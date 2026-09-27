# Hệ thống Quản lý Tài sản / Thiết bị & Hạ tầng DevOps

**Đồ án / Bài tập lớn môn học DevOps - Quản lý Hạ tầng và Triển khai**

---

## 📌 1. Giới thiệu Tổng quan
Hệ thống Quản lý Tài sản / Thiết bị (Asset & Equipment Management System) là một ứng dụng Web đầy đủ tính năng kết hợp với hệ sinh thái DevOps chuẩn doanh nghiệp bao gồm:
- **Web Application**: Node.js Express + EJS + PostgreSQL + REST API + Prometheus Metrics.
- **Database & Tool**: PostgreSQL 16 + pgAdmin 4 (Quản trị cơ sở dữ liệu qua Giao diện Web).
- **Reverse Proxy & Security**: Nginx Reverse Proxy với HTTPS Self-Signed SSL, OWASP Security Headers.
- **Giám sát (Monitoring)**: Prometheus + Grafana + cAdvisor + Postgres Exporter + Nginx Exporter.
- **Quản lý Log tập trung (Logging)**: Loki + Promtail + LogQL queries.
- **Hardening Container**: Non-root containers, Docker network isolation (3 subnets), Secret management, Resource limits.

---

## 🏗️ 2. Kiến trúc Hệ thống & Sơ đồ Mạng

```
                            [ User / Browser ]
                                    │
                                HTTPS / HTTP
                                    │
                         ┌──────────▼──────────┐
                         │   Nginx Proxy       │ (Port 80 / 443 / 8080)
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │ (frontend-net)          │ (frontend-net)          │ (frontend-net)
          ▼                         ▼                         ▼
  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
  │  Web App      │         │   pgAdmin     │         │   Grafana     │
  │  (Port 3000)  │         │   (Port 80)   │         │  (Port 3000)  │
  └───────┬───────┘         └───────┬───────┘         └───────┬───────┘
          │ (backend-net)           │ (backend-net)           │ (monitoring-net)
          └────────────┬────────────┘                         │
                       ▼                                      │
              ┌─────────────────┐                             │
              │  PostgreSQL     │                             │
              │  (Port 5432)    │                             │
              └────────┬────────┘                             │
                       │ (monitoring-net)                     │
                       ▼                                      ▼
       ┌───────────────────────────────┐        ┌──────────────────────────┐
       │ Exporters (Postgres, Nginx,    ├───────►│  Prometheus & Loki Engine│
       │ cAdvisor, Promtail)           │        └──────────────────────────┘
       └───────────────────────────────┘
```

### Phân vùng Mạng cách ly (Docker Network Isolation)
1. `frontend-net` (Subnet: `172.28.1.0/24`): Nginx, Web App, pgAdmin, Grafana.
2. `backend-net` (Subnet: `172.28.2.0/24`): Web App, PostgreSQL, pgAdmin, Postgres Exporter.
3. `monitoring-net` (Subnet: `172.28.3.0/24`): Prometheus, Grafana, Loki, Promtail, cAdvisor, Exporters.

---

## 🚀 3. Hướng dẫn Khởi chạy Hệ thống

### Yêu cầu Tiền đề
- Docker (phiên bản >= 20.10)
- Docker Compose (phiên bản >= 2.0)
- Git

### Các bước Thực hiện

1. **Clone Repository & Chuyển vào thư mục dự án**:
   ```bash
   git clone <URL_REPOSITORY_GITHUB>
   cd "HTQL TaiSan ThietBi"
   ```

2. **Cấu hình File Môi trường**:
   Sao chép file mẫu `.env.example` thành `.env` (có thể điều chỉnh mật khẩu nếu muốn):
   ```bash
   cp .env.example .env
   ```

3. **Khởi chạy Hệ thống bằng Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

4. **Kiểm tra Trạng thái Các Container**:
   ```bash
   docker compose ps
   ```

---

## 🌐 4. Đường dẫn Truy cập Các Dịch vụ

