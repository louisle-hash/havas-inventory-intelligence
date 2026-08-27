# Havas Inventory Intelligence — Mục lục dự án

Dashboard tồn kho mousse block cho ban giám đốc. Dữ liệu kéo tự động từ SQL Server
của ERP, lưu tại Supabase, hiển thị bằng trang tĩnh trên GitHub Pages.

Cập nhật mục lục: 27/08/2026

## File sống (đang chạy)

| File | Vai trò |
|---|---|
| `index.html` | Khung app: màn hình đăng nhập + vỏ dashboard |
| `app.js` | Toàn bộ logic dashboard, 10 màn hình, đọc dữ liệu từ Supabase |
| `auth.js` | Đăng nhập/đăng xuất qua Supabase Auth, chặn app khi chưa đăng nhập |
| `config.js` | URL + publishable key của Supabase (an toàn khi công khai) |
| `styles.css` | Toàn bộ giao diện |
| `scripts/sync.py` | **Đồng bộ SQL Server → Supabase.** Chạy: `.venv/bin/python scripts/sync.py` |
| `scripts/build_data.py` | Đường cũ: CSV → JSON tĩnh. Giữ lại để đối chiếu, không còn dùng |
| `scripts/cron-supabase.sql` | Bản sao lịch tự động đang chạy trong Supabase + cách tra khi nghi lịch hỏng |
| `scripts/dat-secrets.py` | Đẩy cấu hình từ `.env` lên GitHub Secrets |
| `.env.example` | Mẫu cấu hình. Sao chép thành `.env` rồi điền |
| `Logo/` | Logo Havas |

## Thư mục

| Thư mục | Nội dung |
|---|---|
| `knowledge/` | **`BAN-GIAO.md` đọc trước tiên** — quyết định đã chốt, sự thật về dữ liệu, chỗ cất bí mật. Kèm lộ trình và bài học |
| `data/` | `inventory.json` — di sản của đường cũ, sẽ gỡ khỏi git ở bước dọn dẹp |
| `output/` | Ảnh chụp màn hình khi kiểm thử (bị .gitignore chặn) |
| `.venv/` | Môi trường Python cho `sync.py` (bị .gitignore chặn) |

## Không bao giờ đưa lên GitHub

`.env` · `*.csv` · `*.xlsx` · `data/*.json` — đã chặn sẵn trong `.gitignore`.
Repo là **công khai**, nên mọi dữ liệu kho phải nằm trong Supabase, không nằm trong repo.

## Hạ tầng

| Thành phần | Địa chỉ |
|---|---|
| SQL Server | `115.75.10.155:1433` · DB `B7R2_Havas_NB_2015` · máy `HAVAS` |
| Stored procedure | `usp_Vcd_TongHopNhapXuatMousseBlockData` (19 tham số, truyền 12) |
| Supabase | `https://sgsrtpsvhnyjdmlevskr.supabase.co` · Singapore |
| Bảng dữ liệu | `inventory` · `movements` · `snapshots` · `sync_runs` · `login_log` · `cron_trigger_log` |

Mô tả đầy đủ nằm ngay trong app: mở màn hình **"Cách app hoạt động"**.

## Việc còn lại

1. ~~Dựng lịch chạy tự động~~ — xong, Supabase pg_cron gọi ngược GitHub, xem `scripts/cron-supabase.sql`
2. ~~Gỡ `data/inventory.json` khỏi git~~ — xong. Lịch sử git cũ vẫn còn dữ liệu tháng 7 (quyết định giữ nguyên)
3. Chia lại dải tuổi tồn cho khớp nhịp kho thật (xem `knowledge/LESSONS.md`)
