const state = {
  data: null,
  records: [],
  rawRecords: [],
  movements: [],
  filtered: [],
  page: "guide",
  reportDate: "2026-07-23",
  timeline: "week",
  movementMetric: "volume",
  tasks: [],
  selectedTaskBarcode: "",
  filters: { warehouse: "all", product: "all", color: "all", age: "all", status: "all" },
};

const pageConfig = {
  guide: {
    label: "Hướng dẫn sử dụng",
    title: "Cách sử dụng báo cáo trong cuộc họp kho",
    description: "Đi từ bức tranh tổng quan đến barcode cần xử lý, giao người phụ trách và kiểm soát deadline.",
    kicker: "Bắt đầu tại đây",
  },
  overview: {
    label: "Tổng quan",
    title: "Tồn kho mousse dưới góc nhìn điều hành",
    description: "Ban quản trị kho nhìn nhanh tồn gì, ở đâu, vì sao tồn và nên xử lý nhóm nào trước.",
    kicker: "Điều hành tồn kho",
  },
  warehouse: {
    label: "Theo kho",
    title: "Kho nào đang giữ loại tồn nào",
    description: "Nhìn rõ vai trò kho, quy mô tồn và nhóm tồn cần làm việc ngay trong từng kho.",
    kicker: "Phân tích kho",
  },
  product: {
    label: "Theo sản phẩm",
    title: "Sản phẩm và màu sắc đang chiếm dung tích",
    description: "Theo dõi sản phẩm, màu và trạng thái để chốt hướng xử lý theo từng nhóm mousse.",
    kicker: "Phân tích sản phẩm",
  },
  aging: {
    label: "Tuổi tồn",
    title: "Tuổi tồn và áp lực xử lý",
    description: "Đo tuổi tồn theo ngày nhập để nhận diện vùng an toàn, vùng cần theo dõi và vùng cần hành động.",
    kicker: "Tuổi tồn",
  },
  status: {
    label: "Trạng thái",
    title: "Hàng tồn đang phục vụ mục đích gì",
    description: "Tách rõ SX theo đơn hàng, SX dư và nhóm chưa xác định, sau đó đào sâu qua Remark và Remark 1.",
    kicker: "Trạng thái nghiệp vụ",
  },
  actions: {
    label: "Phương án xử lý",
    title: "Danh sách ưu tiên hành động",
    description: "Biến dữ liệu kho thành danh sách việc cần làm để chuẩn bị cho cuộc họp quản trị kho.",
    kicker: "Khuyến nghị xử lý",
  },
  details: {
    label: "Chi tiết block",
    title: "Tra cứu block mousse đang tồn",
    description: "Xem theo block, vị trí, sản phẩm, màu sắc, trạng thái và lịch nhập xuất hiện tại.",
    kicker: "Chi tiết dữ liệu",
  },
  workflow: {
    label: "Luồng công việc",
    title: "Kiểm soát nhiệm vụ xử lý tồn kho",
    description: "Theo dõi người phụ trách, deadline và tiến độ xử lý đến từng barcode mousse.",
    kicker: "Điều hành công việc",
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
  overview: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  warehouse: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 9l9-5 9 5v11H3zM3 9h18M8 20v-6h8v6"/></svg>',
  product: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/></svg>',
  aging: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  status: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M4 12h16M4 17h8"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>',
  actions: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4l8 4v8l-8 4-8-4V8z"/><path d="M9 12l2 2 4-4"/></svg>',
  workflow: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5M8 16h7"/><path d="M16 12l1.5 1.5L20 11"/></svg>',
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
  filterBar: document.getElementById("filter-bar"),
  clearFilters: document.getElementById("clear-filters"),
  exportButton: document.getElementById("export-button"),
  menuButton: document.getElementById("menu-button"),
  sidebar: document.getElementById("sidebar"),
  scrim: document.getElementById("mobile-scrim"),
  toast: document.getElementById("toast"),
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

const TASK_STORAGE_KEY = "havas-inventory-tasks-v1";

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("vi-VN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value || 0));
const formatDate = value => (value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—");
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
  const scope = [];
  if (state.filters.warehouse !== "all") scope.push(state.filters.warehouse);
  if (state.filters.product !== "all") scope.push(state.filters.product);
  if (state.filters.color !== "all") scope.push(state.filters.color);
  if (state.filters.status !== "all") scope.push(state.filters.status);
  if (state.filters.age !== "all") scope.push(state.filters.age);
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
    return `<button class="rank-row" data-drill-type="${item.drillType}" data-drill-value="${item.drillValue}">
      <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="rank-copy"><strong title="${item.label}">${item.label}</strong><span>${item.note || "Dung tích đang tồn"}</span></span>
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
      detail: "Đây là nhóm tồn không gắn trực tiếp với đơn hàng, phù hợp ưu tiên lên phương án chuyển đổi hoặc tiêu thụ trước.",
      type: "status",
      value: "SX dư",
    });
  }
  if (noStatus.length) {
    items.push({
      title: "Bổ sung trạng thái nghiệp vụ cho nhóm chưa xác định",
      note: `${formatNumber(sum(noStatus, "closeUnits"), 0)} block chưa có logic rõ`,
      detail: "Nhóm này sẽ gây khó khi họp vì không trả lời được tồn này phục vụ đơn hàng hay mục đích nào khác.",
      type: "status",
      value: "Chưa xác định",
    });
  }
  if (old.length) {
    items.push({
      title: "Theo dõi nhóm tồn trên 60 ngày",
      note: `${formatNumber(sum(old, "closeUnits"), 0)} block · ${formatNumber(sum(old, "closeVolume"), 1)} m³`,
      detail: "Nếu nhóm này tiếp tục kéo dài, cần chốt ngay sản phẩm nào, màu nào và trạng thái nào đang làm tăng tuổi tồn.",
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
      title: "Tồn kho đang ở vùng khá sạch",
      note: `${formatNumber(rows.length, 0)} dòng tồn hiện tại chưa lộ rủi ro lớn`,
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
    ${products.map(item => `<tr class="interactive-row" data-product="${item.productFull}">
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
  return `<div class="table-wrap"><table><thead><tr><th>Block</th><th>Sản phẩm</th><th>Màu</th><th>Kho</th><th>Vị trí</th><th>Trạng thái</th><th>SL tồn</th><th>m3 tồn</th><th>Ngày nhập</th><th>Tuổi tồn</th><th>Giao việc</th></tr></thead><tbody>
    ${rows.map(row => `<tr>
      <td><div class="product-cell"><strong>${row.barcode || row.rowId}</strong><span>${row.rowId}</span></div></td>
      <td>${row.product}</td>
      <td>${row.color}</td>
      <td>${row.warehouse}</td>
      <td>${row.location}</td>
      <td><div class="product-cell"><strong>${row.status}</strong><span>${[row.statusSecondary, row.statusTertiary].filter(Boolean).join(" · ") || "Không có trạng thái phụ"}</span></div></td>
      <td class="numeric" data-sort-value="${row.closeUnits}">${formatNumber(row.closeUnits, 0)}</td>
      <td class="numeric" data-sort-value="${row.closeVolume}">${formatNumber(row.closeVolume, 2)}</td>
      <td data-sort-value="${row.receiptDate}">${formatDate(row.receiptDate)}</td>
      <td class="numeric" data-sort-value="${row.daysInStock || 0}">${row.daysInStock ?? "—"}${row.daysInStock != null ? " ngày" : ""}</td>
      <td><button class="assign-task-button" type="button" data-assign-barcode="${row.barcode || row.rowId}">${state.tasks.filter(task => task.barcode === (row.barcode || row.rowId) && task.status !== "Hoàn thành").length ? "Xem / giao thêm" : "Giao việc"}</button></td>
    </tr>`).join("")}
  </tbody></table></div>`;
}

function guidePage() {
  const steps = [
    { number: "01", title: "Chọn phạm vi cần họp", text: "Vào Tổng quan rồi lọc theo kho, sản phẩm, màu sắc, tuổi tồn hoặc ClassCode.", page: "overview", action: "Mở Tổng quan" },
    { number: "02", title: "Nhìn biến động nhập – xuất", text: "Đọc cột m³, đường số block và luồng ròng theo ngày, tuần hoặc tháng.", page: "overview", action: "Xem nhịp kho" },
    { number: "03", title: "Drill xuống nguyên nhân", text: "Nhấn biểu đồ, ô tuổi × trạng thái hoặc dòng sản phẩm để mở màn hình inside.", page: "aging", action: "Mở Tuổi tồn" },
    { number: "04", title: "Chốt đến từng barcode", text: "Trong bảng inside hoặc Chi tiết block, xác định đúng block cần xử lý.", page: "details", action: "Mở Chi tiết block" },
    { number: "05", title: "Giao người và deadline", text: "Nhấn Giao việc, nhập người phụ trách, ngày giao, deadline, ưu tiên và yêu cầu đầu ra.", page: "details", action: "Bắt đầu giao việc" },
    { number: "06", title: "Kiểm soát đến khi hoàn thành", text: "Theo dõi việc mở, quá hạn, sắp đến hạn và cập nhật trạng thái trong Luồng công việc.", page: "workflow", action: "Mở Luồng công việc" },
  ];
  return `
    <section class="guide-hero">
      <div>
        <span class="guide-label">Quy trình họp kho</span>
        <h2>Từ một tín hiệu tồn kho<br>đến một hành động có người phụ trách</h2>
        <p>Báo cáo được thiết kế để cuộc họp không dừng ở việc “nhìn số”. Mỗi vấn đề cần được drill đến barcode, giao người xử lý và theo dõi đến deadline.</p>
        <button type="button" data-go-page="overview">Bắt đầu xem Tổng quan <span>→</span></button>
      </div>
      <div class="guide-principle">
        <span>Nguyên tắc sử dụng</span>
        <strong>1 vấn đề</strong><i>→</i><strong>1 barcode</strong><i>→</i><strong>1 người phụ trách</strong><i>→</i><strong>1 deadline</strong>
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
        <h3>Ba câu hỏi cần chốt</h3>
        <ol>
          <li>Block này tồn vì đơn hàng, sản xuất dư hay nguyên nhân khác?</li>
          <li>Phương án xử lý cụ thể là sử dụng, chuyển đổi, điều chuyển hay loại bỏ?</li>
          <li>Ai là người phụ trách và deadline dự kiến là ngày nào?</li>
        </ol>
        <p class="guide-storage-note">Nhiệm vụ hiện được lưu trên trình duyệt của máy đang sử dụng. Cần backend để đồng bộ nhiều người dùng.</p>
      </section>
    </div>
  `;
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
      ${kpiCard("Block đang tồn", `${formatNumber(sum(rows, "closeUnits"), 0)}`, `${formatNumber(rows.length, 0)} dòng tồn dương`, "blocks", "brand")}
      ${kpiCard("Dung tích đang giữ", `${formatNumber(sum(rows, "closeVolume"), 1)} m³`, `${formatNumber(productGroups(rows).length, 0)} sản phẩm màu`, "volume", "info")}
      ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, "Tính theo ngày nhập của lượng tồn hiện tại", "clock", "warning")}
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
      <div class="overview-side-stack">
        ${panel("Cơ cấu tuổi tồn", "Nhìn nhanh vùng an toàn và vùng cần chú ý", stackedDistribution(ageDistribution(rows), "age"), `${formatNumber(sum(rows.filter(row => row.daysInStock > 60), "closeVolume"), 1)} m³ trên 60 ngày`)}
        ${panel("Tuổi tồn theo màu", "Màu nào đang có tuổi bình quân cao hơn", ageByColorChart(rows), "Theo m³ tồn")}
      </div>
      ${panel("Đề xuất cho cuộc họp kho", "Gợi ý các nhóm nên được chốt phương án xử lý trước", actionsList(rows))}
    </div>
  `;
}

function warehousePage(rows = state.filtered) {
  return `<div class="warehouse-grid">${warehouseCards(rows)}</div>
    <div class="dashboard-grid section-gap">
      ${panel("Tồn theo tuổi trong từng kho", "Dùng để hỏi đúng câu chuyện ở từng kho", heatmap(rows))}
      ${panel("Tuổi theo màu", "Màu nào đang có tuổi tồn bình quân cao hơn", ageByColorChart(rows), "Tuổi TB theo m³")}
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
      ${panel("Màu sắc đang tồn", "Cơ cấu dung tích, số sản phẩm và số block theo màu", colorInventoryChart(rows))}
    </div>
    ${panel("Hiệu quả theo sản phẩm", "Chọn một dòng để mở hồ sơ phân tích chi tiết", productTable(rows), `${formatNumber(productGroups(rows).length, 0)} sản phẩm màu`, "table-panel")}`;
}

function agingPage(rows = state.filtered) {
  const buckets = ageDistribution(rows).map(item => ({ label: item.label, value: item.value, drillType: "age", drillValue: item.label, color: item.color }));
  return `<div class="dashboard-grid">
      ${panel("Tồn theo nhóm tuổi", "Cột thể hiện m³ và tỷ trọng tồn trong từng dải tuổi", ageBucketChart(rows), "Theo ReceiptDate")}
      ${panel("Tuổi tồn x trạng thái", "Nhấn từng ô để xem sản phẩm nào nằm trong vùng đó", heatmap(rows))}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Danh sách block già nhất", "Tập trung nhóm có nguy cơ chậm xử lý", detailsTable([...rows].sort((a, b) => (b.daysInStock || 0) - (a.daysInStock || 0)).slice(0, 12)), "", "table-panel")}
      ${panel("Khuyến nghị theo tuổi tồn", "Không phải tất cả hàng già đều cần xử lý giống nhau", actionsList(rows.filter(row => row.daysInStock > 30)))}
    </div>`;
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
      ${panel("Remark đang đi cùng tồn kho", "Nhấn một dòng để xem toàn bộ barcode và giao việc xử lý", remarkTable(rows, "statusSecondary", "Remark"))}
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

function actionsPage(rows = state.filtered) {
  return `<div class="dashboard-grid">
      ${panel("Danh sách ưu tiên xử lý", "Nhóm nào cần hỏi trong cuộc họp và vì sao", actionsList(rows))}
      ${panel("Top sản phẩm cần chất vấn", "Lấy theo nhóm vừa tồn nhiều vừa thiếu rõ trạng thái", productRiskTable(rows))}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Tập trung theo kho", "Gợi ý câu hỏi điều hành cho từng kho", warehouseQuestions(rows))}
      ${panel("Nhịp nhập xuất kho gần nhất", "Đối chiếu m³, số block và chênh lệch ròng", movementChart(), "ReceiptDate / DeliveryDate")}
    </div>`;
}

function taskDueState(task) {
  if (task.status === "Hoàn thành") return "done";
  const today = new Date(`${state.reportDate}T00:00:00`);
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
    <section class="kpi-grid task-kpis">
      ${kpiCard("Việc đang mở", open.length, `${unique(open.map(task => task.barcode)).length} barcode đang được theo dõi`, "flow", "brand")}
      ${kpiCard("Đã quá hạn", overdue.length, overdue.length ? "Cần chốt người xử lý ngay" : "Không có việc quá hạn", "clock", "warning")}
      ${kpiCard("Đến hạn ≤ 3 ngày", dueSoon.length, "Nhóm cần kiểm tra trong cuộc họp", "actions", "info")}
      ${kpiCard("Đã hoàn thành", done.length, tasks.length ? `${formatNumber(done.length / tasks.length * 100, 0)}% tổng nhiệm vụ` : "Chưa có nhiệm vụ", "blocks", "success")}
    </section>
    <div class="dashboard-grid">
      ${panel("Bức tranh luồng việc", "Số nhiệm vụ đang nằm tại mỗi bước xử lý", `<div class="workflow-pipeline">${workflow.map((item, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.count}</strong><small>${item.status}</small></div>`).join("")}</div>`, `${tasks.length} nhiệm vụ`)}
      ${panel("Tải việc theo người phụ trách", "Nhìn nhanh ai đang giữ nhiều việc hoặc có việc quá hạn", assignees.length ? `<div class="assignee-load">${assignees.map(item => `<div><span><strong>${item.name}</strong><small>${item.total} nhiệm vụ</small></span><b>${item.open} đang mở</b><em class="${item.overdue ? "has-overdue" : ""}">${item.overdue} quá hạn</em></div>`).join("")}</div>` : '<div class="empty-state"><strong>Chưa có người phụ trách</strong><span>Giao việc từ bảng barcode để bắt đầu theo dõi.</span></div>')}
    </div>
    ${panel("Danh sách nhiệm vụ theo barcode", "Có thể cập nhật tiến độ ngay trong bảng; dữ liệu đang lưu trên trình duyệt này", taskTable(tasks), `${open.length} việc đang mở`, "table-panel")}
  `;
}

function taskTable(tasks) {
  if (!tasks.length) return '<div class="empty-state"><strong>Chưa có nhiệm vụ</strong><span>Mở một sản phẩm hoặc bảng chi tiết block và chọn “Giao việc”.</span></div>';
  return `<div class="table-wrap"><table><thead><tr><th>Barcode / sản phẩm</th><th>Nhiệm vụ</th><th>Phụ trách</th><th>Ngày giao</th><th>Deadline</th><th>Ưu tiên</th><th>Tiến độ</th><th>Tình trạng hạn</th></tr></thead><tbody>
    ${tasks.map(task => {
      const record = state.records.find(row => (row.barcode || row.rowId) === task.barcode);
      const due = taskDueState(task);
      const dueLabel = due === "overdue" ? "Quá hạn" : due === "due-soon" ? "Sắp đến hạn" : due === "done" ? "Đã đóng" : "Đúng tiến độ";
      return `<tr>
        <td><div class="product-cell"><strong>${task.barcode}</strong><span>${record ? `${record.productFull} · ${record.warehouse}` : "Barcode ngoài tồn hiện tại"}</span></div></td>
        <td><div class="product-cell"><strong>${task.title}</strong><span>${task.note || "Không có ghi chú"}</span></div></td>
        <td>${task.assignee}</td><td>${formatDate(task.startDate)}</td><td>${formatDate(task.deadline)}</td>
        <td><span class="task-priority priority-${task.priority === "Khẩn cấp" ? "urgent" : task.priority === "Cao" ? "high" : "normal"}">${task.priority}</span></td>
        <td><select class="task-status-select" data-task-status-id="${task.id}">${["Chưa bắt đầu", "Đang xử lý", "Chờ xác nhận", "Hoàn thành"].map(status => `<option ${status === task.status ? "selected" : ""}>${status}</option>`).join("")}</select></td>
        <td><span class="due-state due-${due}">${dueLabel}</span></td>
      </tr>`;
    }).join("")}
  </tbody></table></div>`;
}

function productRiskTable(rows) {
  const items = productGroups(rows).map(item => ({
    ...item,
    risk: item.statusLead === "Chưa xác định" ? 3 : item.statusLead === "SX dư" ? 2 : 1,
  })).sort((a, b) => b.risk - a.risk || b.volume - a.volume).slice(0, 10);
  return `<div class="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Màu</th><th>Kho</th><th>m3 tồn</th><th>Tuổi TB</th><th>Trạng thái dẫn dắt</th></tr></thead><tbody>
    ${items.map(item => `<tr class="interactive-row" data-product="${item.productFull}"><td>${item.product}</td><td>${item.color}</td><td>${item.warehouseMix}</td><td class="numeric" data-sort-value="${item.volume}">${formatNumber(item.volume, 1)} m³</td><td class="numeric" data-sort-value="${item.age}">${formatNumber(item.age, 0)} ngày</td><td>${badge(item.statusLead)}</td></tr>`).join("")}
  </tbody></table></div>`;
}

function warehouseQuestions(rows) {
  const blocks = unique(rows.map(row => row.warehouse)).map(warehouse => {
    const items = rows.filter(row => row.warehouse === warehouse);
    const role = items[0]?.warehouseRole || "Kho";
    const topStatus = dominant(items, "status");
    return `<div class="question-card">
      <strong>${warehouse} · ${role}</strong>
      <p>Tồn chủ đạo hiện là <b>${topStatus}</b> với ${formatNumber(sum(items, "closeVolume"), 1)} m³. Cần hỏi tiếp: vì sao nhóm này còn tồn, có gắn đơn hàng hay không, và phương án xử lý là gì.</p>
    </div>`;
  });
  return `<div class="question-list">${blocks.join("")}</div>`;
}

function detailsPage(rows = state.filtered) {
  return panel("Danh sách block tồn hiện tại", "Mỗi dòng là một block còn tồn dương sau khi làm sạch dữ liệu SQL", detailsTable(rows), `${formatNumber(rows.length, 0)} block`, "table-panel");
}

function barChart(items, valueFormatter = value => formatMetric(value, "volume"), color = "#b22536") {
  const max = Math.max(...items.map(item => item.value), 1);
  return `<div class="bar-chart">${items.map(item => `<button class="bar-row bar-drill" ${item.drillType ? `data-drill-type="${item.drillType}" data-drill-value="${item.drillValue}"` : ""}>
        <span class="bar-label" title="${item.label}">${item.label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(item.value / max * 100, 1)}%;--bar-color:${item.color || color}"></div></div>
        <span class="bar-value">${valueFormatter(item.value)}</span>
      </button>`).join("")}</div>`;
}

function renderPage() {
  const config = pageConfig[state.page];
  els.pageTitle.textContent = config.title;
  els.pageDescription.textContent = config.description;
  els.pageKicker.textContent = config.kicker;
  els.topTitle.textContent = config.label;
  els.scopeText.textContent = filtersScopeLabel();
  els.filterBar.hidden = state.page === "guide";
  const pages = {
    guide: guidePage,
    overview: overviewPage,
    warehouse: warehousePage,
    product: productPage,
    aging: agingPage,
    status: statusPage,
    actions: actionsPage,
    details: detailsPage,
    workflow: workflowPage,
  };
  els.pageContent.innerHTML = pages[state.page](state.filtered);
  els.pageContent.classList.add("page-enter");
  enhanceSortableTables(els.pageContent);
}

function populateFilters() {
  const products = unique(state.records.map(row => row.product));
  const colors = unique(state.records.map(row => row.color));
  const ages = unique(state.records.map(row => row.ageBucket));
  const statuses = unique(state.records.map(row => row.status));
  const warehouses = unique(state.rawRecords.map(row => row.warehouse));
  els.warehouseFilter.innerHTML = `<option value="all">Tất cả kho</option>${optionsMarkup(warehouses, state.filters.warehouse)}`;
  els.productFilter.innerHTML = `<option value="all">Tất cả sản phẩm</option>${optionsMarkup(products, state.filters.product)}`;
  els.colorFilter.innerHTML = `<option value="all">Tất cả màu</option>${optionsMarkup(colors, state.filters.color)}`;
  els.ageFilter.innerHTML = `<option value="all">Tất cả tuổi tồn</option>${optionsMarkup(ages, state.filters.age)}`;
  els.statusFilter.innerHTML = `<option value="all">Tất cả trạng thái</option>${optionsMarkup(statuses, state.filters.status)}`;
}

function applyFilters() {
  state.filtered = state.records.filter(row => {
    if (state.filters.warehouse !== "all" && row.warehouse !== state.filters.warehouse) return false;
    if (state.filters.product !== "all" && row.product !== state.filters.product) return false;
    if (state.filters.color !== "all" && row.color !== state.filters.color) return false;
    if (state.filters.age !== "all" && row.ageBucket !== state.filters.age) return false;
    if (state.filters.status !== "all" && row.status !== state.filters.status) return false;
    return true;
  });
  renderPage();
}

function buildNav() {
  els.nav.innerHTML = Object.entries(pageConfig).map(([key, config]) => `<button class="nav-button ${state.page === key ? "active" : ""}" data-page="${key}"><span class="nav-icon">${icons[key]}</span><span>${config.label}</span></button>`).join("");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function exportCurrentCsv() {
  const headers = ["barcode", "product", "productFull", "color", "warehouse", "location", "status", "statusSecondary", "statusTertiary", "closeUnits", "closeVolume", "receiptDate", "deliveryDate", "daysInStock"];
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
      <div><span>Dung tích</span><strong>${formatNumber(sum(rows, "closeVolume"), 1)} m³</strong></div>
      <div><span>Tuổi TB</span><strong>${formatNumber(weightedAge(rows), 0)} ngày</strong></div>
      <div class="analysis-risk ${rows.some(row => row.status === "Chưa xác định") ? "has-risk" : ""}"><span>Điểm cần hỏi</span><strong>${dominant(rows, "status")}</strong></div>
    </div>
    <div class="dashboard-grid equal">
      ${panel("Kho đang giữ nhóm này", "Để biết tồn đang nằm ở đâu", barChart(unique(rows.map(row => row.warehouse)).map(warehouse => ({ label: warehouse, value: sum(rows.filter(row => row.warehouse === warehouse), "closeVolume"), drillType: "warehouse", drillValue: warehouse })), value => `${formatNumber(value, 1)} m³`, "#34373c"))}
      ${panel("Trạng thái phụ nổi bật", "Nhấn để xem barcode và giao việc", topRemarks.length ? barChart(topRemarks.map(item => ({ label: item.name, value: item.volume, drillType: "remark", drillValue: escapeAttr(item.name) })), value => `${formatNumber(value, 1)} m³`, "#b22536") : '<div class="empty-state"><strong>Không có dữ liệu</strong><span>Nhóm này chưa có trạng thái phụ.</span></div>')}
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

function saveTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
}

function openTaskModal(barcode) {
  const record = state.records.find(row => (row.barcode || row.rowId) === barcode);
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

function createTask() {
  state.tasks.push({
    id: `TASK-${Date.now()}`,
    barcode: els.taskBarcode.value,
    title: els.taskTitle.value.trim(),
    assignee: els.taskAssignee.value.trim(),
    startDate: els.taskStartDate.value,
    deadline: els.taskDeadline.value,
    priority: els.taskPriority.value,
    status: els.taskStatus.value,
    note: els.taskNote.value.trim(),
    createdAt: new Date().toISOString(),
  });
  saveTasks();
  closeTaskModal();
  renderPage();
  toast(`Đã giao việc cho ${els.taskAssignee.value.trim()} theo barcode ${els.taskBarcode.value}`);
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

  els.clearFilters.addEventListener("click", () => {
    state.filters = { warehouse: "all", product: "all", color: "all", age: "all", status: "all" };
    populateFilters();
    applyFilters();
  });

  els.reportDate.addEventListener("change", () => {
    state.reportDate = els.reportDate.value;
    toast("Ngày báo cáo đang là mốc hiển thị. Tuổi tồn hiện lấy từ dữ liệu build gần nhất.");
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
      toast("Deadline phải bằng hoặc sau ngày giao");
      return;
    }
    createTask();
  });
  els.pageContent.addEventListener("change", event => {
    const select = event.target.closest("[data-task-status-id]");
    if (!select) return;
    const task = state.tasks.find(item => item.id === select.dataset.taskStatusId);
    if (!task) return;
    task.status = select.value;
    task.updatedAt = new Date().toISOString();
    saveTasks();
    renderPage();
    toast("Đã cập nhật tiến độ nhiệm vụ");
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

async function init() {
  const response = await fetch("data/inventory.json");
  state.data = await response.json();
  state.records = state.data.records;
  state.rawRecords = state.data.rawRecords;
  state.movements = state.data.movements;
  try {
    state.tasks = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) || "[]");
  } catch {
    state.tasks = [];
  }
  state.filtered = [...state.records];
  state.reportDate = state.data.meta.reportDate || state.reportDate;
  els.reportDate.value = state.reportDate;
  els.syncTime.textContent = `Nguồn ${state.data.meta.source} · cập nhật ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(state.data.meta.generatedAt))}`;
  buildNav();
  populateFilters();
  renderPage();
  bindEvents();
}

init().catch(error => {
  console.error(error);
  els.pageContent.innerHTML = `<div class="empty-state"><strong>Không tải được dữ liệu</strong><span>${error.message}</span></div>`;
});