| Dịch Vụ | Đường Dẫn Truy Cập | Tài Khoản Mặc Định |
| :--- | :--- | :--- |
| **Website Quản lý Tài sản** | `https://localhost` hoặc `http://localhost` | Khai báo trực tiếp trên UI |
| **pgAdmin (Quản trị DB)** | `http://localhost/pgadmin/` | Email: `admin@asset.local`<br>Pass: `AdminPgPass2026!` |
| **Grafana Dashboard** | `http://localhost/grafana/` | User: `admin`<br>Pass: `GrafanaAdminPass2026!` |
| **Prometheus Server** | `http://localhost:9090` | N/A |
| **App Healthcheck** | `http://localhost:3000/health` | API JSON |
| **App Prometheus Metrics** | `http://localhost:3000/metrics` | API Text Metrics |

---

## 🔒 5. Biện pháp Security Hardening Đã Áp Dụng

1. **Non-Root Containers**: Web App chạy với `USER 10001:10001` (`appuser`), Prometheus chạy với `user: 65534:65534`. Hạn chế triệt để nguy cơ Container Escape nâng quyền root host.
2. **Network Isolation**: Tách làm 3 mạng độc lập (`frontend-net`, `backend-net`, `monitoring-net`). PostgreSQL chỉ giao tiếp trong `backend-net`, không mở port công khai ra host ngoài.
3. **OWASP Security Headers**:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Content-Security-Policy`
4. **Hạn chế Tài nguyên (Resource Limits)**: Thiết lập giới hạn CPU và RAM đối với tất cả các container nhằm chống tấn công DoS/DDoS hoặc tràn bộ nhớ.
5. **Mật khẩu & Quản lý Bí mật**: Sử dụng file `.env` không commit vào git công khai, mật khẩu phức tạp độ dài >12 ký tự có chứa ký tự đặc biệt.

---

## 6. Nhật ký Log tập trung Loki & LogQL Sample Queries

Truy cập `Grafana → Explore → chọn Datasource Loki`.

### Truy vấn 1 – Xem tất cả log của Web App

```logql
{container="web-app"}
```

Dùng để xem toàn bộ log phát sinh từ container Web App.

### Truy vấn 2 – Lọc log có chứa lỗi

```logql
{container=~".+"} |= "error"
```

Dùng để tìm các dòng log có chứa từ khóa `error`.

### Truy vấn 3 – Thống kê tốc độ phát sinh log trong 1 phút

```logql
rate({container=~".+"}[1m])
```

Dùng để thống kê tốc độ phát sinh log trong khoảng thời gian 1 phút.

### Truy vấn 4 – Xem log truy cập của Nginx

```logql
{container="nginx"} |~ "GET /assets"
```

Dùng để lọc các request GET đến đường dẫn `/assets`.

### Truy vấn 5 – Xem toàn bộ log của các container

```logql
{container=~".+"}
```

Dùng để xem log của tất cả container được Promtail thu thập.

## 📝 7. Lịch sử Git Commits Quy chuẩn

- **Commit 1**: `feat: init web app, postgresql, pgadmin & nginx reverse proxy with ssl`
- **Commit 2**: `feat: integrate prometheus, grafana, cadvisor, postgres & nginx exporters`
- **Commit 3**: `feat: add centralized logging stack loki, promtail & logql query specs`
- **Commit 4**: `sec: apply container hardening, non-root user, network isolation & docs`

---

## 📄 8. Tạo Báo Cáo Tổng Hợp (Word / PDF >= 10 Trang)

Chạy script Python tự động tạo báo cáo `BaoCao_HTQL_TaiSan_ThietBi.docx`:
```bash
python report/generate_report.py
```
Báo cáo tạo ra bao gồm trang bìa chuẩn thực tập, nội dung chi tiết 6 bước triển khai, hình vẽ sơ đồ hệ thống, hướng dẫn LogQL, kết quả đo kiểm Prometheus & Hardening.
