import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const { supabaseUrl, supabasePublishableKey } = window.HAVAS_CONFIG;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
window.supabase = supabase;

const els = {
  screen: document.getElementById("auth-screen"),
  form: document.getElementById("auth-form"),
  email: document.getElementById("auth-email"),
  password: document.getElementById("auth-password"),
  submit: document.getElementById("auth-submit"),
  error: document.getElementById("auth-error"),
  reveal: document.getElementById("auth-reveal"),
  identity: document.getElementById("auth-identity"),
  signOut: document.getElementById("auth-signout"),
};

// Thông báo lỗi viết lại theo ngôn ngữ người dùng: nói rõ sai gì và sửa thế nào.
function readableError(error) {
  const raw = (error?.message || "").toLowerCase();
  if (raw.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu chưa đúng. Kiểm tra lại giúp bạn.";
  }
  if (raw.includes("email not confirmed")) {
    return "Tài khoản chưa được xác nhận. Liên hệ quản trị viên để kích hoạt.";
  }
  if (raw.includes("too many requests") || raw.includes("rate limit")) {
    return "Thử quá nhiều lần. Đợi khoảng một phút rồi đăng nhập lại.";
  }
  if (raw.includes("signups not allowed") || raw.includes("not allowed")) {
    return "Email này chưa được cấp quyền xem báo cáo. Liên hệ bộ phận IT.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
  }
  return error?.message || "Không đăng nhập được. Thử lại giúp bạn.";
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = !message;
}

function setBusy(busy) {
  els.submit.disabled = busy;
  els.submit.textContent = busy ? "Đang đăng nhập…" : "Đăng nhập";
  els.form.classList.toggle("is-busy", busy);
}

function lockScreen() {
  document.body.classList.add("auth-locked");
  document.body.classList.remove("auth-pending");
  els.screen.hidden = false;
  requestAnimationFrame(() => els.email?.focus());
}

function unlockScreen(session) {
  document.body.classList.remove("auth-locked", "auth-pending");
  els.screen.hidden = true;
  const email = session?.user?.email || "";
  if (els.identity) {
    els.identity.textContent = email;
    els.identity.title = email;
  }
  startApp();
}

// app.js không tự chạy nữa; chỉ khởi động sau khi có phiên đăng nhập hợp lệ.
let appStarted = false;
function startApp() {
  if (appStarted) return;
  appStarted = true;
  window.__authReady = true;
  window.__startApp?.();
}

// Supabase chỉ lưu MỐC ĐĂNG NHẬP GẦN NHẤT của mỗi người, và schema auth không
// đọc được qua API. Nên tự ghi một dòng vào login_log sau mỗi lần đăng nhập
// thành công — đó là nguồn cho màn hình Nhật ký.
// Ghi lỗi thì bỏ qua: không được để việc ghi nhật ký chặn đường vào app.
async function ghiNhatKyDangNhap(session) {
  try {
    await supabase.from("login_log").insert({
      user_id: session.user.id,
      email: session.user.email,
      user_agent: navigator.userAgent.slice(0, 300),
    });
  } catch (error) {
    console.warn("Không ghi được nhật ký đăng nhập:", error);
  }
}

els.form?.addEventListener("submit", async event => {
  event.preventDefault();
  showError("");
  setBusy(true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: els.email.value.trim(),
    password: els.password.value,
  });
  setBusy(false);
  if (error) {
    showError(readableError(error));
    els.password.focus();
    els.password.select();
    return;
  }
  if (data?.session) ghiNhatKyDangNhap(data.session);
});

els.reveal?.addEventListener("click", () => {
  const shown = els.password.type === "text";
  els.password.type = shown ? "password" : "text";
  els.reveal.setAttribute("aria-label", shown ? "Hiện mật khẩu" : "Ẩn mật khẩu");
  els.reveal.classList.toggle("is-shown", !shown);
  els.password.focus();
});

els.signOut?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    window.location.reload();
    return;
  }
  if (session) unlockScreen(session);
});

const { data } = await supabase.auth.getSession();
if (data.session) unlockScreen(data.session);
else lockScreen();
