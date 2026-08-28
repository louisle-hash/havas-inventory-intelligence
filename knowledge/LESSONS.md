# Bài học dự án Warehouse APP

## 2026-08-26 — Chẩn đoán nguồn dữ liệu SQL Server

**Việc:** Kết nối trực tiếp SQL Server để tự động hoá thay cho export CSV tay.

**Sai gì:** Tôi (Claude) đưa ra 2 giả thuyết, cả hai đều SAI:
1. Đoán tên stored procedure là `usp_Vcd_TongHopNhapXuatMousseBlock` — suy từ tên file
   CSV, nhưng tên file bị cắt cụt ở 60 ký tự. Tên thật có thêm hậu tố: `...BlockData`.
2. Đoán tham số `@_DocDate1` (khoảng ngày) làm mất hàng tồn cũ, gây KPI ">90 ngày = 0".
   Kiểm chứng bằng cách chạy 2 lần với cửa sổ 1 tháng và 19 tháng → kết quả GIỐNG HỆT.
   `@_DocDate1` không ảnh hưởng tồn kho; chỉ `@_DocDate2` (ngày chốt) mới có tác dụng.

**Sửa gì:** Chạy `sys.parameters` để lấy chữ ký thật của proc (19 tham số), và chạy
thử nghiệm A/B trên chính dữ liệu thay vì suy luận từ tên file.

**Rule rút ra:**
- KHÔNG suy tên đối tượng database từ tên file export — tên file luôn có thể bị cắt.
  Luôn xác minh bằng `sys.parameters` / `sys.objects`.
- Giả thuyết về dữ liệu phải kiểm chứng bằng phép so sánh A/B chạy thật, trước khi
  báo cho người dùng như một kết luận.

## 2026-08-26 — Sự thật về tồn kho mousse

- Kho quay vòng NHANH: tuổi tồn trung vị 7 ngày, block cũ nhất 82 ngày.
- ">90 ngày = 0" là ĐÚNG, không phải lỗi cửa sổ dữ liệu.
- Hệ quả: dải tuổi tồn hiện tại (0-7/8-30/31-60/61-90/91-180/>180) có 2 dải cuối
  VĨNH VIỄN RỖNG. Nên chia lại theo nhịp thật: 0-3/4-7/8-14/15-30/31-60/>60.
- `RowId` duy nhất tuyệt đối (2.178/2.178) → dùng làm khoá.
  `BarCodeTP` KHÔNG duy nhất (2.076/2.178) → không dùng làm khoá, và tính năng
  giao việc theo barcode phải lưu ý một barcode có thể ứng nhiều dòng.
- Cột `Color` trong ERP rỗng 100% → bắt buộc tách màu từ đuôi `ItemName`.

## 2026-08-26 — Dữ liệu app đã cũ 29 ngày

App hiển thị 491 block / 1.688,6 m³ (số ngày 28/07), trong khi thực tế ngày 26/08
là 298 block / 904,1 m³. Sai lệch +46% dung tích.

**Rule rút ra:** báo cáo cập nhật tay luôn âm thầm cũ đi. Mọi dashboard đưa cho ban
giám đốc phải hiển thị RÕ thời điểm dữ liệu, và tự cảnh báo khi quá hạn — đây là lý
do bảng `sync_runs` tồn tại.

## 2026-08-26 — Hiệu năng stored procedure biến động mạnh

Cùng một truy vấn, cùng tham số: lần chạy đầu 17,3s — lần sau 152,2s (gấp 9 lần).
Nguyên nhân chưa xác định (nhiều khả năng do tải máy chủ hoặc cache).

**Rule rút ra:** đặt timeout kết nối rộng tay (đang để 600s) và KHÔNG dùng thời gian
chạy của một lần đo duy nhất để kết luận về hiệu năng.

## 2026-08-27 — Rà soát toàn app, 10 lỗi được vá

Chạy rà soát có hệ thống sau khi hệ thống đã chạy tự động. Mười lỗi tìm được,
tất cả đều kiểm chứng bằng dữ liệu thật chứ không suy đoán.

