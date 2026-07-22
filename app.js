const state = {
  data: null,
  records: [],
  filtered: [],
  page: "overview",
  selectedSku: null,
  reportDate: "2026-07-22",
  filters: { warehouse: "all", product: "all", age: "all", status: "all" },
};

const pageConfig = {
  overview: { label: "Tổng quan", title: "Tồn kho dưới góc nhìn quyết định", description: "Nắm quy mô vốn, tuổi tồn và các nhóm hàng cần ưu tiên xử lý.", kicker: "Tổng quan điều hành", icon: "overview" },
  warehouse: { label: "Theo kho", title: "Hiệu quả tồn kho theo kho", description: "So sánh quy mô, giá trị, tuổi tồn và mức độ rủi ro giữa các kho.", kicker: "Phân tích theo kho", icon: "warehouse" },
  product: { label: "Theo sản phẩm", title: "Danh mục sản phẩm đang giữ vốn", description: "Nhận diện sản phẩm có giá trị lớn, tồn lâu hoặc tỷ lệ bất thường cao.", kicker: "Phân tích sản phẩm", icon: "box" },
  aging: { label: "Tuổi tồn kho", title: "Vốn tồn kho đang già đi như thế nào?", description: "Đo thời gian từ ngày nhập đến ngày báo cáo và phân tầng mức độ ưu tiên.", kicker: "Phân tích tuổi tồn", icon: "clock" },
  status: { label: "Trạng thái", title: "Mục đích và chất lượng hàng tồn", description: "Phân biệt hàng theo đơn, sản xuất dư, hàng lỗi và nhóm chưa xác định.", kicker: "Trạng thái sử dụng", icon: "status" },
  alerts: { label: "Cảnh báo", title: "Danh sách cần hành động", description: "Tập trung vào tồn lâu, hàng lỗi và dữ liệu chưa đủ để ra quyết định.", kicker: "Trung tâm cảnh báo", icon: "alert" },
  details: { label: "Chi tiết", title: "Dữ liệu block mousse", description: "Tra cứu các block đang tồn theo bộ lọc hiện tại.", kicker: "Danh sách chi tiết", icon: "table" },
};

const colors = {
  "Theo đơn hàng": "#2E7D5A",
  "Sản xuất dư": "#C78318",
  "Hàng lỗi / hư": "#C43737",
  "Chưa xác định": "#7A7F87",
  "0–7 ngày": "#2E7D5A",
  "8–30 ngày": "#5D9277",
  "31–60 ngày": "#3568A8",
  "61–90 ngày": "#C78318",
  "91–180 ngày": "#B35F2A",
  ">180 ngày": "#B22536",
  "Thiếu ngày nhập": "#7A7F87",
};

const icons = {
  overview: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  warehouse: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 9l9-5 9 5v11H3zM3 9h18M8 20v-6h8v6"/></svg>',
  box: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/></svg>',
  clock: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  status: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h10M4 12h16M4 17h8"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>',
  alert: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4L3.5 19h17zM12 9v4M12 16h.01"/></svg>',
  table: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>',
  blocks: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="6" rx="1"/><rect x="4" y="13" width="16" height="6" rx="1"/></svg>',
  volume: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10"/></svg>',
  money: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9h.01M17 15h.01"/></svg>',
  hourglass: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 3h10M7 21h10M8 3c0 5 4 5 4 9s-4 4-4 9M16 3c0 5-4 5-4 9s4 4 4 9"/></svg>',
};

const formatNumber = (value, digits = 0) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value || 0);
const formatMoney = (value, compact = false) => compact
  ? new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0) + " ₫"
  : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value || 0) + " ₫";
const formatDate = value => value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—";
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);
const unique = values => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), "vi"));

function sortableValue(text, type) {
  const value = text.trim().replace(/\s+/g, " ");
  if (type === "date") {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime() : 0;
  }
  if (type === "number") {
    const match = value.replace(/\./g, "").replace(",", ".").match(/-?[\d.]+/);
    return match ? Number(match[0]) : 0;
  }
  return value;
}

function enhanceSortableTables(root) {
  root.querySelectorAll("table").forEach((table, tableIndex) => {
    if (table.dataset.sortReady) return;
    table.dataset.sortReady = "true";
    const headers = [...table.querySelectorAll("thead th")];
    headers.forEach((header, columnIndex) => {
      const label = header.textContent.trim();
      if (!label) return;
      const normalized = label.toLocaleUpperCase("vi");
      const type = /(^NGÀY|NGÀY NHẬP|NGÀY XUẤT)/.test(normalized) ? "date" : /BLOCK|THỂ TÍCH|GIÁ TRỊ|TUỔI|HÀNG LỖI|TỶ LỆ|SỐ LƯỢNG|CẤP ĐỘ|TỒN/.test(normalized) ? "number" : "text";
      header.classList.toggle("numeric-header", type === "number");
      header.classList.toggle("date-header", type === "date");
      header.setAttribute("aria-sort", "none");
      header.innerHTML = `<button class="sort-button" type="button" title="Sắp xếp ${type === "text" ? "A–Z" : type === "date" ? "cũ đến mới" : "nhỏ đến lớn"}"><span>${label}</span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M5 3v10m0-10L2.5 5.5M5 3l2.5 2.5M11 13V3m0 10-2.5-2.5M11 13l2.5-2.5"/></svg></button>`;
      header.querySelector("button").addEventListener("click", () => {
        const current = header.dataset.sortDirection;
        const direction = current === "asc" ? "desc" : "asc";
        headers.forEach(other => {
          other.dataset.sortDirection = "";
          other.setAttribute("aria-sort", "none");
          other.querySelector(".sort-button")?.classList.remove("sorted-asc", "sorted-desc");
        });
        header.dataset.sortDirection = direction;
        header.setAttribute("aria-sort", direction === "asc" ? "ascending" : "descending");
        const button = header.querySelector(".sort-button");
        button.classList.add(direction === "asc" ? "sorted-asc" : "sorted-desc");
        button.title = `Đang sắp xếp ${direction === "asc" ? type === "text" ? "A–Z" : type === "date" ? "cũ đến mới" : "nhỏ đến lớn" : type === "text" ? "Z–A" : type === "date" ? "mới đến cũ" : "lớn đến nhỏ"}`;
        const body = table.tBodies[0];
        const rows = [...body?.rows || []].map((row, index) => ({ row, index }));
        rows.sort((a, b) => {
          const av = sortableValue(a.row.cells[columnIndex]?.dataset.sortValue || a.row.cells[columnIndex]?.textContent || "", type);
          const bv = sortableValue(b.row.cells[columnIndex]?.dataset.sortValue || b.row.cells[columnIndex]?.textContent || "", type);
          const result = type === "text" ? String(av).localeCompare(String(bv), "vi", { numeric: true, sensitivity: "base" }) : av - bv;
          return result ? result * (direction === "asc" ? 1 : -1) : a.index - b.index;
        });
        rows.forEach(item => body.appendChild(item.row));
      });
    });
  });
}

function groupRows(rows, key) {
  return rows.reduce((groups, row) => {
    const name = typeof key === "function" ? key(row) : row[key];
    (groups[name] ||= []).push(row);
    return groups;
  }, {});
}

function weightedAge(rows) {
  const valid = rows.filter(row => Number.isFinite(row.ageDays));
  return valid.length ? valid.reduce((total, row) => total + row.ageDays, 0) / valid.length : 0;
}

function kpiCard(label, value, note, icon, tone = "brand") {
  return `<article class="kpi-card tone-${tone}"><div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon">${icons[icon]}</span></div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></article>`;
}

function panel(title, subtitle, body, metric = "", extraClass = "") {
  return `<section class="panel ${extraClass}"><div class="panel-header"><div><h2>${title}</h2><p>${subtitle}</p></div>${metric ? `<span class="panel-metric">${metric}</span>` : ""}</div>${body}</section>`;
}

