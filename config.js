// Cấu hình kết nối Supabase.
//
// AN TOÀN KHI ĐỂ TRONG REPO PUBLIC: publishable key được thiết kế để nằm trong
// mã nguồn trình duyệt. Nó không mở được dữ liệu nếu chưa đăng nhập — thứ chặn
// thật sự là Row Level Security cấu hình trong Supabase.
//
// TUYỆT ĐỐI KHÔNG đặt secret key (sb_secret_...) vào file này. Secret key chỉ
// dùng trong sync.py chạy trên máy nội bộ, đọc từ .env đã bị .gitignore chặn.
window.HAVAS_CONFIG = {
  supabaseUrl: "https://sgsrtpsvhnyjdmlevskr.supabase.co",
  supabasePublishableKey: "sb_publishable_csKLisvwTioCz-x06T9lSA_-nNvOUVA",
};
