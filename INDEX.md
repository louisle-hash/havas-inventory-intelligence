# Havas Inventory Intelligence — Mục lục dự án

Dashboard tồn kho mousse block cho ban giám đốc. Dữ liệu kéo tự động từ SQL Server
của ERP, lưu tại Supabase, hiển thị bằng trang tĩnh trên GitHub Pages.

Cập nhật mục lục: 27/08/2026 (lần 2 — thêm phân quyền)

## File sống (đang chạy)

| File | Vai trò |
|---|---|
| `index.html` | Khung app: màn hình đăng nhập + vỏ dashboard |
| `app.js` | Toàn bộ logic dashboard, 12 màn hình (màn hình "Theo kho" tự ẩn khi chỉ có một kho có tồn), đọc dữ liệu từ Supabase. Gồm cả phân quyền, việc giao và phân tích khách hàng |
| `auth.js` | Đăng nhập/đăng xuất qua Supabase Auth, chặn app khi chưa đăng nhập |
| `config.js` | URL + publishable key của Supabase (an toàn khi công khai) |
| `styles.css` | Toàn bộ giao diện |
| `scripts/sync.py` | **Đồng bộ SQL Server → Supabase.** Chạy: `.venv/bin/python scripts/sync.py` |
| `scripts/build_data.py` | Đường cũ: CSV → JSON tĩnh. **Không còn chạy được** — file CSV đầu vào đã chuyển vào `obsolete/2026-08/du-lieu-cu/`. Giữ lại chỉ để đọc tham khảo |
| `scripts/cron-supabase.sql` | Bản sao lịch tự động đang chạy trong Supabase + cách tra khi nghi lịch hỏng |
| `scripts/phan-quyen-supabase.sql` | **ĐÃ CHẠY 27/08/2026.** Dựng bảng `app_users` (vai trò + màn hình được xem) và bảng `tasks` (việc giao dùng chung), kèm RLS. Giữ lại để dựng lại khi cần; chạy lại nhiều lần vẫn an toàn |
| `scripts/dat-secrets.py` | Đẩy cấu hình từ `.env` lên GitHub Secrets |
| `.env.example` | Mẫu cấu hình. Sao chép thành `.env` rồi điền |
| `Logo/` | Logo Havas |

## Thư mục

| Thư mục | Nội dung |
|---|---|
| `knowledge/` | **`BAN-GIAO.md` đọc trước tiên** — quyết định đã chốt, sự thật về dữ liệu, chỗ cất bí mật. Kèm lộ trình và bài học |
| `output/` | Ảnh chụp màn hình khi kiểm thử (bị .gitignore chặn) |
| `.venv/` | Môi trường Python cho `sync.py` (bị .gitignore chặn) |
| `obsolete/2026-08/du-lieu-cu/` | Dữ liệu cũ đã cho về hưu 27/08/2026: 2 file CSV export từ ERP (23/07, 28/07), 2 file Excel, `inventory.json`. **Giữ trên đĩa để tra, .gitignore chặn tuyệt đối** |

## Không bao giờ đưa lên GitHub

`.env` · `*.csv` · `*.xlsx` · `data/*.json` · `test/` · `obsolete/**/du-lieu-cu/`
— đã chặn sẵn trong `.gitignore`.

**Bài học 27/08/2026:** luật trong `.gitignore` KHÔNG gỡ được file đã được git
theo dõi từ trước. Hai file dữ liệu từng lọt vào repo dù luật đã có. Muốn chắc,
kiểm bằng `git ls-files` chứ đừng tin vào `.gitignore`:

```bash
git ls-files | grep -iE '\.csv|\.xlsx|\.json'
```
Repo là **công khai**, nên mọi dữ liệu kho phải nằm trong Supabase, không nằm trong repo.

## Hạ tầng

| Thành phần | Địa chỉ |
|---|---|
| SQL Server | `115.75.10.155:1433` · DB `B7R2_Havas_NB_2015` · máy `HAVAS` |
| Stored procedure | `usp_Vcd_TongHopNhapXuatMousseBlockData` (19 tham số, truyền 12) |
| Supabase | `https://sgsrtpsvhnyjdmlevskr.supabase.co` · Singapore |
| Bảng dữ liệu | `inventory` · `movements` · `snapshots` · `sync_runs` · `login_log` · `cron_trigger_log` · `app_users` · `tasks` |

Mô tả đầy đủ nằm ngay trong app: mở màn hình **"Cách app hoạt động"**.

## Việc còn lại

1. ~~Dựng lịch chạy tự động~~ — xong, Supabase pg_cron gọi ngược GitHub, xem `scripts/cron-supabase.sql`
2. ~~Gỡ `data/inventory.json` khỏi git~~ — xong. Lịch sử git cũ vẫn còn dữ liệu tháng 7 (quyết định giữ nguyên)
3. ~~Chia lại dải tuổi tồn~~ — **đã bỏ**, lý do trong `knowledge/BAN-GIAO.md` mục 7
4. ~~Chạy `scripts/phan-quyen-supabase.sql` trên Supabase~~ — xong 27/08/2026, đã nghiệm
   thu RLS, bảng kết quả ở `knowledge/BAN-GIAO.md` mục 7
5. Cấp thêm màn hình quản trị cho ai cần — làm ngay trong app, màn hình **Cấu hình tài khoản**
6. Xác nhận `SST` là khách hàng hay mã nội bộ (xem `knowledge/BAN-GIAO.md` mục 12)
7. Đề nghị kho chốt danh mục khách hàng trong ERP — 21% tồn đang không ghi mã đơn