| # | Lỗi | Hậu quả |
|---|---|---|
| 1 | Ngưỡng cũ 26 giờ tính theo lịch, trong khi đồng bộ chỉ chạy T2–T6 | Sáng thứ Hai nào cũng bật băng đỏ giả (62 giờ) |
| 2 | App lọc `movements` theo `report_date` nhưng bảng chỉ giữ một ngày | Chạy `--date` để vá ngày cũ là biểu đồ nhập xuất trống trơn |
| 3 | Ô "Ngày báo cáo" ghi đè `state.reportDate` mà không tải lại | `taskDueState()` dùng chung biến đó → mọi task đổi tình trạng hạn |
| 4 | `refreshData()` không có `.catch()` | Mất mạng lúc Realtime bắn → hỏng im lặng, số cũ vẫn hiện |
| 5 | Bộ lọc trỏ vào giá trị đã biến mất sau đồng bộ | Dropdown hiện "Tất cả" nhưng bảng trống, không rõ lý do |
| 6 | Tra block theo `barcode` vốn KHÔNG duy nhất | Bảng công việc hiện sai sản phẩm, đi tìm sai vị trí hàng |
| 7 | Nội dung task chèn thẳng vào `innerHTML` | Gõ "tồn <30 ngày" là vỡ dòng bảng |
| 8 | `data-product` / `title` không escape | Tên hàng có dấu nháy kép → drill-down trả 0 dòng |
| 9 | `sync.py` xoá sạch `movements` TRƯỚC khi ghi | Ghi lỗi giữa chừng → bảng trống tới lượt sau |
| 10 | Tài nguyên tĩnh không có vân phiên bản | Sau mỗi lần deploy, người dùng cũ vẫn chạy code cũ từ cache |

**Rule rút ra:**

- Ngưỡng cảnh báo "dữ liệu cũ" phải tính theo ĐÚNG lịch chạy. Đếm giờ theo lịch
  trong khi job chỉ chạy ngày làm việc thì cuối tuần nào cũng báo động giả — mà
  báo động giả lặp lại thì người dùng sẽ bỏ qua cả cảnh báo thật.
- Hai bảng có chiến lược lưu khác nhau (`inventory` giữ theo ngày, `movements`
  chỉ giữ bản mới nhất) thì KHÔNG được lọc chúng bằng cùng một điều kiện.
- Thao tác thay dữ liệu phải GHI TRƯỚC, XOÁ SAU. Xoá trước là tự tạo khoảng
  thời gian trống nếu bước ghi hỏng.
- Trang tĩnh không có bước build vẫn cần vân phiên bản trên tài nguyên, nếu
  không thì deploy xong người dùng cũ không nhận được bản mới.
- Mọi chuỗi tự do (do người nhập hoặc từ ERP) đổ vào `innerHTML` đều phải escape.
  Dữ liệu hôm nay sạch không có nghĩa là ngày mai vẫn sạch.

---

## 27/08/2026 — Phân quyền tài khoản + đưa việc giao lên Supabase

Làm giai đoạn 5 của lộ trình: bảng `app_users` (ba vai trò + danh sách màn hình
được xem), bảng `tasks` dùng chung, màn hình "Cấu hình tài khoản".

**Sai gì / suýt sai gì:**

| # | Vấn đề | Cách xử lý |
|---|---|---|
| 1 | Policy trên `app_users` phải đọc `app_users` để biết ai là admin | Tách ra hàm `security definer` — nếu không, Postgres báo đệ quy vô hạn và **không ai đăng nhập được** |
| 2 | Quản trị viên cuối cùng có thể tự hạ vai trò mình, khoá cửa vĩnh viễn | Constraint trigger chặn ở cuối giao dịch + hộp xác nhận trong app |
| 3 | Policy chặn được "ai sửa" nhưng không chặn được "sửa cột nào" | Cấp `grant update` theo từng cột — nếu không, member sửa được `created_by` của việc người khác thành tên mình |
| 4 | Ba màn hình quản trị lặng lẽ biến mất khi chưa chạy file SQL | Thêm banner nói rõ nguyên nhân và chỉ đúng file cần chạy |
| 5 | Dùng lại lớp `.stale-banner` (`display:flex`) cho câu có chèn `<code>` | Thẻ `code` bị tách thành cột riêng, câu vỡ làm đôi. Tách lớp `.setup-banner` |
| 6 | Bài kiểm thử báo hỏng nhưng mã đúng | Đếm `class="account-card` khớp luôn `account-card-head`/`-foot`. Lỗi ở phép đo |

**Rule rút ra:**

- **RLS tự tham chiếu thì luôn phải đi qua hàm `security definer`** kèm
  `set search_path`. Đây không phải mẹo tối ưu — để thiếu là hỏng toàn bộ đăng nhập.
- **Mọi hệ phân quyền phải có tấm lưới chống tự khoá cửa.** Người có quyền cao
  nhất bao giờ cũng có đường tự tước quyền của chính mình; phải chặn ở tầng
  database, đừng chỉ chặn bằng hộp xác nhận trong giao diện.
- **Policy quản "ai", grant theo cột quản "cái gì".** Có policy rồi vẫn phải hỏi
  tiếp: người này sửa được những cột nào?
- **Ẩn nút không phải là bảo mật.** Nhiều màn hình cùng đọc một bảng thì phân
  quyền theo màn hình chỉ là dọn giao diện. Phải nói thẳng điều đó ngay trong app
  cho người đi cấp quyền, nếu không họ sẽ tin là đã giấu được số liệu.
