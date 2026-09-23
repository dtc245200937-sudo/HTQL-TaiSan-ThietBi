const express = require('express');
const path = require('path');
const db = require('./db');
const metrics = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Prometheus Metrics Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    metrics.httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });
    metrics.httpRequestDurationHistogram.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode,
      },
      duration
    );
  });
  next();
});

// Helper function to update background Prometheus metrics
async function updateGauges() {
  try {
    const statusRes = await db.query(
      'SELECT status, COUNT(*) as cnt FROM assets GROUP BY status'
    );
    statusRes.rows.forEach((row) => {
      metrics.assetTotalGauge.set({ status: row.status }, parseInt(row.cnt, 10));
    });

    const costRes = await db.query(
      'SELECT COALESCE(SUM(cost), 0) as total_cost FROM maintenance_logs'
    );
    if (costRes.rows.length > 0) {
      metrics.maintenanceCostGauge.set(parseFloat(costRes.rows[0].total_cost));
    }
  } catch (err) {
    console.error('Error updating Prometheus gauges:', err.message);
  }
}

// Update gauges periodically every 30 seconds
setInterval(updateGauges, 30000);
updateGauges();

// Routes

// 1. Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT 1 as alive');
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: dbRes.rows.length > 0 ? 'Connected' : 'Disconnected',
      service: 'Asset & Equipment Management System',
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
});

// 2. Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// 3. Dashboard Route
app.get('/', async (req, res) => {
  try {
    const totalAssets = await db.query('SELECT COUNT(*) FROM assets');
    const statusCounts = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM assets 
      GROUP BY status
    `);
    const totalValue = await db.query('SELECT COALESCE(SUM(cost), 0) as total FROM assets');
    const totalMaintCost = await db.query('SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_logs');
    const recentAssets = await db.query(`
      SELECT a.*, c.name as category_name 
      FROM assets a 
      LEFT JOIN categories c ON a.category_id = c.id 
      ORDER BY a.created_at DESC LIMIT 5
    `);
    const recentMaintenance = await db.query(`
      SELECT m.*, a.name as asset_name, a.asset_code 
      FROM maintenance_logs m 
      JOIN assets a ON m.asset_id = a.id 
      ORDER BY m.maintenance_date DESC LIMIT 5
    `);

    const stats = {
      totalAssets: parseInt(totalAssets.rows[0].count, 10),
      totalValue: parseFloat(totalValue.rows[0].total),
      totalMaintCost: parseFloat(totalMaintCost.rows[0].total),
      statusMap: {},
    };

    statusCounts.rows.forEach((r) => {
      stats.statusMap[r.status] = parseInt(r.count, 10);
    });

    res.render('index', {
      pageTitle: 'Tổng quan Hệ thống',
      stats,
      recentAssets: recentAssets.rows,
      recentMaintenance: recentMaintenance.rows,
    });
  } catch (err) {
    console.error('Error rendering dashboard:', err);
    res.status(500).send('Lỗi máy chủ: ' + err.message);
  }
});

// 4. Asset List & Filter Route
app.get('/assets', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let queryText = `
      SELECT a.*, c.name as category_name 
      FROM assets a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND a.status = $${params.length}`;
    }
    if (category) {
      params.push(category);
      queryText += ` AND a.category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (a.name ILIKE $${params.length} OR a.asset_code ILIKE $${params.length} OR a.serial_number ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY a.id DESC';

    const assetsRes = await db.query(queryText, params);
    const categoriesRes = await db.query('SELECT * FROM categories ORDER BY name');

    res.render('assets', {
      pageTitle: 'Quản lý Tài sản & Thiết bị',
      assets: assetsRes.rows,
      categories: categoriesRes.rows,
      filters: { status, category, search },
    });
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).send('Lỗi máy chủ: ' + err.message);
  }
});