function stackedChart(groups, valueKey, order) {
  const items = (order || Object.keys(groups)).filter(name => groups[name]?.length).map(name => ({ name, value: sum(groups[name], valueKey), color: colors[name] || "#3568A8" }));
  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;
  const dimensionOf = name => ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"].includes(name) ? "status" : ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"].includes(name) ? "ageBucket" : "";
  return `<div class="stacked-bar" role="img" aria-label="${items.map(item => `${item.name}: ${formatMoney(item.value)}`).join(", ")}">${items.map(item => `<button class="stacked-segment chart-drill" style="width:${item.value / total * 100}%;background:${item.color}" title="Phân tích ${item.name}" data-drill-type="${dimensionOf(item.name)}" data-drill-value="${item.name}" aria-label="Mở phân tích ${item.name}"></button>`).join("")}</div><div class="legend-list">${items.map(item => `<button class="legend-row legend-drill" data-drill-type="${dimensionOf(item.name)}" data-drill-value="${item.name}" aria-label="Mở phân tích ${item.name}"><span class="legend-swatch" style="background:${item.color}"></span><span class="legend-name">${item.name}</span><span class="legend-value">${formatMoney(item.value, true)} · ${formatNumber(item.value / total * 100, 1)}%</span></button>`).join("")}</div>`;
}

function barChart(items, valueFormatter = value => formatMoney(value, true), color = "#B22536") {
  const max = Math.max(...items.map(item => item.value), 1);
  return `<div class="bar-chart">${items.map(item => { const clickable = item.sku || item.drillType; const attrs = item.sku ? `data-product-sku="${item.sku}"` : item.drillType ? `data-drill-type="${item.drillType}" data-drill-value="${item.drillValue}"` : ""; return `<div class="bar-row ${clickable ? "bar-drill" : ""}" ${attrs} ${clickable ? `tabindex="0" role="button" aria-label="Mở phân tích ${item.label}"` : ""}><span class="bar-label" title="${item.label}">${item.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(item.value / max * 100, 1)}%;--bar-color:${item.color || color}"></div></div><span class="bar-value">${valueFormatter(item.value)}</span></div>`; }).join("")}</div>`;
}