- **Đổi chỗ lưu dữ liệu thì phải mang theo dữ liệu cũ.** Chuyển localStorage →
  Supabase mà không có bước đẩy dữ liệu cũ lên là làm mất việc người ta đã giao.
  Dùng một cột `legacy_id` có ràng buộc unique để chạy bao nhiêu lần cũng không trùng.
- **Tính năng mới phải hỏng một cách biết nói.** Mã app lên trước khi chạy SQL là
  chuyện bình thường; điều không chấp nhận được là màn hình biến mất mà không
  giải thích lý do.
- **Bài kiểm thử báo hỏng thì nghi phép đo trước, đừng vội sửa mã.** Đếm chuỗi
  con trong HTML rất dễ khớp nhầm tên lớp dài hơn.
- **Kiểm RLS phải đổi vai trò TRƯỚC khi câu lệnh được lập kế hoạch.** Nhét
  `set_config('role', …)` vào một CTE giữa chừng câu lệnh thì Postgres đã lập kế
  hoạch xong với vai trò cũ — truy vấn đọc đủ dữ liệu và **trông y như RLS
  hỏng**. Cách đúng: `begin; set local role authenticated; set local
  "request.jwt.claims" = '{"sub":"…"}'; select …;` rồi `rollback`.
  Suýt kết luận sai là RLS không chặn được gì.
- **Phép thử phá hoại phải chạy trong transaction có đường lùi.** Muốn biết tấm
  lưới chống tự khoá cửa có hoạt động không thì phải thử hạ đúng quản trị viên
  duy nhất. Dùng `begin; …; set constraints all immediate; rollback;` —
  trigger hoãn-lại bị ép chạy ngay, thấy được kết quả mà không commit gì.

---

## 28/08/2026 — Màn hình "Theo khách hàng"

Yêu cầu: thêm màn hình phân tích theo khách hàng. Việc đầu tiên làm không phải
là vẽ giao diện, mà là **đi tìm xem dữ liệu có chứa khách hàng không**.

Câu trả lời: ERP **không có** cột khách hàng. Tên khách nằm lẫn trong ô ghi chú
tự do, và chỉ quy được **52,9%** khối lượng kho về một khách.

**Rule rút ra:**

- **Trước khi thiết kế một màn hình, hãy đi hỏi dữ liệu, đừng hỏi trí tưởng
  tượng.** Nếu bắt tay vẽ ngay theo yêu cầu, sẽ ra một màn hình đẹp dựa trên
  một cột không tồn tại. Mười lăm phút đọc `sync.py` và đếm dữ liệu thật đã đổi
  hoàn toàn nội dung buổi tư vấn.
- **Đo độ phủ TRƯỚC khi hứa.** Con số 52,9% là thứ quyết định màn hình này nên
  trông như thế nào — nó buộc phải có một thanh "độ tin cậy" ngay đầu trang thay
  vì một dòng chú thích nhỏ ở góc.
- **Khi buộc phải diễn giải dữ liệu, phải trả lại đường lần ngược.** App vốn có
  nguyên tắc "là gương trung thực của ERP". Màn hình này phá lệ, nên phải bù
  bằng ba thứ: công khai luật gộp, hiện tỷ lệ không quy được, và nút xem nguyên
  văn từng chuỗi gốc. Diễn giải mà không cho kiểm chứng ngược thì thành bịa.
- **Ô nhập tự do luôn chứa nhiều hơn một loại thông tin.** Ô "mã đơn" ở đây chứa
  cả tên khách, lệnh sản xuất, tình trạng lỗi và nhóm nội bộ. Phân loại phải bắt
  đầu bằng việc *liệt kê hết các loại*, không phải bằng việc viết regex.
- **Cẩn thận hai chuỗi giống nhau ở vài ký tự đầu nhưng khác nhóm hẳn.**
  `ĐỔ TN` là thí nghiệm, `ĐỔ DƯ` là ghi chú lỗi. Thứ tự luật quyết định đúng sai.
- **Thêm màn hình mới thì phải cấp quyền cho màn hình đó.** Đặt vào `default` của
  cột `allowed_pages` chỉ có tác dụng với tài khoản tạo SAU. Tài khoản đã có phải
  `array_append` thêm, nếu không cả nhóm không thấy màn hình mới — chỉ quản trị
  viên thấy, và sẽ tưởng là đã xong.
- **Bài kiểm thử ghi cứng con số sẽ hỏng khi thêm tính năng.** "Xem được 9 màn
  hình nghiệp vụ" hỏng ngay khi có màn hình thứ 10. Cho phép đo tự tính từ
  `pageConfig` thay vì ghi số.

**Bỏ một màn hình (28/08/2026) — rule rút ra:**