// 5. Add Asset Route
app.post('/assets/add', async (req, res) => {
  try {
    const {
      asset_code,
      name,
      category_id,
      serial_number,
      model,
      manufacturer,
      purchase_date,
      cost,
      status,
      location,
      department,
      notes,
    } = req.body;

    await db.query(
      `INSERT INTO assets (asset_code, name, category_id, serial_number, model, manufacturer, purchase_date, cost, status, location, department, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        asset_code,
        name,
        category_id || null,
        serial_number || null,
        model || null,
        manufacturer || null,
        purchase_date || null,
        cost || 0,
        status || 'Hoạt động',
        location || null,
        department || null,
        notes || null,
      ]
    );

    updateGauges();
    res.redirect('/assets');
  } catch (err) {
    console.error('Error adding asset:', err);
    res.status(500).send('Lỗi khi thêm tài sản: ' + err.message);
  }
});

// 6. Delete Asset Route
app.post('/assets/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    updateGauges();
    res.redirect('/assets');
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).send('Lỗi khi xóa tài sản: ' + err.message);
  }
});

// 7. Maintenance Logs Route
app.get('/maintenance', async (req, res) => {
  try {
    const logsRes = await db.query(`
      SELECT m.*, a.name as asset_name, a.asset_code, a.department 
      FROM maintenance_logs m 
      JOIN assets a ON m.asset_id = a.id 
      ORDER BY m.maintenance_date DESC, m.id DESC
    `);
    const assetsRes = await db.query('SELECT id, asset_code, name FROM assets ORDER BY name');

    res.render('maintenance', {
      pageTitle: 'Lịch sử Bảo trì & Sửa chữa',
      logs: logsRes.rows,
      assets: assetsRes.rows,
    });
  } catch (err) {
    console.error('Error fetching maintenance logs:', err);
    res.status(500).send('Lỗi máy chủ: ' + err.message);
  }
});

// 8. Add Maintenance Log Route
app.post('/maintenance/add', async (req, res) => {
  try {
    const { asset_id, maintenance_date, maintenance_type, cost, performer, description, result } = req.body;

    await db.query(
      `INSERT INTO maintenance_logs (asset_id, maintenance_date, maintenance_type, cost, performer, description, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [asset_id, maintenance_date, maintenance_type, cost || 0, performer, description, result || 'Hoàn thành']
    );

    // If maintenance status is "Đang xử lý" or "Chờ linh kiện", update asset status to "Đang bảo trì"
    if (result === 'Đang xử lý' || result === 'Chờ linh kiện') {
      await db.query(`UPDATE assets SET status = 'Đang bảo trì' WHERE id = $1`, [asset_id]);
    } else if (result === 'Hoàn thành') {
      await db.query(`UPDATE assets SET status = 'Hoạt động' WHERE id = $1`, [asset_id]);
    }

    updateGauges();
    res.redirect('/maintenance');
  } catch (err) {
    console.error('Error adding maintenance log:', err);
    res.status(500).send('Lỗi khi thêm nhật ký bảo trì: ' + err.message);
  }
});

// 9. Categories Route
app.get('/categories', async (req, res) => {
  try {
    const catRes = await db.query(`
      SELECT c.*, COUNT(a.id) as asset_count 
      FROM categories c 
      LEFT JOIN assets a ON c.id = a.category_id 
      GROUP BY c.id 
      ORDER BY c.name
    `);
    res.render('categories', {
      pageTitle: 'Quản lý Danh mục Thiết bị',
      categories: catRes.rows,
    });
  } catch (err) {
    res.status(500).send('Lỗi máy chủ: ' + err.message);
  }
});

// 10. Add Category Route
app.post('/categories/add', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    await db.query('INSERT INTO categories (code, name, description) VALUES ($1, $2, $3)', [
      code,
      name,
      description,
    ]);
    res.redirect('/categories');
  } catch (err) {
    res.status(500).send('Lỗi khi thêm danh mục: ' + err.message);
  }
});

// 11. REST APIs for Monitoring or Mobile integration
app.get('/api/stats', async (req, res) => {
  try {
    const totalAssets = await db.query('SELECT COUNT(*) FROM assets');
    const totalMaintCost = await db.query('SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_logs');
    res.json({
      total_assets: parseInt(totalAssets.rows[0].count, 10),
      total_maintenance_cost: parseFloat(totalMaintCost.rows[0].total),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================`);
  console.log(`Hệ thống Quản lý Tài sản & Thiết bị đang chạy tại port ${PORT}`);
  console.log(`Healthcheck: http://localhost:${PORT}/health`);
  console.log(`Prometheus Metrics: http://localhost:${PORT}/metrics`);
  console.log(`========================================================`);
});