function monthlyTrend(rows) {
  const grouped = groupRows(rows.filter(row => row.receivedAt), row => row.receivedAt.slice(0, 7));
  const months = Object.keys(grouped).sort().slice(-14);
  const values = months.map(month => sum(grouped[month], "value"));
  const max = Math.max(...values, 1);
  const width = 760, height = 230, left = 48, right = 18, top = 18, bottom = 42;
  const chartW = width - left - right, chartH = height - top - bottom;
  const points = values.map((value, index) => ({
    x: left + (months.length === 1 ? chartW / 2 : index / (months.length - 1) * chartW),
    y: top + chartH - value / max * chartH,
    value,
    month: months[index],
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = points.length ? `${path} L${points.at(-1).x},${top + chartH} L${points[0].x},${top + chartH} Z` : "";
  return `<div class="svg-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Xu hướng giá trị nhập kho theo tháng: ${months.map((m, i) => `${m} ${formatMoney(values[i], true)}`).join(", ")}">
    <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B22536" stop-opacity=".22"/><stop offset="1" stop-color="#B22536" stop-opacity="0"/></linearGradient></defs>
    ${[0, .25, .5, .75, 1].map(ratio => `<line class="chart-gridline" x1="${left}" y1="${top + chartH * ratio}" x2="${width - right}" y2="${top + chartH * ratio}"/>`).join("")}
    <path class="chart-area" d="${area}" fill="url(#trendFill)"/>
    <path class="chart-line" d="${path}"/>
    ${points.map((point, index) => `<g class="chart-point chart-drill" data-drill-type="month" data-drill-value="${point.month}" tabindex="0" role="button" aria-label="Phân tích sản phẩm nhập trong tháng ${point.month}" style="--point-delay:${index * 35}ms"><circle cx="${point.x}" cy="${point.y}" r="4"><title>${point.month}: ${formatMoney(point.value)}</title></circle>${index % 2 === 0 || index === points.length - 1 ? `<text class="chart-axis-label" x="${point.x}" y="${height - 14}" text-anchor="middle">${point.month.slice(5)}/${point.month.slice(2,4)}</text>` : ""}</g>`).join("")}
    <text class="chart-axis-label" x="${left}" y="12">${formatMoney(max, true)}</text>
  </svg></div>`;
}

function paretoChart(rows) {
  const products = productAggregates(rows).sort((a, b) => b.value - a.value).slice(0, 10);
  const total = sum(rows, "value") || 1;
  let running = 0;
  const items = products.map(product => ({ ...product, cumulative: (running += product.value) / total * 100 }));
  const width = 760, height = 270, left = 48, right = 44, top = 20, bottom = 64;
  const chartW = width - left - right, chartH = height - top - bottom;
  const max = Math.max(...items.map(item => item.value), 1);
  const slot = chartW / Math.max(items.length, 1), barW = Math.min(42, slot * .62);
  const linePoints = items.map((item, index) => ({ x: left + slot * index + slot / 2, y: top + chartH - item.cumulative / 100 * chartH }));
  const path = linePoints.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  return `<div class="svg-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Pareto giá trị tồn kho: ${items.map(i => `${i.sku} ${formatMoney(i.value, true)}`).join(", ")}">
    ${[0, .25, .5, .75, 1].map(ratio => `<line class="chart-gridline" x1="${left}" y1="${top + chartH * ratio}" x2="${width - right}" y2="${top + chartH * ratio}"/>`).join("")}
    ${items.map((item, index) => { const h = item.value / max * chartH; const x = left + slot * index + (slot - barW) / 2; return `<g class="pareto-bar chart-drill" data-product-sku="${item.sku}" tabindex="0" role="button" aria-label="Xem chi tiết ${item.sku} ${item.product}" style="--bar-delay:${index * 45}ms"><rect x="${x}" y="${top + chartH - h}" width="${barW}" height="${h}" rx="4"><title>${item.product}: ${formatMoney(item.value)}</title></rect><text class="chart-axis-label" x="${x + barW / 2}" y="${height - 38}" text-anchor="middle">${item.sku.replace("FB00", "")}</text></g>`; }).join("")}
    <path class="chart-line chart-line-dark" d="${path}"/>
    ${linePoints.map((point, index) => `<g class="chart-point" style="--point-delay:${index * 45}ms"><circle class="dark-point" cx="${point.x}" cy="${point.y}" r="3.5"><title>Lũy kế ${formatNumber(items[index].cumulative, 1)}%</title></circle></g>`).join("")}
    <text class="chart-axis-label" x="${left}" y="12">${formatMoney(max, true)}</text><text class="chart-axis-label" x="${width - right}" y="12" text-anchor="end">Lũy kế 100%</text><text class="chart-caption" x="${width / 2}" y="${height - 10}" text-anchor="middle">Mã sản phẩm · đường đen = tỷ lệ giá trị lũy kế</text>
  </svg></div>`;
}

function scatterChart(rows) {
  const products = productAggregates(rows).sort((a, b) => b.value - a.value).slice(0, 35);
  const width = 760, height = 270, left = 58, right = 22, top = 18, bottom = 48;
  const chartW = width - left - right, chartH = height - top - bottom;
  const maxAge = Math.max(...products.map(item => item.age), 1);
  const maxValue = Math.max(...products.map(item => item.value), 1);
  return `<div class="svg-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Tương quan tuổi tồn và giá trị theo sản phẩm">
    ${[0, .25, .5, .75, 1].map(ratio => `<line class="chart-gridline" x1="${left}" y1="${top + chartH * ratio}" x2="${width - right}" y2="${top + chartH * ratio}"/>`).join("")}
    <line class="chart-threshold" x1="${left + 90 / maxAge * chartW}" y1="${top}" x2="${left + 90 / maxAge * chartW}" y2="${top + chartH}"/><text class="chart-axis-label threshold-label" x="${left + 90 / maxAge * chartW + 5}" y="${top + 12}">90 ngày</text>
    ${products.map((item, index) => { const x = left + item.age / maxAge * chartW; const y = top + chartH - item.value / maxValue * chartH; const radius = Math.max(4, Math.min(11, Math.sqrt(item.volume) * 1.2)); const color = item.issueValue > 0 ? "#C43737" : item.oldValue > 0 ? "#C78318" : "#3568A8"; return `<circle class="scatter-dot chart-drill" data-product-sku="${item.sku}" style="--point-delay:${index * 24}ms" cx="${x}" cy="${y}" r="${radius}" fill="${color}" tabindex="0" role="button" aria-label="Xem chi tiết ${item.sku} ${item.product}"><title>${item.sku} · ${item.product}\n${formatNumber(item.age,0)} ngày · ${formatMoney(item.value)}</title></circle>`; }).join("")}
    <text class="chart-axis-label" x="${left}" y="12">${formatMoney(maxValue, true)}</text><text class="chart-axis-label" x="${left}" y="${height - 14}">0 ngày</text><text class="chart-axis-label" x="${width - right}" y="${height - 14}" text-anchor="end">${formatNumber(maxAge,0)} ngày</text><text class="chart-caption" x="${width / 2}" y="${height - 12}" text-anchor="middle">Tuổi tồn → · kích thước điểm = thể tích</text>
  </svg></div><div class="chart-key"><span><i style="background:#3568A8"></i>Bình thường</span><span><i style="background:#C78318"></i>Có tồn lâu</span><span><i style="background:#C43737"></i>Có hàng lỗi</span></div>`;
}

function statusAgeHeatmap(rows) {
  const statuses = ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"];
  const ages = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày"];
  const values = statuses.flatMap(status => ages.map(age => sum(rows.filter(row => row.status === status && row.ageBucket === age), "value")));
  const max = Math.max(...values, 1);
  return `<div class="heatmap-wrap"><div class="heatmap" role="img" aria-label="Ma trận giá trị theo trạng thái và tuổi tồn"><div></div>${ages.map(age => `<div class="heatmap-head">${age}</div>`).join("")}${statuses.map(status => `<div class="heatmap-row-label">${status}</div>${ages.map(age => { const value = sum(rows.filter(row => row.status === status && row.ageBucket === age), "value"); const intensity = value / max; return `<button class="heatmap-cell" data-drill-age="${age}" data-drill-status="${status}" style="--heat:${.07 + intensity * .83};--cell-delay:${Math.round(intensity * 160)}ms" title="Phân tích ${status} · ${age}: ${formatMoney(value)}" ${value ? "" : "disabled"}><strong>${value ? formatMoney(value, true) : "—"}</strong><span>${formatNumber(value / Math.max(sum(rows, "value"), 1) * 100, 1)}%</span></button>`; }).join("")}`).join("")}</div></div>`;
}

function riskFunnel(rows) {
  const tiers = [
    { label: "Toàn bộ tồn kho", rows, color: "#7A7F87" },
    { label: "Cần theo dõi >90 ngày", rows: rows.filter(r => r.ageDays > 90), color: "#C78318" },
    { label: "Ưu tiên cao >180 ngày", rows: rows.filter(r => r.ageDays > 180), color: "#B22536" },
    { label: "Hàng lỗi / hư", rows: rows.filter(r => r.status === "Hàng lỗi / hư"), color: "#C43737" },
  ];
  const max = sum(rows, "value") || 1;
  return `<div class="risk-funnel">${tiers.map((tier, index) => { const value = sum(tier.rows, "value"); return `<div class="funnel-row"><div class="funnel-label"><strong>${tier.label}</strong><span>${formatNumber(tier.rows.length)} block</span></div><div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(value / max * 100, 4)}%;background:${tier.color};--bar-delay:${index * 80}ms"></div></div><strong>${formatMoney(value, true)}</strong></div>`; }).join("")}</div>`;
}

function badge(text) {
  const cls = text === "Theo đơn hàng" || text === "0–7 ngày" || text === "8–30 ngày" ? "success" : text === "Sản xuất dư" || text === "61–90 ngày" || text === "91–180 ngày" ? "warning" : text === "Hàng lỗi / hư" || text === ">180 ngày" ? "danger" : text === "31–60 ngày" ? "info" : "muted";
  return `<span class="badge badge-${cls}">${text}</span>`;
}

function productAggregates(rows) {
  return Object.entries(groupRows(rows, "sku")).map(([sku, items]) => ({
    sku, product: items[0].product, blocks: sum(items, "qtyStock"), volume: sum(items, "volumeStock"), value: sum(items, "value"), age: weightedAge(items), oldValue: sum(items.filter(item => item.ageDays > 90), "value"), issueValue: sum(items.filter(item => item.status === "Hàng lỗi / hư"), "value"), items,
  }));
}

function overviewPage(rows) {
  const totalValue = sum(rows, "value");
  const oldRows = rows.filter(row => row.ageDays > 90);
  const statusGroups = groupRows(rows, "status");
  const agingGroups = groupRows(rows, "ageBucket");
  const topProducts = productAggregates(rows).sort((a, b) => b.value - a.value).slice(0, 7);
  const issueRows = rows.filter(row => row.status === "Hàng lỗi / hư");
  const unknownRows = rows.filter(row => row.status === "Chưa xác định");
  const surplusRows = rows.filter(row => row.status === "Sản xuất dư");
  return `
    <section class="kpi-grid">
      ${kpiCard("Block đang tồn", formatNumber(sum(rows, "qtyStock")), `${formatNumber(new Set(rows.map(r => r.sku)).size)} mã sản phẩm`, "blocks", "brand")}
      ${kpiCard("Thể tích tồn", `${formatNumber(sum(rows, "volumeStock"), 1)} m³`, `Bình quân ${formatNumber(sum(rows, "volumeStock") / Math.max(sum(rows, "qtyStock"), 1), 2)} m³/block`, "volume", "info")}
      ${kpiCard("Giá trị tồn kho", formatMoney(totalValue, true), "Giá trị vốn tại ngày báo cáo", "money", "success")}
      ${kpiCard("Giá trị trên 90 ngày", formatMoney(sum(oldRows, "value"), true), `${formatNumber(sum(oldRows, "value") / Math.max(totalValue, 1) * 100, 1)}% tổng giá trị tồn`, "hourglass", "warning")}
    </section>
    <div class="dashboard-grid">
      ${panel("Tuổi tồn theo giá trị", "Tỷ trọng vốn theo thời gian từ ngày nhập", stackedChart(agingGroups, "value", ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"]), `TB ${formatNumber(weightedAge(rows), 0)} ngày`)}
      ${panel("Trạng thái hàng tồn", "Ưu tiên tình trạng lỗi trước lý do nhập", stackedChart(statusGroups, "value", ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"]))}
    </div>
    <div class="dashboard-grid">
      ${panel("Top sản phẩm giữ vốn", "Chọn một sản phẩm để mở phân tích", barChart(topProducts.map(p => ({ label: `${p.sku} · ${p.product}`, value: p.value, sku: p.sku }))))}
      ${panel("Vấn đề cần chú ý", "Xếp theo khả năng ảnh hưởng đến quyết định", `<div class="insight-list">
        <div class="insight-card"><span class="insight-line" style="--insight-color:var(--danger)"></span><div><h3>Hàng lỗi / hư</h3><p>${formatNumber(issueRows.length)} block cần đánh giá chất lượng</p></div><span class="insight-value">${formatMoney(sum(issueRows, "value"), true)}</span></div>
        <div class="insight-card"><span class="insight-line" style="--insight-color:var(--brand)"></span><div><h3>Tồn trên 180 ngày</h3><p>${formatNumber(rows.filter(r => r.ageDays > 180).length)} block cần kế hoạch xử lý</p></div><span class="insight-value">${formatMoney(sum(rows.filter(r => r.ageDays > 180), "value"), true)}</span></div>
        <div class="insight-card"><span class="insight-line" style="--insight-color:var(--warning)"></span><div><h3>Sản xuất dư</h3><p>${formatNumber(surplusRows.length)} block ngoài nhu cầu đơn hàng</p></div><span class="insight-value">${formatMoney(sum(surplusRows, "value"), true)}</span></div>
        <div class="insight-card"><span class="insight-line" style="--insight-color:var(--muted)"></span><div><h3>Chưa xác định mục đích</h3><p>Cần bổ sung lý do nhập cho ${formatNumber(unknownRows.length)} block</p></div><span class="insight-value">${formatMoney(sum(unknownRows, "value"), true)}</span></div>
      </div>`)}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Nhịp nhập kho 14 tháng", "Giá trị các block theo tháng nhập", monthlyTrend(rows), "Theo ngày nhập")}
      ${panel("Pareto giá trị sản phẩm", "Mức độ tập trung vốn vào nhóm SKU dẫn đầu", paretoChart(rows), "Top 10 SKU")}
    </div>`;
}

function warehousePage(rows) {
  const warehouses = Object.entries(groupRows(rows, "warehouse")).map(([name, items]) => ({ name, items, blocks: sum(items, "qtyStock"), volume: sum(items, "volumeStock"), value: sum(items, "value"), age: weightedAge(items), oldValue: sum(items.filter(i => i.ageDays > 90), "value") })).sort((a, b) => b.value - a.value);
  const leader = warehouses[0] || { name: "—", value: 0, age: 0, oldValue: 0, blocks: 0 };
  return `<section class="kpi-grid">
    ${kpiCard("Số kho có dữ liệu", formatNumber(warehouses.length), "Cấu trúc sẵn sàng mở rộng nhiều kho", "warehouse", "brand")}
    ${kpiCard("Kho lớn nhất", leader.name, `${formatNumber(leader.blocks)} block đang tồn`, "blocks", "info")}
    ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, "Bình quân tất cả block", "clock", "warning")}
    ${kpiCard("Tồn lâu trên 90 ngày", formatMoney(sum(rows.filter(r => r.ageDays > 90), "value"), true), "Giá trị cần ưu tiên", "hourglass", "brand")}
  </section><div class="dashboard-grid equal">
    ${panel("So sánh giá trị theo kho", "Chọn kho để xem sản phẩm bên trong", barChart(warehouses.map(w => ({ label: w.name, value: w.value, drillType: "warehouse", drillValue: w.name }))))}
    ${panel("Tuổi tồn bình quân", "Số ngày từ ngày nhập đến ngày báo cáo", barChart(warehouses.map(w => ({ label: w.name, value: w.age })), value => `${formatNumber(value, 0)} ngày`, "#C78318"))}
  </div><div class="dashboard-grid equal">
    ${panel("Nhịp nhập kho theo tháng", "Quan sát thời điểm phát sinh tồn hiện tại", monthlyTrend(rows))}
    ${panel("Tuổi tồn × trạng thái", "Vùng vốn cần chú ý trong từng nhóm", statusAgeHeatmap(rows))}
  </div>${warehouseTable(warehouses)}`;
}

function warehouseTable(items) {
  return panel("Bảng tổng hợp theo kho", "Click bộ lọc kho để xem sâu hơn", `<div class="table-wrap"><table><thead><tr><th>Kho</th><th>Block tồn</th><th>Thể tích</th><th>Giá trị</th><th>Tuổi TB</th><th>Giá trị >90 ngày</th></tr></thead><tbody>${items.map(w => `<tr><td><strong>${w.name}</strong></td><td class="numeric">${formatNumber(w.blocks)}</td><td class="numeric">${formatNumber(w.volume, 1)} m³</td><td class="numeric">${formatMoney(w.value)}</td><td class="numeric">${formatNumber(w.age, 0)} ngày</td><td class="numeric">${formatMoney(w.oldValue)}</td></tr>`).join("")}</tbody></table></div>`, "", "table-panel section-gap");
}

function productPage(rows) {
  const products = productAggregates(rows).sort((a, b) => b.value - a.value);
  const oldest = [...products].sort((a, b) => b.age - a.age).slice(0, 7);
  return `<section class="kpi-grid">
    ${kpiCard("Mã sản phẩm", formatNumber(products.length), "Có phát sinh tồn tại ngày báo cáo", "box", "brand")}
    ${kpiCard("Giá trị/SKU bình quân", formatMoney(sum(rows, "value") / Math.max(products.length, 1), true), "Mức vốn bình quân mỗi SKU", "money", "success")}
    ${kpiCard("SKU trên 90 ngày", formatNumber(products.filter(p => p.items.some(i => i.ageDays > 90)).length), "Có ít nhất một block tồn lâu", "hourglass", "warning")}
    ${kpiCard("SKU có hàng lỗi", formatNumber(products.filter(p => p.issueValue > 0).length), "Cần đánh giá chất lượng", "alert", "brand")}
  </section><div class="dashboard-grid equal">
    ${panel("Top giá trị tồn", "Chọn một sản phẩm để mở phân tích", barChart(products.slice(0, 8).map(p => ({ label: `${p.sku} · ${p.product}`, value: p.value, sku: p.sku }))))}
    ${panel("Top tuổi tồn bình quân", "Chọn một sản phẩm để mở phân tích", barChart(oldest.map(p => ({ label: `${p.sku} · ${p.product}`, value: p.age, sku: p.sku })), value => `${formatNumber(value, 0)} ngày`, "#C78318"))}
  </div><div class="dashboard-grid equal">
    ${panel("Pareto danh mục", "Thanh đỏ là giá trị; đường đen là tỷ lệ lũy kế", paretoChart(rows))}
    ${panel("Tương quan tuổi tồn – giá trị", "Góc trên bên phải là nhóm vốn lớn và luân chuyển chậm", scatterChart(rows))}
  </div>${productTable(products.slice(0, 30))}`;
}

function productTable(products) {
  return panel("Hiệu quả theo sản phẩm", "Chọn một dòng để mở hồ sơ phân tích chi tiết", `<div class="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Block</th><th>Thể tích</th><th>Giá trị</th><th>Tuổi TB</th><th>Giá trị >90 ngày</th><th>Hàng lỗi</th><th></th></tr></thead><tbody>${products.map(p => `<tr class="interactive-row" data-product-sku="${p.sku}" tabindex="0" role="button" aria-label="Xem chi tiết ${p.sku} ${p.product}"><td><div class="product-cell"><strong>${p.product}</strong><span>${p.sku}</span></div></td><td class="numeric">${formatNumber(p.blocks)}</td><td class="numeric">${formatNumber(p.volume, 1)} m³</td><td class="numeric">${formatMoney(p.value)}</td><td class="numeric">${formatNumber(p.age, 0)} ngày</td><td class="numeric">${formatMoney(p.oldValue)}</td><td class="numeric">${formatMoney(p.issueValue)}</td><td class="row-arrow">→</td></tr>`).join("")}</tbody></table></div>`, "", "table-panel section-gap");
}

function minMax(items, accessor) {
  const values = items.map(accessor).filter(value => Number.isFinite(value));
  return values.length ? [Math.min(...values), Math.max(...values)] : [0, 0];
}

function productDetailPage(sku, scopeContext = null) {
  const baseRows = state.filtered.filter(row => row.sku === sku);
  const rows = scopeContext ? filterByDimension(baseRows, scopeContext) : baseRows;
  if (!rows.length) return `<div class="panel empty-state"><strong>Không tìm thấy sản phẩm</strong><span>Mã ${sku} không còn trong dữ liệu hiện tại.</span></div>`;
  const product = rows[0].product;
  const statusGroups = groupRows(rows, "status");
  const warehouses = Object.entries(groupRows(rows, "warehouse")).map(([name, items]) => ({ label: name, value: sum(items, "value"), blocks: sum(items, "qtyStock") })).sort((a, b) => b.value - a.value);
  const conditions = Object.entries(groupRows(rows, "condition")).map(([name, items]) => ({ name, items, value: sum(items, "value"), blocks: sum(items, "qtyStock") })).sort((a, b) => b.value - a.value);
  const grades = Object.entries(groupRows(rows, row => `Cấp ${row.grade}`)).map(([name, items]) => ({ label: name, value: sum(items, "qtyStock") })).sort((a, b) => b.value - a.value);
  const [minLength, maxLength] = minMax(rows, row => row.dimensions.length);
  const [minWidth, maxWidth] = minMax(rows, row => row.dimensions.width);
  const [minHeight, maxHeight] = minMax(rows, row => row.dimensions.height);
  const oldest = Math.max(...rows.map(row => row.ageDays || 0));
  const newest = Math.min(...rows.map(row => row.ageDays || 0));
  const totalValue = sum(rows, "value");
  const oldValue = sum(rows.filter(row => row.ageDays > 90), "value");
  const issueValue = sum(rows.filter(row => row.status === "Hàng lỗi / hư"), "value");
  const riskValue = sum(rows.filter(row => row.ageDays > 90 || row.status === "Hàng lỗi / hư"), "value");
  const documentCount = new Set(rows.flatMap(row => [row.receiptNo, row.issueNo]).filter(Boolean)).size;
  return `<section class="analysis-summary"><div><span>Phạm vi phân tích</span><strong>${formatNumber(rows.length)} block · ${formatNumber(warehouses.length)} kho · ${formatNumber(documentCount)} chứng từ</strong></div><div class="analysis-risk ${oldValue || issueValue ? "has-risk" : ""}"><span>Mức cần chú ý</span><strong>${issueValue ? "Có hàng lỗi" : oldValue ? "Có tồn trên 90 ngày" : "Bình thường"}</strong></div></section>
    <section class="kpi-grid detail-kpis">
      ${kpiCard("Block đang tồn", formatNumber(sum(rows, "qtyStock")), `${formatNumber(sum(rows, "volumeStock"), 2)} m³`, "blocks", "brand")}
      ${kpiCard("Giá trị tồn", formatMoney(totalValue, true), `${formatMoney(totalValue / Math.max(sum(rows, "qtyStock"), 1), true)}/block`, "money", "success")}
      ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, `Mới nhất ${newest} · lâu nhất ${oldest} ngày`, "clock", "warning")}
      ${kpiCard("Giá trị cần chú ý", formatMoney(riskValue, true), `${formatNumber(riskValue / Math.max(totalValue, 1) * 100, 1)}% giá trị mã hàng`, "alert", "brand")}
    </section>
    <div class="dashboard-grid equal">
      ${panel("Tuổi tồn × trạng thái", `Phân tích riêng cho ${sku}`, statusAgeHeatmap(rows), `${formatNumber(rows.length)} block`)}
      ${panel("Cơ cấu mục đích và chất lượng", "Tỷ trọng giá trị theo trạng thái", stackedChart(statusGroups, "value", ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"]))}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Phân bổ theo kho", "Giá trị và số block đang ghi nhận", barChart(warehouses, value => formatMoney(value, true), "#3568A8"))}
      ${panel("Cấp độ block", "Số lượng block theo cấp", barChart(grades, value => `${formatNumber(value)} block`, "#7A7F87"))}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Thông số liên quan", "Phạm vi kích thước và chứng từ của mã hàng", `<dl class="spec-grid"><div><dt>Kích thước dài</dt><dd>${formatNumber(minLength)}–${formatNumber(maxLength)} mm</dd></div><div><dt>Kích thước rộng</dt><dd>${formatNumber(minWidth)}–${formatNumber(maxWidth)} mm</dd></div><div><dt>Kích thước cao</dt><dd>${formatNumber(minHeight)}–${formatNumber(maxHeight)} mm</dd></div><div><dt>Số chứng từ liên quan</dt><dd>${formatNumber(documentCount)}</dd></div><div><dt>Ngày nhập gần nhất</dt><dd>${formatDate([...rows].sort((a,b) => String(b.receivedAt).localeCompare(String(a.receivedAt)))[0]?.receivedAt)}</dd></div><div><dt>Ngày nhập lâu nhất</dt><dd>${formatDate([...rows].sort((a,b) => String(a.receivedAt).localeCompare(String(b.receivedAt)))[0]?.receivedAt)}</dd></div></dl>`)}
      ${panel("Tình trạng block", "Các ghi nhận chất lượng đang gắn với mã", `<div class="condition-list">${conditions.map(condition => `<div><span>${condition.name}</span><strong>${formatNumber(condition.blocks)} block</strong><em>${formatMoney(condition.value, true)}</em></div>`).join("")}</div>`)}
    </div>
    ${productBlockTable(rows)}
  `;
}

function productBlockTable(rows) {
  return panel("Chi tiết từng block", "Barcode, tuổi tồn, chứng từ và thông tin liên quan", `<div class="table-wrap"><table><thead><tr><th>Barcode</th><th>Kho</th><th>Kích thước D×R×C</th><th>Ngày nhập</th><th>Tuổi tồn</th><th>Trạng thái</th><th>Tình trạng</th><th>Cấp độ</th><th>Chứng từ nhập</th><th>Chứng từ xuất</th><th>Ghi chú</th><th>Thể tích</th><th>Giá trị</th></tr></thead><tbody>${[...rows].sort((a,b) => b.ageDays - a.ageDays).map(row => `<tr><td>${row.barcode}</td><td>${row.warehouse}</td><td>${formatNumber(row.dimensions.length)}×${formatNumber(row.dimensions.width)}×${formatNumber(row.dimensions.height)}</td><td>${formatDate(row.receivedAt)}</td><td>${badge(row.ageBucket)}</td><td>${badge(row.status)}</td><td>${row.condition}</td><td>${row.grade}</td><td>${row.receiptNo || "—"}</td><td>${row.issueNo || "—"}</td><td title="${row.note}">${row.note || "—"}</td><td class="numeric">${formatNumber(row.volumeStock, 3)} m³</td><td class="numeric">${formatMoney(row.value)}</td></tr>`).join("")}</tbody></table></div>`, "", "table-panel section-gap");
}

function filterByDimension(rows, context) {
  return rows.filter(row =>
    (!context.sku || row.sku === context.sku) &&
    (!context.ageBucket || row.ageBucket === context.ageBucket) &&
    (!context.status || row.status === context.status) &&
    (!context.warehouse || row.warehouse === context.warehouse) &&
    (!context.month || row.receivedAt?.slice(0, 7) === context.month)
  );
}

function dimensionTitle(context) {
  const productPrefix = context.sku ? `${context.sku} · ` : "";
  if (context.ageBucket && context.status) return `${productPrefix}${context.ageBucket} × ${context.status}`;
  if (context.ageBucket) return `${productPrefix}Tuổi tồn ${context.ageBucket}`;
  if (context.status) return `${productPrefix}Trạng thái: ${context.status}`;
  if (context.warehouse) return `${productPrefix}Kho ${context.warehouse}`;
  if (context.month) return `${productPrefix}Tháng nhập ${context.month}`;
  return "Phân tích đa chiều";
}

function dimensionDetailPage(context) {
  const rows = filterByDimension(state.filtered, context);
  if (!rows.length) return `<div class="empty-state"><strong>Không có dữ liệu trong lát cắt này</strong><span>Hãy chọn một vùng có phát sinh giá trị.</span></div>`;
  const products = productAggregates(rows).sort((a, b) => b.value - a.value);
  const warehouses = Object.entries(groupRows(rows, "warehouse")).map(([name, items]) => ({ label: name, value: sum(items, "value") })).sort((a, b) => b.value - a.value);
  const statuses = groupRows(rows, "status");
  const ages = groupRows(rows, "ageBucket");
  const issueRows = rows.filter(row => row.status === "Hàng lỗi / hư");
  return `<section class="analysis-summary"><div><span>Lát cắt đang phân tích</span><strong>${dimensionTitle(context)}</strong></div><div><span>Phạm vi bộ lọc</span><strong>${formatNumber(rows.length)} block · ${formatNumber(products.length)} sản phẩm</strong></div></section>
    <section class="kpi-grid detail-kpis">
      ${kpiCard("Sản phẩm trong nhóm", formatNumber(products.length), `${formatNumber(rows.length)} block liên quan`, "box", "brand")}
      ${kpiCard("Giá trị trong nhóm", formatMoney(sum(rows, "value"), true), `${formatNumber(sum(rows, "value") / Math.max(sum(state.filtered, "value"), 1) * 100, 1)}% phạm vi hiện tại`, "money", "success")}
      ${kpiCard("Thể tích", `${formatNumber(sum(rows, "volumeStock"), 1)} m³`, `Bình quân ${formatNumber(sum(rows, "volumeStock") / Math.max(rows.length, 1), 2)} m³/block`, "volume", "info")}
      ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, `${formatNumber(rows.filter(row => row.ageDays > 90).length)} block trên 90 ngày`, "clock", "warning")}
    </section>
    <div class="dashboard-grid equal">
      ${panel("Sản phẩm bên trong lát cắt", "Chọn sản phẩm để mở tiếp hồ sơ chi tiết", barChart(products.slice(0, 10).map(product => ({ label: `${product.sku} · ${product.product}`, value: product.value, sku: product.sku }))))}
      ${panel("Phân bổ theo kho", "Giá trị hiện diện tại từng kho", barChart(warehouses, value => formatMoney(value, true), "#3568A8"))}
    </div>
    <div class="dashboard-grid equal">
      ${panel("Cơ cấu trạng thái", "Tỷ trọng giá trị trong lát cắt", stackedChart(statuses, "value", ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"]))}
      ${panel("Cơ cấu tuổi tồn", "Phân bố giá trị theo nhóm tuổi", stackedChart(ages, "value", ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày"]))}
    </div>
    ${productTable(products.slice(0, 50))}
    ${detailTable([...rows].sort((a,b) => b.value - a.value).slice(0, 80), `Chi tiết ${Math.min(rows.length, 80)} / ${rows.length} block trong lát cắt`)}
  `;
}

function agingPage(rows) {
  const order = ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"];
  const groups = groupRows(rows, "ageBucket");
  const items = order.filter(name => groups[name]?.length).map(name => ({ name, rows: groups[name], value: sum(groups[name], "value"), blocks: sum(groups[name], "qtyStock"), volume: sum(groups[name], "volumeStock") }));
  const oldest = [...rows].filter(r => Number.isFinite(r.ageDays)).sort((a, b) => b.ageDays - a.ageDays).slice(0, 12);
  return `<section class="kpi-grid">
    ${kpiCard("Tuổi tồn bình quân", `${formatNumber(weightedAge(rows), 0)} ngày`, "Trung bình theo block", "clock", "info")}
    ${kpiCard("Block trên 90 ngày", formatNumber(rows.filter(r => r.ageDays > 90).length), `${formatNumber(rows.filter(r => r.ageDays > 90).length / Math.max(rows.length, 1) * 100, 1)}% tổng số block`, "hourglass", "warning")}
    ${kpiCard("Giá trị trên 180 ngày", formatMoney(sum(rows.filter(r => r.ageDays > 180), "value"), true), "Nhóm ưu tiên cao nhất", "money", "brand")}
    ${kpiCard("Block lâu nhất", `${formatNumber(Math.max(...rows.map(r => r.ageDays || 0)), 0)} ngày`, "Tính từ ngày nhập", "alert", "brand")}
  </section><div class="dashboard-grid equal">
    ${panel("Cơ cấu tuổi tồn theo giá trị", "Giá trị vốn trong từng nhóm tuổi", stackedChart(groups, "value", order))}
    ${panel("Số block theo nhóm tuổi", "Chọn nhóm tuổi để xem sản phẩm bên trong", barChart(items.map(item => ({ label: item.name, value: item.blocks, color: colors[item.name], drillType: "ageBucket", drillValue: item.name })), value => `${formatNumber(value)} block`))}
  </div><div class="dashboard-grid equal">
    ${panel("Bản đồ rủi ro sản phẩm", "Tuổi tồn, giá trị và thể tích trên cùng một mặt phẳng", scatterChart(rows))}
    ${panel("Tuổi tồn × trạng thái", "Đọc chính xác giá trị tại từng giao điểm", statusAgeHeatmap(rows))}
  </div>${detailTable(oldest, "12 block có tuổi tồn cao nhất")}`;
}

function statusPage(rows) {
  const order = ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"];
  const groups = groupRows(rows, "status");
  const items = order.filter(name => groups[name]?.length).map(name => ({ name, rows: groups[name], value: sum(groups[name], "value"), blocks: sum(groups[name], "qtyStock"), volume: sum(groups[name], "volumeStock"), age: weightedAge(groups[name]) }));
  const total = sum(rows, "value");
  return `<section class="kpi-grid">
    ${items.map((item, index) => kpiCard(item.name, formatMoney(item.value, true), `${formatNumber(item.blocks)} block · ${formatNumber(item.value / Math.max(total, 1) * 100, 1)}% giá trị`, index === 2 ? "alert" : index === 0 ? "box" : "money", index === 0 ? "success" : index === 1 ? "warning" : index === 2 ? "brand" : "info")).join("")}
  </section><div class="dashboard-grid equal">
    ${panel("Giá trị theo trạng thái", "Mức vốn của từng mục đích và tình trạng", stackedChart(groups, "value", order))}
    ${panel("Tuổi tồn bình quân theo trạng thái", "Chọn trạng thái để xem sản phẩm bên trong", barChart(items.map(item => ({ label: item.name, value: item.age, color: colors[item.name], drillType: "status", drillValue: item.name })), value => `${formatNumber(value, 0)} ngày`))}
  </div><div class="dashboard-grid equal">
    ${panel("Ma trận trạng thái – tuổi tồn", "Vùng màu đậm đại diện cho giá trị vốn lớn hơn", statusAgeHeatmap(rows))}
    ${panel("Xu hướng thời điểm nhập", "Giá trị hàng đang tồn theo tháng phát sinh", monthlyTrend(rows))}
  </div>${statusTable(items)}`;
}

function statusTable(items) {
  return panel("Tổng hợp trạng thái", "Tình trạng lỗi được ưu tiên khi phân loại", `<div class="table-wrap"><table><thead><tr><th>Trạng thái</th><th>Block</th><th>Thể tích</th><th>Giá trị</th><th>Tuổi TB</th><th>Tỷ lệ giá trị</th></tr></thead><tbody>${items.map(item => `<tr><td>${badge(item.name)}</td><td class="numeric">${formatNumber(item.blocks)}</td><td class="numeric">${formatNumber(item.volume, 1)} m³</td><td class="numeric">${formatMoney(item.value)}</td><td class="numeric">${formatNumber(item.age, 0)} ngày</td><td class="numeric">${formatNumber(item.value / Math.max(sum(state.filtered, "value"), 1) * 100, 1)}%</td></tr>`).join("")}</tbody></table></div>`, "", "table-panel section-gap");
}

function alertsPage(rows) {
  const critical = rows.filter(r => r.ageDays > 180 || r.status === "Hàng lỗi / hư");
  const old = rows.filter(r => r.ageDays > 90 && r.ageDays <= 180);
  const unknown = rows.filter(r => r.status === "Chưa xác định");
  const duplicates = rows.filter((row, _, all) => row.barcode && all.findIndex(r => r.barcode === row.barcode) !== all.findLastIndex(r => r.barcode === row.barcode));
  return `<section class="kpi-grid">
    ${kpiCard("Ưu tiên cao", formatNumber(critical.length), `${formatMoney(sum(critical, "value"), true)} giá trị ảnh hưởng`, "alert", "brand")}
    ${kpiCard("Cần theo dõi", formatNumber(old.length), "Tồn từ 91 đến 180 ngày", "hourglass", "warning")}
    ${kpiCard("Thiếu phân loại", formatNumber(unknown.length), "Chưa xác định mục đích nhập", "status", "info")}
    ${kpiCard("Barcode trùng", formatNumber(new Set(duplicates.map(r => r.barcode)).size), "Cần kiểm tra chất lượng dữ liệu", "table", "brand")}
  </section><div class="dashboard-grid equal">${panel("Phễu rủi ro vốn tồn kho", "Thu hẹp từ tổng vốn đến nhóm cần xử lý", riskFunnel(rows))}${panel("Ma trận vùng rủi ro", "Kết hợp tuổi tồn với mục đích và chất lượng", statusAgeHeatmap(rows))}</div>${panel("Danh mục cảnh báo điều hành", "Mức độ được xác định từ tuổi tồn, chất lượng và tính đầy đủ dữ liệu", `<div class="insight-list">
    <div class="insight-card"><span class="insight-line" style="--insight-color:var(--danger)"></span><div><h3>Tồn trên 180 ngày</h3><p>Khuyến nghị xác định khả năng sử dụng, tái phân bổ hoặc xử lý</p></div><span class="insight-value">${formatMoney(sum(rows.filter(r => r.ageDays > 180), "value"), true)}</span></div>
    <div class="insight-card"><span class="insight-line" style="--insight-color:var(--danger)"></span><div><h3>Hàng lỗi / hư</h3><p>Khuyến nghị đánh giá chất lượng và khả năng thu hồi giá trị</p></div><span class="insight-value">${formatMoney(sum(rows.filter(r => r.status === "Hàng lỗi / hư"), "value"), true)}</span></div>
    <div class="insight-card"><span class="insight-line" style="--insight-color:var(--warning)"></span><div><h3>Sản xuất dư</h3><p>Khuyến nghị đối chiếu nhu cầu và kế hoạch sử dụng gần nhất</p></div><span class="insight-value">${formatMoney(sum(rows.filter(r => r.status === "Sản xuất dư"), "value"), true)}</span></div>
    <div class="insight-card"><span class="insight-line" style="--insight-color:var(--muted)"></span><div><h3>Chưa xác định mục đích</h3><p>Khuyến nghị bổ sung lý do nhập trước kỳ báo cáo tiếp theo</p></div><span class="insight-value">${formatMoney(sum(unknown, "value"), true)}</span></div>
  </div>`)}${detailTable(critical.sort((a, b) => b.value - a.value).slice(0, 20), "20 block ưu tiên xử lý")}`;
}

function detailsPage(rows) {
  return detailTable(rows.slice().sort((a, b) => b.value - a.value).slice(0, 100), `Hiển thị ${Math.min(rows.length, 100)} / ${rows.length} block theo bộ lọc`);
}

function detailTable(rows, title) {
  return panel(title, "Chọn tên sản phẩm để mở phân tích chi tiết", rows.length ? `<div class="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Barcode</th><th>Kho</th><th>Ngày nhập</th><th>Tuổi tồn</th><th>Trạng thái</th><th>Tình trạng</th><th>Thể tích</th><th>Giá trị</th></tr></thead><tbody>${rows.map(r => `<tr><td><button class="product-cell product-link" data-product-sku="${r.sku}" aria-label="Mở phân tích ${r.sku} ${r.product}"><strong>${r.product}</strong><span>${r.sku}</span></button></td><td>${r.barcode}</td><td>${r.warehouse}</td><td>${formatDate(r.receivedAt)}</td><td>${badge(r.ageBucket)}</td><td>${badge(r.status)}</td><td>${r.condition}</td><td class="numeric">${formatNumber(r.volumeStock, 3)} m³</td><td class="numeric">${formatMoney(r.value)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><strong>Không có dữ liệu phù hợp</strong><span>Hãy thay đổi hoặc xóa bộ lọc hiện tại.</span></div>`, "", "table-panel section-gap");
}

function renderPage() {
  const config = pageConfig[state.page];
  document.getElementById("top-title").textContent = config.label;
  document.getElementById("page-kicker").textContent = config.kicker;
  document.getElementById("page-title").textContent = config.title;
  document.getElementById("page-description").textContent = config.description;
  document.querySelectorAll(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.page === state.page));
  const scope = Object.values(state.filters).filter(v => v !== "all").length;
  document.getElementById("scope-text").textContent = scope ? `${formatNumber(state.filtered.length)} block theo bộ lọc` : "Toàn bộ dữ liệu";
  const content = document.getElementById("page-content");
  document.querySelector(".filter-bar").hidden = false;
  document.querySelector(".scope-badge").hidden = false;
  if (!state.filtered.length) {
    content.innerHTML = `<div class="panel empty-state"><strong>Không có dữ liệu phù hợp</strong><span>Hãy thay đổi hoặc xóa bộ lọc hiện tại.</span></div>`;
    return;
  }
  const renderers = { overview: overviewPage, warehouse: warehousePage, product: productPage, aging: agingPage, status: statusPage, alerts: alertsPage, details: detailsPage };
  content.innerHTML = renderers[state.page](state.filtered);
  enhanceSortableTables(content);
  content.classList.remove("page-enter");
  void content.offsetWidth;
  content.classList.add("page-enter");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyFilters() {
  state.filtered = state.records.filter(row =>
    (state.filters.warehouse === "all" || row.warehouse === state.filters.warehouse) &&
    (state.filters.product === "all" || row.sku === state.filters.product) &&
    (state.filters.age === "all" || row.ageBucket === state.filters.age) &&
    (state.filters.status === "all" || row.status === state.filters.status)
  );
  renderPage();
}

function buildSelect(id, values, allLabel, labeler = value => value) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="all">${allLabel}</option>${values.map(value => `<option value="${value}">${labeler(value)}</option>`).join("")}`;
  select.addEventListener("change", event => {
    const key = id.replace("-filter", "");
    state.filters[key] = event.target.value;
    applyFilters();
  });
}

function buildNavigation() {
  document.getElementById("nav-list").innerHTML = Object.entries(pageConfig).map(([key, page]) => `<button class="nav-button ${key === state.page ? "active" : ""}" data-page="${key}">${icons[page.icon]}<span>${page.label}</span></button>`).join("");
  document.getElementById("nav-list").addEventListener("click", event => {
    const button = event.target.closest(".nav-button");
    if (!button) return;
    state.page = button.dataset.page;
    state.selectedSku = null;
    history.replaceState(null, "", `#${state.page}`);
    closeMenu();
    renderPage();
  });
}

function closeMenu() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("mobile-scrim").classList.remove("show");
  document.getElementById("menu-button").setAttribute("aria-expanded", "false");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 3500);
}

function renderAnalysisModal({ kicker, title, subtitle, body }) {
  const modal = document.getElementById("product-modal");
  if (modal.hidden) state.modalTrigger = document.activeElement;
  document.querySelector(".analysis-kicker").textContent = kicker;
  document.getElementById("product-modal-title").textContent = title;
  document.getElementById("product-modal-subtitle").textContent = subtitle;
  const modalBody = document.getElementById("product-modal-body");
  modalBody.innerHTML = body;
  enhanceSortableTables(modalBody);
  modalBody.scrollTop = 0;
  modalBody.classList.remove("page-enter");
  void modalBody.offsetWidth;
  modalBody.classList.add("page-enter");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => {
    modal.classList.add("show");
    document.getElementById("product-modal-close").focus();
  });
}

function openProductModal(sku) {
  const previousContext = state.modalContext?.type === "dimension" ? state.modalContext : null;
  const scopeContext = previousContext?.context || null;
  const rows = filterByDimension(state.filtered.filter(row => row.sku === sku), scopeContext || {});
  if (!rows.length) {
    showToast("Không có dữ liệu sản phẩm trong phạm vi bộ lọc hiện tại.");
    return;
  }
  state.selectedSku = sku;
  state.previousModalContext = previousContext;
  state.modalContext = { type: "product", sku, scopeContext };
  const back = previousContext ? `<button class="modal-back" id="modal-analysis-back">← Quay lại ${dimensionTitle(previousContext.context)}</button>` : "";
  renderAnalysisModal({
    kicker: "Sản phẩm",
    title: `${sku} · ${rows[0].product}`,
    subtitle: `Phân tích ${formatNumber(rows.length)} block ${scopeContext ? `trong lát cắt ${dimensionTitle(scopeContext)}` : "trong phạm vi bộ lọc hiện tại"}`,
    body: `${back}${productDetailPage(sku, scopeContext)}`,
  });
}

function openDimensionModal(context) {
  const rows = filterByDimension(state.filtered, context);
  if (!rows.length) {
    showToast("Không có dữ liệu trong lát cắt này.");
    return;
  }
  state.selectedSku = null;
  state.previousModalContext = null;
  state.modalContext = { type: "dimension", context };
  renderAnalysisModal({
    kicker: "Phân tích đa chiều",
    title: dimensionTitle(context),
    subtitle: `${formatNumber(rows.length)} block · ${formatNumber(new Set(rows.map(row => row.sku)).size)} sản phẩm trong phạm vi hiện tại`,
    body: dimensionDetailPage(context),
  });
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
  setTimeout(() => {
    modal.hidden = true;
    document.getElementById("product-modal-body").innerHTML = "";
    state.selectedSku = null;
    state.modalContext = null;
    state.previousModalContext = null;
    state.modalTrigger?.focus?.();
  }, 180);
}

function exportCsv() {
  const headers = ["Mã", "Tên", "Barcode", "Kho", "Ngày nhập", "Tuổi tồn", "Nhóm tuổi", "Trạng thái", "Tình trạng", "Tồn (pcs)", "Tồn (m3)", "Giá trị"];
  const values = state.filtered.map(r => [r.sku, r.product, r.barcode, r.warehouse, r.receivedAt || "", r.ageDays ?? "", r.ageBucket, r.status, r.condition, r.qtyStock, r.volumeStock, r.value]);
  const csv = [headers, ...values].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `havas-ton-kho-${state.reportDate}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`Đã xuất ${formatNumber(state.filtered.length)} dòng dữ liệu.`);
}

async function init() {
  try {
    const response = await fetch("data/inventory.json");
    if (!response.ok) throw new Error("Không thể tải dữ liệu");
    state.data = await response.json();
    state.records = state.data.records;
    state.filtered = state.records;
    state.reportDate = state.data.meta.reportDate;
    document.getElementById("report-date").value = state.reportDate;
    document.getElementById("sync-time").textContent = `Nguồn: ${state.data.meta.source}`;
    const [hashPage, hashSku] = location.hash.slice(1).split("/");
    if (pageConfig[hashPage]) state.page = hashPage;
    if (hashPage === "product" && hashSku) state.selectedSku = decodeURIComponent(hashSku);
    buildNavigation();
    buildSelect("warehouse-filter", unique(state.records.map(r => r.warehouse)), "Tất cả kho");
    buildSelect("product-filter", unique(state.records.map(r => r.sku)), "Tất cả sản phẩm", sku => `${sku} · ${state.records.find(r => r.sku === sku)?.product || ""}`);
    buildSelect("age-filter", ["0–7 ngày", "8–30 ngày", "31–60 ngày", "61–90 ngày", "91–180 ngày", ">180 ngày", "Thiếu ngày nhập"], "Tất cả nhóm tuổi");
    buildSelect("status-filter", ["Theo đơn hàng", "Sản xuất dư", "Hàng lỗi / hư", "Chưa xác định"], "Tất cả trạng thái");
    renderPage();
    if (hashPage === "product" && hashSku) openProductModal(decodeURIComponent(hashSku));
  } catch (error) {
    document.getElementById("page-content").innerHTML = `<div class="panel empty-state"><strong>Không tải được dữ liệu</strong><span>Hãy chạy Live Preview hoặc một local server, sau đó tải lại trang.</span></div>`;
    console.error(error);
  }
}

document.getElementById("clear-filters").addEventListener("click", () => {
  state.filters = { warehouse: "all", product: "all", age: "all", status: "all" };
  document.querySelectorAll(".filter-bar select").forEach(select => select.value = "all");
  applyFilters();
  showToast("Đã xóa toàn bộ bộ lọc.");
});
document.getElementById("export-button").addEventListener("click", exportCsv);
document.getElementById("menu-button").addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  const open = sidebar.classList.toggle("open");
  document.getElementById("mobile-scrim").classList.toggle("show", open);
  document.getElementById("menu-button").setAttribute("aria-expanded", String(open));
});
document.getElementById("mobile-scrim").addEventListener("click", closeMenu);
document.getElementById("report-date").addEventListener("change", event => {
  showToast(`Ngày báo cáo hiển thị: ${formatDate(event.target.value)}. Tuổi tồn đang theo ngày dữ liệu gốc.`);
});
window.addEventListener("hashchange", () => {
  const [page, sku] = location.hash.slice(1).split("/");
  if (pageConfig[page]) { state.page = page; renderPage(); if (page === "product" && sku) openProductModal(decodeURIComponent(sku)); }
});

function handleAnalysisClick(event) {
  if (event.target.closest("#modal-analysis-back") && state.previousModalContext) {
    openDimensionModal(state.previousModalContext.context);
    return;
  }
  const productTarget = event.target.closest("[data-product-sku]");
  if (productTarget) {
    openProductModal(productTarget.dataset.productSku);
    return;
  }
  const heatCell = event.target.closest("[data-drill-age][data-drill-status]");
  if (heatCell) {
    const base = state.modalContext?.type === "product" ? { sku: state.modalContext.sku } : state.modalContext?.type === "dimension" ? state.modalContext.context : {};
    openDimensionModal({ ...base, ageBucket: heatCell.dataset.drillAge, status: heatCell.dataset.drillStatus });
    return;
  }
  const dimensionTarget = event.target.closest("[data-drill-type][data-drill-value]");
  if (dimensionTarget?.dataset.drillType) {
    const base = state.modalContext?.type === "product" ? { sku: state.modalContext.sku } : state.modalContext?.type === "dimension" ? state.modalContext.context : {};
    openDimensionModal({ ...base, [dimensionTarget.dataset.drillType]: dimensionTarget.dataset.drillValue });
  }
}

function handleAnalysisKeydown(event) {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-product-sku], [data-drill-type], [data-drill-age]")) {
    event.preventDefault();
    event.target.click();
  }
}

document.getElementById("page-content").addEventListener("click", handleAnalysisClick);
document.getElementById("page-content").addEventListener("keydown", handleAnalysisKeydown);
document.getElementById("product-modal-body").addEventListener("click", handleAnalysisClick);
document.getElementById("product-modal-body").addEventListener("keydown", handleAnalysisKeydown);
document.getElementById("product-modal-close").addEventListener("click", closeProductModal);
document.getElementById("product-modal").addEventListener("click", event => {
  if (event.target.id === "product-modal") closeProductModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.getElementById("product-modal").hidden) closeProductModal();
});

init();
