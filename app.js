const state = {
  data: null,
  records: [],
  rawRecords: [],
  movements: [],
  filtered: [],
  page: "guide",
  reportDate: "2026-07-28",
  timeline: "week",
  movementMetric: "volume",
  tasks: [],
  tasksError: null,
  selectedTaskBarcode: "",
  // Hồ sơ phân quyền của chính người đang đăng nhập, đọc từ bảng app_users.
  profile: null,
  // Danh sách toàn bộ tài khoản — chỉ quản trị viên đọc được, nạp khi mở màn hình Cấu hình.
  users: [],
  filters: { warehouse: "all", product: "all", color: "all", age: "all", status: "all", size: "" },
};

const pageConfig = {
  guide: {
    label: "Hướng dẫn sử dụng",
    title: "Cách sử dụng báo cáo trong cuộc họp kho",
    description: "Đi từ bức tranh tổng quan đến từng barcode, cùng phân công người phụ trách và theo dõi thời hạn.",
    kicker: "Bắt đầu tại đây",
  },
  architecture: {
    label: "Cách app hoạt động",
    title: "Dữ liệu đi từ ERP tới màn hình này bằng cách nào",
    description: "Tài liệu kỹ thuật cho bộ phận IT: hạ tầng, đường kết nối, lịch đồng bộ và cách xử lý sự cố.",
    kicker: "Kiến trúc hệ thống",
  },
  overview: {
    label: "Tổng quan",
    title: "Tồn kho mousse dưới góc nhìn điều hành",
    description: "Ban quản trị kho nhìn nhanh tồn gì, ở đâu, nguyên nhân tồn và nhóm nào nên cùng xem xét trước.",
    kicker: "Điều hành tồn kho",
  },
  warehouse: {
    label: "Theo kho",
    title: "Kho nào đang giữ loại tồn nào",
    description: "Nhìn rõ vai trò kho, quy mô tồn và các nhóm nên cùng trao đổi tại từng kho.",
    kicker: "Phân tích kho",
  },
  product: {
    label: "Theo sản phẩm",
    title: "Sản phẩm và màu sắc đang chiếm dung tích",
    description: "Theo dõi sản phẩm, màu và trạng thái để cùng thống nhất hướng xử lý cho từng nhóm mousse.",
    kicker: "Phân tích sản phẩm",
  },
  customer: {
    label: "Theo khách hàng",
    title: "Nửa kho đang nằm đó cho ai",
    description: "Tách tên khách từ ô mã đơn của ERP, xem ai đang giữ tồn, hàng của ai nằm lâu và sản xuất dư dồn cho ai.",
    kicker: "Phân tích khách hàng",
  },
  aging: {
    label: "Tuổi tồn",
    title: "Theo dõi tuổi tồn kho",
    description: "Đo tuổi tồn theo ngày nhập để nhận diện vùng ổn định và các nhóm nên được quan tâm thêm.",
    kicker: "Tuổi tồn",
  },
  status: {
    label: "Trạng thái",
    title: "Hàng tồn đang phục vụ mục đích gì",
    description: "Tách rõ SX theo đơn hàng, SX dư và nhóm chưa xác định, sau đó đào sâu qua Remark và Remark 1.",
    kicker: "Trạng thái nghiệp vụ",
  },
  details: {
    label: "Chi tiết block",
    title: "Tra cứu block mousse đang tồn",
    description: "Xem theo block, vị trí, sản phẩm, màu sắc, trạng thái và lịch nhập xuất hiện tại.",
    kicker: "Chi tiết dữ liệu",
  },
  workflow: {
    label: "Luồng công việc",
    title: "Theo dõi công việc xử lý tồn kho",
    description: "Cùng theo dõi người phụ trách, thời hạn và tiến độ đến từng barcode mousse.",
    kicker: "Phối hợp công việc",
  },
  logs: {
    label: "Nhật ký",
    title: "Nhật ký hoạt động của hệ thống",
    description: "Ai đã vào app lúc nào, mỗi lượt đồng bộ chạy ra sao, và số liệu đổi thế nào qua từng ngày.",
    kicker: "Theo dõi vận hành",
  },
  admin: {
    label: "Cấu hình tài khoản",
    title: "Ai được vào, được xem gì, được sửa gì",
    description: "Đặt vai trò cho từng tài khoản và chọn những màn hình tài khoản đó được mở.",
    kicker: "Quản trị hệ thống",
  },
};

const statusColors = {
  "SX theo đơn hàng": "#202226",
  "SX dư": "#b22536",
  "Chưa xác định": "#9aa0a7",
};

const ageColors = {
  "0–7 ngày": "#cfd3d7",
  "8–30 ngày": "#9ca2a9",
  "31–60 ngày": "#686e76",
  "61–90 ngày": "#34373c",
  "91–180 ngày": "#7f2632",
  ">180 ngày": "#b22536",
  "Thiếu ngày nhập": "#707784",
};

const icons = {
  guide: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M8 20a3 3 0 010-6h11M9 8h6"/></svg>',
  architecture: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="4" width="7" height="6" rx="1"/><rect x="8.5" y="15" width="7" height="6" rx="1"/><path d="M6.5 10v2.5h11V10M12 12.5V15"/></svg>',
  overview: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  warehouse: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 9l9-5 9 5v11H3zM3 9h18M8 20v-6h8v6"/></svg>',
  product: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/></svg>',
  customer: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4"/><path d="M3 20a6 6 0 0112 0"/><path d="M16.5 5.5a3 3 0 010 5.4M18.5 20a6.4 6.4 0 00-2.2-4.6"/></svg>',
  aging: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  status: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M4 12h16M4 17h8"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>',
  // Không còn màn hình "Phương án xử lý" (bỏ 28/08/2026) nhưng biểu tượng này
  // vẫn được dùng làm icon thẻ số ở Luồng công việc và Theo khách hàng.
  actions: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4l8 4v8l-8 4-8-4V8z"/><path d="M9 12l2 2 4-4"/></svg>',
  workflow: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h7"/><path d="M16 12l1.5 1.5L20 11"/></svg>',
  logs: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 4h9a2 2 0 012 2v14H8z"/><path d="M5 7v11a2 2 0 002 2M11 9h5M11 13h5M11 17h3"/></svg>',
  admin: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0111 0"/><circle cx="17.5" cy="14.5" r="2.2"/><path d="M17.5 10.6v1.4M17.5 17v1.4M21 14.5h-1.4M15.4 14.5H14"/></svg>',
  details: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>',
  blocks: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="6" rx="1"/><rect x="4" y="13" width="16" height="6" rx="1"/></svg>',
  volume: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/></svg>',
  clock: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v8l5 3"/><circle cx="12" cy="12" r="9"/></svg>',
  flow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 7h10m0 0-3-3m3 3-3 3M19 17H9m0 0 3-3m-3 3 3 3"/></svg>',
};

const els = {
  nav: document.getElementById("nav-list"),
  pageContent: document.getElementById("page-content"),
  pageTitle: document.getElementById("page-title"),
  pageDescription: document.getElementById("page-description"),
  pageKicker: document.getElementById("page-kicker"),
  topTitle: document.getElementById("top-title"),
  scopeText: document.getElementById("scope-text"),
  syncTime: document.getElementById("sync-time"),
  reportDate: document.getElementById("report-date"),
  warehouseFilter: document.getElementById("warehouse-filter"),
  productFilter: document.getElementById("product-filter"),
  colorFilter: document.getElementById("color-filter"),
  ageFilter: document.getElementById("age-filter"),
  statusFilter: document.getElementById("status-filter"),
  sizeFilter: document.getElementById("size-filter"),
  filterBar: document.getElementById("filter-bar"),
  clearFilters: document.getElementById("clear-filters"),
  exportButton: document.getElementById("export-button"),
  menuButton: document.getElementById("menu-button"),
  sidebar: document.getElementById("sidebar"),
  scrim: document.getElementById("mobile-scrim"),
  toast: document.getElementById("toast"),
  staleBanner: document.getElementById("stale-banner"),
  modal: document.getElementById("product-modal"),
  modalBody: document.getElementById("product-modal-body"),
  modalTitle: document.getElementById("product-modal-title"),
  modalSubtitle: document.getElementById("product-modal-subtitle"),
  modalClose: document.getElementById("product-modal-close"),
  taskModal: document.getElementById("task-modal"),
  taskModalClose: document.getElementById("task-modal-close"),
  taskForm: document.getElementById("task-form"),
  taskBarcode: document.getElementById("task-barcode"),
  taskBarcodeContext: document.getElementById("task-barcode-context"),
  taskTitle: document.getElementById("task-title"),
  taskAssignee: document.getElementById("task-assignee"),
  taskStartDate: document.getElementById("task-start-date"),
  taskDeadline: document.getElementById("task-deadline"),
  taskPriority: document.getElementById("task-priority"),
  taskStatus: document.getElementById("task-status"),
  taskNote: document.getElementById("task-note"),
  taskCancel: document.getElementById("task-cancel"),
};

// Khoá localStorage của bản CŨ. App không còn ghi vào đây nữa — chỉ đọc một
// lần lúc khởi động để đẩy nốt việc cũ lên Supabase rồi xoá hẳn.
// Xem chuyenViecCuLenSupabase().
const TASK_STORAGE_KEY = "havas-inventory-tasks-v1";

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value || 0));
const formatDate = value => (value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—");
const escapeHtml = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escapeAttr = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const unique = values => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), "vi", { sensitivity: "base" }));
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);

function formatMetric(value, metric) {
  return metric === "units" ? `${formatNumber(value, 0)} block` : `${formatNumber(value, 1)} m³`;
}

function weightedAge(rows) {
  const valid = rows.filter(row => Number.isFinite(row.daysInStock));
  if (!valid.length) return 0;
  const weighted = valid.reduce((total, row) => total + row.daysInStock * Math.max(row.closeVolume || 0.0001, 0.0001), 0);
  const weight = valid.reduce((total, row) => total + Math.max(row.closeVolume || 0.0001, 0.0001), 0);
  return weighted / weight;
}

function badge(text) {
  const cls = text === "SX theo đơn hàng" ? "info" : text === "SX dư" ? "warning" : text === "Chưa xác định" ? "muted" : "success";
  return `<span class="badge badge-${cls}">${text}</span>`;
}

function kpiCard(label, value, note, icon, tone = "brand") {
  return `<article class="kpi-card tone-${tone}"><div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon">${icons[icon]}</span></div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></article>`;
}

function panel(title, subtitle, body, metric = "", extraClass = "") {
  return `<section class="panel ${extraClass}"><div class="panel-header"><div><h2>${title}</h2><p>${subtitle}</p></div>${metric ? `<span class="panel-metric">${metric}</span>` : ""}</div>${body}</section>`;
}

function optionsMarkup(items, selected, labeler = value => value) {
  return items.map(item => `<option value="${item}" ${item === selected ? "selected" : ""}>${labeler(item)}</option>`).join("");
}

function filtersScopeLabel() {
  // Ô kích thước là bộ lọc tự do, không nằm trong danh sách dropdown bên dưới,
  // nên phải nêu riêng — nếu không người dùng sẽ không hiểu vì sao bảng ít dòng.
  const scope = [];
  if (state.filters.warehouse !== "all") scope.push(state.filters.warehouse);
  if (state.filters.product !== "all") scope.push(state.filters.product);
  if (state.filters.color !== "all") scope.push(state.filters.color);
  if (state.filters.status !== "all") scope.push(state.filters.status);
  if (state.filters.age !== "all") scope.push(state.filters.age);
  if (state.filters.size) scope.push(`kích thước ${state.filters.size}`);
  return scope.length ? scope.join(" · ") : "Toàn bộ tồn kho";
}

