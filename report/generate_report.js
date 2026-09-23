const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} = require('docx');

async function buildReport() {
  const doc = new Document({
    sections: [
      // ---------------------------------------------------------
      // SECTION 1: COVER PAGE
      // ---------------------------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & KỸ THUẬT',
                bold: true,
                size: 26, // 13pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'KHOA CÔNG NGHỆ THÔNG TIN - BỘ MÔN DEVOPS',
                bold: true,
                size: 24, // 12pt
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '----------------------------------------',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 1200 } }),

          // Cover Title Box
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'BÁO CÁO TỔNG HỢP ĐỒ ÁN / BÀI TẬP LỚN',
                bold: true,
                size: 32, // 16pt
                font: 'Times New Roman',
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [
              new TextRun({
                text: 'CHỦ ĐỀ: HỆ THỐNG QUẢN LÝ TÀI SẢN / THIẾT BỊ',
                bold: true,
                size: 36, // 18pt
                font: 'Times New Roman',
                color: '4F46E5',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: 'Triển khai Web App, Nginx Reverse Proxy SSL, Prometheus, Grafana, Loki LogQL & Hardening',
                italic: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 2000 } }),

          // Student Info Table Alignment
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 85, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableTableCellInfo('Sinh viên thực hiện:', true),
                  new TableTableCellInfo('NGAU VAN A', false),
                ],
              }),
              new TableRow({
                children: [
                  new TableTableCellInfo('Mã số Sinh viên (MSSV):', true),
                  new TableTableCellInfo('SV20269999', false),
                ],
              }),
              new TableRow({
                children: [
                  new TableTableCellInfo('Lớp / Khóa:', true),
                  new TableTableCellInfo('DevOps & Cloud Security - K18', false),
                ],
              }),
              new TableRow({
                children: [
                  new TableTableCellInfo('Giảng viên hướng dẫn:', true),
                  new TableTableCellInfo('TS. Nguyễn Văn B', false),
                ],
              }),
              new TableRow({
                children: [
                  new TableTableCellInfo('Hệ thống GitHub Repository:', true),
                  new TableTableCellInfo('https://github.com/sv20269999/HTQL-TaiSan-ThietBi', false),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 1500 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'HÀ NỘI - 2026',
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new PageBreak(),
        ],
      },

      // ---------------------------------------------------------
      // SECTION 2: MAIN REPORT BODY (WITH HEADERS & FOOTERS)
      // ---------------------------------------------------------
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Báo cáo Đồ án DevOps: Hệ thống Quản lý Tài sản / Thiết bị | MSSV: SV20269999',
                    size: 18,
                    italic: true,
                    font: 'Times New Roman',
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Trang ',
                    size: 20,
                    font: 'Times New Roman',
                  }),
                  PageNumber.CURRENT,
                ],
              }),
            ],
          }),
        },
        children: [
          // Table of Contents Section Header
          createHeading1('MỤC LỤC BÁO CÁO'),
          createParagraph(
            'Báo cáo này được cấu trúc logic gồm 9 phần chính, trình bày đầy đủ từ yêu cầu bài toán, kiến trúc hệ thống, các bước triển khai chi tiết theo quy trình Git commit, tích hợp hệ thống giám sát Prometheus/Grafana, hệ thống log Loki/LogQL, giải pháp bảo mật Hardening container, đến các kịch bản kiểm thử vận hành thực tế.'
          ),

          createBulletPoint('Chương 1: Tổng quan Đề tài & Yêu cầu Triển khai'),
          createBulletPoint('Chương 2: Kiến trúc Hệ thống & Mô hình Phân vùng Container'),
          createBulletPoint('Chương 3: Triển khai Ứng dụng Web, PostgreSQL, pgAdmin & Nginx Reverse Proxy (Commit 1)'),
          createBulletPoint('Chương 4: Triển khai Hệ thống Giám sát Tập trung Prometheus & Grafana (Commit 2)'),
          createBulletPoint('Chương 5: Triển khai Hệ thống Log Tập trung Loki & Promtail với LogQL (Commit 3)'),
          createBulletPoint('Chương 6: Áp dụng các Biện pháp Hardening & Bảo mật Container (Commit 4)'),
          createBulletPoint('Chương 7: Quản lý Mã nguồn trên GitHub & Lịch sử Commits Quy chuẩn'),
          createBulletPoint('Chương 8: Hướng dẫn Vận hành, Chạy Hệ thống & Đo kiểm Thực tế'),
          createBulletPoint('Chương 9: Kết luận, Đánh giá Kỹ thuật & Hướng Phát triển'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 1
          createHeading1('CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI & YÊU CẦU TRIỂN KHAI'),
          createHeading2('1.1. Bối cảnh & Lý do Chọn Đề tài'),
          createParagraph(
            'Trong các doanh nghiệp, tổ chức và trường học, tài sản cố định cũng như thiết bị công nghệ thông tin (Server, Laptop, Switch, Router, Thiết bị đo kiểm...) đóng vai trò cốt lõi duy trì hoạt động liên tục. Việc quản lý thủ công bằng sổ sách hoặc file Excel truyền thống gặp nhiều rủi ro như hỏng hóc dữ liệu, thất thoát tài sản, không theo dõi được chi tiết lịch sử bảo trì và chi phí sửa chữa định kỳ.'
          ),
          createParagraph(
            'Do đó, hệ thống Web Quản lý Tài sản / Thiết bị (Asset & Equipment Management System) được phát triển nhằm tự động hóa quy trình quản lý tài sản, cập nhật trạng thái thiết bị theo thời gian thực và lưu trữ đầy đủ lịch sử bảo trì. Đồng thời, ứng dụng được chuẩn hóa theo quy trình DevOps hiện đại, triển khai toàn bộ trên nền tảng Docker Container, tích hợp hệ thống giám sát hiệu năng Prometheus, hiển thị trực quan Grafana, quản lý log tập trung Loki/Promtail và áp dụng các tiêu chuẩn bảo mật Hardening nghiêm ngặt.'
          ),

          createHeading2('1.2. Yêu cầu Kỹ thuật Đặt ra'),
          createParagraph('Hệ thống phải đáp ứng đầy đủ các yêu cầu kỹ thuật bắt buộc sau:'),
          createBulletPoint('1. Mã nguồn & Cấu hình: Quản lý toàn bộ mã nguồn ứng dụng, Dockerfile, docker-compose.yml, cấu hình Nginx, Prometheus, Grafana, Loki trên GitHub với commit rõ ràng và file README hướng dẫn chạy.'),
          createBulletPoint('2. Cơ sở dữ liệu: Triển khai PostgreSQL 16 tích hợp công cụ quản trị giao diện Web pgAdmin 4.'),
          createBulletPoint('3. Reverse Proxy & SSL: Cấu hình Nginx làm Reverse Proxy xử lý HTTPS self-signed cert, chặn truy cập trực tiếp backend và bổ sung đầy đủ Security Headers chuẩn OWASP.'),
          createBulletPoint('4. Monitoring Stack: Tích hợp Prometheus và Grafana để giám sát container (cAdvisor), web server (nginx-exporter) và cơ sở dữ liệu (postgres-exporter).'),
          createBulletPoint('5. Centralized Logging Stack: Triển khai Loki + Promtail thu thập log container tập trung, truy vấn log bằng ngôn ngữ LogQL với ít nhất 3-4 kịch bản query.'),
          createBulletPoint('6. Security Hardening: Áp dụng các kỹ thuật container non-root, cách ly mạng Docker network isolation (3 subnets), giới hạn tài nguyên CPU/RAM, mật khẩu mạnh và phân quyền tối thiểu.'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 2
          createHeading1('CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG & MÔ HÌNH PHÂN VÙNG CONTAINER'),
          createHeading2('2.1. Kiến trúc Tổng thể Hệ thống'),
          createParagraph(
            'Hệ thống gồm 11 dịch vụ container hoạt động phối hợp chặt chẽ. Nginx đóng vai trò Cổng giao tiếp duy nhất (Single Point of Entry) tiếp nhận các yêu cầu từ phía Người dùng qua giao thức HTTP/HTTPS, sau đó điều hướng chính xác đến các dịch vụ nội bộ tương ứng.'
          ),

          createCodeBlock(`
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
+----------------------------------------+------------------------------------------+
                                         | HTTPS / HTTP
                                         v
+-----------------------------------------------------------------------------------+
|                              NGINX REVERSE PROXY                                  |
|            (SSL Self-Signed Cert | OWASP Security Headers | Port 80/443)          |
+-------------------+--------------------+-------------------+----------------------+
                    |                    |                   |
     frontend-net   |       backend-net  |    monitoring-net |
                    v                    v                   v
+-----------------------+  +--------------------+  +--------------------------------+
|  Node.js Web App      |  |  PostgreSQL 16 DB  |  | Prometheus & Grafana Dashboard |
|  (Express + EJS)      |  |  (Port 5432)       |  | (Port 9090 / 3000)             |
+-----------+-----------+  +----------+---------+  +---------------+----------------+
            |                         |                            ^
            +-------------------------+                            |
                        │                                          |
                        v                                          |
            +-------------------------+                            |
            | Exporters (cAdvisor,    +----------------------------+
            | Postgres, Nginx,        |
            | Promtail -> Loki Engine)|
            +-------------------------+
          `),

          createHeading2('2.2. Thiết kế Mạng Độc lập & Cách ly (Docker Network Isolation)'),
          createParagraph(
            'Để đảm bảo nguyên tắc Nguyên tắc Phân quyền Tối thiểu (Principle of Least Privilege) ở mức hạ tầng mạng, hệ thống không sử dụng docker bridge mặc định mà phân tách thành 3 subnets riêng biệt:'
          ),
          createBulletPoint('1. frontend-net (Subnet 172.28.1.0/24): Chứa Nginx, Web App, pgAdmin, Grafana. Phục vụ định tuyến và giao diện người dùng.'),
          createBulletPoint('2. backend-net (Subnet 172.28.2.0/24): Chứa Web App, PostgreSQL, pgAdmin, Postgres-exporter. Tuyệt đối không expose port PostgreSQL ra ngoài máy host.'),
          createBulletPoint('3. monitoring-net (Subnet 172.28.3.0/24): Chứa Prometheus, Grafana, Loki, Promtail, cAdvisor và các Exporters. Đảm bảo luồng dữ liệu giám sát và log tách biệt hoàn toàn với luồng dữ liệu người dùng.'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 3
          createHeading1('CHƯƠNG 3: TRIỂN KHAI WEB APP, POSTGRESQL, PGADMIN & NGINX PROXY (COMMIT 1)'),
          createHeading2('3.1. Thiết kế Ứng dụng Web Quản lý Tài sản (Node.js/Express)'),
          createParagraph(
            'Ứng dụng Web được phát triển bằng Node.js Express, giao diện động rendering bằng EJS template engine và phong cách thiết kế giao diện hiện đại (Modern Glassmorphism UI) kết hợp font chữ Inter và FontAwesome icons.'
          ),
          createParagraph('Các chức năng cốt lõi của ứng dụng bao gồm:'),
          createBulletPoint('• Dashboard Tổng quan: Hiển thị 4 thẻ thống kê (Tổng số tài sản, Số lượng tài sản đang hoạt động, Đang bảo trì, Tổng chi phí bảo trì tích lũy) cùng danh sách tài sản và phiếu bảo trì gần nhất.'),
          createBulletPoint('• Quản lý Tài sản (/assets): Cho phép tìm kiếm theo từ khóa, lọc theo trạng thái (Hoạt động, Đang bảo trì, Hỏng, Thanh lý) hoặc danh mục; hỗ trợ thêm mới và xóa tài sản.'),
          createBulletPoint('• Lịch sử Bảo trì (/maintenance): Theo dõi từng lượt bảo dưỡng thiết bị, cập nhật chi phí sửa chữa, người thực hiện, nội dung chi tiết và tự động đồng bộ trạng thái thiết bị.'),
          createBulletPoint('• Danh mục Thiết bị (/categories): Phân loại tài sản theo từng lĩnh vực (CNTT, Văn phòng, Phòng Lab, Mạng).'),
          createBulletPoint('• Endpoints Giám sát: /health (Kiểm tra sống còn ứng dụng và DB) và /metrics (Xuất dữ liệu Prometheus chuẩn).'),

          createHeading2('3.2. Cơ sở Dữ liệu PostgreSQL & Khởi tạo Tự động'),
          createParagraph(
            'Cơ sở dữ liệu postgresql được khởi tạo tự động thông qua script db/init.sql khi container khởi chạy lần đầu. Cấu trúc bảng gồm 4 bảng chính:'
          ),
          createCodeBlock(`
-- Cấu trúc bảng chính
CREATE TABLE categories (id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE, name VARCHAR(100), description TEXT);
CREATE TABLE assets (id SERIAL PRIMARY KEY, asset_code VARCHAR(30) UNIQUE, name VARCHAR(150), category_id INT REFERENCES categories(id), serial_number VARCHAR(50), cost DECIMAL(15,2), status VARCHAR(30), location VARCHAR(100), department VARCHAR(100));
CREATE TABLE maintenance_logs (id SERIAL PRIMARY KEY, asset_id INT REFERENCES assets(id), maintenance_date DATE, maintenance_type VARCHAR(50), cost DECIMAL(12,2), performer VARCHAR(100), description TEXT, result VARCHAR(50));
CREATE TABLE system_users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, password_hash VARCHAR(255), full_name VARCHAR(100), role VARCHAR(20));
          `),

          createHeading2('3.3. Cấu hình Nginx Reverse Proxy, SSL Self-Signed & Security Headers'),
          createParagraph(
            'Nginx được đóng gói trong container riêng (xây dựng từ nginx:1.25-alpine), tự động sinh chứng chỉ SSL/TLS self-signed 2048-bit tại thời điểm build. File nginx.conf cấu hình xử lý HTTP -> HTTPS redirect và định tuyến proxy_pass cho web-app, pgadmin, grafana:'
          ),
          createCodeBlock(`
# OWASP Recommended Security Headers trong Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;" always;
          `),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 4
          createHeading1('CHƯƠNG 4: TRIỂN KHAI HỆ THỐNG GIÁM SÁT TẬP TRUNG PROMETHEUS & GRAFANA (COMMIT 2)'),
          createHeading2('4.1. Cấu hình Prometheus Scraper'),
          createParagraph(
            'Prometheus thu thập thông số định kỳ (interval 15s) từ 5 nguồn dữ liệu (targets) trong mạng monitoring-net:'
          ),
          createBulletPoint('1. web-app:3000/metrics: Số lượng request, thời gian phản hồi (duration histogram), tổng số tài sản, chi phí bảo trì.'),
          createBulletPoint('2. postgres-exporter:9187: Kết nối DB, dung lượng buffer pool, số lượng query/giây.'),
          createBulletPoint('3. nginx-exporter:9113: Số kết nối Nginx đang active, số lượng request/giây xử lý qua proxy.'),
          createBulletPoint('4. cadvisor:8080: Mức độ tiêu thụ CPU (nanoseconds), Memory (bytes), Network I/O và Disk I/O của từng container.'),
          createBulletPoint('5. prometheus:9090: Tự giám sát chính Prometheus server.'),

          createHeading2('4.2. Tự động Khởi tạo Grafana Datasources & Custom Dashboards'),
          createParagraph(
            'Grafana 10.4.0 được cấu hình Auto-provisioning dữ liệu đầu vào (Datasources Prometheus & Loki) và giao diện giám sát Asset Management System Dashboard (asset_system_dashboard.json). Dashboard hiển thị 6 panel quan trọng:'
          ),
          createBulletPoint('• Panel 1 (Stat): Tổng số lượng HTTP Request đã xử lý.'),
          createBulletPoint('• Panel 2 (Stat): Số lượng tài sản đang ở trạng thái "Hoạt động".'),
          createBulletPoint('• Panel 3 (Stat): Tổng chi phí bảo trì tính bằng VNĐ.'),
          createBulletPoint('• Panel 4 (Time Series): Biểu đồ tiêu thụ CPU phần trăm của 11 container theo thời gian thực.'),
          createBulletPoint('• Panel 5 (Time Series): Dung lượng RAM (RAM Usage) tiêu thụ của từng container.'),
          createBulletPoint('• Panel 6 (Logs Panel): Dòng chảy log tập trung thời gian thực tích hợp từ Loki.'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 5
          createHeading1('CHƯƠNG 5: TRIỂN KHAI HỆ THỐNG LOG TẬP TRUNG LOKI & PROMTAIL VỚI LOGQL (COMMIT 3)'),
          createHeading2('5.1. Kiến trúc Thu thập Log Loki + Promtail'),
          createParagraph(
            'Promtail chạy dưới dạng daemon thu thập log, gắn tới Docker Socket (/var/run/docker.sock) và đường dẫn log container (/var/lib/docker/containers). Promtail tự động trích xuất các nhãn (labels) như container_name, stream (stdout/stderr) và đẩy dữ liệu log về Loki Engine theo cổng 3100 qua HTTP API.'
          ),

          createHeading2('5.2. Danh sách & Giải thích Chi tiết các Kịch bản Truy vấn LogQL'),
          createParagraph(
            'Hệ thống đã xây dựng và kiểm thử thành công 4 câu truy vấn LogQL phục vụ cho công tác giám sát sự cố và an ninh thông tin:'
          ),

          createParagraph('• Kịch bản LogQL 1: Truy vấn toàn bộ log của Web Application'),
          createCodeBlock('{job="docker", container="web-app"}'),
          createParagraph('Ý nghĩa: Lọc toàn bộ log dòng chảy sinh ra từ container ứng dụng Node.js để kiểm tra luồng request HTTP.'),

          createParagraph('• Kịch bản LogQL 2: Truy vấn phát hiện lỗi & ngoại lệ trên toàn bộ hạ tầng (Error Filter)'),
          createCodeBlock('{job="docker"} |= "error" or "DOWN" or "Lỗi" or "Exception"'),
          createParagraph('Ý nghĩa: Sử dụng toán tử chuỗi |= để lọc tức thời các từ khóa sự cố trên toàn bộ 11 container.'),

          createParagraph('• Kịch bản LogQL 3: Thống kê tốc độ phát sinh log (Log Rate) trong từng khoảng thời gian 1 phút'),
          createCodeBlock('rate({job="docker", container="web-app"}[1m])'),
          createParagraph('Ý nghĩa: Đo lường mật độ log sinh ra trên 1 giây, giúp phát hiện sớm các hiện tượng bất thường như tấn công brute-force hoặc loop vô tận.'),

          createParagraph('• Kịch bản LogQL 4: Lọc log truy cập chi tiết của Nginx Reverse Proxy theo endpoint API'),
          createCodeBlock('{job="docker", container="nginx"} |~ "GET /assets|POST /maintenance"'),
          createParagraph('Ý nghĩa: Sử dụng toán tử Regex |~ để tìm kiếm chính xác các HTTP method và URI cụ thể.'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 6
          createHeading1('CHƯƠNG 6: ÁP DỤNG CÁC BIỆN PHÁP HARDENING & BẢO MẬT CONTAINER (COMMIT 4)'),
          createHeading2('6.1. Nguyên tắc Non-Root Container Execution'),
          createParagraph(
            'Chạy container với quyền root là một trong những rủi ro bảo mật hàng đầu dẫn đến nguy cơ Container Escape (chiếm quyền kiểm soát máy host). Trong dự án này, toàn bộ các Dockerfile đều áp dụng chặt chẽ chuyển đổi người dùng không có quyền quản trị:'
          ),
          createBulletPoint('• Web App Dockerfile: Tạo group appgroup (GID 10001), user appuser (UID 10001) và khai báo USER 10001:10001.'),
          createBulletPoint('• Prometheus Service: Sử dụng người dùng không có quyền hệ thống user: "65534:65534" (nobody).'),
          createBulletPoint('• Nginx Container: Sử dụng Nginx Alpine tối giản, ẩn thông tin phiên bản server_tokens off;.'),

          createHeading2('6.2. Giới hạn Tài nguyên (Resource Limits)'),
          createParagraph(
            'Tất cả các dịch vụ trong docker-compose.yml đều được khai báo thông số giới hạn CPU và RAM (deploy.resources.limits) nhằm ngăn chặn hiện tượng một dịch vụ bị lỗi làm cạn kiệt tài nguyên của hệ thống host (Resource Starvation):'
          ),
          createTableFromData([
            ['Container Service', 'CPU Limit', 'RAM Memory Limit', 'Trạng thái Hardening'],
            ['web-app', '0.50 Cores', '256 MB', 'Đã áp dụng Non-Root + Limits'],
            ['postgres', '0.50 Cores', '512 MB', 'Đã áp dụng Isolation + Limits'],
            ['pgadmin', '0.50 Cores', '256 MB', 'Đã áp dụng Script Proxy + Limits'],
            ['nginx', '0.25 Cores', '128 MB', 'Đã áp dụng SSL + Security Headers'],
            ['prometheus', '0.50 Cores', '256 MB', 'Đã áp dụng Non-Root (65534)'],
            ['grafana', '0.50 Cores', '256 MB', 'Đã áp dụng Subpath + Credentials'],
            ['loki', '0.50 Cores', '256 MB', 'Đã áp dụng Retention Policy'],
          ]),

          createHeading2('6.3. Quản lý Mật khẩu & Bí mật Môi trường (.env)'),
          createParagraph(
            'Hệ thống loại bỏ hoàn toàn việc hardcode mật khẩu trong mã nguồn. Toàn bộ các thông số nhạy cảm (POSTGRES_PASSWORD, PGADMIN_DEFAULT_PASSWORD, GF_SECURITY_ADMIN_PASSWORD) được quản lý tập trung trong file .env và được tham chiếu qua biến môi trường trong docker-compose.yml.'
          ),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 7
          createHeading1('CHƯƠNG 7: QUẢN LÝ MÃ NGUỒN TRÊN GITHUB & LỊCH SỬ COMMITS QUY CHUẨN'),
          createHeading2('7.1. Cấu trúc Thư mục Mã nguồn Dự án'),
          createParagraph('Dự án được sắp xếp cấu trúc thư mục quy chuẩn, dễ quản lý và mở rộng:'),
          createCodeBlock(`
HTQL TaiSan ThietBi/
├── docker-compose.yml           # Configuration khởi chạy 11 services
├── .env.example                 # File mẫu cấu hình biến môi trường
├── .env                         # File cấu hình bí mật thực tế
├── README.md                    # File hướng dẫn vận hành chi tiết
├── app/                         # Mã nguồn Web Application Node.js
│   ├── Dockerfile               # Multi-stage non-root Dockerfile
│   ├── package.json             # Khai báo thư viện phụ thuộc
│   └── src/                     # Server.js, db.js, metrics.js, views & styles
├── db/
│   └── init.sql                 # Script khởi tạo Database PostgreSQL & Seed data
├── nginx/                       # Reverse Proxy & SSL
│   ├── Dockerfile               # Dockerfile tự tạo SSL Self-signed
│   └── nginx.conf               # Hardened Nginx configuration
├── monitoring/                  # Cấu hình hệ thống giám sát
│   ├── prometheus/              # prometheus.yml
│   └── grafana/                 # Provisioning datasources & dashboards
├── logging/                     # Cấu hình quản lý Log tập trung
│   ├── loki/                    # loki-config.yml
│   └── promtail/                # promtail-config.yml
└── report/                      # Script tự động tạo báo cáo
    ├── generate_report.js
    └── BaoCao_HTQL_TaiSan_ThietBi.docx
          `),

          createHeading2('7.2. Lịch sử Commits Quy chuẩn (4 Commits)'),
          createParagraph(
            'Để thể hiện rõ ràng tiến trình triển khai từng bước theo yêu cầu đề bài, lịch sử Git được tổ chức thành 4 commit lớn:'
          ),
          createBulletPoint('• Commit 1: feat: init web app, postgresql, pgadmin & nginx reverse proxy with ssl (Nền tảng ứng dụng + DB + Proxy SSL).'),
          createBulletPoint('• Commit 2: feat: integrate prometheus, grafana, cadvisor, postgres & nginx exporters (Tích hợp Monitoring stack).'),
          createBulletPoint('• Commit 3: feat: add centralized logging stack loki, promtail & logql query specs (Tích hợp Logging stack Loki + Promtail).'),
          createBulletPoint('• Commit 4: sec: apply container hardening, non-root user, network isolation & docs (Hardening bảo mật & tài liệu báo cáo).'),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 8
          createHeading1('CHƯƠNG 8: HƯỚNG DẪN VẬN HÀNH, CHẠY HỆ THỐNG & ĐO KIỂM THỰC TẾ'),
          createHeading2('8.1. Các Bước Khởi chạy Hệ thống'),
          createParagraph('Sinh viên/Quản trị viên thực hiện 3 bước đơn giản để đưa toàn bộ hệ thống vào hoạt động:'),
          createCodeBlock(`
# Bước 1: Copy file cấu hình môi trường
cp .env.example .env

# Bước 2: Build và khởi chạy tất cả dịch vụ dưới dạng Background (Detached mode)
docker compose up -d --build

# Bước 3: Kiểm tra trạng thái sức khỏe của 11 container
docker compose ps
          `),

          createHeading2('8.2. Bảng Địa chỉ Truy cập & Tài khoản Đăng nhập'),
          createTableFromData([
            ['Tên Dịch Vụ', 'Đường Dẫn URL Truy Cập', 'Tài Khoản Mặc Định', 'Ghi Chú'],
            ['Website Quản lý Tài sản', 'https://localhost', 'Truy cập trực tiếp UI', 'HTTPS SSL Self-Signed'],
            ['pgAdmin (Quản trị DB)', 'http://localhost/pgadmin/', 'admin@asset.local / AdminPgPass2026!', 'Quản lý PostgreSQL Web'],
            ['Grafana Dashboard', 'http://localhost/grafana/', 'admin / GrafanaAdminPass2026!', 'Đã nạp sẵn Dashboard'],
            ['Prometheus Server', 'http://localhost:9090', 'N/A', 'Xem Target & Metrics'],
            ['App Healthcheck API', 'http://localhost:3000/health', 'N/A', 'Trả về trạng thái JSON'],
          ]),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // CHƯƠNG 9
          createHeading1('CHƯƠNG 9: KẾT LUẬN, ĐÁNH GIÁ KỸ THUẬT & HƯỚNG PHÁT TRIỂN'),
          createHeading2('9.1. Đánh giá Kết quả Đạt được'),
          createParagraph(
            'Sau quá trình nghiên cứu, thiết kế và triển khai thực nghiệm, dự án "Hệ thống Quản lý Tài sản / Thiết bị" đã hoàn thành 100% các mục tiêu và yêu cầu kỹ thuật đề ra:'
          ),
          createBulletPoint('1. Đã xây dựng ứng dụng Web hoàn chỉnh hỗ trợ đầy đủ các nghiệp vụ quản lý tài sản, theo dõi lịch sử bảo trì, phân loại danh mục và tính toán chi phí.'),
          createBulletPoint('2. Đã triển khai thành công 11 container dịch vụ hoạt động ổn định trên Docker Compose với 3 vùng mạng cách ly chuẩn mực.'),
          createBulletPoint('3. Đã tích hợp giải pháp Prometheus + Grafana tự động giám sát toàn diện hạ tầng (CPU, RAM, Connections, HTTP Requests, DB Metrics).'),
          createBulletPoint('4. Đã xây dựng thành công hệ thống thu thập log tập trung Loki + Promtail và viết 4 câu lệnh truy vấn LogQL chuyên sâu.'),
          createBulletPoint('5. Đã áp dụng triệt để giải pháp Hardening container (Non-root user, Resource limits, OWASP security headers, Secret environment variables).'),

          createHeading2('9.2. Hướng Phát triển Đề tài'),
          createParagraph(
            'Trong các phiên bản tiếp theo, hệ thống có thể mở rộng bổ sung các tính năng nâng cao như:'
          ),
          createBulletPoint('• Tích hợp Alertmanager để tự động gửi thông báo sự cố qua Telegram / Email / Slack khi tài nguyên container vượt ngưỡng 85%.'),
          createBulletPoint('• Triển khai cụm Kubernetes (K8s) với Helm Chart thay cho Docker Compose để tăng khả năng Auto-scaling.'),
          createBulletPoint('• Tích hợp CI/CD Pipeline bằng GitHub Actions tự động kiểm thử Lint, Security Scan (Trivy/SonarQube) và Deploy tự động.'),

          new Paragraph({ text: '', spacing: { after: 800 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: 'Hà Nội, Ngày 23 Tháng 09 Năm 2026',
                italic: true,
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: 'Sinh viên Thực hiện: NGAU VAN A',
                bold: true,
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, 'BaoCao_HTQL_TaiSan_ThietBi.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Báo cáo Word đã được tạo thành công tại: ${outPath}`);
}

// Helper Functions
function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28, // 14pt
        color: '1E3A8A',
        font: 'Times New Roman',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24, // 12pt
        color: '2563EB',
        font: 'Times New Roman',
      }),
    ],
  });
}

function createParagraph(text) {
  return new Paragraph({
    spacing: { after: 150, line: 280 },
    alignment: AlignmentType.JUSTIFY,
    children: [
      new TextRun({
        text: text,
        size: 24, // 12pt
        font: 'Times New Roman',
      }),
    ],
  });
}

function createBulletPoint(text) {
  return new Paragraph({
    spacing: { after: 100, line: 260 },
    bullet: { level: 0 },
    children: [
      new TextRun({
        text: text,
        size: 24,
        font: 'Times New Roman',
      }),
    ],
  });
}

function createCodeBlock(code) {
  const lines = code.trim().split('\n');
  return new Paragraph({
    spacing: { before: 150, after: 200 },
    children: lines.map(
      (line, i) =>
        new TextRun({
          text: line + (i < lines.length - 1 ? '\n' : ''),
          font: 'Consolas',
          size: 20,
          color: '0F172A',
        })
    ),
  });
}

function createTableFromData(data) {
  const rows = data.map((row, rowIndex) => {
    return new TableRow({
      children: row.map((cellText) => {
        return new TableCell({
          width: { size: Math.floor(100 / row.length), type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          },
          children: [
            new Paragraph({
              alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: cellText,
                  bold: rowIndex === 0,
                  size: 20,
                  font: 'Times New Roman',
                  color: rowIndex === 0 ? 'FFFFFF' : '0F172A',
                }),
              ],
            }),
          ],
          shading: {
            fill: rowIndex === 0 ? '1E293B' : rowIndex % 2 === 0 ? 'F8FAFC' : 'FFFFFF',
          },
        });
      }),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows,
  });
}

function TableTableCellInfo(text, isBold) {
  return new TableCell({
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: isBold,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  });
}

buildReport().catch((err) => {
  console.error('Lỗi tạo báo cáo docx:', err);
});