- **Gỡ màn hình thì phải tra hàm nào dùng CHUNG trước.** `actionsList()` trông
  như của riêng màn hình "Phương án xử lý" vì trùng tên, nhưng Tổng quan và Tuổi
  tồn cũng gọi nó. `icons.actions` cũng vậy — không còn là icon màn hình nhưng
  vẫn là icon thẻ số ở hai nơi. Xoá theo tên là gãy hai trang khác.
- **Gỡ màn hình cũng phải gỡ quyền của màn hình đó.** Để `'actions'` nằm lại
  trong `allowed_pages` thì vô hại hôm nay, nhưng sẽ tự sống lại nếu sau này có
  ai đặt một trang trùng tên.
- **Đổi xong thì bấm thử TẤT CẢ các trang còn lại**, không chỉ trang vừa đụng.
  Mười hai trang, mất mười giây, bắt được lỗi mà kiểm thử đơn vị không thấy.

---

## 28/08/2026 — Rà soát trùng lặp biểu đồ

**Rule rút ra:**

- **So trùng bằng cách so NGUYÊN VĂN thứ app dựng ra, đừng so bằng mắt.** Hai
  khối tên khác nhau ở hai màn hình khác nhau hoá ra giống nhau từng ký tự. Nhìn
  tiêu đề thì không bao giờ phát hiện được.
- **Nguy hiểm hơn trùng lặp là cùng một tên hai con số.** "SX dư" hiện 324,7 m³
  ở màn hình này và 201,2 m³ ở màn hình kia vì một bên lọc sẵn `>30 ngày` mà
  không nói. Trùng lặp làm người dùng chán; mâu thuẫn làm người dùng mất tin.
- **Tên khối phải khớp với thứ hàm thực sự vẽ.** `heatmap()` chia theo trạng
  thái, nhưng được đặt tên "Tồn theo tuổi trong từng kho". Đọc tiêu đề mà không
  đọc hàm là bỏ lọt.
- **Một chiều phân tích chỉ còn một giá trị thì nó không còn là chiều phân
  tích.** Cả màn hình "Theo kho" và ô lọc Kho đều vô nghĩa khi chỉ có TP20. Cho
  **tự ẩn theo dữ liệu** thay vì xoá — có kho thứ hai là tự sống lại, không cần
  ai nhớ bật.
- **Trước khi thêm chỉ số mới, hãy xem dữ liệu đã có gì chưa dùng.** Bảng
  `snapshots` giữ số tổng hợp mỗi ngày từ lâu mà chỉ Nhật ký đọc tới. "So với
  hôm qua" không cần thêm một dòng dữ liệu nào.
- **Số tổng hợp sẵn KHÔNG đi qua bộ lọc — phải chặn khi người dùng đang lọc.**
  So một con số đã lọc với một con số chưa lọc ra kết quả sai mà nhìn vẫn hợp lý.
  Đó là loại lỗi không ai phát hiện.
- **Mũi tên tăng giảm nên để trung tính khi dữ liệu không nói tốt xấu.** Tồn kho
  tăng không hẳn tốt. Tô xanh/đỏ là áp phán xét mà số liệu không có.

---

## 28/08/2026 — Sắp xếp bảng nhảy lộn xộn

**Rule rút ra:**

- **Đừng dùng chung một hàm bóc số cho cả số MÁY lẫn chữ NGƯỜI ĐỌC.** Số máy là
  `14.6`, chữ hiển thị là `1.949,0 m³` — hai quy ước ngược nhau về dấu chấm. Một
  hàm phục vụ cả hai thì kiểu gì cũng sai một bên. Đây chính là lỗi làm 14,6
  ngày thành 146.
- **Đừng đoán kiểu dữ liệu từ TÊN cột.** "Ngày nhập" chứa chữ "ngày" nên bị coi
  là số; "Dung tích" không chứa từ khoá nào nên bị coi là chữ. Suy từ **giá trị
  thật trong ô** thì không bao giờ sai theo cách đó.
- **Bỏ dấu ngăn nghìn phải có điều kiện:** chỉ bỏ dấu chấm đứng trước đúng ba
  chữ số. `replace(/\./g, "")` là bỏ tất, kể cả dấu thập phân.
- **Bảng có dòng phụ `colspan` thì sắp xếp phải kéo nó đi theo.** Nếu không,
  thông báo lỗi của lượt chạy này bị gán sang lượt chạy khác — sai dữ liệu chứ
  không chỉ xấu giao diện.
- **Có bảng không nên cho sắp xếp.** Bảng mỗi dòng một đơn vị (m³, ngày, %) thì
  sắp xếp chỉ tạo ra thứ tự vô nghĩa trông như có nghĩa.
- **Kiểm bằng cách bấm thật mọi cột, cả hai chiều.** 138 lượt bấm chạy trong
  vài giây và bắt được hai lỗi mà đọc mã không thấy.
