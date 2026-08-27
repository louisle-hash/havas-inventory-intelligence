# Kiểm chứng dữ liệu kéo từ SQL Server

- **Ngày:** 26/08/2026
- **Test cái gì:** đối chiếu dữ liệu `sync.py` kéo về với dữ liệu gốc trong ERP
- **Yêu cầu từ:** anh Louis — "xuất ra Excel để kiểm chứng, lấy đầy đủ hết tất cả dòng và cột"
- **File:** `du-lieu-tho-tu-sql_2026-08-26.xlsx` (0,86 MB)

## Nguồn

| | |
|---|---|
| Máy chủ | `115.75.10.155:1433` |
| Database | `B7R2_Havas_NB_2015` |
| Stored procedure | `usp_Vcd_TongHopNhapXuatMousseBlockData` |
| Khoảng ngày | `@_DocDate1 = 2025-01-01` → `@_DocDate2 = 2026-08-26` |

Toàn bộ 12 tham số ghi đầy đủ trong sheet **4. Đối chiếu**.

## Bốn sheet

| Sheet | Nội dung |
|---|---|
| 4. Đối chiếu | Tham số, số lượng, bảng tổng kiểm tra. Đặt đầu tiên cho dễ thấy |
| 1. Thô từ SQL | **3.183 dòng × 44 cột — nguyên trạng, chưa qua bất kỳ xử lý nào** |
| 2. Tồn kho đã chuẩn hoá | 298 dòng × 28 cột — chính là dữ liệu nằm trong Supabase |
| 3. Biến động nhập xuất | 5.679 dòng × 10 cột — sự kiện nhập/xuất sinh ra từ sheet 1 |

## Cách đối chiếu

1. Mở DBeaver, chạy đúng script với các tham số trong sheet 4
2. So số dòng trả về với ô ghi tổng dòng thô
3. So tổng `CloseInventory` với bảng TỔNG KIỂM TRA
4. Sheet 1 chưa qua xử lý nào, so trực tiếp được với lưới kết quả của DBeaver

Bảng tổng kiểm tra để **hai cột cạnh nhau**: công thức Excel và số Python tính độc lập.
Khớp nhau nghĩa là dữ liệu trong file đúng với dữ liệu đã đọc từ SQL.

## Kết luận

Chờ anh Louis đối chiếu.

## Lưu ý

File chứa dữ liệu kho thật. `.gitignore` đã chặn `*.xlsx` và cả thư mục `test/`,
nên không lọt lên GitHub. Không gửi ra ngoài công ty.