function parseSortValue(text, type) {
  const value = String(text || "").trim();
  if (type === "number") {
    const normalized = value.replace(/\./g, "").replace(",", ".").match(/-?[\d.]+/);
    return normalized ? Number(normalized[0]) : 0;
  }
  if (type === "date") {
    const parsed = Date.parse(value.split("/").reverse().join("-"));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return value;
}

function enhanceSortableTables(root) {
  root.querySelectorAll("table").forEach(table => {
    if (table.dataset.sortReady) return;
    table.dataset.sortReady = "true";
    [...table.querySelectorAll("thead th")].forEach((header, index, headers) => {
      const label = header.textContent.trim();
      if (!label) return;
      const upper = label.toUpperCase();
      const type = /SỐ|M3|M³|NGÀY|TUỔI|TỒN|SL/.test(upper) ? "number" : /NHẬP|XUẤT/.test(upper) ? "date" : "text";
      header.innerHTML = `<button class="sort-button" type="button"><span>${label}</span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M5 3v10m0-10L2.5 5.5M5 3l2.5 2.5M11 13V3m0 10-2.5-2.5M11 13l2.5-2.5"/></svg></button>`;
      header.querySelector("button").addEventListener("click", () => {
        const direction = header.dataset.sortDirection === "asc" ? "desc" : "asc";
        headers.forEach(item => {
          item.dataset.sortDirection = "";
          item.querySelector(".sort-button")?.classList.remove("sorted-asc", "sorted-desc");
        });
        header.dataset.sortDirection = direction;
        header.querySelector(".sort-button").classList.add(direction === "asc" ? "sorted-asc" : "sorted-desc");
        const body = table.tBodies[0];
        const rows = [...body.rows].map((row, originalIndex) => ({ row, originalIndex }));
        rows.sort((a, b) => {
          const av = parseSortValue(a.row.cells[index]?.dataset.sortValue || a.row.cells[index]?.textContent || "", type);
          const bv = parseSortValue(b.row.cells[index]?.dataset.sortValue || b.row.cells[index]?.textContent || "", type);
          const result = type === "text"
            ? String(av).localeCompare(String(bv), "vi", { numeric: true, sensitivity: "base" })
            : av - bv;
          return result ? result * (direction === "asc" ? 1 : -1) : a.originalIndex - b.originalIndex;
        });
        rows.forEach(item => body.appendChild(item.row));
      });
    });
  });
}

function groupRows(rows, keyGetter) {
  return rows.reduce((groups, row) => {
    const key = typeof keyGetter === "function" ? keyGetter(row) : row[keyGetter];
    (groups[key] ||= []).push(row);
    return groups;
  }, {});
}

function productGroups(rows = state.filtered) {
  return Object.entries(groupRows(rows, row => row.productFull)).map(([productFull, items]) => ({
    productFull,
    product: items[0].product,
    color: items[0].color,
    warehouseMix: unique(items.map(item => item.warehouse)).join(", "),
    units: sum(items, "closeUnits"),
    volume: sum(items, "closeVolume"),
    age: weightedAge(items),
    statusLead: dominant(items, "status"),
    items,
  }));
}

function dominant(rows, key) {
  const counter = groupRows(rows, key);
  return Object.entries(counter).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "—";
}

function ageDistribution(rows = state.filtered, metric = "closeVolume") {
  const order = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"];
  return order.map(label => ({
    label,
    value: sum(rows.filter(row => row.ageBucket === label), metric),
    color: ageColors[label] || "#77808a",
  })).filter(item => item.value > 0 || item.label === "0–7 ngày");
}

function statusDistribution(rows = state.filtered, metric = "closeVolume") {
  return unique(rows.map(row => row.status)).map(label => ({
    label,
    value: sum(rows.filter(row => row.status === label), metric),
    color: statusColors[label] || "#6e7683",
  }));
}

function stackedDistribution(items, kind) {
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
  return `<div class="stacked-bar">${items.map(item => `<button class="stacked-segment" style="width:${Math.max(item.value / total * 100, 1)}%;background:${item.color}" data-drill-type="${kind}" data-drill-value="${item.label}" title="${item.label}: ${formatMetric(item.value, "volume")}"></button>`).join("")}</div>
    <div class="legend-list">${items.map(item => `<button class="legend-row legend-drill" data-drill-type="${kind}" data-drill-value="${item.label}"><span class="legend-swatch" style="background:${item.color}"></span><span class="legend-name">${item.label}</span><span class="legend-value">${formatNumber(item.value, 1)} ${kind === "status" ? "m³" : "m³"}</span></button>`).join("")}</div>`;
}

function matchMovement(event) {
  if (state.filters.warehouse !== "all" && event.warehouse !== state.filters.warehouse) return false;
  if (state.filters.product !== "all" && event.product !== state.filters.product) return false;
  if (state.filters.color !== "all" && event.color !== state.filters.color) return false;
  if (state.filters.status !== "all" && event.status !== state.filters.status) return false;
  return true;
}

function movementBuckets() {
  const key = state.timeline === "day" ? "date" : state.timeline === "week" ? "week" : "month";
  const events = state.movements.filter(matchMovement);
  const labels = unique(events.map(item => item[key])).filter(Boolean).slice(-10);
  return labels.map(label => {
    const receipt = events.filter(item => item[key] === label && item.type === "receipt");
    const delivery = events.filter(item => item[key] === label && item.type === "delivery");
    return {
      label,
      receiptUnits: sum(receipt, "units"),
      receiptVolume: sum(receipt, "volume"),
      deliveryUnits: sum(delivery, "units"),
      deliveryVolume: sum(delivery, "volume"),
    };
  });
}

function movementChart() {
  const buckets = movementBuckets();
  if (!buckets.length) return '<div class="empty-state"><strong>Chưa có nhịp nhập xuất</strong><span>Không có giao dịch phù hợp với bộ lọc hiện tại.</span></div>';
  const width = 760;
  const height = 304;
  const plot = { left: 52, right: 54, top: 24, bottom: 48 };
  const innerWidth = width - plot.left - plot.right;
  const innerHeight = height - plot.top - plot.bottom;
  const maxVolume = Math.max(...buckets.flatMap(item => [item.receiptVolume, item.deliveryVolume]), 1);
  const maxUnits = Math.max(...buckets.flatMap(item => [item.receiptUnits, item.deliveryUnits]), 1);
  const step = innerWidth / buckets.length;
  const barWidth = Math.min(25, step * .3);
  const receiptPoints = buckets.map((item, index) => {
    const x = plot.left + step * index + step / 2;
    const y = plot.top + innerHeight - item.receiptUnits / maxUnits * innerHeight;
    return { x, y, item };
  });
  const deliveryPoints = buckets.map((item, index) => {
    const x = plot.left + step * index + step / 2;
    const y = plot.top + innerHeight - item.deliveryUnits / maxUnits * innerHeight;
    return { x, y, item };
  });
  const receiptLinePath = receiptPoints.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const deliveryLinePath = deliveryPoints.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const grid = [0, .25, .5, .75, 1];
  const receiptVolumeTotal = buckets.reduce((total, item) => total + item.receiptVolume, 0);
  const deliveryVolumeTotal = buckets.reduce((total, item) => total + item.deliveryVolume, 0);
  const netVolume = receiptVolumeTotal - deliveryVolumeTotal;
  const outboundRate = receiptVolumeTotal ? deliveryVolumeTotal / receiptVolumeTotal * 100 : 0;
  const mostVolatile = [...buckets].sort((a, b) =>
    Math.abs(b.receiptVolume - b.deliveryVolume) - Math.abs(a.receiptVolume - a.deliveryVolume)
  )[0];
  return `<div class="panel-controls">
      <div class="segmented-control" data-control="timeline">
        ${["day", "week", "month"].map(value => `<button type="button" class="${state.timeline === value ? "active" : ""}" data-timeline="${value}">${value === "day" ? "Ngày" : value === "week" ? "Tuần" : "Tháng"}</button>`).join("")}
      </div>
      <div class="combo-legend" aria-label="Chú giải">
        <span><i class="legend-column receipt"></i>m³ nhập</span>
        <span><i class="legend-column delivery"></i>m³ xuất</span>
        <span><i class="legend-line receipt"></i>Block nhập</span>
        <span><i class="legend-line delivery"></i>Block xuất</span>
      </div>
    </div>
    <div class="svg-chart combo-chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Nhịp nhập xuất kho: cột là mét khối, đường là số lượng block">
        ${grid.map(ratio => {
          const y = plot.top + innerHeight - ratio * innerHeight;
          return `<line class="chart-gridline" x1="${plot.left}" y1="${y}" x2="${width - plot.right}" y2="${y}"></line>
            <text class="chart-axis-label" x="${plot.left - 9}" y="${y + 4}" text-anchor="end">${formatNumber(maxVolume * ratio, 0)}</text>
            <text class="chart-axis-label" x="${width - plot.right + 9}" y="${y + 4}">${formatNumber(maxUnits * ratio, 0)}</text>`;
        }).join("")}
        <text class="chart-axis-title" x="${plot.left}" y="12">m³ nhập / xuất</text>
        <text class="chart-axis-title" x="${width - plot.right}" y="12" text-anchor="end">Block nhập / xuất</text>
        ${buckets.map((item, index) => {
          const x = plot.left + step * index + step / 2;
          const receiptHeight = item.receiptVolume / maxVolume * innerHeight;
          const deliveryHeight = item.deliveryVolume / maxVolume * innerHeight;
          return `<g class="chart-drill flow-column receipt-column" tabindex="0" data-drill-type="${state.timeline}" data-drill-value="${item.label}">
              <rect x="${x - barWidth - 2}" y="${plot.top + innerHeight - receiptHeight}" width="${barWidth}" height="${receiptHeight}" rx="4"></rect>
              <title>${labelForTimeline(item.label)} · Nhập ${formatNumber(item.receiptVolume, 1)} m³ / ${formatNumber(item.receiptUnits, 0)} block</title>
            </g>
            <g class="chart-drill flow-column delivery-column" tabindex="0" data-drill-type="${state.timeline}" data-drill-value="${item.label}">
              <rect x="${x + 2}" y="${plot.top + innerHeight - deliveryHeight}" width="${barWidth}" height="${deliveryHeight}" rx="4"></rect>
              <title>${labelForTimeline(item.label)} · Xuất ${formatNumber(item.deliveryVolume, 1)} m³ / ${formatNumber(item.deliveryUnits, 0)} block</title>
            </g>
            <text class="chart-axis-label" x="${x}" y="${height - 18}" text-anchor="middle">${labelForTimeline(item.label)}</text>`;
        }).join("")}
        <path class="flow-units-line receipt-units-line" d="${receiptLinePath}"></path>
        <path class="flow-units-line delivery-units-line" d="${deliveryLinePath}"></path>
        ${receiptPoints.map((point, index) => `<g class="chart-drill flow-point receipt-point" tabindex="0" data-drill-type="${state.timeline}" data-drill-value="${point.item.label}" style="--point-delay:${index * 45}ms">
            <circle cx="${point.x}" cy="${point.y}" r="5"></circle>
            <title>${labelForTimeline(point.item.label)} · Nhập ${formatNumber(point.item.receiptUnits, 0)} block</title>
          </g>`).join("")}
        ${deliveryPoints.map((point, index) => `<g class="chart-drill flow-point delivery-point" tabindex="0" data-drill-type="${state.timeline}" data-drill-value="${point.item.label}" style="--point-delay:${index * 45}ms">
            <circle cx="${point.x}" cy="${point.y}" r="4"></circle>
            <title>${labelForTimeline(point.item.label)} · Xuất ${formatNumber(point.item.deliveryUnits, 0)} block</title>
          </g>`).join("")}
      </svg>
    </div>
    <div class="flow-insights">
      <div><span>Tổng nhập</span><strong>${formatNumber(receiptVolumeTotal, 1)} m³</strong><small>${formatNumber(buckets.reduce((total, item) => total + item.receiptUnits, 0), 0)} block</small></div>
      <div><span>Tổng xuất</span><strong>${formatNumber(deliveryVolumeTotal, 1)} m³</strong><small>${formatNumber(buckets.reduce((total, item) => total + item.deliveryUnits, 0), 0)} block</small></div>
      <div class="${netVolume >= 0 ? "net-in" : "net-out"}"><span>Luồng ròng</span><strong>${netVolume >= 0 ? "+" : ""}${formatNumber(netVolume, 1)} m³</strong><small>${netVolume >= 0 ? "Nhập cao hơn xuất" : "Xuất cao hơn nhập"}</small></div>
      <div><span>Tỷ lệ xuất / nhập</span><strong>${formatNumber(outboundRate, 1)}%</strong><small>Biến động mạnh nhất: ${labelForTimeline(mostVolatile.label)}</small></div>
    </div>`;
}

function rankChart(items, accent = "#b22536") {
  const max = Math.max(...items.map(item => item.value), 1);
  return `<div class="rank-chart">${items.map((item, index) => {
    const percentage = item.value / max * 100;
    return `<button class="rank-row" data-drill-type="${item.drillType}" data-drill-value="${escapeAttr(item.drillValue)}">
      <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="rank-copy"><strong title="${escapeAttr(item.label)}">${escapeHtml(item.label)}</strong><span>${item.note || "Dung tích đang tồn"}</span></span>
      <span class="rank-track"><i style="width:${Math.max(percentage, 2)}%;--rank-color:${item.color || accent}"></i></span>
      <b>${formatNumber(item.value, 1)} m³</b>
    </button>`;
  }).join("")}</div>`;
}

function colorInventoryChart(rows = state.filtered) {
  const items = colorRows(rows).slice(0, 8);
  const total = items.reduce((acc, item) => acc + item.volume, 0) || 1;
  let cursor = 0;
  const swatches = ["#171719", "#b22536", "#4c4f54", "#7d8289", "#aeb3b8", "#7f2632", "#d3d6d9", "#5e1822"];
  const stops = items.map((item, index) => {
    const start = cursor;
    cursor += item.volume / total * 100;
    item.chartColor = swatches[index % swatches.length];
    return `${item.chartColor} ${start}% ${cursor}%`;
  }).join(",");
  return `<div class="color-inventory">
    <div class="color-donut" style="--donut:${stops}"><div><strong>${formatNumber(total, 1)}</strong><span>m³ đang tồn</span></div></div>
    <div class="color-breakdown">${items.map(item => `<button data-drill-type="color" data-drill-value="${item.color}">
      <i style="background:${item.chartColor}"></i><span><strong>${item.color}</strong><small>${item.products} sản phẩm · ${formatNumber(item.units, 0)} block</small></span><b>${formatNumber(item.volume / total * 100, 1)}%</b>
    </button>`).join("")}</div>
  </div>`;
}

function ageByColorChart(rows = state.filtered) {
  const items = colorRows(rows).sort((a, b) => b.age - a.age).slice(0, 8);
  const maxAge = Math.max(...items.map(item => item.age), 1);
  return `<div class="age-color-chart">${items.map(item => `<button data-drill-type="color" data-drill-value="${item.color}">
    <span class="age-color-name"><strong>${item.color}</strong><small>${formatNumber(item.volume, 1)} m³</small></span>
    <span class="age-color-track"><i style="width:${Math.max(item.age / maxAge * 100, 2)}%"></i><em style="left:${Math.min(item.age / maxAge * 100, 96)}%"></em></span>
    <b>${formatNumber(item.age, 0)} ngày</b>
  </button>`).join("")}</div>`;
}

function ageBucketChart(rows = state.filtered) {
  const items = ageDistribution(rows);
  const max = Math.max(...items.map(item => item.value), 1);
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
  return `<div class="age-column-chart">${items.map(item => `<button data-drill-type="age" data-drill-value="${item.label}">
    <span class="age-column-value">${formatNumber(item.value, 1)} m³</span>
    <span class="age-column-stage"><i style="height:${Math.max(item.value / max * 100, 3)}%;background:${item.color}"></i></span>
    <strong>${item.label}</strong>
    <small>${formatNumber(item.value / total * 100, 1)}% tồn kho</small>
  </button>`).join("")}</div>`;
}

function labelForTimeline(label) {
  if (state.timeline === "day") return label.slice(5).split("-").reverse().join("/");
  if (state.timeline === "month") return `${label.slice(5)}/${label.slice(2, 4)}`;
  return label.replace("-", " ");
}

function warehouseCards(rows = state.filtered) {
  return unique(state.rawRecords.map(item => item.warehouse)).map(warehouse => {
    const items = rows.filter(row => row.warehouse === warehouse);
    const raw = state.rawRecords.filter(row => row.warehouse === warehouse);
    const title = items[0]?.warehouseLabel || warehouse;
    const role = items[0]?.warehouseRole || raw[0]?.warehouseRole || "Kho khác";
    return `<article class="warehouse-card ${items.length ? "" : "is-empty"}">
        <div class="warehouse-card-head">
          <div><span class="eyebrow">${title}</span><h3>${role}</h3></div>
          <button class="ghost-button" data-drill-type="warehouse" data-drill-value="${warehouse}">Mở phân tích</button>
        </div>
        <div class="warehouse-kpis">
          <div><span>Block tồn</span><strong>${formatNumber(sum(items, "closeUnits"), 0)}</strong></div>
          <div><span>Dung tích tồn</span><strong>${formatNumber(sum(items, "closeVolume"), 1)} m³</strong></div>
          <div><span>Tuổi tồn TB</span><strong>${formatNumber(weightedAge(items), 0)} ngày</strong></div>
        </div>
        <div class="warehouse-legend">
          ${statusDistribution(items).map(item => `<div><span style="background:${item.color}"></span><strong>${item.label}</strong><em>${formatNumber(item.value, 1)} m³</em></div>`).join("") || '<div><strong>Chưa có tồn dương</strong><em>Kho chỉ xuất nội bộ hoặc đã hết tồn</em></div>'}
        </div>
      </article>`;
  }).join("");
}

function colorRows(rows = state.filtered) {
  return Object.entries(groupRows(rows, "color")).map(([color, items]) => ({
    color,
    products: unique(items.map(item => item.product)).length,
    units: sum(items, "closeUnits"),
    volume: sum(items, "closeVolume"),
    age: weightedAge(items),
  })).sort((a, b) => b.volume - a.volume);
}

function actionsList(rows = state.filtered) {
  const items = [];
  const noStatus = rows.filter(row => row.status === "Chưa xác định");
  const surplus = rows.filter(row => row.status === "SX dư");
  const old = rows.filter(row => row.daysInStock > 60);
  const colorUnknown = rows.filter(row => row.color === "Chưa tách màu");
  if (surplus.length) {
    items.push({
      title: "Rà soát nhóm SX dư đang chiếm dung tích",
      note: `${formatNumber(sum(surplus, "closeUnits"), 0)} block · ${formatNumber(sum(surplus, "closeVolume"), 1)} m³`,
      detail: "Đây là nhóm tồn không gắn trực tiếp với đơn hàng; đội ngũ có thể cùng xem xét phương án chuyển đổi hoặc sử dụng phù hợp.",
      type: "status",
      value: "SX dư",
    });
  }
  if (noStatus.length) {
    items.push({
      title: "Cùng hoàn thiện trạng thái cho nhóm chưa xác định",
      note: `${formatNumber(sum(noStatus, "closeUnits"), 0)} block đang chờ bổ sung thông tin`,
      detail: "Việc bổ sung thêm thông tin sẽ giúp đội ngũ hiểu rõ nhóm tồn đang phục vụ đơn hàng hay mục đích khác.",
      type: "status",
      value: "Chưa xác định",
    });
  }
  if (old.length) {
    items.push({
      title: "Theo dõi nhóm tồn trên 60 ngày",
      note: `${formatNumber(sum(old, "closeUnits"), 0)} block · ${formatNumber(sum(old, "closeVolume"), 1)} m³`,
      detail: "Đội ngũ có thể cùng xem lại sản phẩm, màu và trạng thái đang đóng góp nhiều vào tuổi tồn của nhóm này.",
      type: "age",
      value: "61–90 ngày",
    });
  }
  if (colorUnknown.length) {
    items.push({
      title: "Chuẩn hóa tên màu trong ItemName",
      note: `${formatNumber(colorUnknown.length, 0)} dòng chưa tách được màu`,
      detail: "Nếu muốn phân tích màu sâu hơn, nên thống nhất quy ước đặt màu ở đuôi tên sản phẩm.",
      type: "color",
      value: "Chưa tách màu",
    });
  }
  if (!items.length) {
    items.push({
      title: "Tồn kho hiện đang tương đối ổn định",
      note: `${formatNumber(rows.length, 0)} dòng tồn hiện tại chưa có điểm bất thường lớn`,
      detail: "Có thể chuyển trọng tâm sang nhịp xuất nhập, tần suất xoay vòng và năng suất sử dụng kho.",
      type: "all",
      value: "",
    });
  }
  return `<div class="action-list">${items.map(item => `<button class="action-card" ${item.type !== "all" ? `data-drill-type="${item.type}" data-drill-value="${item.value}"` : ""}><strong>${item.title}</strong><span>${item.note}</span><p>${item.detail}</p></button>`).join("")}</div>`;
}

function heatmap(rows = state.filtered) {
  const ages = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày"];
  const statuses = unique(rows.map(row => row.status));
  const values = statuses.flatMap(status => ages.map(age => sum(rows.filter(row => row.status === status && row.ageBucket === age), "closeVolume")));
  const max = Math.max(...values, 1);
  return `<div class="heatmap-wrap"><div class="heatmap"><div></div>${ages.map(age => `<div class="heatmap-head">${age}</div>`).join("")}
    ${statuses.map(status => `<div class="heatmap-row-label">${status}</div>${ages.map(age => {
      const value = sum(rows.filter(row => row.status === status && row.ageBucket === age), "closeVolume");
      return `<button class="heatmap-cell" ${value ? `data-drill-age="${age}" data-drill-status="${status}"` : "disabled"} style="--heat:${0.08 + value / max * 0.82}"><strong>${value ? `${formatNumber(value, 1)} m³` : "—"}</strong><span>${formatNumber(sum(rows.filter(row => row.status === status && row.ageBucket === age), "closeUnits"), 0)} block</span></button>`;
    }).join("")}`).join("")}</div></div>`;
}

function productTable(rows = state.filtered) {
  const products = productGroups(rows).sort((a, b) => b.volume - a.volume);
  return `<div class="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Màu</th><th>Kho</th><th>Block tồn</th><th>m3 tồn</th><th>Tuổi TB</th><th>Trạng thái chính</th><th></th></tr></thead><tbody>
    ${products.map(item => `<tr class="interactive-row" data-product="${escapeAttr(item.productFull)}">
      <td data-sort-value="${item.productFull}"><div class="product-cell"><strong>${item.product}</strong><span>${item.productFull}</span></div></td>
      <td>${item.color}</td>
      <td>${item.warehouseMix}</td>
      <td class="numeric" data-sort-value="${item.units}">${formatNumber(item.units, 0)}</td>
      <td class="numeric" data-sort-value="${item.volume}">${formatNumber(item.volume, 1)} m³</td>
      <td class="numeric" data-sort-value="${item.age}">${formatNumber(item.age, 0)} ngày</td>
      <td>${badge(item.statusLead)}</td>
      <td class="row-arrow">→</td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function detailsTable(rows = state.filtered) {
  return `<div class="table-wrap"><table><thead><tr><th>Block</th><th>Sản phẩm</th><th>Kích thước D×R×C (mm)</th><th>Màu</th><th>Kho</th><th>Vị trí</th><th>Trạng thái</th><th>SL tồn</th><th>m3 tồn</th><th>Ngày nhập</th><th>Tuổi tồn</th><th>Phân công</th></tr></thead><tbody>
    ${rows.map(row => `<tr>
      <td><div class="product-cell"><strong>${row.barcode || row.rowId}</strong><span>${row.rowId}</span></div></td>
      <td>${escapeHtml(row.product)}</td>
      <td class="numeric size-cell" data-sort-value="${row.lengthMm || 0}">${row.sizeLabel || "—"}</td>
      <td>${escapeHtml(row.color)}</td>
      <td>${row.warehouse}</td>
      <td>${row.location}</td>
      <td><div class="product-cell"><strong>${row.status}</strong><span>${[row.statusSecondary, row.statusTertiary].filter(Boolean).join(" · ") || "Không có trạng thái phụ"}</span></div></td>
      <td class="numeric" data-sort-value="${row.closeUnits}">${formatNumber(row.closeUnits, 0)}</td>
      <td class="numeric" data-sort-value="${row.closeVolume}">${formatNumber(row.closeVolume, 2)}</td>
      <td data-sort-value="${row.receiptDate}">${formatDate(row.receiptDate)}</td>
      <td class="numeric" data-sort-value="${row.daysInStock || 0}">${row.daysInStock ?? "—"}${row.daysInStock != null ? " ngày" : ""}</td>
      <td>${duocSuaViec()
        ? `<button class="assign-task-button" type="button" data-assign-barcode="${row.barcode || row.rowId}">${state.tasks.filter(task => task.barcode === (row.barcode || row.rowId) && task.status !== "Hoàn thành").length ? "Xem / phân công thêm" : "Phân công"}</button>`
        : `<span class="assign-locked">${state.tasks.filter(task => task.barcode === (row.barcode || row.rowId) && task.status !== "Hoàn thành").length ? "Đang có việc mở" : "—"}</span>`}</td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function guidePage() {
  const steps = [
    { number: "01", title: "Chọn phạm vi trao đổi", text: "Vào Tổng quan rồi lọc theo kho, sản phẩm, màu sắc, tuổi tồn hoặc ClassCode.", page: "overview", action: "Mở Tổng quan" },
    { number: "02", title: "Nhìn biến động nhập – xuất", text: "Đọc cột m³, đường số block và luồng ròng theo ngày, tuần hoặc tháng.", page: "overview", action: "Xem nhịp kho" },
    { number: "03", title: "Drill xuống nguyên nhân", text: "Nhấn biểu đồ, ô tuổi × trạng thái hoặc dòng sản phẩm để mở màn hình inside.", page: "aging", action: "Mở Tuổi tồn" },
    { number: "04", title: "Xem đến từng barcode", text: "Trong bảng inside hoặc Chi tiết block, chọn đúng block để cùng xem xét.", page: "details", action: "Mở Chi tiết block" },
    { number: "05", title: "Phân công và thống nhất thời hạn", text: "Nhấn Phân công, nhập người phụ trách, ngày giao, thời hạn, mức ưu tiên và kết quả mong đợi.", page: "details", action: "Bắt đầu phân công" },
    { number: "06", title: "Cùng theo dõi đến khi hoàn thành", text: "Theo dõi việc đang mở, thời hạn và cập nhật trạng thái trong Luồng công việc.", page: "workflow", action: "Mở Luồng công việc" },
  ];
  return `
    <section class="guide-hero">
      <div>
        <span class="guide-label">Quy trình họp kho</span>
        <h2>Từ một tín hiệu tồn kho<br>đến phương án phối hợp rõ ràng</h2>
        <p>Báo cáo giúp đội ngũ cùng nhìn số liệu, xem chi tiết đến barcode, thống nhất người phụ trách và theo dõi tiến độ.</p>
        <button type="button" data-go-page="overview">Bắt đầu xem Tổng quan <span>→</span></button>
      </div>
      <div class="guide-principle">
        <span>Nguyên tắc sử dụng</span>
        <strong>1 nội dung</strong><i>→</i><strong>1 barcode</strong><i>→</i><strong>1 người phụ trách</strong><i>→</i><strong>1 thời hạn</strong>
      </div>
    </section>
    <section class="guide-steps">
      ${steps.map(step => `<article>
        <span class="guide-step-number">${step.number}</span>
        <div><h3>${step.title}</h3><p>${step.text}</p></div>
        <button type="button" data-go-page="${step.page}">${step.action} <span>→</span></button>
      </article>`).join("")}
    </section>
    <div class="guide-reference-grid">
      <section class="guide-reference">
        <span class="guide-reference-kicker">Cách đọc dữ liệu</span>
        <h3>Các định nghĩa chính</h3>
        <dl>
          <div><dt>Sản phẩm</dt><dd>Lấy từ ItemName; màu được tách thành trường riêng.</dd></div>
          <div><dt>Tuổi tồn</dt><dd>Ngày báo cáo trừ ReceiptDate của block đang tồn.</dd></div>
          <div><dt>Trạng thái</dt><dd>ClassCode là trạng thái chính; Remark và Remark 1 là lớp giải thích phụ.</dd></div>
          <div><dt>Nhập / xuất</dt><dd>Receipt và Delivery, theo cả số block và m³.</dd></div>
        </dl>
      </section>
      <section class="guide-reference">
        <span class="guide-reference-kicker">Trong cuộc họp</span>
        <h3>Ba nội dung cùng thống nhất</h3>
        <ol>
          <li>Block này tồn vì đơn hàng, sản xuất dư hay nguyên nhân khác?</li>
          <li>Phương án phù hợp là sử dụng, chuyển đổi, điều chuyển hay loại bỏ?</li>
          <li>Ai sẽ phụ trách và thời hạn dự kiến là ngày nào?</li>
        </ol>
        <p class="guide-storage-note">Nhiệm vụ hiện được lưu trên trình duyệt của máy đang sử dụng. Có thể bổ sung backend khi cần đồng bộ nhiều người dùng.</p>
      </section>
    </div>
  `;
}

// ==========================================================================
// SO SÁNH VỚI NGÀY TRƯỚC
//
// Số so sánh lấy từ bảng snapshots — là số TOÀN KHO, không đi qua bộ lọc.
// Vì vậy mũi tên chênh lệch trên thẻ số chỉ hiện khi KHÔNG lọc gì; nếu không
// sẽ so một con số đã lọc với một con số chưa lọc, ra kết quả vô nghĩa.
// ==========================================================================

const khongLoc = () =>
  Object.entries(state.filters).every(([k, v]) => (k === "size" ? !v : v === "all"));

function chipChenh(homNay, homQua, dinhDang) {
  if (homQua == null || homNay == null) return "";
  const d = Number(homNay) - Number(homQua);
  if (Math.abs(d) < 0.05) return '<span class="delta-chip is-flat">không đổi</span>';
  const huong = d > 0 ? "up" : "down";
  const mui = d > 0 ? "▲" : "▼";
  return `<span class="delta-chip is-${huong}">${mui} ${dinhDang(Math.abs(d))}</span>`;
}

// Mũi tên chỉ có nghĩa khi đang xem toàn bộ kho.
function chenhTheoAnhChup(truong, dinhDang) {
  if (!khongLoc()) return "";
  const a = state.data?.snapshot?.[truong];
  const b = state.data?.snapshotTruoc?.[truong];
  return chipChenh(a, b, dinhDang);
}

const CHI_SO_SO_NGAY = [
  ["Dung tích tồn", "total_volume", v => `${formatNumber(v, 1)} m³`],
  ["Số block", "total_units", v => `${formatNumber(v, 0)} block`],
  ["Tuổi tồn bình quân", "avg_age_days", v => `${formatNumber(v, 1)} ngày`],
  ["SX theo đơn hàng", "volume_ordered", v => `${formatNumber(v, 1)} m³`],
  ["SX dư", "volume_surplus", v => `${formatNumber(v, 1)} m³`],
  ["Tồn trên 60 ngày", "volume_over_60d", v => `${formatNumber(v, 1)} m³`],
  ["Block có ghi lỗi", "defect_blocks", v => `${formatNumber(v, 0)} block`],
  ["Top 5 sản phẩm chiếm", "top5_share_pct", v => `${formatNumber(v, 1)}%`],
];

function soVoiHomQua() {
  const nay = state.data?.snapshot;
  const qua = state.data?.snapshotTruoc;
  if (!nay) return '<div class="empty-state"><strong>Chưa có ảnh chụp nào</strong><span>Cần chạy scripts/sync.py trước.</span></div>';
  if (!qua) {
    return `<div class="empty-state"><strong>Mới có một ngày dữ liệu</strong>
      <span>Chưa so được với ngày trước. Từ lượt đồng bộ ngày mai, khối này sẽ tự có số.</span></div>`;
  }
  const ngay = d => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(`${d}T00:00:00`));
  return `<div class="table-wrap"><table class="so-ngay"><thead><tr>
      <th>Chỉ số</th><th>${ngay(qua.report_date)}</th><th>${ngay(nay.report_date)}</th><th>Thay đổi</th>
    </tr></thead><tbody>
    ${CHI_SO_SO_NGAY.map(([nhan, truong, dd]) => `<tr>
      <td>${nhan}</td>
      <td class="numeric">${qua[truong] == null ? "—" : dd(qua[truong])}</td>
      <td class="numeric"><strong>${nay[truong] == null ? "—" : dd(nay[truong])}</strong></td>
      <td class="numeric">${chipChenh(nay[truong], qua[truong], dd)}</td>
    </tr>`).join("")}
  </tbody></table></div>
  <p class="so-ngay-nhac">Đây là số <strong>toàn kho</strong>, không đi qua bộ lọc ở trên. Ảnh chụp được ghi mỗi lượt đồng bộ.</p>`;
}

function overviewPage(rows = state.filtered) {
  const oldest = [...rows].sort((a, b) => (b.daysInStock || 0) - (a.daysInStock || 0))[0];
  const topProducts = productGroups(rows).sort((a, b) => b.volume - a.volume).slice(0, 5).map(item => ({
    label: `${item.product} · ${item.color}`,
    value: item.volume,
    drillType: "product",
    drillValue: item.productFull,
  }));
  return `
    <section class="kpi-grid">
      ${kpiCard("Block đang tồn", `${formatNumber(sum(rows, "closeUnits"), 0)}`, `${chenhTheoAnhChup("total_units", v => `${formatNumber(v, 0)} block`)}${formatNumber(rows.length, 0)} dòng tồn dương`, "blocks", "brand")}
      ${kpiCard("Dung tích đang giữ", `${formatNumber(sum(rows, "closeVolume"), 1)} m³`, `${chenhTheoAnhChup("total_volume", v => `${formatNumber(v, 1)} m³`)}${formatNumber(productGroups(rows).length, 0)} sản phẩm màu`, "volume", "info")}
      ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, `${chenhTheoAnhChup("avg_age_days", v => `${formatNumber(v, 1)} ngày`)}Tính theo ngày nhập của lượng tồn hiện tại`, "clock", "warning")}
      ${kpiCard("Block lâu nhất", oldest ? `${oldest.daysInStock || 0} ngày` : "—", oldest ? `${oldest.productFull} · ${oldest.warehouse}` : "Không có dữ liệu", "flow", "success")}
    </section>
    <div class="dashboard-grid overview-primary-grid">
      ${panel("Nhịp nhập xuất kho", "So sánh đồng thời m³ và số block để nhìn tốc độ luân chuyển", movementChart(), "ReceiptDate / DeliveryDate")}
      <div class="overview-side-stack">
        ${panel("Cơ cấu trạng thái đang tồn", "Nhóm tồn chính theo ClassCode", stackedDistribution(statusDistribution(rows), "status"))}
        ${panel("Top 5 sản phẩm chiếm dung tích", "Nhấn từng dòng để mở phân tích barcode", barChart(topProducts, value => `${formatNumber(value, 1)} m³`, "#b22536"))}
      </div>
    </div>
    <div class="dashboard-grid overview-secondary-grid">
      ${panel("So với hôm qua", "Số toàn kho lấy từ ảnh chụp cuối mỗi ngày", soVoiHomQua(), state.data?.snapshotTruoc ? "" : "chờ đủ 2 ngày", "table-panel")}
      ${panel("Gợi ý cho cuộc họp kho", "Các nhóm đội ngũ có thể cùng xem xét và thống nhất phương án", actionsList(rows))}
    </div>
  `;
}

// Màn hình này TỰ ẨN khi chỉ còn một kho có tồn (xem trangDuocXem).
//
// Bản cũ có hai lỗi, sửa 28/08/2026 khi rà soát trùng lặp:
//   1. Khối tên "Tồn theo tuổi trong từng kho" gọi heatmap(rows) — mà heatmap()
//      chia theo TRẠNG THÁI × tuổi, không phải kho. Tên hứa một đằng, vẽ một nẻo,
//      và kết quả trùng từng ký tự với khối "Tuổi tồn x trạng thái" ở trang Tuổi tồn.
//   2. Khối "Tuổi theo màu" trùng từng ký tự với khối cùng nội dung ở nơi khác.
// Giờ cả hai khối đều thật sự chia theo kho — thứ mà không trang nào khác có.
function warehousePage(rows = state.filtered) {
  const dai = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"];
  const khos = unique(rows.map(r => r.warehouse).filter(Boolean));
  const oGiaTri = (k, d) => sum(rows.filter(r => r.warehouse === k && r.ageBucket === d), "closeVolume");
  const cot = dai.filter(d => khos.some(k => oGiaTri(k, d) > 0));
  const max = Math.max(...khos.flatMap(k => cot.map(d => oGiaTri(k, d))), 1);

  return `<div class="warehouse-grid">${warehouseCards(rows)}</div>
    <div class="dashboard-grid section-gap">
      ${panel("Kho × Tuổi tồn", "Kho nào đang giữ hàng nằm lâu", `<div class="heatmap-wrap">
        <div class="khach-luoi" style="grid-template-columns:minmax(110px,1.2fr) repeat(${cot.length || 1},minmax(64px,1fr))">
          <div></div>${cot.map(d => `<div class="heatmap-head">${d}</div>`).join("")}
          ${khos.map(k => `<div class="heatmap-row-label" title="${escapeAttr(k)}">${escapeHtml(k)}</div>${cot.map(d => {
            const v = oGiaTri(k, d);
            return `<button class="heatmap-cell" ${v ? `data-drill-type="warehouse" data-drill-value="${escapeAttr(k)}"` : "disabled"} style="--heat:${v ? 0.08 + v / max * 0.82 : 0}"><strong>${v ? formatNumber(v, 1) : "—"}</strong></button>`;
          }).join("")}`).join("")}
        </div></div><p class="luoi-chu-thich">Số trong ô là m³.</p>`, `${khos.length} kho`)}
      ${panel("Kho × Trạng thái", "Cơ cấu trạng thái trong từng kho", `<div class="khach-trangthai">
        ${khos.map(k => {
          const r = rows.filter(x => x.warehouse === k);
          const tong = sum(r, "closeVolume") || 1;
          return `<div class="khach-tt-row">
            <span class="khach-tt-ten" title="${escapeAttr(k)}">${escapeHtml(k)}</span>
            <span class="khach-tt-bar">${statusDistribution(r).filter(x => x.value > 0).map(x => `<i style="width:${x.value / tong * 100}%;background:${x.color}" title="${x.label}: ${formatNumber(x.value, 1)} m³"></i>`).join("")}</span>
            <b>${formatNumber(tong, 1)} m³</b></div>`;
        }).join("")}
        <div class="legend-list">${statusDistribution(rows).filter(x => x.value > 0).map(x => `<span class="legend-row"><span class="legend-swatch" style="background:${x.color}"></span><span class="legend-name">${x.label}</span></span>`).join("")}</div>
      </div>`)}
    </div>`;
}

function productPage(rows = state.filtered) {
  const topProducts = productGroups(rows).sort((a, b) => b.volume - a.volume).slice(0, 8).map(item => ({
    label: `${item.product} · ${item.color}`,
    value: item.volume,
    drillType: "product",
    drillValue: item.productFull,
    note: `${formatNumber(item.units, 0)} block · tuổi TB ${formatNumber(item.age, 0)} ngày`,
  }));
  return `<div class="dashboard-grid">
      ${panel("Sản phẩm giữ nhiều dung tích nhất", "Xếp hạng theo m³ tồn; nhấn để mở phân tích chi tiết", rankChart(topProducts))}
      <div class="side-stack">
        ${panel("Màu sắc đang tồn", "Cơ cấu dung tích, số sản phẩm và số block theo màu", colorInventoryChart(rows))}
        ${panel("Tuổi tồn theo màu", "Màu nào đang có tuổi bình quân cao hơn", ageByColorChart(rows), "Theo m³ tồn")}
      </div>
    </div>
    ${panel("Hiệu quả theo sản phẩm", "Chọn một dòng để mở hồ sơ phân tích chi tiết", productTable(rows), `${formatNumber(productGroups(rows).length, 0)} sản phẩm màu`, "table-panel")}`;
}

function agingPage(rows = state.filtered) {
  const buckets = ageDistribution(rows).map(item => ({ label: item.label, value: item.value, drillType: "age", drillValue: item.label, color: item.color }));
  return `<div class="dashboard-grid">
      ${panel("Tồn theo nhóm tuổi", "Cột thể hiện m³ và tỷ trọng tồn trong từng dải tuổi", ageBucketChart(rows), "Theo ReceiptDate")}
      ${panel("Tuổi tồn x trạng thái", "Nhấn từng ô để xem sản phẩm nào nằm trong vùng đó", heatmap(rows))}
    </div>
    ${panel("Danh sách block có tuổi tồn cao", "Hỗ trợ đội ngũ cùng xem xét các nhóm tồn lâu", detailsTable([...rows].sort((a, b) => (b.daysInStock || 0) - (a.daysInStock || 0)).slice(0, 12)), "", "table-panel")}`;
}

function statusPage(rows = state.filtered) {
  const statusGroups = unique(rows.map(row => row.status)).map(status => {
    const items = rows.filter(row => row.status === status);
    return {
      status,
      units: sum(items, "closeUnits"),
      volume: sum(items, "closeVolume"),
      age: weightedAge(items),
      topRemark: dominant(items.filter(item => item.statusSecondary), "statusSecondary"),
    };
  }).sort((a, b) => b.volume - a.volume);
  return `<div class="status-grid">
      ${statusGroups.map(group => `<article class="status-card">
        <div class="status-card-head"><div>${badge(group.status)}</div><button class="ghost-button" data-drill-type="status" data-drill-value="${group.status}">Mở phân tích</button></div>
        <strong>${formatNumber(group.volume, 1)} m³</strong>
        <span>${formatNumber(group.units, 0)} block · tuổi TB ${formatNumber(group.age, 0)} ngày</span>
        <p>${group.topRemark && group.topRemark !== "—" ? `Remark nổi bật: ${group.topRemark}` : "Chưa có Remark nổi bật rõ ràng"}</p>
      </article>`).join("")}
    </div>
    <div class="dashboard-grid section-gap">
      ${panel("Remark đang đi cùng tồn kho", "Nhấn một dòng để xem toàn bộ barcode và cùng phân công xử lý", remarkTable(rows, "statusSecondary", "Remark"))}
      ${panel("Remark 1 đi kèm", "Nhấn một dòng để drill xuống các block liên quan", remarkTable(rows, "statusTertiary", "Remark 1"))}
    </div>`;
}

function remarkTable(rows, key, label) {
  const items = Object.entries(groupRows(rows.filter(row => row[key]), key)).map(([name, entries]) => ({
    name,
    units: sum(entries, "closeUnits"),
    volume: sum(entries, "closeVolume"),
    age: weightedAge(entries),
  })).sort((a, b) => b.volume - a.volume).slice(0, 12);
  if (!items.length) return '<div class="empty-state"><strong>Chưa có dữ liệu</strong><span>Nhóm hiện tại không phát sinh trường này.</span></div>';
  const drillType = key === "statusSecondary" ? "remark" : "remark1";
  return `<div class="table-wrap"><table><thead><tr><th>${label}</th><th>Block</th><th>m3 tồn</th><th>Tuổi TB</th><th></th></tr></thead><tbody>
    ${items.map(item => `<tr class="interactive-row" tabindex="0" data-drill-type="${drillType}" data-drill-value="${escapeAttr(item.name)}"><td>${item.name}</td><td class="numeric" data-sort-value="${item.units}">${formatNumber(item.units, 0)}</td><td class="numeric" data-sort-value="${item.volume}">${formatNumber(item.volume, 1)} m³</td><td class="numeric" data-sort-value="${item.age}">${formatNumber(item.age, 0)} ngày</td><td class="row-arrow">→</td></tr>`).join("")}
  </tbody></table></div>`;
}

function taskDueState(task) {
  if (task.status === "Hoàn thành") return "done";
  // Mốc so hạn phải là NGÀY THẬT HÔM NAY. Trước đây dùng state.reportDate nên
  // người dùng đổi ô "Ngày báo cáo" là toàn bộ task đổi tình trạng hạn theo.
  const today = new Date(new Date().toDateString());
  const deadline = new Date(`${task.deadline}T00:00:00`);
  const days = Math.ceil((deadline - today) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 3) return "due-soon";
  return "on-track";
}

function taskStatusBadge(status) {
  const key = status === "Hoàn thành" ? "done" : status === "Đang xử lý" ? "doing" : status === "Chờ xác nhận" ? "waiting" : "todo";
  return `<span class="task-status task-${key}">${status}</span>`;
}

function workflowPage() {
  const tasks = [...state.tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const open = tasks.filter(task => task.status !== "Hoàn thành");
  const overdue = open.filter(task => taskDueState(task) === "overdue");
  const dueSoon = open.filter(task => taskDueState(task) === "due-soon");
  const done = tasks.filter(task => task.status === "Hoàn thành");
  const statusOrder = ["Chưa bắt đầu", "Đang xử lý", "Chờ xác nhận", "Hoàn thành"];
  const assignees = Object.entries(groupRows(tasks, task => task.assignee || "Chưa phân công"))
    .map(([name, items]) => ({ name, open: items.filter(item => item.status !== "Hoàn thành").length, overdue: items.filter(item => taskDueState(item) === "overdue").length, total: items.length }))
    .sort((a, b) => b.open - a.open);
  const workflow = statusOrder.map(status => ({ status, count: tasks.filter(task => task.status === status).length }));
  return `
    ${bangCanhBaoViec()}
    <section class="kpi-grid task-kpis">
      ${kpiCard("Việc đang mở", open.length, `${unique(open.map(task => task.barcode)).length} barcode đang được theo dõi`, "flow", "brand")}
      ${kpiCard("Đã quá hạn", overdue.length, overdue.length ? "Nên cùng cập nhật người phụ trách và tiến độ" : "Không có việc quá hạn", "clock", "warning")}
      ${kpiCard("Đến hạn ≤ 3 ngày", dueSoon.length, "Nhóm nên được cùng cập nhật trong cuộc họp", "actions", "info")}
      ${kpiCard("Đã hoàn thành", done.length, tasks.length ? `${formatNumber(done.length / tasks.length * 100, 0)}% tổng nhiệm vụ` : "Chưa có nhiệm vụ", "blocks", "success")}
    </section>
    <div class="dashboard-grid">
      ${panel("Bức tranh luồng việc", "Số nhiệm vụ đang nằm tại mỗi bước xử lý", `<div class="workflow-pipeline">${workflow.map((item, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.count}</strong><small>${item.status}</small></div>`).join("")}</div>`, `${tasks.length} nhiệm vụ`)}
      ${panel("Phân bổ công việc theo người phụ trách", "Hỗ trợ cân đối công việc và cùng cập nhật các nhiệm vụ đến hạn", assignees.length ? `<div class="assignee-load">${assignees.map(item => `<div><span><strong>${escapeHtml(item.name)}</strong><small>${item.total} nhiệm vụ</small></span><b>${item.open} đang mở</b><em class="${item.overdue ? "has-overdue" : ""}">${item.overdue} quá hạn</em></div>`).join("")}</div>` : '<div class="empty-state"><strong>Chưa có người phụ trách</strong><span>Có thể phân công từ bảng barcode để bắt đầu theo dõi.</span></div>')}
    </div>
    ${panel("Danh sách nhiệm vụ theo barcode", "Cập nhật tiến độ ngay trong bảng. Việc lưu trên Supabase — mọi người đăng nhập đều thấy cùng danh sách này", taskTable(tasks), `${open.length} việc đang mở`, "table-panel")}
  `;
}

// Bảng tasks chưa tồn tại, hoặc RLS chặn — nói thẳng nguyên nhân và cách sửa,
// thay vì để màn hình trống khiến người dùng tưởng chưa ai giao việc.
function bangCanhBaoViec() {
  if (!state.tasksError) return "";
  const chuaCoBang = /relation .*tasks.* does not exist|schema cache/i.test(state.tasksError);
  return `<p class="setup-banner" role="status">${chuaCoBang
    ? "Chưa dựng bảng công việc trên Supabase. Mở Supabase &gt; SQL Editor, dán toàn bộ <code>scripts/phan-quyen-supabase.sql</code> rồi bấm Run."
    : `Chưa đọc được danh sách công việc: ${escapeHtml(state.tasksError)}`}</p>`;
}

function taskTable(tasks) {
  if (!tasks.length) {
    return `<div class="empty-state"><strong>Chưa có nhiệm vụ</strong><span>${duocSuaViec()
      ? "Mở một sản phẩm hoặc bảng chi tiết block và chọn “Phân công”."
      : "Tài khoản của bạn chỉ được xem, chưa giao việc được. Liên hệ quản trị viên nếu cần quyền giao việc."}</span></div>`;
  }
  const suaDuoc = duocSuaViec();
  return `<div class="table-wrap"><table><thead><tr><th>Barcode / sản phẩm</th><th>Nhiệm vụ</th><th>Phụ trách</th><th>Người giao</th><th>Ngày giao</th><th>Thời hạn</th><th>Ưu tiên</th><th>Tiến độ</th><th>Tình trạng hạn</th><th></th></tr></thead><tbody>
    ${tasks.map(task => {
      // Task cũ lưu theo barcode, task mới lưu rowId — tra rowId trước cho chính xác.
      const record = state.records.find(row => row.rowId === (task.rowId || task.barcode))
                  || state.records.find(row => (row.barcode || row.rowId) === task.barcode);
      const due = taskDueState(task);
      const dueLabel = due === "overdue" ? "Quá hạn" : due === "due-soon" ? "Sắp đến hạn" : due === "done" ? "Đã đóng" : "Đúng tiến độ";
      // Xoá được khi là quản trị viên, hoặc chính người đã giao việc đó — khớp
      // đúng policy tasks_xoa trong scripts/phan-quyen-supabase.sql.
      const xoaDuoc = laQuanTri() || (task.createdBy && task.createdBy === state.profile?.user_id);
      return `<tr>
        <td><div class="product-cell"><strong>${escapeHtml(task.barcode)}</strong><span>${record ? `${escapeHtml(record.productFull)} · ${escapeHtml(record.warehouse)}` : "Barcode ngoài tồn hiện tại"}</span></div></td>
        <td><div class="product-cell"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.note) || "Không có ghi chú"}</span></div></td>
        <td>${escapeHtml(task.assignee)}</td>
        <td><div class="product-cell"><strong>${escapeHtml(task.createdByEmail || "—")}</strong><span>${task.updatedByEmail && task.updatedByEmail !== task.createdByEmail ? `sửa gần nhất: ${escapeHtml(task.updatedByEmail)}` : task.createdAt ? formatDate(task.createdAt) : ""}</span></div></td>
        <td>${formatDate(task.startDate)}</td><td>${formatDate(task.deadline)}</td>
        <td><span class="task-priority priority-${task.priority === "Khẩn cấp" ? "urgent" : task.priority === "Cao" ? "high" : "normal"}">${task.priority}</span></td>
        <td><select class="task-status-select" data-task-status-id="${escapeAttr(task.id)}" ${suaDuoc ? "" : "disabled"}>${["Chưa bắt đầu", "Đang xử lý", "Chờ xác nhận", "Hoàn thành"].map(status => `<option ${status === task.status ? "selected" : ""}>${status}</option>`).join("")}</select></td>
        <td><span class="due-state due-${due}">${dueLabel}</span></td>
        <td>${xoaDuoc ? `<button class="task-delete" type="button" data-delete-task="${escapeAttr(task.id)}" aria-label="Xoá nhiệm vụ">Xoá</button>` : ""}</td>
      </tr>`;
    }).join("")}
  </tbody></table></div>`;
}

function detailsPage(rows = state.filtered) {
  return panel("Danh sách block tồn hiện tại", "Mỗi dòng là một block còn tồn dương sau khi làm sạch dữ liệu SQL", detailsTable(rows), `${formatNumber(rows.length, 0)} block`, "table-panel");
}

function barChart(items, valueFormatter = value => formatMetric(value, "volume"), color = "#b22536") {
  const max = Math.max(...items.map(item => item.value), 1);
  return `<div class="bar-chart">${items.map(item => `<button class="bar-row bar-drill" ${item.drillType ? `data-drill-type="${item.drillType}" data-drill-value="${escapeAttr(item.drillValue)}"` : ""}>
        <span class="bar-label" title="${escapeAttr(item.label)}">${escapeHtml(item.label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(item.value / max * 100, 1)}%;--bar-color:${item.color || color}"></div></div>
        <span class="bar-value">${valueFormatter(item.value)}</span>
      </button>`).join("")}</div>`;
}

// ==========================================================================
// TRANG "CÁCH APP HOẠT ĐỘNG" — tài liệu kỹ thuật cho bộ phận IT
// Mô tả toàn bộ chuỗi từ SQL Server tới màn hình, kèm lịch đồng bộ.
// ==========================================================================

const ARCH = {
  sql: { host: "115.75.10.155", port: "1433", db: "B7R2_Havas_NB_2015", may: "HAVAS",
         ban: "SQL Server 2019 Standard Edition (64-bit)",
         proc: "usp_Vcd_TongHopNhapXuatMousseBlockData" },
  supabase: { ref: "sgsrtpsvhnyjdmlevskr", vung: "Singapore · ap-southeast-1",
              url: "https://sgsrtpsvhnyjdmlevskr.supabase.co" },
  lich: { chuKy: "30 phút", gio: "07:00 – 18:00 các ngày làm việc", moiLuot: "≈ 37 giây", canhBao: 26 },
};

function archDiagram() {
  return `<div class="arch-figure"><svg viewBox="0 0 880 250" role="img"
      aria-label="Sơ đồ bốn tầng: SQL Server trong mạng công ty, script đồng bộ chạy trên GitHub Actions, Supabase tại Singapore, và app tĩnh trên GitHub Pages.">
    <defs>
      <marker id="arch-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="#b22536"/>
      </marker>
    </defs>

    <text x="14" y="20" class="arch-lane">TẦNG 1 · NGUỒN</text>
    <text x="238" y="20" class="arch-lane">TẦNG 2 · ĐỒNG BỘ</text>
    <text x="470" y="20" class="arch-lane">TẦNG 3 · LƯU TRỮ</text>
    <text x="722" y="20" class="arch-lane">TẦNG 4 · HIỂN THỊ</text>

    <rect x="14" y="46" width="190" height="104" rx="4" class="arch-box"/>
    <text x="109" y="76" text-anchor="middle" class="arch-t1">SQL Server 2019</text>
    <text x="109" y="97" text-anchor="middle" class="arch-t2">máy HAVAS · nội bộ</text>
    <text x="109" y="115" text-anchor="middle" class="arch-mono">115.75.10.155:1433</text>
    <text x="109" y="133" text-anchor="middle" class="arch-mono">B7R2_Havas_NB_2015</text>

    <rect x="238" y="46" width="190" height="104" rx="4" class="arch-box arch-box-accent"/>
    <text x="333" y="76" text-anchor="middle" class="arch-t1">sync.py</text>
    <text x="333" y="97" text-anchor="middle" class="arch-t2">GitHub Actions</text>
    <text x="333" y="115" text-anchor="middle" class="arch-mono">cron 30 phút/lượt</text>
    <text x="333" y="133" text-anchor="middle" class="arch-t2">≈ 37 giây rồi tắt</text>

    <rect x="470" y="46" width="190" height="104" rx="4" class="arch-box"/>
    <text x="565" y="72" text-anchor="middle" class="arch-t1">Supabase</text>
    <text x="565" y="90" text-anchor="middle" class="arch-t2">Singapore · ap-southeast-1</text>
    <text x="565" y="112" text-anchor="middle" class="arch-mono">Postgres · Auth · Realtime</text>
    <text x="565" y="133" text-anchor="middle" class="arch-t2">4 bảng, RLS bật toàn bộ</text>

    <rect x="694" y="46" width="172" height="104" rx="4" class="arch-box"/>
    <text x="780" y="76" text-anchor="middle" class="arch-t1">App tĩnh</text>
    <text x="780" y="97" text-anchor="middle" class="arch-t2">GitHub Pages</text>
    <text x="780" y="115" text-anchor="middle" class="arch-mono">HTML · CSS · JS</text>
    <text x="780" y="133" text-anchor="middle" class="arch-t2">không có máy chủ riêng</text>

    <line x1="204" y1="98" x2="232" y2="98" class="arch-arrow" marker-end="url(#arch-ar)"/>
    <text x="218" y="176" text-anchor="middle" class="arch-note">TDS 1433</text>
    <text x="218" y="192" text-anchor="middle" class="arch-note">gọi stored proc</text>

    <line x1="428" y1="98" x2="464" y2="98" class="arch-arrow" marker-end="url(#arch-ar)"/>
    <text x="446" y="176" text-anchor="middle" class="arch-note">HTTPS</text>
    <text x="446" y="192" text-anchor="middle" class="arch-note">secret key</text>

    <line x1="660" y1="84" x2="688" y2="84" class="arch-arrow" marker-end="url(#arch-ar)"/>
    <text x="674" y="176" text-anchor="middle" class="arch-note">WebSocket</text>
    <text x="674" y="192" text-anchor="middle" class="arch-note">đẩy tức thì</text>
    <line x1="688" y1="118" x2="660" y2="118" class="arch-arrow" marker-end="url(#arch-ar)"/>
    <text x="674" y="212" text-anchor="middle" class="arch-note">đăng nhập + đọc</text>

    <text x="14" y="238" class="arch-foot">Không có máy chủ ứng dụng, không có API riêng. Dữ liệu chỉ đi một chiều: từ ERP ra, không bao giờ ghi ngược vào ERP.</text>
  </svg></div>`;
}

function archLayers() {
  const layers = [
    {
      so: "1", ten: "Nguồn dữ liệu", noi: "Mạng nội bộ công ty",
      dong: [
        ["Máy chủ", ARCH.sql.may + " · " + ARCH.sql.ban],
        ["Địa chỉ", ARCH.sql.host + ":" + ARCH.sql.port],
        ["Database", ARCH.sql.db],
        ["Stored procedure", ARCH.proc || ARCH.sql.proc],
        ["Tham số truyền", "12 trong tổng số 19 — phần còn lại dùng giá trị mặc định"],
        ["Chiều truy cập", "CHỈ ĐỌC. App không bao giờ ghi ngược vào ERP"],
      ],
    },
    {
      so: "2", ten: "Script đồng bộ", noi: "GitHub Actions (máy ảo, không phải máy công ty)",
      dong: [
        ["Tệp", "scripts/sync.py — Python 3, thư viện pymssql"],
        ["Nhiệm vụ", "Đọc ERP, chuẩn hoá, đẩy lên Supabase, ghi nhật ký"],
        ["Chuẩn hoá", "Tách màu từ đuôi tên SP · gộp trạng thái có dấu và không dấu · sinh sự kiện nhập-xuất"],
        ["Mật khẩu", "Lấy từ GitHub Secrets. Không nằm trong mã nguồn"],
        ["Thời lượng", ARCH.lich.moiLuot + " mỗi lượt, chạy xong là tắt"],
      ],
    },
    {
      so: "3", ten: "Lưu trữ", noi: "Supabase — Postgres quản lý sẵn",
      dong: [
        ["Vùng", ARCH.supabase.vung],
        ["Địa chỉ", ARCH.supabase.url],
        ["Bảng", "inventory · movements · snapshots · sync_runs"],
        ["Phân quyền", "Row Level Security bật trên cả 4 bảng"],
        ["Xác thực", "Email + mật khẩu, tài khoản do quản trị viên tạo. Tự đăng ký đã TẮT"],
        ["Realtime", "Đẩy thay đổi xuống trình duyệt qua WebSocket"],
      ],
    },
    {
      so: "4", ten: "Hiển thị", noi: "GitHub Pages — trang tĩnh",
      dong: [
        ["Công nghệ", "HTML, CSS, JavaScript thuần. Không framework, không bước build"],
        ["Repo", "Công khai — nhưng CHỈ chứa mã nguồn, không có một dòng dữ liệu nào"],
        ["Biểu đồ", "SVG tự vẽ, không thư viện ngoài"],
        ["Máy chủ ứng dụng", "Không có. Trình duyệt nói thẳng với Supabase"],
      ],
    },
  ];

  return `<div class="arch-layers">${layers.map(l => `
    <article class="arch-layer">
      <div class="arch-layer-head">
        <span class="arch-layer-num">${l.so}</span>
        <div><strong>${l.ten}</strong><span>${l.noi}</span></div>
      </div>
      <dl class="arch-dl">${l.dong.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    </article>`).join("")}</div>`;
}

function archSyncTable() {
  const buoc = [
    ["01", "Lịch cron nổ, GitHub khởi động máy ảo sạch", "tức thì"],
    ["02", "Ghi một dòng vào <code>sync_runs</code>, trạng thái <code>running</code>", "tức thì"],
    ["03", "Kết nối SQL Server, gọi stored procedure với ngày chốt là hôm nay", "≈ 0,7 giây"],
    ["04", "Nhận khoảng 3.200 dòng thô", "4 – 150 giây"],
    ["05", "Lọc còn các dòng tồn dương, chuẩn hoá, sinh sự kiện nhập-xuất", "dưới 1 giây"],
    ["06", "Ghi lên Supabase", "≈ 5 giây"],
    ["07", "Tính chỉ số ngày, ghi vào <code>snapshots</code>", "tức thì"],
    ["08", "Đổi <code>sync_runs</code> thành <code>success</code> → mọi màn hình đang mở tự đổi số", "tức thì"],
  ];
  return `
    <div class="arch-schedule">
      <div><span>Chu kỳ</span><strong>${ARCH.lich.chuKy}</strong><em>một lượt</em></div>
      <div><span>Khung giờ</span><strong>07:00 – 18:00</strong><em>ngày làm việc</em></div>
      <div><span>Mỗi lượt mất</span><strong>${ARCH.lich.moiLuot}</strong><em>rồi tự tắt</em></div>
      <div><span>Cảnh báo cũ</span><strong>${ARCH.lich.canhBao} giờ</strong><em>hiện băng đỏ</em></div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Bước</th><th>Việc</th><th>Thời gian</th></tr></thead><tbody>
      ${buoc.map(([n, v, t]) => `<tr${n === "08" ? ' class="arch-row-key"' : ""}><td class="arch-step-num">${n}</td><td>${v}</td><td class="numeric">${t}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="arch-callout">
      <strong>Vì sao màn hình tự đổi số ở bước 08</strong>
      <p>Supabase Realtime bám vào bảng <code>sync_runs</code> chứ không phải <code>inventory</code>. Mỗi lượt đồng bộ vì thế chỉ sinh <strong>một</strong> tín hiệu thay vì hàng trăm tín hiệu rời rạc, nên app chỉ nạp lại đúng một lần.</p>
    </div>`;
}

function archWriteTable() {
  const bang = [
    ["inventory", "298 dòng mỗi ngày", "Xoá đúng ngày hôm nay rồi chèn lại", "Mỗi ngày là một ảnh chụp riêng. Ngày cũ giữ nguyên — đây là lịch sử để so sánh kỳ."],
    ["movements", "≈ 5.700 dòng", "Xoá sạch rồi ghi mới toàn bộ", "Mỗi lượt chạy đã trả về toàn bộ lịch sử nhập-xuất, giữ nhiều bản chỉ là chép lại cùng dữ liệu."],
    ["snapshots", "1 dòng mỗi ngày", "Ghi đè theo ngày", "Chạy lại trong ngày thì đè lên chính nó. Một ngày đúng một dòng."],
    ["sync_runs", "1 dòng mỗi lượt", "Chỉ thêm, không xoá", "Nhật ký vận hành: lượt nào thành công, lượt nào lỗi và lỗi gì."],
  ];
  return `<div class="table-wrap"><table><thead><tr><th>Bảng</th><th>Quy mô</th><th>Cách ghi mỗi lượt</th><th>Lý do</th></tr></thead><tbody>
      ${bang.map(([a, b, c, d]) => `<tr><td><strong class="arch-code">${a}</strong></td><td>${b}</td><td>${c}</td><td>${d}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="arch-callout">
      <strong>Chạy lại bao nhiêu lần cũng an toàn</strong>
      <p>Mọi bảng đều theo nguyên tắc xoá rồi ghi lại, không cộng dồn. Lỡ lịch rồi chạy bù, hay bấm chạy tay giữa ngày, đều không bao giờ nhân đôi số liệu.</p>
    </div>`;
}

function archSecurity() {
  const quyen = [
    ["Người chưa đăng nhập", "Không thấy gì", "Màn hình đăng nhập. API trả về HTTP 401 trên cả 4 bảng", "chan"],
    ["Người đã đăng nhập", "Đọc toàn bộ báo cáo", "Tài khoản do quản trị viên tạo. Tự đăng ký đã tắt", "cho"],
    ["sync.py", "Đọc và ghi", "Dùng secret key, chỉ chạy trên máy ảo GitHub Actions", "cho"],
    ["Người xem repo GitHub", "Chỉ thấy mã nguồn", "Repo công khai nhưng không chứa dòng dữ liệu nào", "chan"],
  ];
  const khoa = [
    ["Publishable key", "Nằm công khai trong <code>config.js</code>", "Được thiết kế để lộ. Không mở được gì nếu chưa đăng nhập — RLS mới là lớp chặn thật", "cho"],
    ["Secret key", "GitHub Secrets", "Bỏ qua mọi phân quyền. Không bao giờ được đưa vào mã nguồn", "chan"],
    ["Mật khẩu SQL Server", "GitHub Secrets", "Chỉ script đồng bộ dùng tới", "chan"],
  ];
  return `
    <div class="table-wrap"><table><thead><tr><th>Ai</th><th>Thấy được gì</th><th>Cơ chế</th></tr></thead><tbody>
      ${quyen.map(([a, b, c, t]) => `<tr><td><strong>${a}</strong></td><td><span class="arch-flag arch-${t}">${b}</span></td><td>${c}</td></tr>`).join("")}
    </tbody></table></div>
    <h4 class="arch-sub">Ba loại khoá — đừng nhầm lẫn</h4>
    <div class="table-wrap"><table><thead><tr><th>Khoá</th><th>Cất ở đâu</th><th>Ghi chú</th></tr></thead><tbody>
      ${khoa.map(([a, b, c, t]) => `<tr><td><strong class="arch-code">${a}</strong></td><td><span class="arch-flag arch-${t}">${b}</span></td><td>${c}</td></tr>`).join("")}
    </tbody></table></div>`;
}

function archTrouble() {
  const ca = [
    ["Băng đỏ báo dữ liệu cũ", "Quá " + ARCH.lich.canhBao + " giờ chưa có lượt đồng bộ thành công",
     "Mở bảng <code>sync_runs</code> trên Supabase, xem dòng mới nhất. Cột <code>message</code> ghi nguyên văn lỗi."],
    ["Đăng nhập báo sai mật khẩu", "Sai thông tin, hoặc tài khoản chưa được tạo",
     "Kiểm tra trong Supabase → Authentication → Users. Tự đăng ký đang tắt nên tài khoản phải do quản trị viên thêm."],
    ["Số liệu không đổi dù kho có biến động", "Lượt đồng bộ lỗi, hoặc ERP chưa ghi nhận phiếu",
     "Đối chiếu <code>sync_runs.finished_at</code> với thời điểm phát sinh phiếu trong ERP."],
    ["Đồng bộ chạy rất lâu", "Stored procedure biến động mạnh theo tải máy chủ — đã đo được từ 4 tới 152 giây",
     "Bình thường. Timeout đặt 600 giây nên vẫn hoàn tất."],
    ["Trang trắng, không tải được", "Mất kết nối tới Supabase",
     "Kiểm tra trạng thái project trên Supabase. Gói miễn phí tự tạm dừng sau 7 ngày hoàn toàn không có hoạt động."],
  ];
  return `<div class="table-wrap"><table><thead><tr><th>Hiện tượng</th><th>Nguyên nhân thường gặp</th><th>Kiểm tra ở đâu</th></tr></thead><tbody>
      ${ca.map(([a, b, c]) => `<tr><td><strong>${a}</strong></td><td>${b}</td><td>${c}</td></tr>`).join("")}
    </tbody></table></div>`;
}

function archSourceBanner() {
  const run = state.data?.lastRun;
  const dt = value => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(`${value}T00:00:00`)) : "—";
  const dtFull = value => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
  if (!run) {
    return `<div class="arch-source"><div class="arch-source-main"><span class="arch-source-label">Nguồn dữ liệu</span>
      <strong>Chưa ghi nhận lần đồng bộ nào</strong></div></div>`;
  }
  const gio = run.finished_at ? (Date.now() - new Date(run.finished_at).getTime()) / 3600000 : null;
  const tuoi = gio == null ? "" : gio < 1 ? `${Math.round(gio * 60)} phút trước`
    : gio < 24 ? `${Math.floor(gio)} giờ trước` : `${Math.floor(gio / 24)} ngày trước`;
  return `<div class="arch-source">
    <div class="arch-source-main">
      <span class="arch-source-label">Dữ liệu hiện đang xem được kéo từ SQL Server</span>
      <strong>Khoảng chứng từ ${dt(run.doc_date_from)} → ${dt(run.doc_date_to)}</strong>
      <span class="arch-source-sub">Lấy về lúc <b>${dtFull(run.finished_at)}</b>${tuoi ? ` · ${tuoi}` : ""}</span>
    </div>
    <dl class="arch-source-stats">
      <div><dt>Máy chủ nguồn</dt><dd class="arch-code">${ARCH.sql.host}:${ARCH.sql.port}</dd></div>
      <div><dt>Database</dt><dd class="arch-code">${ARCH.sql.db}</dd></div>
      <div><dt>Dòng thô nhận về</dt><dd>${run.source_rows ? formatNumber(run.source_rows, 0) : "—"}</dd></div>
      <div><dt>Dòng tồn đã ghi</dt><dd>${run.rows_loaded ? formatNumber(run.rows_loaded, 0) : "—"}</dd></div>
    </dl>
  </div>`;
}

function architecturePage() {
  return `
    ${archSourceBanner()}
    ${panel("Sơ đồ tổng thể", "Bốn tầng, dữ liệu đi một chiều từ trái sang phải", archDiagram(), "ERP → Dashboard")}
    ${panel("Chi tiết từng tầng", "Địa chỉ, công nghệ và vai trò của mỗi thành phần", archLayers())}
    ${panel("Lịch đồng bộ dữ liệu", "Một lượt tự động diễn ra thế nào và mất bao lâu", archSyncTable(), ARCH.lich.chuKy + " / lượt")}
    ${panel("Cách ghi vào từng bảng", "Ba bảng dữ liệu dùng ba chiến lược khác nhau", archWriteTable())}
    ${panel("Phân quyền và bảo mật", "Ai thấy được gì, và khoá nào cất ở đâu", archSecurity())}
    ${panel("Khi có sự cố", "Tra nhanh trước khi báo lên", archTrouble())}
  `;
}

// ==========================================================================
// TRANG "NHẬT KÝ" — ai vào app lúc nào, và số liệu đổi ra sao qua từng lượt
// Dữ liệu nạp riêng khi mở trang, không tải cùng lúc với dashboard.
// ==========================================================================

const nhatKy = { dangTai: false, daTai: false, dangNhap: [], dongBo: [], theoNgay: [] };

async function taiNhatKy() {
  if (nhatKy.dangTai) return;
  nhatKy.dangTai = true;
  try {
    const [dangNhap, dongBo, theoNgay] = await Promise.all([
      window.supabase.from("login_log")
        .select("*").order("signed_in_at", { ascending: false }).limit(100)
        .then(r => r.data || []),
      window.supabase.from("sync_runs")
        .select("*").order("started_at", { ascending: false }).limit(60)
        .then(r => r.data || []),
      window.supabase.from("snapshots")
        .select("*").order("report_date", { ascending: false }).limit(60)
        .then(r => r.data || []),
    ]);
    Object.assign(nhatKy, { dangNhap, dongBo, theoNgay, daTai: true });
  } finally {
    nhatKy.dangTai = false;
  }
}

const gioPhut = value => value
  ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value))
  : "—";

// "3 phút trước", "2 giờ trước" — dễ đọc hơn mốc tuyệt đối khi vừa mới xảy ra.
function baoLau(value) {
  if (!value) return "";
  const phut = (Date.now() - new Date(value).getTime()) / 60000;
  if (phut < 1) return "vừa xong";
  if (phut < 60) return `${Math.floor(phut)} phút trước`;
  if (phut < 1440) return `${Math.floor(phut / 60)} giờ trước`;
  return `${Math.floor(phut / 1440)} ngày trước`;
}

// Rút gọn User-Agent thành tên trình duyệt và máy, đủ để phân biệt thiết bị.
function thietBi(ua) {
  if (!ua) return "—";
  const may = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac"
    : /Windows/.test(ua) ? "Windows" : "Khác";
  const trinhDuyet = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari"
    : /Firefox\//.test(ua) ? "Firefox" : "";
  return trinhDuyet ? `${trinhDuyet} · ${may}` : may;
}

function lech(moi, cu, donVi = "", soLe = 0) {
  if (cu == null || moi == null) return "";
  const d = Number(moi) - Number(cu);
  if (Math.abs(d) < (soLe ? 0.05 : 0.5)) return `<span class="log-delta log-flat">không đổi</span>`;
  const lop = d > 0 ? "log-up" : "log-down";
  return `<span class="log-delta ${lop}">${d > 0 ? "+" : ""}${formatNumber(d, soLe)}${donVi}</span>`;
}

function logDangNhap() {
  if (!nhatKy.dangNhap.length) {
    return `<div class="empty-state"><strong>Chưa ghi nhận lượt đăng nhập nào</strong>
      <span>Nhật ký bắt đầu tính từ lúc tính năng này được bật. Các lần đăng nhập trước đó không có trong đây.</span></div>`;
  }
  const theoNguoi = Object.entries(groupRows(nhatKy.dangNhap, r => r.email))
    .map(([email, ds]) => ({ email, soLan: ds.length, ganNhat: ds[0].signed_in_at }))
    .sort((a, b) => b.ganNhat.localeCompare(a.ganNhat));

  return `<div class="log-people">${theoNguoi.map(n => `
      <div class="log-person">
        <strong>${escapeHtml(n.email)}</strong>
        <span>${n.soLan} lượt · gần nhất ${baoLau(n.ganNhat)}</span>
      </div>`).join("")}</div>
    <div class="table-wrap"><table><thead><tr><th>Thời điểm</th><th>Người dùng</th><th>Thiết bị</th><th></th></tr></thead><tbody>
      ${nhatKy.dangNhap.map(r => `<tr>
        <td class="numeric" data-sort-value="${r.signed_in_at}">${gioPhut(r.signed_in_at)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(thietBi(r.user_agent))}</td>
        <td class="log-ago">${baoLau(r.signed_in_at)}</td>
      </tr>`).join("")}
    </tbody></table></div>`;
}

function logDongBo() {
  if (!nhatKy.dongBo.length) {
    return '<div class="empty-state"><strong>Chưa có lượt đồng bộ nào</strong><span>Chạy scripts/sync.py để bắt đầu.</span></div>';
  }
  const ok = nhatKy.dongBo.filter(r => r.status === "success").length;
  const hong = nhatKy.dongBo.filter(r => r.status === "failed").length;

  return `<div class="log-summary">
      <div><span>Lượt gần đây</span><strong>${nhatKy.dongBo.length}</strong></div>
      <div><span>Thành công</span><strong class="log-ok">${ok}</strong></div>
      <div><span>Thất bại</span><strong class="${hong ? "log-fail" : ""}">${hong}</strong></div>
      <div><span>Lượt mới nhất</span><strong>${baoLau(nhatKy.dongBo[0].finished_at || nhatKy.dongBo[0].started_at)}</strong></div>
    </div>
    <div class="table-wrap"><table><thead><tr>
      <th>Bắt đầu</th><th>Kết quả</th><th>Block tồn</th><th>Thay đổi</th>
      <th>Dòng thô</th><th>Mất</th><th>Khoảng ngày kéo về</th></tr></thead><tbody>
      ${nhatKy.dongBo.map((r, i) => {
        const truoc = nhatKy.dongBo.slice(i + 1).find(x => x.status === "success" && x.rows_loaded != null);
        const giay = r.finished_at && r.started_at
          ? (new Date(r.finished_at) - new Date(r.started_at)) / 1000 : null;
        const nhan = r.status === "success" ? "log-ok" : r.status === "failed" ? "log-fail" : "log-run";
        return `<tr>
          <td class="numeric" data-sort-value="${r.started_at}">${gioPhut(r.started_at)}</td>
          <td><span class="log-badge ${nhan}">${r.status}</span></td>
          <td class="numeric">${r.rows_loaded != null ? formatNumber(r.rows_loaded, 0) : "—"}</td>
          <td class="numeric">${r.status === "success" ? lech(r.rows_loaded, truoc?.rows_loaded) : ""}</td>
          <td class="numeric">${r.source_rows != null ? formatNumber(r.source_rows, 0) : "—"}</td>
          <td class="numeric">${giay != null ? `${formatNumber(giay, 1)}s` : "—"}</td>
          <td>${r.doc_date_from ? `${formatDate(r.doc_date_from)} → ${formatDate(r.doc_date_to)}` : "—"}</td>
        </tr>${r.message && r.status === "failed"
          ? `<tr class="log-msg"><td colspan="7">${escapeHtml(r.message)}</td></tr>` : ""}`;
      }).join("")}
    </tbody></table></div>`;
}

function logTheoNgay() {
  if (nhatKy.theoNgay.length < 2) {
    return `<div class="empty-state"><strong>Cần ít nhất 2 ngày dữ liệu</strong>
      <span>Hiện mới có ${nhatKy.theoNgay.length} ngày. Mỗi ngày đồng bộ ghi thêm một dòng, vài ngày nữa bảng này sẽ có ý nghĩa.</span></div>`;
  }
  return `<div class="table-wrap"><table><thead><tr>
      <th>Ngày</th><th>Block tồn</th><th>Δ block</th><th>Dung tích</th><th>Δ m³</th>
      <th>Tuổi TB</th><th>SX dư</th><th>Hàng lỗi</th></tr></thead><tbody>
      ${nhatKy.theoNgay.map((s, i) => {
        const truoc = nhatKy.theoNgay[i + 1];
        return `<tr>
          <td class="numeric" data-sort-value="${s.report_date}">${formatDate(s.report_date)}</td>
          <td class="numeric">${formatNumber(s.stock_rows, 0)}</td>
          <td class="numeric">${lech(s.stock_rows, truoc?.stock_rows)}</td>
          <td class="numeric">${formatNumber(s.total_volume, 1)} m³</td>
          <td class="numeric">${lech(s.total_volume, truoc?.total_volume, " m³", 1)}</td>
          <td class="numeric">${s.avg_age_days ?? "—"} ngày</td>
          <td class="numeric">${formatNumber(s.volume_surplus, 1)} m³</td>
          <td class="numeric">${s.defect_blocks ?? "—"}</td>
        </tr>`;
      }).join("")}
    </tbody></table></div>`;
}

function logsPage() {
  if (!nhatKy.daTai) {
    // Nạp xong thì vẽ lại đúng trang này, tránh ghi đè nếu người dùng đã chuyển trang.
    taiNhatKy().then(() => { if (state.page === "logs") renderPage(); })
      .catch(error => {
        console.error("Không tải được nhật ký:", error);
        toast("Không tải được nhật ký. Kiểm tra mạng rồi thử lại.");
      });
    return '<div class="empty-state"><strong>Đang tải nhật ký…</strong><span>Đọc từ Supabase.</span></div>';
  }
  return `
    ${panel("Ai đã vào app", "Ghi nhận mỗi lần đăng nhập thành công, kèm thiết bị", logDangNhap(), `${nhatKy.dangNhap.length} lượt gần nhất`, "table-panel")}
    ${panel("Mỗi lượt đồng bộ chạy ra sao", "Kết quả từng lượt và mức thay đổi so với lượt thành công trước đó", logDongBo(), "", "table-panel")}
    ${panel("Số liệu đổi thế nào qua từng ngày", "So sánh ảnh chụp cuối mỗi ngày", logTheoNgay(), `${nhatKy.theoNgay.length} ngày`, "table-panel")}
  `;
}

// Chưa chạy phan-quyen-supabase.sql thì ba màn hình quản trị bị khoá với MỌI
// người, kể cả người dựng hệ thống. Không nói ra thì người dùng chỉ thấy các
// mục quen thuộc tự nhiên biến mất khỏi thanh bên và không hiểu vì sao.
function bangChuaPhanQuyen() {
  if (!state.profile?.chuaCoHoSo) return "";
  return `<p class="setup-banner" role="status">Chưa dựng bảng phân quyền trên Supabase, nên ba màn hình quản trị (Cách app hoạt động · Nhật ký · Cấu hình tài khoản) đang tạm khoá với mọi người. Mở Supabase &gt; SQL Editor, dán toàn bộ <code>scripts/phan-quyen-supabase.sql</code> rồi bấm Run.</p>`;
}

function renderPage() {
  // Chặn ở đây chứ không chỉ ở thanh điều hướng: người dùng vẫn có thể tới
  // một trang bị thu quyền do quyền vừa đổi giữa chừng, hoặc do trang đang mở
  // sẵn từ trước. Rơi về Hướng dẫn thay vì để màn hình trắng.
  if (!trangDuocXem(state.page)) state.page = "guide";
  const config = pageConfig[state.page];
  els.pageTitle.textContent = config.title;
  els.pageDescription.textContent = config.description;
  els.pageKicker.textContent = config.kicker;
  els.topTitle.textContent = config.label;
  els.scopeText.textContent = filtersScopeLabel();
  els.filterBar.hidden = ["guide", "architecture", "logs", "admin"].includes(state.page);
  const pages = {
    guide: guidePage,
    architecture: architecturePage,
    overview: overviewPage,
    warehouse: warehousePage,
    product: productPage,
    customer: customerPage,
    aging: agingPage,
    status: statusPage,
    details: detailsPage,
    workflow: workflowPage,
    logs: logsPage,
    admin: adminPage,
  };
  els.pageContent.innerHTML = bangChuaPhanQuyen() + pages[state.page](state.filtered);
  els.pageContent.classList.add("page-enter");
  enhanceSortableTables(els.pageContent);
}

function populateFilters() {
  const products = unique(state.records.map(row => row.product));
  const colors = unique(state.records.map(row => row.color));
  const ages = unique(state.records.map(row => row.ageBucket));
  const statuses = unique(state.records.map(row => row.status));
  const warehouses = unique(state.records.map(row => row.warehouse));

  // Sau mỗi lần đồng bộ, một giá trị đang được lọc có thể đã biến mất khỏi dữ
  // liệu (ví dụ mã hàng vừa xuất hết). Nếu không dọn, ô select hiện "Tất cả"
  // trong khi bộ lọc vẫn giữ giá trị cũ và bảng trống trơn không rõ lý do.
  const conTonTai = { warehouse: warehouses, product: products, color: colors, age: ages, status: statuses };
  let daDon = false;
  for (const [khoa, danhSach] of Object.entries(conTonTai)) {
    if (state.filters[khoa] !== "all" && !danhSach.includes(state.filters[khoa])) {
      state.filters[khoa] = "all";
      daDon = true;
    }
  }
  if (daDon) toast("Một số giá trị đang lọc không còn trong dữ liệu mới — đã bỏ lọc đó.");

  // Ô lọc chỉ có đúng một lựa chọn thật thì không phải bộ lọc, chỉ là nhiễu.
  els.warehouseFilter.closest("label").hidden = warehouses.length < 2;
  els.warehouseFilter.innerHTML = `<option value="all">Tất cả kho</option>${optionsMarkup(warehouses, state.filters.warehouse)}`;
  els.productFilter.innerHTML = `<option value="all">Tất cả sản phẩm</option>${optionsMarkup(products, state.filters.product)}`;
  els.colorFilter.innerHTML = `<option value="all">Tất cả màu</option>${optionsMarkup(colors, state.filters.color)}`;
  els.ageFilter.innerHTML = `<option value="all">Tất cả tuổi tồn</option>${optionsMarkup(ages, state.filters.age)}`;
  els.statusFilter.innerHTML = `<option value="all">Tất cả trạng thái</option>${optionsMarkup(statuses, state.filters.status)}`;
}

// Khớp kích thước theo cách người trong kho hay gõ:
//   "2070"            -> bất kỳ chiều nào bằng 2070
//   "1850x2070"       -> hai chiều đó cùng có mặt, không cần đúng thứ tự
//   "1850x2070x550"   -> đúng cả ba chiều
// Chấp nhận cả "x", "×", dấu cách, dấu phẩy làm dấu ngăn.
function khopKichThuoc(row, tuKhoa) {
  const so = tuKhoa.split(/[^0-9]+/).filter(Boolean).map(Number);
  if (!so.length) return true;
  const chieu = [row.lengthMm, row.widthMm, row.heightMm].filter(v => v != null);
  if (!chieu.length) return false;
  if (so.length === 1) return chieu.some(v => String(v).startsWith(String(so[0])));
  // Nhiều số: mỗi số phải ăn một chiều riêng, không dùng lại chiều đã khớp.
  const conLai = [...chieu];
  return so.every(s => {
    const i = conLai.indexOf(s);
    if (i === -1) return false;
    conLai.splice(i, 1);
    return true;
  });
}

function applyFilters() {
  state.filtered = state.records.filter(row => {
    if (state.filters.warehouse !== "all" && row.warehouse !== state.filters.warehouse) return false;
    if (state.filters.product !== "all" && row.product !== state.filters.product) return false;
    if (state.filters.color !== "all" && row.color !== state.filters.color) return false;
    if (state.filters.age !== "all" && row.ageBucket !== state.filters.age) return false;
    if (state.filters.status !== "all" && row.status !== state.filters.status) return false;
    if (state.filters.size && !khopKichThuoc(row, state.filters.size)) return false;
    return true;
  });
  renderPage();
}

function buildNav() {
  els.nav.innerHTML = Object.entries(pageConfig)
    .filter(([key]) => trangDuocXem(key))
    .map(([key, config]) => `<button class="nav-button ${state.page === key ? "active" : ""}" data-page="${key}"><span class="nav-icon">${icons[key]}</span><span>${config.label}</span></button>`)
    .join("");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function exportCurrentCsv() {
  const headers = ["barcode", "product", "productFull", "color", "warehouse", "location", "status", "statusSecondary", "statusTertiary", "lengthMm", "widthMm", "heightMm", "closeUnits", "closeVolume", "receiptDate", "deliveryDate", "daysInStock"];
  const lines = [headers.join(",")].concat(state.filtered.map(row => headers.map(header => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "inventory-filtered.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  toast("Đã xuất CSV theo bộ lọc hiện tại");
}

function subsetByDrill(type, value) {
  if (type === "product") return state.filtered.filter(row => row.productFull === value);
  if (type === "status") return state.filtered.filter(row => row.status === value);
  if (type === "color") return state.filtered.filter(row => row.color === value);
  if (type === "age") return state.filtered.filter(row => row.ageBucket === value);
  if (type === "warehouse") return state.filtered.filter(row => row.warehouse === value);
  if (type === "customer") return state.filtered.filter(row => phanLoaiDon(row.statusSecondary).ten === value);
  if (type === "remark") return state.filtered.filter(row => row.statusSecondary === value);
  if (type === "remark1") return state.filtered.filter(row => row.statusTertiary === value);
  if (type === "day" || type === "week" || type === "month") {
    const receiptKey = type === "day" ? "receiptDate" : type === "week" ? "receiptWeek" : "receiptMonth";
    const deliveryKey = type === "day" ? "deliveryDate" : type === "week" ? "deliveryWeek" : "deliveryMonth";
    return state.filtered.filter(row => row[receiptKey] === value || row[deliveryKey] === value);
  }
  return state.filtered;
}

function openAnalysis(rows, title, subtitle) {
  const topRemarks = Object.entries(groupRows(rows.filter(row => row.statusSecondary), "statusSecondary"))
    .map(([name, items]) => ({ name, volume: sum(items, "closeVolume") }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);
  els.modalTitle.textContent = title;
  els.modalSubtitle.textContent = subtitle;
  els.modalBody.innerHTML = `
    <div class="analysis-summary">
      <div><span>Block tồn</span><strong>${formatNumber(sum(rows, "closeUnits"), 0)}</strong></div>
      <div><span>Kích thước</span><strong>${(() => {
        const cỡ = unique(rows.map(r => r.sizeLabel).filter(Boolean));
        return cỡ.length === 1 ? cỡ[0] : `${cỡ.length} loại`;
      })()}</strong></div>
      <div><span>Dung tích</span><strong>${formatNumber(sum(rows, "closeVolume"), 1)} m³</strong></div>
      <div><span>Tuổi TB</span><strong>${formatNumber(weightedAge(rows), 0)} ngày</strong></div>
      <div class="analysis-risk ${rows.some(row => row.status === "Chưa xác định") ? "has-risk" : ""}"><span>Nội dung cùng trao đổi</span><strong>${dominant(rows, "status")}</strong></div>
    </div>
    <div class="dashboard-grid equal">
      ${panel("Kho đang giữ nhóm này", "Để biết tồn đang nằm ở đâu", barChart(unique(rows.map(row => row.warehouse)).map(warehouse => ({ label: warehouse, value: sum(rows.filter(row => row.warehouse === warehouse), "closeVolume"), drillType: "warehouse", drillValue: warehouse })), value => `${formatNumber(value, 1)} m³`, "#34373c"))}
      ${panel("Trạng thái phụ nổi bật", "Nhấn để xem barcode và cùng phân công", topRemarks.length ? barChart(topRemarks.map(item => ({ label: item.name, value: item.volume, drillType: "remark", drillValue: escapeAttr(item.name) })), value => `${formatNumber(value, 1)} m³`, "#b22536") : '<div class="empty-state"><strong>Không có dữ liệu</strong><span>Nhóm này chưa có trạng thái phụ.</span></div>')}
    </div>
    ${panel("Danh sách block liên quan", "Phạm vi theo drill hiện tại", detailsTable(rows.slice(0, 40)), `${formatNumber(rows.length, 0)} block`, "table-panel")}
  `;
  enhanceSortableTables(els.modalBody);
  els.modal.hidden = false;
  requestAnimationFrame(() => {
    els.modal.classList.add("show");
    document.body.classList.add("modal-open");
  });
}

function closeAnalysis() {
  els.modal.classList.remove("show");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    els.modal.hidden = true;
    els.modalBody.innerHTML = "";
  }, 180);
}

function openTaskModal(barcode) {
  // barcode KHÔNG duy nhất (2.076 mã cho 2.178 dòng) nên tra theo rowId trước.
  const record = state.records.find(row => row.rowId === barcode)
              || state.records.find(row => (row.barcode || row.rowId) === barcode);
  const today = state.reportDate || new Date().toISOString().slice(0, 10);
  const deadline = new Date(`${today}T00:00:00`);
  deadline.setDate(deadline.getDate() + 7);
  state.selectedTaskBarcode = barcode;
  els.taskForm.reset();
  els.taskBarcode.value = barcode;
  els.taskStartDate.value = today;
  els.taskDeadline.value = deadline.toISOString().slice(0, 10);
  els.taskPriority.value = "Cao";
  els.taskStatus.value = "Chưa bắt đầu";
  els.taskBarcodeContext.textContent = record
    ? `${barcode} · ${record.productFull} · ${record.warehouse} · ${formatNumber(record.closeVolume, 2)} m³`
    : barcode;
  els.taskModal.hidden = false;
  requestAnimationFrame(() => {
    els.taskModal.classList.add("show");
    document.body.classList.add("modal-open");
    els.taskTitle.focus();
  });
}

function closeTaskModal() {
  els.taskModal.classList.remove("show");
  document.body.classList.toggle("modal-open", !els.modal.hidden);
  setTimeout(() => {
    els.taskModal.hidden = true;
  }, 180);
}

async function createTask() {
  if (!duocSuaViec()) {
    toast("Tài khoản của bạn chỉ được xem, chưa giao việc được");
    return;
  }
  const nut = els.taskForm.querySelector(".task-submit");
  nut.disabled = true;
  nut.textContent = "Đang lưu…";

  const user = await nguoiDangDangNhap();
  const row = {
    barcode: els.taskBarcode.value,
    // Lưu thêm row_id vì barcode không duy nhất; row_id mới là khoá tra chính xác.
    row_id: state.selectedTaskBarcode,
    title: els.taskTitle.value.trim(),
    assignee: els.taskAssignee.value.trim(),
    start_date: els.taskStartDate.value,
    deadline: els.taskDeadline.value,
    priority: els.taskPriority.value,
    status: els.taskStatus.value,
    note: els.taskNote.value.trim(),
    created_by: user?.id || null,
    created_by_email: user?.email || null,
  };
  const { data, error } = await window.supabase.from("tasks").insert(row).select().single();

  nut.disabled = false;
  nut.textContent = "Phân công";

  if (error) {
    toast(`Chưa lưu được lên Supabase: ${error.message}`);
    return;
  }
  state.tasks.push(mapTask(data));
  closeTaskModal();
  renderPage();
  toast(`Đã giao cho ${row.assignee} theo barcode ${row.barcode} — mọi người đăng nhập đều thấy`);
}

async function xoaViec(id) {
  const task = state.tasks.find(item => item.id === id);
  if (!task) return;
  if (!confirm(`Xoá nhiệm vụ "${task.title}" của barcode ${task.barcode}?\n\nMọi người sẽ không còn thấy nhiệm vụ này.`)) return;
  const { error } = await window.supabase.from("tasks").delete().eq("id", id);
  if (error) {
    toast(`Chưa xoá được: ${error.message}`);
    return;
  }
  state.tasks = state.tasks.filter(item => item.id !== id);
  renderPage();
  toast("Đã xoá nhiệm vụ");
}

// ==========================================================================
// PHÂN TÍCH THEO KHÁCH HÀNG
//
// ĐỌC KỸ TRƯỚC KHI SỬA — màn hình này khác mọi màn hình còn lại ở một điểm:
// nó là DIỄN GIẢI, không phải số gốc.
//
// ERP KHÔNG có cột khách hàng. Đã kiểm cả 44 cột stored procedure trả về.
// Tên khách nằm lẫn trong ô ghi chú tự do `Remark` (map thành statusSecondary),
// theo dạng "KHÁCH - MÃ ĐƠN - mô tả":
//     QUỐC PHONG-QP-2607-01      HUỲNH LÊ-HL-1808-2
//     ASHT-883.R0--Mousse tấm    ĐH-JANGIN
//
// Vì là ô tự do nên trong đó lẫn cả bốn thứ khác nhau, đo trên tồn 28/08/2026:
//     53,0%  quy được về khách hàng      (1.054 m³)
//     19,8%  lệnh sản xuất nội bộ WO/IN  (394 m³)
//     20,6%  ô để trống                  (410 m³)
//      4,4%  nhóm nội bộ: thí nghiệm, dự trù, QA, TMĐT
//      2,3%  ghi chú LỖI bị gõ nhầm vào ô mã đơn — "NỨT", "RÁCH", "LEM MÀU"
//
// Anh Louis chọn phương án B ngày 28/08/2026: gộp theo luật, nhưng CÔNG KHAI
// luật ngay trên màn hình và cho xem nguyên văn chuỗi gốc. Điều đó giữ được
// tinh thần "app là gương trung thực của ERP" ở BAN-GIAO mục 4 — người dùng
// luôn kiểm chứng ngược được.
//
// Cách chữa tận gốc KHÔNG nằm ở đây: kho cần chốt danh mục khách trong ERP.
// Đã ghi vào phần "Còn treo" của BAN-GIAO.
// ==========================================================================

// Lệnh sản xuất nội bộ: WO2608, WOE2608, IN2608, INE2603…
const DON_NOI_BO = /^(WO|WOE|IN|INE)\d/i;

// Hàng thí nghiệm, gõ 6 kiểu khác nhau cho cùng một thứ:
// "THÍ NGHIỆM", "THI NGHIEM" (không dấu), "TN", "TN RÊ", "TN 14/5/26", "ĐỔ TN".
// Lưu ý "ĐỔ TN" (đổ thí nghiệm) khác hẳn "ĐỔ DƯ" (đổ dư, là ghi chú lỗi) —
// hai chuỗi giống nhau ở hai chữ đầu nhưng thuộc hai nhóm khác nhau.
const DON_THI_NGHIEM = /^(THÍ NGHIỆM|THI NGHIEM|ĐỔ TN|TN)\b/i;

// Ghi chú tình trạng lỗi bị gõ nhầm sang ô mã đơn. Khớp theo tiền tố vì người
// nhập hay viết thêm: "RÁCH SX TRẢ", "LEM MÀU K SD ĐC", "ĐỔ DƯ 4/3".
const DON_LOI = ["NỨT", "RÁCH", "LEM MÀU", "ĐỔ DƯ", "MÀU VÀNG", "MÚT MÀU", "CÓ BỘT", "PHẾ PHẨM", "BOSUNGTEM"];

// Nhóm nội bộ của Havas, không phải khách hàng.
const DON_NHOM_NOI_BO = new Set(["DỰ TRÙ", "TMĐT", "QA", "HÀNG TKN"]);

const KHACH_LOAI = {
  khach:  { nhan: "Khách hàng",              mau: "#b22536" },
  noibo:  { nhan: "Lệnh sản xuất nội bộ",    mau: "#34373c" },
  khac:   { nhan: "Nhóm nội bộ khác",        mau: "#8a9097" },
  loi:    { nhan: "Ghi chú lỗi gõ nhầm ô",   mau: "#a8660a" },
  trong:  { nhan: "Ô mã đơn để trống",       mau: "#cfd3d7" },
};

// Trả về { ten, loai, chacChan }. chacChan = false nghĩa là luật đoán được
// nhưng nên có người rà lại — hiện thành dấu "?" trên màn hình chứ không giấu.
function phanLoaiDon(chuoi) {
  const goc = (chuoi || "").trim();
  if (!goc) return { ten: "(không ghi mã đơn)", loai: "trong", chacChan: true };

  // Một ô có thể chứa hai đơn: "SST-158--Mousse tấm/SST-171--Mousse tấm".
  // Một block chỉ thuộc về một nơi, nên lấy phần đầu và ghi nhận điều đó.
  const dau = goc.split(/[-–/]/)[0].replace(/\s+/g, " ").trim().toUpperCase();

  if (DON_NOI_BO.test(dau) || /^ĐƠN HÀNG WO/i.test(goc)) return { ten: dau, loai: "noibo", chacChan: true };
  if (DON_THI_NGHIEM.test(dau)) return { ten: "THÍ NGHIỆM", loai: "khac", chacChan: true };
  if (DON_LOI.some(tu => dau.startsWith(tu))) return { ten: dau, loai: "loi", chacChan: true };
  if (DON_NHOM_NOI_BO.has(dau)) return { ten: dau, loai: "khac", chacChan: true };

  // "ĐH-JANGIN" nghĩa là "đơn hàng của JANGIN" — khách nằm ở token thứ hai.
  // Không xử lý riêng thì JANGIN, HMT, LV đều bị gộp nhầm thành một khách "ĐH",
  // và PHÁT TRIỂN bị tách làm đôi (đứng một mình, và trong "ĐH-PHÁT TRIỂN").
  if (dau === "ĐH") {
    const phan = goc.split(/[-–]/).map(x => x.replace(/\s+/g, " ").trim()).filter(Boolean);
    const ten = (phan[1] || "ĐH").toUpperCase();
    return { ten, loai: "khach", chacChan: ten.length > 2 };
  }

  // Tên một hoặc hai ký tự ("Q", "T") không đủ để khẳng định là khách hàng.
  return { ten: dau, loai: "khach", chacChan: dau.length > 2 };
}

function gomTheoKhach(rows) {
  const theoLoai = {};
  for (const k of Object.keys(KHACH_LOAI)) theoLoai[k] = { volume: 0, units: 0, blocks: 0 };

  const map = new Map();
  for (const row of rows) {
    const { ten, loai, chacChan } = phanLoaiDon(row.statusSecondary);
    const o = theoLoai[loai];
    o.volume += row.closeVolume || 0;
    o.units += row.closeUnits || 0;
    o.blocks += 1;
    if (loai !== "khach") continue;

    if (!map.has(ten)) map.set(ten, { ten, chacChan, rows: [], donGoc: new Set() });
    const k = map.get(ten);
    k.rows.push(row);
    if (row.statusSecondary) k.donGoc.add(row.statusSecondary);
  }

  const khach = [...map.values()].map(k => {
    const tuoi = k.rows.map(r => Number(r.daysInStock)).filter(v => Number.isFinite(v));
    return {
      ten: k.ten,
      chacChan: k.chacChan,
      rows: k.rows,
      donGoc: [...k.donGoc].sort(),
      volume: sum(k.rows, "closeVolume"),
      units: sum(k.rows, "closeUnits"),
      blocks: k.rows.length,
      tuoiTB: tuoi.length ? tuoi.reduce((a, b) => a + b, 0) / tuoi.length : null,
      tuoiMax: tuoi.length ? Math.max(...tuoi) : null,
      soLoi: k.rows.filter(r => (r.statusTertiary || "").trim()).length,
      khoDangGiu: unique(k.rows.map(r => r.warehouse)),
    };
  }).sort((a, b) => b.volume - a.volume);

  return { khach, theoLoai, tongVolume: sum(rows, "closeVolume") };
}

// Thanh độ tin cậy — đặt NGAY ĐẦU trang, không giấu xuống dưới. Người đi ra
// quyết định phải biết mình đang nhìn bao nhiêu phần trăm của kho.
function bangDoTinCay({ theoLoai, tongVolume }) {
  const muc = Object.entries(KHACH_LOAI)
    .map(([key, meta]) => ({ key, ...meta, ...theoLoai[key] }))
    .filter(m => m.volume > 0)
    .sort((a, b) => b.volume - a.volume);
  const tong = tongVolume || 1;
  const quyDuoc = theoLoai.khach.volume;

  return `<section class="panel trust-panel">
    <div class="panel-header">
      <div>
        <h2>Bao nhiêu phần của kho quy được về khách hàng</h2>
        <p>ERP không có cột khách hàng — tên khách được tách từ ô ghi chú tự do. Đây là phần đọc được, và phần không đọc được.</p>
      </div>
      <span class="panel-metric">${formatNumber(quyDuoc / tong * 100, 1)}% quy được</span>
    </div>
    <div class="trust-bar">${muc.map(m => `<span class="trust-seg" style="width:${Math.max(m.volume / tong * 100, 0.8)}%;background:${m.mau}" title="${m.nhan}: ${formatNumber(m.volume, 1)} m³"></span>`).join("")}</div>
    <div class="trust-legend">${muc.map(m => `<div class="trust-item">
        <span class="legend-swatch" style="background:${m.mau}"></span>
        <span class="trust-name">${m.nhan}</span>
        <b>${formatNumber(m.volume, 1)} m³</b>
        <em>${formatNumber(m.volume / tong * 100, 1)}% · ${m.blocks} block</em>
      </div>`).join("")}</div>
    <p class="trust-note">Mọi con số bên dưới chỉ tính trên <strong>${formatNumber(quyDuoc, 1)} m³ quy được về khách</strong>, không phải toàn bộ ${formatNumber(tong, 1)} m³ đang tồn.</p>
  </section>`;
}

function bangKhachHang(khach, tongKhach) {
  if (!khach.length) {
    return '<div class="empty-state"><strong>Không có khách hàng nào trong phạm vi đang lọc</strong><span>Thử bỏ bớt bộ lọc ở thanh trên.</span></div>';
  }
  return `<div class="table-wrap"><table><thead><tr>
      <th>Khách hàng</th><th>m3 tồn</th><th>Block</th><th>Tỷ trọng</th>
      <th>Tuổi TB</th><th>Nằm lâu nhất</th><th>Cơ cấu trạng thái</th><th>Có ghi lỗi</th><th>Kho</th><th></th>
    </tr></thead><tbody>
    ${khach.map(k => {
      const coCau = ["SX theo đơn hàng", "SX dư", "Chưa xác định"]
        .map(s => ({ s, v: sum(k.rows.filter(r => r.status === s), "closeVolume") }))
        .filter(x => x.v > 0);
      const tuoiLop = k.tuoiMax >= 90 ? "due-overdue" : k.tuoiMax >= 60 ? "due-due-soon" : "due-on-track";
      return `<tr class="interactive-row" data-drill-type="customer" data-drill-value="${escapeAttr(k.ten)}">
        <td><div class="product-cell"><strong>${escapeHtml(k.ten)}${k.chacChan ? "" : ' <em class="khach-ngo" title="Tên quá ngắn để khẳng định là khách hàng — cần rà lại">?</em>'}</strong><span>${k.donGoc.length} mã đơn</span></div></td>
        <td class="numeric" data-sort-value="${k.volume}">${formatNumber(k.volume, 1)} m³</td>
        <td class="numeric" data-sort-value="${k.blocks}">${k.blocks}</td>
        <td class="numeric" data-sort-value="${k.volume}">${formatNumber(k.volume / (tongKhach || 1) * 100, 1)}%</td>
        <td class="numeric" data-sort-value="${k.tuoiTB ?? -1}">${k.tuoiTB == null ? "—" : `${formatNumber(k.tuoiTB, 0)} ngày`}</td>
        <td class="numeric" data-sort-value="${k.tuoiMax ?? -1}">${k.tuoiMax == null ? "—" : `<span class="due-state ${tuoiLop}">${formatNumber(k.tuoiMax, 0)} ngày</span>`}</td>
        <td><div class="mini-stack">${coCau.map(x => `<span style="width:${x.v / k.volume * 100}%;background:${statusColors[x.s]}" title="${x.s}: ${formatNumber(x.v, 1)} m³"></span>`).join("")}</div></td>
        <td class="numeric" data-sort-value="${k.soLoi}">${k.soLoi ? `<span class="canh-bao-loi">${k.soLoi}</span>` : "—"}</td>
        <td>${k.khoDangGiu.join(", ")}</td>
        <td><button class="assign-task-button" type="button" data-xem-don="${escapeAttr(k.ten)}">Xem nguyên văn</button></td>
      </tr>`;
    }).join("")}
  </tbody></table></div>`;
}

// Khách × Tuổi tồn — câu hỏi tiền: hàng của ai đang nằm lâu.
function luoiKhachTuoi(khach) {
  const dai = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày"];
  const top = khach.slice(0, 10);
  if (!top.length) return '<div class="empty-state"><strong>Chưa có dữ liệu</strong><span>—</span></div>';
  const oGiaTri = (k, d) => sum(k.rows.filter(r => r.ageBucket === d), "closeVolume");
  const max = Math.max(...top.flatMap(k => dai.map(d => oGiaTri(k, d))), 1);
  return `<div class="heatmap-wrap"><div class="khach-luoi" style="grid-template-columns:minmax(120px,1.4fr) repeat(${dai.length},minmax(64px,1fr))">
    <div></div>${dai.map(d => `<div class="heatmap-head">${d}</div>`).join("")}
    ${top.map(k => `<div class="heatmap-row-label" title="${escapeAttr(k.ten)}">${escapeHtml(k.ten)}</div>${dai.map(d => {
      const v = oGiaTri(k, d);
      return `<button class="heatmap-cell" ${v ? `data-drill-khach-tuoi="${escapeAttr(k.ten)}" data-drill-tuoi="${d}"` : "disabled"} style="--heat:${v ? 0.08 + v / max * 0.82 : 0}"><strong>${v ? formatNumber(v, 1) : "—"}</strong></button>`;
    }).join("")}`).join("")}
  </div></div><p class="luoi-chu-thich">Số trong ô là m³. Càng đậm càng nhiều. Bấm vào ô để xem đúng những block đó.</p>`;
}

// Khách × Trạng thái — sản xuất dư đang dồn cho ai.
function cotTrangThaiKhach(khach) {
  const top = khach.slice(0, 10);
  if (!top.length) return '<div class="empty-state"><strong>Chưa có dữ liệu</strong><span>—</span></div>';
  const thuTu = ["SX theo đơn hàng", "SX dư", "Chưa xác định"];
  return `<div class="khach-trangthai">${top.map(k => {
    const phan = thuTu.map(s => ({ s, v: sum(k.rows.filter(r => r.status === s), "closeVolume") })).filter(x => x.v > 0);
    const du = phan.find(x => x.s === "SX dư");
    return `<div class="khach-tt-row">
      <span class="khach-tt-ten" title="${escapeAttr(k.ten)}">${escapeHtml(k.ten)}</span>
      <span class="khach-tt-bar">${phan.map(x => `<i style="width:${x.v / k.volume * 100}%;background:${statusColors[x.s]}" title="${x.s}: ${formatNumber(x.v, 1)} m³"></i>`).join("")}</span>
      <b class="${du && du.v / k.volume > 0.4 ? "khach-tt-canh-bao" : ""}">${du ? `${formatNumber(du.v / k.volume * 100, 0)}% dư` : "0% dư"}</b>
    </div>`;
  }).join("")}
  <div class="legend-list">${thuTu.map(s => `<span class="legend-row"><span class="legend-swatch" style="background:${statusColors[s]}"></span><span class="legend-name">${s}</span></span>`).join("")}</div></div>`;
}

function luatGopDangApDung({ theoLoai }) {
  const hang = [
    ["Bắt đầu bằng <code>WO</code>, <code>WOE</code>, <code>IN</code>, <code>INE</code> + số", "Lệnh sản xuất nội bộ", theoLoai.noibo],
    ["Bắt đầu bằng <code>THÍ NGHIỆM</code>, <code>THI NGHIEM</code>, <code>TN</code>", "Gộp làm một nhóm “Thí nghiệm”", theoLoai.khac],
    ["Bắt đầu bằng " + DON_LOI.map(t => `<code>${t}</code>`).join(", "), "Ghi chú lỗi gõ nhầm ô — không tính là khách", theoLoai.loi],
    ["<code>ĐH-TÊNKHÁCH</code>", "Khách là phần sau <code>ĐH-</code>, để không gộp nhầm mọi đơn thành một khách tên “ĐH”", null],
    ["Ô để trống", "Không quy được về ai", theoLoai.trong],
    ["Còn lại", "Lấy phần trước dấu gạch đầu tiên làm tên khách", theoLoai.khach],
  ];
  return `<div class="luat-gop">
    <table><thead><tr><th>Chuỗi trong ô mã đơn</th><th>Luật áp dụng</th><th>Đang ảnh hưởng</th></tr></thead><tbody>
      ${hang.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td class="numeric">${c ? `${formatNumber(c.volume, 1)} m³` : "—"}</td></tr>`).join("")}
    </tbody></table>
    <p class="luat-canh-bao"><strong>Hai giới hạn phải biết.</strong>
      Một ô có thể chứa hai đơn của hai khách (ví dụ <code>SST-128-RL/ASHT-882.R0</code>) — block đó chỉ được tính cho khách đứng trước.
      Tên chỉ một hai ký tự được đánh dấu <em class="khach-ngo">?</em> vì chưa đủ chắc là khách hàng.
      Cách chữa tận gốc là kho chốt danh mục khách trong ERP, không phải sửa ở đây.</p>
  </div>`;
}

// Mở đúng những chuỗi GỐC từ ERP đã được gộp thành một khách. Đây là lời hứa
// khi chọn phương án B: mọi con số trên màn hình đều lần ngược về số gốc được.
function xemNguyenVanDon(ten) {
  const rows = state.filtered.filter(r => phanLoaiDon(r.statusSecondary).ten === ten);
  const theoDon = Object.entries(groupRows(rows, r => r.statusSecondary || "(không ghi mã đơn)"))
    .map(([don, items]) => ({ don, volume: sum(items, "closeVolume"), blocks: items.length }))
    .sort((a, b) => b.volume - a.volume);

  els.modalTitle.textContent = `Nguyên văn mã đơn · ${ten}`;
  els.modalSubtitle.textContent = `${theoDon.length} chuỗi gốc từ ERP được gộp thành khách "${ten}"`;
  els.modalBody.innerHTML = `
    <p class="nguyen-van-nhac">Đây là chữ ERP trả về, chưa qua xử lý. Nếu thấy một chuỗi bị gộp sai chỗ, đó là dấu hiệu kho cần chốt lại danh mục khách trong ERP.</p>
    <div class="table-wrap"><table><thead><tr><th>Chuỗi gốc trong ô mã đơn</th><th>m3</th><th>Block</th></tr></thead><tbody>
      ${theoDon.map(d => `<tr><td class="nguyen-van">${escapeHtml(d.don)}</td>
        <td class="numeric">${formatNumber(d.volume, 1)} m³</td>
        <td class="numeric">${d.blocks}</td></tr>`).join("")}
    </tbody></table></div>`;
  els.modal.hidden = false;
  requestAnimationFrame(() => {
    els.modal.classList.add("show");
    document.body.classList.add("modal-open");
  });
}

function customerPage(rows = state.filtered) {
  const goi = gomTheoKhach(rows);
  const { khach, theoLoai } = goi;
  const tongKhach = theoLoai.khach.volume;
  const top5 = khach.slice(0, 5).reduce((a, k) => a + k.volume, 0);
  const namLau = khach.filter(k => k.tuoiMax != null && k.tuoiMax >= 60);
  const coLoi = khach.filter(k => k.soLoi > 0).sort((a, b) => b.soLoi - a.soLoi);

  return `
    ${bangDoTinCay(goi)}

    <section class="kpi-grid">
      ${kpiCard("Khách đang có tồn", khach.length, `${formatNumber(tongKhach, 1)} m³ quy được về khách`, "customer", "brand")}
      ${kpiCard("Mức tập trung", khach.length ? `${formatNumber(top5 / (tongKhach || 1) * 100, 0)}%` : "—", "Phần của 5 khách lớn nhất", "volume", "info")}
      ${kpiCard("Khách có hàng nằm ≥ 60 ngày", namLau.length, namLau.length ? namLau.map(k => k.ten).slice(0, 3).join(" · ") : "Không có", "clock", namLau.length ? "warning" : "success")}
      ${kpiCard("Khách có block ghi lỗi", coLoi.length, coLoi.length ? `${coLoi.reduce((a, k) => a + k.soLoi, 0)} block có ghi tình trạng lỗi` : "Không có block nào ghi lỗi", "actions", coLoi.length ? "warning" : "success")}
    </section>

    ${panel("Xếp hạng khách hàng", "Bấm một dòng để xem toàn bộ block của khách đó. Bấm tiêu đề cột để sắp xếp", bangKhachHang(khach, tongKhach), `${khach.length} khách`, "table-panel")}

    <div class="dashboard-grid">
      ${panel("Khách × Tuổi tồn", "Hàng của ai đang nằm lâu — đây là câu hỏi về tiền, không phải về kho", luoiKhachTuoi(khach), "10 khách lớn nhất")}
      ${panel("Khách × Trạng thái", "Sản xuất dư đang dồn cho khách nào", cotTrangThaiKhach(khach), "10 khách lớn nhất")}
    </div>

    ${panel("Hàng có ghi lỗi, theo khách", "Lấy nguyên văn ô tình trạng lỗi của ERP, không gộp cách viết",
      coLoi.length
        ? `<div class="rank-chart">${coLoi.slice(0, 8).map((k, i) => `<button class="rank-row" data-drill-type="customer" data-drill-value="${escapeAttr(k.ten)}">
            <span class="rank-number">${String(i + 1).padStart(2, "0")}</span>
            <span class="rank-copy"><strong>${escapeHtml(k.ten)}</strong><span>${unique(k.rows.map(r => r.statusTertiary).filter(Boolean)).slice(0, 3).join(" · ") || "—"}</span></span>
            <span class="rank-track"><i style="width:${Math.max(k.soLoi / coLoi[0].soLoi * 100, 4)}%;--rank-color:#a8660a"></i></span>
            <b>${k.soLoi} block</b>
          </button>`).join("")}</div>`
        : '<div class="empty-state"><strong>Không có block nào ghi tình trạng lỗi</strong><span>Trong phạm vi đang lọc.</span></div>')}

    ${panel("Luật gộp đang áp dụng", "Công khai để anh kiểm chứng được mọi con số ở trên", luatGopDangApDung(goi), "", "table-panel")}
  `;
}

// ==========================================================================
// PHÂN QUYỀN — nguồn sự thật là bảng app_users trên Supabase
//
// ĐỌC KỸ TRƯỚC KHI SỬA: ẩn nút trong màn hình chỉ là dọn giao diện cho gọn,
// KHÔNG phải hàng rào bảo mật. Thứ chặn thật là Row Level Security, cấu hình
// trong scripts/phan-quyen-supabase.sql. Chín màn hình nghiệp vụ đều đọc chung
// hai bảng inventory và movements, nên bỏ một màn hình khỏi allowed_pages chỉ
// làm người đó không thấy lối vào — số liệu gốc vẫn nằm trong tầm tay ai biết
// mở công cụ lập trình của trình duyệt.
// Chỉ hai màn hình được chặn tới tận tầng dữ liệu vì đọc bảng riêng:
//   'logs'  -> login_log     'admin' -> app_users
// ==========================================================================

const TRANG_QUAN_TRI = ["architecture", "logs", "admin"];

const VAI_TRO = {
  admin:  { nhan: "Quản trị", mo_ta: "Sửa được cấu hình tài khoản. Xem mọi màn hình, bất kể danh sách được cấp." },
  member: { nhan: "Giao việc", mo_ta: "Giao việc và cập nhật tiến độ. Chỉ xem những màn hình được cấp." },
  viewer: { nhan: "Chỉ xem", mo_ta: "Chỉ xem báo cáo. Không giao được việc, không sửa được tiến độ." },
};

const laQuanTri = () => state.profile?.role === "admin" && state.profile?.is_active !== false;

// Đo trên dữ liệu thật, không đọc từ danh sách kho cứng trong WAREHOUSE_META.
// Tính tới 28/08/2026 chỉ TP20 từng có tồn — TP24NEM chưa xuất hiện lần nào,
// kể cả trong 6.528 sự kiện nhập xuất từ 1/1/2025.
const nhieuKho = () => unique(state.records.map(r => r.warehouse).filter(Boolean)).length > 1;
const duocSuaViec = () => ["admin", "member"].includes(state.profile?.role) && state.profile?.is_active !== false;

function trangDuocXem(key) {
  // Hướng dẫn luôn mở: phải còn ít nhất một lối vào, nếu không người bị thu hết
  // quyền sẽ nhìn thấy màn hình trắng và không hiểu chuyện gì đang xảy ra.
  if (key === "guide") return true;
  // Chỉ còn một kho có tồn thì màn hình "Theo kho" không nói được gì: mọi con
  // số của nó đúng bằng số toàn kho ở trang Tổng quan. Ẩn đi thay vì xoá — nếu
  // sau này TP24NEM (hoặc kho mới) có hàng, màn hình tự hiện lại.
  // Kiểm TRƯỚC nhánh quản trị viên, vì quản trị viên cũng không cần thấy nó.
  if (key === "warehouse" && !nhieuKho()) return false;
  // Màn hình Cấu hình tài khoản đi theo VAI TRÒ, không theo ô tick. Nếu để nó
  // nằm trong allowed_pages thì hạ một quản trị viên xuống member xong, ô đó
  // vẫn còn tick — họ thấy mục ở thanh bên rồi bấm vào lại bị từ chối.
  if (key === "admin") return laQuanTri();
  if (laQuanTri()) return true;
  const cap = state.profile?.allowed_pages;
  // Chưa chạy phan-quyen-supabase.sql thì không có hồ sơ: giữ nguyên hành vi cũ
  // cho chín màn hình nghiệp vụ, nhưng vẫn khoá ba màn hình quản trị.
  if (!Array.isArray(cap)) return !TRANG_QUAN_TRI.includes(key);
  return cap.includes(key);
}

async function nguoiDangDangNhap() {
  const { data } = await window.supabase.auth.getUser();
  return data?.user || null;
}

async function taiHoSo() {
  const user = await nguoiDangDangNhap();
  if (!user) return null;
  const macDinh = {
    user_id: user.id, email: user.email, full_name: null,
    role: "member", allowed_pages: null, is_active: true, chuaCoHoSo: true,
  };
  const { data, error } = await window.supabase
    .from("app_users").select("*").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.warn("Chưa đọc được hồ sơ phân quyền:", error.message);
    return macDinh;
  }
  return data || macDinh;
}

// ==========================================================================
// VIỆC GIAO — từ 27/08/2026 nằm ở bảng tasks trên Supabase, không còn ở
// localStorage. Ai đăng nhập cũng thấy cùng một danh sách.
// ==========================================================================

function mapTask(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id || "",
    rowId: row.row_id || "",
    barcode: row.barcode || "",
    title: row.title || "",
    assignee: row.assignee || "",
    startDate: row.start_date || "",
    deadline: row.deadline || "",
    priority: row.priority || "Cao",
    status: row.status || "Chưa bắt đầu",
    note: row.note || "",
    createdBy: row.created_by || null,
    createdByEmail: row.created_by_email || "",
    createdAt: row.created_at || null,
    updatedByEmail: row.updated_by_email || "",
    updatedAt: row.updated_at || null,
  };
}

async function taiViec() {
  const { data, error } = await window.supabase
    .from("tasks").select("*").order("deadline", { ascending: true });
  if (error) {
    state.tasksError = error.message;
    state.tasks = [];
    return;
  }
  state.tasksError = null;
  state.tasks = (data || []).map(mapTask);
}

// Việc cũ còn kẹt trong localStorage của riêng máy này: đẩy lên Supabase đúng
// một lần rồi xoá hẳn khỏi trình duyệt. Cột legacy_id có ràng buộc unique nên
// chạy lại, hoặc chạy từ máy khác cũng đang giữ bản sao, đều không sinh dòng trùng.
async function chuyenViecCuLenSupabase() {
  let cu = [];
  try {
    cu = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || "[]");
  } catch {
    cu = [];
  }
  if (!Array.isArray(cu) || !cu.length) {
    localStorage.removeItem(TASK_STORAGE_KEY);
    return 0;
  }
  // Người chỉ-xem không có quyền chèn; giữ nguyên dữ liệu cũ để người có quyền
  // đăng nhập trên máy này còn đẩy lên được, thay vì xoá mất.
  if (!duocSuaViec()) return 0;

  const hopLe = (giaTri, danhSach, mac) => (danhSach.includes(giaTri) ? giaTri : mac);
  const homNay = new Date().toISOString().slice(0, 10);
  const user = await nguoiDangDangNhap();
  const rows = cu
    .filter(t => t && t.id)
    .map(t => ({
      legacy_id: String(t.id).slice(0, 120),
      row_id: t.rowId || t.barcode || null,
      barcode: t.barcode || t.rowId || "—",
      title: (t.title || "").trim() || "Việc chuyển từ bản cũ",
      assignee: (t.assignee || "").trim(),
      start_date: t.startDate || t.deadline || homNay,
      deadline: t.deadline || t.startDate || homNay,
      priority: hopLe(t.priority, ["Khẩn cấp", "Cao", "Trung bình", "Thấp"], "Cao"),
      status: hopLe(t.status, ["Chưa bắt đầu", "Đang xử lý", "Chờ xác nhận", "Hoàn thành"], "Chưa bắt đầu"),
      note: t.note || "",
      created_by: user?.id || null,
      created_by_email: user?.email || null,
    }));

  if (!rows.length) {
    localStorage.removeItem(TASK_STORAGE_KEY);
    return 0;
  }
  const { error } = await window.supabase
    .from("tasks").upsert(rows, { onConflict: "legacy_id", ignoreDuplicates: true });
  if (error) {
    console.warn("Chưa chuyển được việc cũ lên Supabase:", error.message);
    return 0;
  }
  localStorage.removeItem(TASK_STORAGE_KEY);
  return rows.length;
}

// ==========================================================================
// MÀN HÌNH "CẤU HÌNH TÀI KHOẢN" — chỉ quản trị viên
// ==========================================================================

const quanTri = { dangTai: false, daTai: false, loi: null, lanCuoi: {} };

async function taiDanhSachTaiKhoan() {
  if (quanTri.dangTai) return;
  quanTri.dangTai = true;
  try {
    const [ds, dangNhap] = await Promise.all([
      window.supabase.from("app_users").select("*").order("email"),
      // Quản trị viên luôn đọc được login_log (hàm duoc_xem_trang trả true cho
      // vai trò admin), nên lấy luôn mốc đăng nhập gần nhất của từng người.
      window.supabase.from("login_log").select("email, signed_in_at")
        .order("signed_in_at", { ascending: false }).limit(500)
        .then(r => r.data || []),
    ]);
    quanTri.loi = ds.error ? ds.error.message : null;
    state.users = ds.data || [];
    quanTri.lanCuoi = {};
    for (const d of dangNhap) {
      if (!quanTri.lanCuoi[d.email]) quanTri.lanCuoi[d.email] = d.signed_in_at;
    }
  } finally {
    quanTri.dangTai = false;
    quanTri.daTai = true;
  }
}

function theTrang(userId, key, config, daCap, khoa) {
  const id = `cap-${userId}-${key}`;
  return `<label class="page-chip ${khoa ? "is-locked" : ""}">
    <input type="checkbox" id="${id}" data-page-key="${key}" ${daCap ? "checked" : ""} ${khoa ? "disabled" : ""} />
    <span>${escapeHtml(config.label)}</span>
  </label>`;
}

function theTaiKhoan(u) {
  const laMinh = u.user_id === state.profile?.user_id;
  const laAdmin = u.role === "admin";
  const cap = Array.isArray(u.allowed_pages) ? u.allowed_pages : [];
  const ganNhat = quanTri.lanCuoi[u.email];

  return `<article class="account-card ${u.is_active ? "" : "is-off"}" data-user="${escapeAttr(u.user_id)}">
    <header class="account-card-head">
      <div class="account-who">
        <strong>${escapeHtml(u.email)}${laMinh ? ' <em class="account-self">bạn</em>' : ""}</strong>
        <span>${ganNhat ? `Đăng nhập gần nhất ${baoLau(ganNhat)}` : "Chưa từng đăng nhập"}</span>
      </div>
      <label class="account-toggle">
        <input type="checkbox" data-field="is_active" ${u.is_active ? "checked" : ""} />
        <span>Đang hoạt động</span>
      </label>
    </header>

    <div class="account-fields">
      <label><span>Tên hiển thị</span><input type="text" data-field="full_name" value="${escapeAttr(u.full_name || "")}" placeholder="Ví dụ: Nguyễn Văn Quang" /></label>
      <label><span>Vai trò</span><select data-field="role">
        ${Object.entries(VAI_TRO).map(([key, v]) => `<option value="${key}" ${key === u.role ? "selected" : ""}>${v.nhan}</option>`).join("")}
      </select></label>
    </div>
    <p class="account-role-hint" data-role-hint>${escapeHtml(VAI_TRO[u.role]?.mo_ta || "")}</p>

    <fieldset class="account-pages" ${laAdmin ? "disabled" : ""}>
      <legend>Màn hình được xem${laAdmin ? " — quản trị viên xem được tất cả" : ""}</legend>
      <p class="account-pages-note">Màn hình <strong>Cấu hình tài khoản</strong> không có trong danh sách này — nó đi theo vai trò Quản trị.</p>
      <div class="page-chips">
        ${Object.entries(pageConfig).filter(([key]) => key !== "admin").map(([key, config]) =>
          theTrang(u.user_id, key, config, key === "guide" || laAdmin || cap.includes(key), key === "guide" || laAdmin)).join("")}
      </div>
    </fieldset>

    <footer class="account-card-foot">
      <span class="account-msg" data-msg></span>
      <button class="task-submit" type="button" data-save-user="${escapeAttr(u.user_id)}">Lưu thay đổi</button>
    </footer>
  </article>`;
}

function adminPage() {
  if (!laQuanTri()) {
    return `<div class="empty-state"><strong>Màn hình dành cho quản trị viên</strong>
      <span>Tài khoản ${escapeHtml(state.profile?.email || "")} chưa được cấp quyền cấu hình tài khoản. Liên hệ quản trị viên nếu bạn cần quyền này.</span></div>`;
  }
  if (!quanTri.daTai) {
    taiDanhSachTaiKhoan().then(() => { if (state.page === "admin") renderPage(); });
    return '<div class="empty-state"><strong>Đang đọc danh sách tài khoản…</strong><span>Kết nối tới Supabase.</span></div>';
  }
  if (quanTri.loi) {
    return `<div class="empty-state"><strong>Chưa đọc được danh sách tài khoản</strong>
      <span>${escapeHtml(quanTri.loi)}<br />Nếu đây là lần chạy đầu, cần dán <code>scripts/phan-quyen-supabase.sql</code> vào Supabase &gt; SQL Editor rồi bấm Run.</span></div>`;
  }

  const theoVaiTro = ["admin", "member", "viewer"]
    .map(key => ({ key, ...VAI_TRO[key], so: state.users.filter(u => u.role === key && u.is_active).length }));
  const tat = state.users.filter(u => !u.is_active).length;

  return `
    <section class="kpi-grid">
      ${theoVaiTro.map(v => kpiCard(v.nhan, v.so, v.mo_ta, "admin", v.key === "admin" ? "brand" : "info")).join("")}
      ${kpiCard("Đã tắt", tat, tat ? "Không đăng nhập vào app được" : "Mọi tài khoản đang hoạt động", "admin", tat ? "warning" : "success")}
    </section>

    ${panel("Cách phân quyền này hoạt động", "Đọc một lần để không đặt nhầm kỳ vọng",
      `<div class="admin-note">
        <p><strong>Vai trò</strong> quyết định được sửa gì: chỉ <em>Quản trị</em> mở được màn hình này và đổi quyền người khác; <em>Giao việc</em> tạo và cập nhật được công việc; <em>Chỉ xem</em> không đụng được vào công việc.</p>
        <p><strong>Màn hình được xem</strong> quyết định người đó thấy mục nào ở thanh bên trái. Màn hình <em>Hướng dẫn sử dụng</em> luôn mở cho mọi người để không ai rơi vào màn hình trắng.</p>
        <p class="admin-warning"><strong>Cần nói thẳng:</strong> việc bỏ một màn hình nghiệp vụ khỏi danh sách là để <em>dọn giao diện cho gọn đúng vai trò</em>, không phải để giấu số liệu. Chín màn hình nghiệp vụ đều đọc chung một nguồn dữ liệu, nên người đã đăng nhập và biết dùng công cụ lập trình của trình duyệt vẫn đọc được số liệu kho. Chỉ <em>Nhật ký</em> và <em>Cấu hình tài khoản</em> là được khoá tới tận tầng dữ liệu. Muốn ai đó không thấy số liệu kho thì đừng cấp tài khoản cho người đó.</p>
        <p><strong>Thêm tài khoản mới:</strong> tạo trong Supabase Dashboard &gt; Authentication &gt; Users. Tài khoản mới sẽ tự hiện ở đây với vai trò <em>Chỉ xem</em>, rồi bạn cấp quyền tại màn hình này.</p>
      </div>`)}

    ${panel("Tài khoản", "Đổi vai trò, bật tắt truy cập và chọn màn hình cho từng người",
      `<div class="account-list">${state.users.map(theTaiKhoan).join("")}</div>`,
      `${state.users.length} tài khoản`)}
  `;
}

async function luuTaiKhoan(userId) {
  const the = els.pageContent.querySelector(`[data-user="${CSS.escape(userId)}"]`);
  if (!the) return;
  const nut = the.querySelector("[data-save-user]");
  const oBao = the.querySelector("[data-msg]");
  const truoc = state.users.find(u => u.user_id === userId);
  const vaiTro = the.querySelector('[data-field="role"]').value;
  const conHoatDong = the.querySelector('[data-field="is_active"]').checked;

  // Tự hạ quyền chính mình là đường một chiều: lưu xong là mất luôn màn hình này.
  if (userId === state.profile?.user_id && (vaiTro !== "admin" || !conHoatDong)) {
    const dong = conHoatDong
      ? `Bạn đang hạ vai trò của chính mình xuống "${VAI_TRO[vaiTro].nhan}".`
      : "Bạn đang tắt hoạt động của chính tài khoản mình.";
    if (!confirm(`${dong}\n\nLưu xong bạn sẽ KHÔNG mở được màn hình Cấu hình tài khoản nữa, và chỉ quản trị viên khác mới cấp lại được.\n\nVẫn tiếp tục?`)) return;
  }

  const payload = {
    full_name: the.querySelector('[data-field="full_name"]').value.trim() || null,
    role: vaiTro,
    is_active: conHoatDong,
    allowed_pages: [...the.querySelectorAll("[data-page-key]")]
      .filter(o => o.checked && !o.disabled)
      .map(o => o.dataset.pageKey),
    updated_by: state.profile?.user_id || null,
  };
  // Hướng dẫn luôn mở nên ô của nó bị khoá, không nằm trong danh sách thu được.
  if (!payload.allowed_pages.includes("guide")) payload.allowed_pages.unshift("guide");
  // 'admin' không bao giờ được nằm trong allowed_pages — xem chú thích ở trangDuocXem().
  payload.allowed_pages = payload.allowed_pages.filter(k => k !== "admin");

  nut.disabled = true;
  nut.textContent = "Đang lưu…";
  oBao.textContent = "";
  oBao.className = "account-msg";

  const { data, error } = await window.supabase
    .from("app_users").update(payload).eq("user_id", userId).select().maybeSingle();

  nut.disabled = false;
  nut.textContent = "Lưu thay đổi";

  if (error) {
    const noiDung = error.message.includes("ít nhất một quản trị viên")
      ? "Không lưu được: hệ thống phải còn ít nhất một quản trị viên đang hoạt động."
      : `Không lưu được: ${error.message}`;
    oBao.textContent = noiDung;
    oBao.className = "account-msg is-error";
    return;
  }

  const moi = data || { ...truoc, ...payload };
  state.users = state.users.map(u => (u.user_id === userId ? moi : u));
  // Sửa chính mình thì hồ sơ đang dùng phải đổi theo ngay, nếu không thanh điều
  // hướng vẫn hiện theo quyền cũ cho tới lần tải trang sau.
  if (userId === state.profile?.user_id) {
    state.profile = moi;
    buildNav();
  }
  oBao.textContent = `Đã lưu lúc ${new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(new Date())}`;
  oBao.className = "account-msg is-ok";
  toast(`Đã cập nhật quyền cho ${moi.email}`);
  if (!trangDuocXem("admin")) renderPage();
}

function bindEvents() {
  els.nav.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    state.page = button.dataset.page;
    buildNav();
    renderPage();
    els.sidebar.classList.remove("open");
    els.scrim.classList.remove("show");
  });

  [
    [els.warehouseFilter, "warehouse"],
    [els.productFilter, "product"],
    [els.colorFilter, "color"],
    [els.ageFilter, "age"],
    [els.statusFilter, "status"],
  ].forEach(([element, key]) => {
    element.addEventListener("change", () => {
      state.filters[key] = element.value;
      applyFilters();
    });
  });

  // Gõ tới đâu lọc tới đó, nhưng chờ 250ms để không vẽ lại bảng sau từng phím.
  let hetGo;
  els.sizeFilter?.addEventListener("input", () => {
    clearTimeout(hetGo);
    hetGo = setTimeout(() => {
      state.filters.size = els.sizeFilter.value.trim();
      applyFilters();
    }, 250);
  });

  els.clearFilters.addEventListener("click", () => {
    state.filters = { warehouse: "all", product: "all", color: "all", age: "all", status: "all", size: "" };
    els.sizeFilter.value = "";
    populateFilters();
    applyFilters();
  });

  // Ô ngày chỉ HIỂN THỊ số liệu tính đến ngày nào — không phải bộ lọc.
  els.reportDate.addEventListener("change", () => {
    els.reportDate.value = state.reportDate;
    toast("Đây là ngày của lần đồng bộ gần nhất, không đổi được. Dữ liệu tự cập nhật theo lịch.");
  });

  els.exportButton.addEventListener("click", exportCurrentCsv);

  els.pageContent.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-go-page],[data-assign-barcode],[data-timeline],[data-metric],[data-product],[data-drill-type],[data-drill-age]");
    if (!pageButton) return;
    if (pageButton.dataset.goPage) {
      state.page = pageButton.dataset.goPage;
      buildNav();
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (pageButton.dataset.assignBarcode) {
      openTaskModal(pageButton.dataset.assignBarcode);
      return;
    }
    if (pageButton.dataset.timeline) {
      state.timeline = pageButton.dataset.timeline;
      renderPage();
      return;
    }
    if (pageButton.dataset.metric) {
      state.movementMetric = pageButton.dataset.metric;
      renderPage();
      return;
    }
    if (pageButton.dataset.product) {
      const subset = subsetByDrill("product", pageButton.dataset.product);
      openAnalysis(subset, pageButton.dataset.product, "Phân tích chi tiết theo sản phẩm trong phạm vi bộ lọc hiện tại");
      return;
    }
    if (pageButton.dataset.drillAge && pageButton.dataset.drillStatus) {
      const subset = state.filtered.filter(row => row.ageBucket === pageButton.dataset.drillAge && row.status === pageButton.dataset.drillStatus);
      openAnalysis(subset, `${pageButton.dataset.drillStatus} · ${pageButton.dataset.drillAge}`, "Phân tích đa chiều theo tuổi tồn x trạng thái");
      return;
    }
    if (pageButton.dataset.drillType) {
      const subset = subsetByDrill(pageButton.dataset.drillType, pageButton.dataset.drillValue);
      openAnalysis(subset, pageButton.dataset.drillValue, "Phân tích trong phạm vi bộ lọc hiện tại");
    }
  });

  els.modalBody.addEventListener("click", event => {
    const button = event.target.closest("[data-assign-barcode],[data-drill-type],[data-product]");
    if (!button) return;
    if (button.dataset.assignBarcode) {
      openTaskModal(button.dataset.assignBarcode);
      return;
    }
    if (button.dataset.product) {
      openAnalysis(subsetByDrill("product", button.dataset.product), button.dataset.product, "Phân tích trong modal");
      return;
    }
    if (button.dataset.drillType) {
      openAnalysis(subsetByDrill(button.dataset.drillType, button.dataset.drillValue), button.dataset.drillValue, "Phân tích trong modal");
    }
  });

  els.modalClose.addEventListener("click", closeAnalysis);
  els.modal.addEventListener("click", event => {
    if (event.target === els.modal) closeAnalysis();
  });
  els.taskModalClose.addEventListener("click", closeTaskModal);
  els.taskCancel.addEventListener("click", closeTaskModal);
  els.taskModal.addEventListener("click", event => {
    if (event.target === els.taskModal) closeTaskModal();
  });
  els.taskForm.addEventListener("submit", event => {
    event.preventDefault();
    if (els.taskDeadline.value < els.taskStartDate.value) {
      toast("Thời hạn nên bằng hoặc sau ngày giao");
      return;
    }
    createTask();
  });
  els.pageContent.addEventListener("change", async event => {
    const select = event.target.closest("[data-task-status-id]");
    if (!select) return;
    const task = state.tasks.find(item => item.id === select.dataset.taskStatusId);
    if (!task) return;
    if (!duocSuaViec()) {
      select.value = task.status;
      toast("Tài khoản của bạn chỉ được xem, chưa sửa tiến độ được");
      return;
    }
    const truoc = task.status;
    const moi = select.value;
    select.disabled = true;
    const user = await nguoiDangDangNhap();
    const { error } = await window.supabase.from("tasks")
      .update({ status: moi, updated_by: user?.id || null, updated_by_email: user?.email || null })
      .eq("id", task.id);
    select.disabled = false;
    if (error) {
      // Trả về giá trị cũ, nếu không màn hình sẽ nói một đằng còn Supabase giữ một nẻo.
      select.value = truoc;
      toast(`Chưa cập nhật được: ${error.message}`);
      return;
    }
    task.status = moi;
    task.updatedByEmail = user?.email || "";
    renderPage();
    toast("Đã cập nhật tiến độ — mọi người cùng thấy");
  });

  // Nút xoá nhiệm vụ và nút lưu tài khoản: để riêng một listener, không lẫn vào
  // listener đào sâu dữ liệu bên trên.
  els.pageContent.addEventListener("click", event => {
    const oLuoi = event.target.closest("[data-drill-khach-tuoi]");
    if (oLuoi) {
      const ten = oLuoi.dataset.drillKhachTuoi, dai = oLuoi.dataset.drillTuoi;
      openAnalysis(state.filtered.filter(r => phanLoaiDon(r.statusSecondary).ten === ten && r.ageBucket === dai),
        `${ten} · ${dai}`, "Phân tích trong modal");
      return;
    }
    const nutDon = event.target.closest("[data-xem-don]");
    if (nutDon) {
      xemNguyenVanDon(nutDon.dataset.xemDon);
      return;
    }
    const nutXoa = event.target.closest("[data-delete-task]");
    if (nutXoa) {
      xoaViec(nutXoa.dataset.deleteTask);
      return;
    }
    const nutLuu = event.target.closest("[data-save-user]");
    if (nutLuu) luuTaiKhoan(nutLuu.dataset.saveUser);
  });

  // Đổi ô vai trò thì đổi luôn dòng mô tả bên dưới, và bật/tắt phần chọn màn
  // hình — quản trị viên xem được tất cả nên chọn màn hình cho họ là vô nghĩa.
  els.pageContent.addEventListener("change", event => {
    const oVaiTro = event.target.closest('[data-field="role"]');
    if (!oVaiTro) return;
    const the = oVaiTro.closest("[data-user]");
    const hint = the.querySelector("[data-role-hint]");
    if (hint) hint.textContent = VAI_TRO[oVaiTro.value]?.mo_ta || "";
    const oTrang = the.querySelector(".account-pages");
    if (oTrang) oTrang.disabled = oVaiTro.value === "admin";
  });

  els.menuButton.addEventListener("click", () => {
    const open = els.sidebar.classList.toggle("open");
    els.scrim.classList.toggle("show", open);
    els.menuButton.setAttribute("aria-expanded", String(open));
  });
  els.scrim.addEventListener("click", () => {
    els.sidebar.classList.remove("open");
    els.scrim.classList.remove("show");
    els.menuButton.setAttribute("aria-expanded", "false");
  });
}

