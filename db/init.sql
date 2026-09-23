-- PostgreSQL Database Initialization Script for Asset & Equipment Management System
-- Database: asset_db

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    serial_number VARCHAR(50),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    cost DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Hoạt động', -- Hoạt động, Đang bảo trì, Hỏng, Thanh lý
    location VARCHAR(100),
    department VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL, -- Bảo trì định kỳ, Sửa chữa khẩn cấp, Nâng cấp
    cost DECIMAL(12, 2) DEFAULT 0.00,
    performer VARCHAR(100),
    description TEXT NOT NULL,
    result VARCHAR(50) DEFAULT 'Hoàn thành', -- Hoàn thành, Đang xử lý, Chờ linh kiện
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT INTO categories (code, name, description) VALUES
('CAT-IT', 'Thiết bị Công nghệ Thông tin', 'Máy tính, Server, Switch, Router, Màn hình, Bàn phím'),
('CAT-OFF', 'Thiết bị Văn phòng', 'Máy in, Máy photo, Điều hòa, Máy chiếu, Bàn ghế'),
('CAT-LAB', 'Thiết bị Phòng Thí nghiệm', 'Kính hiển vi, Dao động ký, Nguồn chuẩn, Máy đo tín hiệu'),
('CAT-NET', 'Hạ tầng Mạng & Viễn thông', 'Tủ Rack, Cáp quang, Bộ phát Wi-Fi, Firewall')
ON CONFLICT (code) DO NOTHING;

-- Seed Assets
INSERT INTO assets (asset_code, name, category_id, serial_number, model, manufacturer, purchase_date, cost, status, location, department, notes) VALUES
('TS-IT-001', 'Máy chủ Server Dell PowerEdge R750', 1, 'SN-DELL-750912', 'PowerEdge R750', 'Dell Technologies', '2024-01-15', 125000000.00, 'Hoạt động', 'Phòng Máy chủ Tầng 3', 'Phòng CNTT', 'Máy chủ ảo hóa VMware ESXi'),
('TS-IT-002', 'Laptop Dell XPS 15 9530', 1, 'SN-XPS-9530-01', 'XPS 15', 'Dell Technologies', '2024-03-10', 45000000.00, 'Hoạt động', 'Phòng Kỹ thuật', 'Phòng R&D', 'Cấp cho Trưởng phòng R&D'),
('TS-IT-003', 'Switch Cisco Catalyst 9300 48-Port', 1, 'SN-CSC-9300-48P', 'Catalyst 9300', 'Cisco Systems', '2023-11-20', 68000000.00, 'Hoạt động', 'Tủ Rack Tầng 2', 'Phòng Hạ tầng', 'Switch Core tòa nhà'),
('TS-OFF-001', 'Máy in Đa năng Canon ImageCLASS MF244dw', 2, 'SN-CANON-244DW', 'MF244dw', 'Canon', '2023-08-05', 7500000.00, 'Đang bảo trì', 'Phòng Kế toán', 'Phòng Hành chính', 'Đang thay hộp mực và trống in'),
('TS-OFF-002', 'Điều hòa Daikin Inverter 24000 BTU', 2, 'SN-DAIKIN-24K', 'FTKF70XVMV', 'Daikin', '2023-05-12', 2450000.00, 'Hoạt động', 'Phòng Họp Lớn', 'Phòng Hành chính', 'Bảo dưỡng định kỳ 6 tháng/lần'),
('TS-LAB-001', 'Máy đo Dao động ký Tektronix TBS1052B', 3, 'SN-TEK-1052B', 'TBS1052B', 'Tektronix', '2022-09-18', 18500000.00, 'Hoạt động', 'Phòng Lab 402', 'Khoa Điện tử', 'Thiết bị thực hành sinh viên'),
('TS-NET-001', 'Router Mikrotik RB5009UG+S+IN', 4, 'SN-MT-5009UG', 'RB5009UG+S+IN', 'Mikrotik', '2024-02-01', 6500000.00, 'Hoạt động', 'Phòng Kỹ thuật Mạng', 'Phòng CNTT', 'Router Gateway kết nối ISP')
ON CONFLICT (asset_code) DO NOTHING;

-- Seed Maintenance Logs
INSERT INTO maintenance_logs (asset_id, maintenance_date, maintenance_type, cost, performer, description, result) VALUES
(1, '2024-06-10', 'Bảo trì định kỳ', 1500000.00, 'Nguyễn Văn Hùng - IT Support', 'Vệ sinh bụi bẩn, thay keo tản nhiệt CPU server Dell, kiểm tra RAID 10', 'Hoàn thành'),
(4, '2024-09-20', 'Sửa chữa khẩn cấp', 850000.00, 'Trung tâm Bảo hành Canon', 'Thay cụm sấy và linh kiện lô cuốn giấy bị kẹt', 'Đang xử lý'),
(5, '2024-04-15', 'Bảo trì định kỳ', 450000.00, 'Công ty Điện lạnh Bách Khoa', 'Nạp gas R32, vệ sinh lưới lọc dàn nóng và dàn lạnh', 'Hoàn thành');

-- Seed User (admin / admin123)
INSERT INTO system_users (username, password_hash, full_name, role) VALUES
('admin', 'scrypt:32768:8:1$saltedhashplaceholder$admin123', 'Quản trị viên Hệ thống', 'admin'),
('technical', 'scrypt:32768:8:1$saltedhashplaceholder$tech123', 'Kỹ thuật viên Bảo trì', 'operator')
ON CONFLICT (username) DO NOTHING;