// ==========================================================================
// NGUỒN DỮ LIỆU: Supabase
// App không còn đọc data/inventory.json. Dữ liệu lấy trực tiếp từ Supabase,
// chỉ ra khỏi đó khi người dùng đã đăng nhập (RLS chặn vai trò anon).
// ==========================================================================

const WAREHOUSE_META = {
  TP20: { label: "TP20", role: "Kho mousse tổng" },
  TP24NEM: { label: "TP24NEM", role: "Kho mousse dành cho nệm" },
};
const warehouseMeta = code => WAREHOUSE_META[code] || { label: code, role: "Kho khác" };

// Tuần ISO, giữ đúng định dạng "2026-W26" mà build_data.py từng sinh ra.
function isoWeek(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - start) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// PostgREST trả tối đa 1000 dòng mỗi lần — bảng movements gần 6.000 dòng nên phải phân trang.
async function fetchAll(table, columns, filters = {}) {
  const PAGE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    let query = window.supabase.from(table).select(columns).range(from, from + PAGE - 1);
    for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
    const { data, error } = await query;
    if (error) throw new Error(`Không đọc được bảng ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

// Đổi tên cột snake_case của Postgres về camelCase mà phần còn lại của app đang dùng.
function mapRecord(row, index) {
  const meta = warehouseMeta(row.warehouse);
  return {
    id: index + 1,
    sku: row.sku || "",
    barcode: row.barcode || "",
    rowId: row.row_id || "",
    product: row.product || "",
    productFull: row.product_full || "",
    color: row.color || "",
    warehouse: row.warehouse || "",
    warehouseLabel: meta.label,
    warehouseRole: meta.role,
    location: row.location || "Chưa có vị trí",
    status: row.status || "Chưa xác định",
    statusSecondary: row.order_ref || "",   // mã đơn hàng / lệnh sản xuất
    statusTertiary: row.defect || "",       // tình trạng lỗi / hư
    specCode: row.spec_code || "",
    specName: row.spec_name || "",
    foamCode: row.foam_code || "",
    thicknessCode: row.thickness_code || "",
    docNoWo: row.doc_no_wo || "",
    receiptVolume: Number(row.receipt_volume || 0),
    receiptUnits: Number(row.receipt_units || 0),
    deliveryVolume: Number(row.delivery_volume || 0),
    deliveryUnits: Number(row.delivery_units || 0),
    closeVolume: Number(row.close_volume || 0),
    closeUnits: Number(row.close_units || 0),
    unit: row.unit || "tấm",
    lengthMm: row.length_mm,
    widthMm: row.width_mm,
    heightMm: row.height_mm,
    // Chuỗi để hiển thị và để lọc: "1850×2070×550"
    sizeLabel: [row.length_mm, row.width_mm, row.height_mm].every(Boolean)
      ? `${row.length_mm}×${row.width_mm}×${row.height_mm}` : "",
    receiptDate: row.receipt_date || "",
    deliveryDate: row.delivery_date || "",
    receiptWeek: isoWeek(row.receipt_date),
    deliveryWeek: isoWeek(row.delivery_date),
    receiptMonth: (row.receipt_date || "").slice(0, 7),
    deliveryMonth: (row.delivery_date || "").slice(0, 7),
    receiptNo: row.receipt_no || "",
    deliveryNo: row.delivery_no || "",
    daysInStock: row.days_in_stock,
    ageBucket: row.age_bucket || "Thiếu ngày nhập",
  };
}

function mapMovement(row) {
  return {
    type: row.event_type,
    date: row.event_date,
    week: isoWeek(row.event_date),
    month: (row.event_date || "").slice(0, 7),
    warehouse: row.warehouse || "",
    product: row.product || "",
    color: row.color || "",
    status: row.status || "",
    units: Number(row.units || 0),
    volume: Number(row.volume || 0),
  };
}

async function loadFromSupabase() {
  // Lấy HAI ngày gần nhất, không phải một: ngày trước dùng để tính thay đổi
  // trên trang Tổng quan. Bảng snapshots đã có sẵn số tổng hợp theo ngày,
  // trước 28/08/2026 chỉ màn hình Nhật ký dùng tới.
  const { data: snapshots, error } = await window.supabase
    .from("snapshots").select("*").order("report_date", { ascending: false }).limit(2);
  if (error) throw new Error(`Không đọc được snapshots: ${error.message}`);
  if (!snapshots.length) throw new Error("Chưa có dữ liệu nào trong Supabase. Cần chạy scripts/sync.py trước.");

  const snapshot = snapshots[0];
  const reportDate = snapshot.report_date;

  const [inventoryRows, movementRows, runRows] = await Promise.all([
    fetchAll("inventory", "*", { report_date: reportDate }),
    // Bảng movements luôn chỉ giữ MỘT bộ đầy đủ (sync.py thay toàn bộ mỗi lượt),
    // nên không lọc theo report_date. Lọc sẽ trả về rỗng khi ai đó chạy backfill
    // bằng --date cho một ngày cũ, làm biểu đồ nhịp nhập xuất trống trơn.
    fetchAll("movements", "*"),
    window.supabase.from("sync_runs").select("*")
      .eq("status", "success").order("finished_at", { ascending: false }).limit(1)
      .then(r => r.data || []),
  ]);

  const records = inventoryRows.map(mapRecord);
  const movements = movementRows.map(mapMovement);

  // App cũ dùng rawRecords chỉ để liệt kê kho — kể cả kho hiện không còn tồn dương.
  // Dựng lại danh sách đó từ movements để giữ nguyên hành vi trang "Theo kho".
  const warehouses = [...new Set([...records, ...movements].map(r => r.warehouse).filter(Boolean))];
  const rawRecords = warehouses.map(code => ({ warehouse: code, ...warehouseMeta(code) }));

  return {
    meta: { reportDate, source: "Supabase", generatedAt: runRows[0]?.finished_at || null },
    snapshot,
    snapshotTruoc: snapshots[1] || null,
    lastRun: runRows[0] || null,
    records,
    rawRecords,
    movements,
  };
}

// Hiện rõ dữ liệu tươi tới đâu, và cảnh báo khi đã quá cũ.
const STALE_HOURS = 26;

// Lịch đồng bộ chỉ chạy thứ Hai đến thứ Sáu, nên đếm giờ trôi qua theo lịch sẽ
// khiến sáng thứ Hai nào cũng vượt ngưỡng (~66 giờ kể từ 18:30 thứ Sáu) và bật
// báo động giả. Chỉ đếm những giờ mà lịch đáng lẽ phải chạy.
function gioLamViecTroiQua(tu, den) {
  let gio = 0;
  const moc = new Date(tu.getTime());
  while (moc < den) {
    const ke = new Date(Math.min(moc.getTime() + 3600000, den.getTime()));
    const thu = moc.getDay();
    if (thu >= 1 && thu <= 5) gio += (ke - moc) / 3600000;
    moc.setTime(ke.getTime());
  }
  return gio;
}
function renderFreshness() {
  const finished = state.data?.lastRun?.finished_at;
  if (!finished) {
    els.syncTime.textContent = "Chưa ghi nhận lần đồng bộ nào";
    return;
  }
  const when = new Date(finished);
  const hours = gioLamViecTroiQua(when, new Date());
  const stamp = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(when);
  const run = state.data?.lastRun;
  const khoang = run?.doc_date_from && run?.doc_date_to
    ? ` · dữ liệu ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(`${run.doc_date_from}T00:00:00`))}–${new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(`${run.doc_date_to}T00:00:00`))}`
    : "";
  els.syncTime.textContent = `Cập nhật ${stamp}${khoang}`;

  const stale = hours > STALE_HOURS;
  document.querySelector(".data-health")?.classList.toggle("is-stale", stale);
  if (els.staleBanner) {
    els.staleBanner.hidden = !stale;
    if (stale) {
      els.staleBanner.textContent =
        `Dữ liệu chưa được cập nhật ${Math.floor(hours)} giờ làm việc. Số liệu bên dưới là của lần đồng bộ lúc ${stamp}.`;
    }
  }
}

// Khi sync.py chạy xong, Supabase đẩy sự kiện xuống — app tự nạp lại, không cần bấm F5.
// Bám vào sync_runs thay vì inventory: mỗi lượt đồng bộ chỉ sinh 1 sự kiện thay vì hàng trăm.
function subscribeRealtime() {
  // Việc giao trong cuộc họp phải hiện ngay trên máy người khác, không phải F5.
  window.supabase
    .channel("viec-giao")
    .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
      taiViec().then(() => {
        if (["workflow", "details"].includes(state.page)) renderPage();
      });
    })
    .subscribe();

  // Quyền bị đổi giữa chừng: dựng lại thanh điều hướng ngay, không đợi tải lại trang.
  window.supabase
    .channel("phan-quyen")
    .on("postgres_changes", { event: "*", schema: "public", table: "app_users" }, async () => {
      const truoc = JSON.stringify(state.profile);
      state.profile = await taiHoSo();
      quanTri.daTai = false;
      if (JSON.stringify(state.profile) !== truoc) {
        buildNav();
        renderPage();
        toast("Quyền của bạn vừa được cập nhật");
      } else if (state.page === "admin") {
        renderPage();
      }
    })
    .subscribe();

  window.supabase
    .channel("dong-bo-ton-kho")
    .on("postgres_changes", { event: "*", schema: "public", table: "sync_runs" }, payload => {
      if (payload.new?.status !== "success") return;
      refreshData()
        .then(() => toast("Đã có số liệu mới từ kho"))
        .catch(error => {
          console.error("Không tải lại được dữ liệu:", error);
          toast("Có số liệu mới nhưng chưa tải được. Kiểm tra mạng rồi tải lại trang.");
        });
    })
    .subscribe();
}

async function refreshData() {
  state.data = await loadFromSupabase();
  state.records = state.data.records;
  state.rawRecords = state.data.rawRecords;
  state.movements = state.data.movements;
  state.reportDate = state.data.meta.reportDate || state.reportDate;
  els.reportDate.value = state.reportDate;
  renderFreshness();
  populateFilters();
  applyFilters();
}

async function init() {
  els.pageContent.innerHTML = '<div class="empty-state"><strong>Đang tải số liệu kho…</strong><span>Kết nối tới Supabase.</span></div>';

  // Hồ sơ phân quyền phải có TRƯỚC khi dựng thanh điều hướng, nếu không người
  // dùng sẽ thấy loé lên những mục họ không được vào rồi mới biến mất.
  state.profile = await taiHoSo();

  if (state.profile && state.profile.is_active === false) {
    els.nav.innerHTML = "";
    els.filterBar.hidden = true;
    els.pageContent.innerHTML = `<div class="empty-state"><strong>Tài khoản đã bị tạm khoá</strong>
      <span>Tài khoản ${escapeHtml(state.profile.email || "")} hiện không được mở báo cáo. Liên hệ quản trị viên để mở lại.</span></div>`;
    return;
  }

  state.data = await loadFromSupabase();
  state.records = state.data.records;
  state.rawRecords = state.data.rawRecords;
  state.movements = state.data.movements;

  await taiViec();
  // Việc cũ còn nằm trong localStorage của máy này thì đẩy nốt lên rồi đọc lại.
  const daChuyen = await chuyenViecCuLenSupabase();
  if (daChuyen) {
    await taiViec();
    setTimeout(() => toast(`Đã chuyển ${daChuyen} việc cũ từ trình duyệt này lên Supabase`), 1200);
  }

  state.filtered = [...state.records];
  state.reportDate = state.data.meta.reportDate || state.reportDate;
  els.reportDate.value = state.reportDate;
  renderFreshness();
  buildNav();
  populateFilters();
  renderPage();
  bindEvents();
  subscribeRealtime();
}

window.__startApp = () => {
  init().catch(error => {
    console.error(error);
    els.pageContent.innerHTML = `<div class="empty-state"><strong>Không tải được dữ liệu</strong><span>${error.message}</span></div>`;
  });
};

if (window.__authReady) window.__startApp();
