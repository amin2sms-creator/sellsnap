"use strict";

const APP_VERSION = "v22";
const WALLET_ADDRESS = "TPAp56PvAJiKCoGv5M6F1ykmGLbW7AuJyg";
const CBE_ACCOUNT = "1000184706591";
const PROOF_EMAIL = "amin2sms@gmail.com";
const TELEGRAM_USERNAME = "usersmind";
const DEFAULT_PRODUCT_IMAGE = "assets/product-earbuds.png";
const STORAGE_KEY = "sellsnap-state-v1";
const DEVICE_KEY = "sellsnap-device-v1";
const LICENSE_KEY = "sellsnap-license-v1";
const APP_ID = "sellsnap-studio";
const PLANS = {
  monthly: {
    id: "monthly",
    label: "30 days Pro",
    shortLabel: "30 days",
    amount: 5,
    unit: "USDT",
    etAmount: 99,
    etUnit: "Birr",
    durationDays: 30
  },
  yearly: {
    id: "yearly",
    label: "1 year Pro",
    shortLabel: "1 year",
    amount: 24,
    unit: "USDT",
    etAmount: 499,
    etUnit: "Birr",
    durationDays: 365
  },
  lifetime: {
    id: "lifetime",
    label: "Lifetime Pro",
    shortLabel: "Lifetime",
    amount: 59,
    unit: "USDT",
    etAmount: 1499,
    etUnit: "Birr",
    durationDays: null
  }
};
const FREE_TEMPLATE = "market";
const FREE_TEMPLATES = ["market", "luxe", "pulse"];
const TEMPLATE_IDS = [
  "market", "luxe", "pulse", "clean", "mono", "social", "urban", "minimal", "retro", "bold",
  "fresh", "gallery", "royal", "neon", "sunrise", "coffee", "tech", "boutique", "harar", "addis",
  "rift", "habesha", "jewelry", "sport", "cosmetic"
];

// Color system - must be defined before generateColors is called
const BASE_COLORS = [
  "#12b981", "#2563eb", "#7c3aed", "#db2777", "#ef4444",
  "#f59e0b", "#06b6d4", "#111827", "#8b5cf6", "#f97316",
  "#14b8a6", "#84cc16", "#ec4899", "#6366f1", "#14b8a6",
  "#f43f5e", "#8b5cf6", "#06b6d4", "#84cc16", "#f59e0b"
];

const COLOR_NAMES = [
  "Emerald", "Blue", "Violet", "Pink", "Red",
  "Amber", "Cyan", "Ink", "Purple", "Orange",
  "Teal", "Lime", "Rose", "Indigo", "Mint",
  "Coral", "Lavender", "Sky", "Lime", "Gold"
];

function generateColors(count) {
  const colors = [];
  const usedHues = new Set();
  const usedSaturation = new Set();
  
  // Start with base colors - ensure they're all unique
  BASE_COLORS.forEach((color, i) => {
    if (colors.some((item) => item.hex.toLowerCase() === color.toLowerCase())) return;
    colors.push({ hex: color, name: COLOR_NAMES[i] || `Color ${i + 1}` });
    const hsl = hexToHSL(color);
    if (hsl) {
      usedHues.add(Math.round(hsl.h / 10) * 10); // Group by 10-degree segments
      usedSaturation.add(Math.round(hsl.s / 10) * 10);
    }
  });
  
  // Generate additional colors using HSL with better distribution
  const hueSteps = 24; // Divide color wheel into 24 segments
  const hueStep = 360 / hueSteps;
  let hueIndex = 0;
  let attempts = 0;
  
  while (colors.length < count && attempts < count * 5) {
    attempts++;
    
    // Cycle through hue segments systematically
    const baseHue = (hueIndex * hueStep) % 360;
    hueIndex++;
    
    // Add some randomness within the segment
    const h = (baseHue + Math.floor(Math.random() * hueStep * 0.8)) % 360;
    const s = 55 + Math.floor(Math.random() * 35); // 55-90% saturation for vibrant colors
    const l = 40 + Math.floor(Math.random() * 30); // 40-70% lightness
    
    // Check if this hue segment is already well-represented
    const hueKey = Math.round(h / 10) * 10;
    const satKey = Math.round(s / 10) * 10;
    
    // Skip if we already have too many colors in this hue/saturation range
    const existingInRange = colors.filter(c => {
      const hsl = hexToHSL(c.hex);
      if (!hsl) return false;
      const cHue = Math.round(hsl.h / 15) * 15;
      const cSat = Math.round(hsl.s / 15) * 15;
      return Math.abs(cHue - hueKey) < 15 && Math.abs(cSat - satKey) < 15;
    }).length;
    
    if (existingInRange > 3 && Math.random() > 0.2) continue;
    
    const hex = hslToHex(h, s, l);
    const name = generateColorName(h, s, l);
    
    if (!colors.some(c => c.hex === hex)) {
      colors.push({ hex, name });
      usedHues.add(hueKey);
      usedSaturation.add(satKey);
    }
  }
  
  // Shuffle the colors for variety
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  
  return colors.slice(0, count);
}

function hexToHSL(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateColorName(h, s, l) {
  const hueNames = [
    [0, "Red"], [30, "Orange"], [60, "Yellow"], [90, "Lime"],
    [120, "Green"], [150, "Mint"], [180, "Cyan"], [210, "Sky"],
    [240, "Blue"], [270, "Purple"], [300, "Pink"], [330, "Rose"], [360, "Red"]
  ];
  
  let hueName = "Color";
  for (const [threshold, name] of hueNames) {
    if (h < threshold) { hueName = name; break; }
  }
  
  if (s < 30) return `Gray-${l > 50 ? "Light" : "Dark"}`;
  if (l < 30) return `Dark ${hueName}`;
  if (l > 70) return `Light ${hueName}`;
  return hueName;
}

const ALL_COLORS = generateColors(120);
const COLORS_PER_PAGE = 24;
let currentColorPage = 0;

function createColorButton(color, index) {
  const button = document.createElement("button");
  button.className = "color-dot";
  button.dataset.color = color.hex;
  button.style.setProperty("--dot", color.hex);
  button.type = "button";
  button.title = color.name;
  button.addEventListener("click", () => {
    state.accent = color.hex;
    state.designVisited = true;
    saveState();
    setActiveColor();
    drawPoster();
  });
  return button;
}

function loadMoreColors() {
  const row = document.getElementById("colorRow");
  if (!row) return;
  const start = row.querySelectorAll("[data-color]").length;
  const end = Math.min(start + COLORS_PER_PAGE, ALL_COLORS.length);

  for (let i = start; i < end; i++) {
    const button = createColorButton(ALL_COLORS[i], i);
    row.appendChild(button);
  }

  currentColorPage = Math.ceil(end / COLORS_PER_PAGE);
  setActiveColor();

  const loadMoreBtn = document.getElementById("loadMoreColors");
  if (loadMoreBtn && end >= ALL_COLORS.length) {
    loadMoreBtn.style.display = "none";
  }
}

// Amazing features
function magicRemix() {
  // Random template
  const randomTemplate = ALL_TEMPLATE_IDS[Math.floor(Math.random() * ALL_TEMPLATE_IDS.length)];
  state.template = randomTemplate;
  
  // Random color
  const randomColor = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
  state.accent = randomColor.hex;
  
  // Random sticker
  const stickers = ["none", "spark", "sale", "hearts", "confetti", "stars", "lightning", "fire", "snow", "music", "crown", "trophy", "rocket", "diamond", "flame", "burst", "arrow", "check", "starburst", "snowflake", "wave"];
  state.sticker = stickers[Math.floor(Math.random() * stickers.length)];
  
  // Random pattern
  const patterns = ["dots", "stripes", "grid", "waves", "circles", "triangles", "hexagons", "diamonds", "crosshatch", "zigzag"];
  state.pattern = Math.random() > 0.5;
  state.patternType = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Random banner
  const banners = ["ribbon", "pill", "corner", "band", "arc", "wave", "slash", "badge"];
  state.bannerStyle = banners[Math.floor(Math.random() * banners.length)];
  state.bannerPosition = ["top", "right", "bottom", "left"][Math.floor(Math.random() * 4)];
  
  // Random alignment
  const alignments = ["left", "center", "right"];
  state.textAlignment = alignments[Math.floor(Math.random() * alignments.length)];
  
  state.designVisited = true;
  saveState();
  hydrateControls();
  updateProofContact();
  drawPoster();
  showToast("Magic remix applied!");
}

// Canvas drag and drop
let dragContext = null;

// Brush drawing
let currentStroke = null;
let brushStrokes = [];

function initStickerDrag() {
  const canvas = document.getElementById("posterCanvas");
  
  canvas.addEventListener("mousedown", handleDragStart);
  canvas.addEventListener("mousemove", handleDragMove);
  canvas.addEventListener("mouseup", handleDragEnd);
  canvas.addEventListener("mouseleave", handleDragEnd);
  
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleDragEnd);
  canvas.addEventListener("touchstart", handlePinchStart, { passive: false });
  canvas.addEventListener("touchmove", handlePinchMove, { passive: false });
  canvas.addEventListener("touchend", handlePinchEnd);
}

// Pinch-to-zoom handlers
function handlePinchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    pinchState = {
      startDistance: dist,
      startZoom: state.zoom || 1,
      startImagePanX: state.imagePanX || 0,
      startImagePanY: state.imagePanY || 0
    };
  }
}

function handlePinchMove(e) {
  if (e.touches.length === 2 && pinchState) {
    e.preventDefault();
    const [t1, t2] = e.touches;
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const scale = dist / pinchState.startDistance;
    const newZoom = Math.max(1, Math.min(2.2, pinchState.startZoom * scale));
    
    state.zoom = newZoom;
    if (elements.zoomInput) {
      elements.zoomInput.value = newZoom;
    }
    drawPoster();
  }
}

function handlePinchEnd() {
  if (pinchState) {
    saveState();
    pinchState = null;
  }
}

function initBrush() {
  const canvas = document.getElementById("posterCanvas");
  
  canvas.addEventListener("mousedown", handleBrushStart);
  canvas.addEventListener("mousemove", handleBrushMove);
  canvas.addEventListener("mouseup", handleBrushEnd);
  canvas.addEventListener("mouseleave", handleBrushEnd);
  
  canvas.addEventListener("touchstart", handleBrushTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleBrushTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleBrushEnd);
}

function handleBrushStart(e) {
  if (state.brushMode === "none") return;
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  currentStroke = {
    mode: state.brushMode,
    size: state.brushSize || 8,
    color: state.brushColor || "#ffffff",
    points: [{ x, y }]
  };
  brushStrokes.push(currentStroke);
  drawPoster();
}

function handleBrushTouchStart(e) {
  if (state.brushMode === "none") return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = e.target.getBoundingClientRect();
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  
  currentStroke = {
    mode: state.brushMode,
    size: state.brushSize || 8,
    color: state.brushColor || "#ffffff",
    points: [{ x, y }]
  };
  brushStrokes.push(currentStroke);
  drawPoster();
}

function handleBrushMove(e) {
  if (!currentStroke) return;
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  currentStroke.points.push({ x, y });
  drawPoster();
}

function handleBrushTouchMove(e) {
  if (!currentStroke) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = e.target.getBoundingClientRect();
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
  currentStroke.points.push({ x, y });
  drawPoster();
}

function handleBrushEnd() {
  currentStroke = null;
  state.brushStrokes = brushStrokes;
  saveState();
}

function getCanvasPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const point = e.touches ? e.touches[0] : e;
  return {
    x: (point.clientX - rect.left) * (canvas.width / rect.width),
    y: (point.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function isOverImageBox(point) {
  return pointInRect(point, getImageBox());
}

function isOverTextArea(point) {
  return point.y < 260 || point.y > canvas.height - 120 || (point.y > 880 && point.y < 1040);
}

function getHeaderBounds() {
  const W = canvas.width;
  const headerBounds = state.template === "gallery"
    ? { x: 164, w: W - 220 }
    : { x: 54, w: W - 108 };
  return {
    x: headerBounds.x + Number(state.headerPanX || 0),
    y: 44 + Number(state.headerPanY || 0),
    w: headerBounds.w,
    h: 96
  };
}

function getProductNameBounds() {
  const W = canvas.width;
  const nameY = {
    clean: 970,
    minimal: 930,
    gallery: 930,
    retro: 940,
    bold: 940,
    fresh: 944
  }[state.template] || 948;
  return {
    x: 56 + Number(state.productPanX || 0),
    y: nameY - 120 + Number(state.productPanY || 0),
    w: W - 112,
    h: 220
  };
}

function unionRect(rects) {
  if (!rects.length) return { x: 0, y: 0, w: 0, h: 0 };
  const x1 = Math.min(...rects.map((rect) => rect.x));
  const y1 = Math.min(...rects.map((rect) => rect.y));
  const x2 = Math.max(...rects.map((rect) => rect.x + rect.w));
  const y2 = Math.max(...rects.map((rect) => rect.y + rect.h));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function getStickerBounds() {
  const W = canvas.width;
  const H = canvas.height;
  if (!state.sticker || state.sticker === "none") return { x: 0, y: 0, w: 0, h: 0 };

  if (state.sticker === "spark") {
    return { x: 40, y: 180, w: W - 80, h: H - 340 };
  }

  if (state.sticker === "sale") {
    return unionRect([
      { x: 86, y: 882, w: 174, h: 70 },
      { x: W - 246, y: 218, w: 168, h: 68 }
    ]);
  }

  if (state.sticker === "hearts") {
    return unionRect([
      { x: 116, y: H - 376, w: 84, h: 84 },
      { x: W - 122, y: 238, w: 68, h: 68 },
      { x: W - 182, y: 875, w: 48, h: 48 }
    ]);
  }

  if (state.sticker === "confetti") {
    return { x: 0, y: 140, w: W, h: H - 120 };
  }

  if (state.sticker === "stars") {
    return { x: 70, y: 180, w: W - 140, h: H - 360 };
  }

  if (state.sticker === "lightning") {
    return { x: W * 0.2, y: 160, w: W * 0.7, h: 660 };
  }

  return { x: 0, y: 0, w: W, h: H };
}

function getPriceBounds() {
  const W = canvas.width;
  const H = canvas.height;
  const priceBox = getPriceBox(W);
  const priceY = H - 170;
  return {
    x: priceBox.x + Number(state.pricePanX || 0),
    y: priceY - 110 + Number(state.pricePanY || 0),
    w: priceBox.w,
    h: 180
  };
}

function getFooterBounds() {
  const W = canvas.width;
  const H = canvas.height;
  return {
    x: 56 + Number(state.footerPanX || 0),
    y: H - 98 + Number(state.footerPanY || 0),
    w: W - 112,
    h: 100
  };
}

function getTimerBounds() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  const timerText = `⏰ ${state.discountTimer || ""}`;
  const timerWidth = ctx.measureText(timerText).width + 40;
  ctx.restore();
  return {
    x: (W - timerWidth) / 2 + Number(state.timerPanX || 0),
    y: H - 148 + Number(state.timerPanY || 0),
    w: timerWidth,
    h: 70
  };
}

function getShopInfoBounds() {
  const W = canvas.width;
  const H = canvas.height;
  return {
    x: 56 + Number(state.shopInfoPanX || 0),
    y: H - 108 + Number(state.shopInfoPanY || 0),
    w: W - 112,
    h: 60
  };
}

function getTextTargetAt(position) {
  if (pointInRect(position, getHeaderBounds())) return "header";
  if (pointInRect(position, getProductNameBounds())) return "product";
  if (pointInRect(position, getPriceBounds())) return "price";
  if (state.discountTimer && pointInRect(position, getTimerBounds())) return "timer";
  if ((state.shopRating || state.shopLocation) && pointInRect(position, getShopInfoBounds())) return "shopInfo";
  if (pointInRect(position, getFooterBounds())) return "footer";
  return null;
}

function handleDragStart(e) {
  const position = getCanvasPointerPos(e);

  const selectedTextTarget = getTextTargetAt(position);
  if (selectedTextTarget) {
    state.textColorTarget = selectedTextTarget;
    setActiveTextTarget();
    saveState();
  }

  if (pointInRect(position, getHeaderBounds())) {
    dragContext = {
      type: "header",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.headerPanX || 0),
      startOffsetY: Number(state.headerPanY || 0)
    };
    return;
  }

  if (pointInRect(position, getProductNameBounds())) {
    dragContext = {
      type: "product",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.productPanX || 0),
      startOffsetY: Number(state.productPanY || 0)
    };
    return;
  }

  if (pointInRect(position, getPriceBounds())) {
    dragContext = {
      type: "price",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.pricePanX || 0),
      startOffsetY: Number(state.pricePanY || 0)
    };
    return;
  }

  if (state.discountTimer && pointInRect(position, getTimerBounds())) {
    dragContext = {
      type: "timer",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.timerPanX || 0),
      startOffsetY: Number(state.timerPanY || 0)
    };
    return;
  }

  if ((state.shopRating || state.shopLocation) && pointInRect(position, getShopInfoBounds())) {
    dragContext = {
      type: "shopInfo",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.shopInfoPanX || 0),
      startOffsetY: Number(state.shopInfoPanY || 0)
    };
    return;
  }

  if (pointInRect(position, getFooterBounds())) {
    dragContext = {
      type: "footer",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.footerPanX || 0),
      startOffsetY: Number(state.footerPanY || 0)
    };
    return;
  }

  if (state.sticker && state.sticker !== "none") {
    const stickerRect = getStickerBounds();
    if (pointInRect(position, stickerRect)) {
      dragContext = {
        type: "sticker",
        startX: position.x,
        startY: position.y,
        startOffsetX: Number(state.stickerX || 0),
        startOffsetY: Number(state.stickerY || 0)
      };
      return;
    }
  }

  if (isOverImageBox(position)) {
    dragContext = {
      type: "image",
      startX: position.x,
      startY: position.y,
      startOffsetX: Number(state.imagePanX || 0),
      startOffsetY: Number(state.imagePanY || 0)
    };
    return;
  }
}

function handleTouchStart(e) {
  e.preventDefault();
  handleDragStart(e);
}

function handleDragMove(e) {
  if (!dragContext) return;
  const position = getCanvasPointerPos(e);
  const dx = position.x - dragContext.startX;
  const dy = position.y - dragContext.startY;
  const type = dragContext.type;

  if (type === "sticker") {
    state.stickerX = dragContext.startOffsetX + dx;
    state.stickerY = dragContext.startOffsetY + dy;
  } else if (type === "image") {
    state.imagePanX = dragContext.startOffsetX + dx;
    state.imagePanY = dragContext.startOffsetY + dy;
  } else if (["header", "product", "price", "footer", "timer", "shopInfo"].includes(type)) {
    state[`${type}PanX`] = dragContext.startOffsetX + dx;
    state[`${type}PanY`] = dragContext.startOffsetY + dy;
  }

  drawPoster();
}

function handleTouchMove(e) {
  e.preventDefault();
  handleDragMove(e);
}

function handleDragEnd() {
  if (dragContext) {
    saveState();
  }
  dragContext = null;
}

// Text effects
const TEXT_EFFECTS = {
  none: { glow: 0, shadow: 0, outline: 0 },
  glow: { glow: 20, shadow: 0, outline: 0 },
  shadow: { glow: 0, shadow: 10, outline: 0 },
  outline: { glow: 0, shadow: 0, outline: 3 },
  neon: { glow: 30, shadow: 15, outline: 0 },
  retro: { glow: 0, shadow: 0, outline: 2 }
};

const TEMPLATE_VARIATIONS = {
  market: ["gold", "silver", "rose", "midnight", "forest", "arctic", "desert", "jungle", "ocean", "savanna"],
  luxe: ["rose", "ember", "frost", "aurora", "onyx", "platinum", "titanium", "copper", "bronze", "chrome"],
  pulse: ["sunset", "ocean", "forest", "fire", "ice", "neon", "ultra", "mega", "turbo", "hyper"],
  clean: ["slate", "pearl", "ash", "mist", "cloud", "ivory", "porcelain", "marble", "quartz", "crystal"],
  mono: ["charcoal", "slate", "ink", "graphite", "obsidian", "ebony", "ivory", "pearl", "ash", "smoke"],
  social: ["coral", "mint", "lime", "peach", "sky", "viral", "trending", "popular", "hot", "buzz"],
  urban: ["asphalt", "concrete", "steel", "rust", "graphite", "metro", "downtown", "city", "street", "block"],
  minimal: ["linen", "silk", "cotton", "wool", "jute", "zen", "pure", "simple", "clean", "basic"],
  retro: ["vintage", "classic", "nostalgia", "antique", "heritage", "funk", "groove", "disco", "mod", "pop"],
  bold: ["crimson", "vermillion", "scarlet", "ruby", "garnet", "neon", "fluo", "acid", "electric", "volt"],
  fresh: ["mint", "seafoam", "basil", "eucalyptus", "aloe", "spring", "summer", "autumn", "winter", "monsoon"],
  gallery: ["museum", "studio", "exhibit", "showcase", "curated", "white", "black", "gray", "color", "mono"],
  royal: ["regal", "imperial", "majestic", "noble", "kingdom", "purple", "blue", "green", "red", "gold"],
  neon: ["cyber", "synth", "retro", "future", "glow", "pink", "blue", "green", "yellow", "orange"],
  sunrise: ["dawn", "aurora", "golden", "horizon", "twilight", "pink", "orange", "yellow", "red", "purple"],
  coffee: ["mocha", "espresso", "latte", "cappuccino", "americano", "dark", "light", "medium", "strong", "mild"],
  tech: ["circuit", "digital", "binary", "pixel", "data", "ai", "vr", "ar", "robot", "drone"],
  boutique: ["chic", "elegant", "stylish", "grace", "poised", "pink", "purple", "blue", "green", "yellow"],
  harar: ["ancient", "traditional", "cultural", "heritage", "timeless", "red", "green", "yellow", "blue", "orange"],
  addis: ["modern", "contemporary", "urban", "vibrant", "dynamic", "green", "yellow", "red", "blue", "white"],
  rift: ["valley", "escarpment", "highland", "plateau", "summit", "blue", "cyan", "teal", "aqua", "navy"],
  habesha: ["classic", "traditional", "cultural", "heritage", "timeless", "green", "yellow", "red", "gold", "white"],
  jewelry: ["gold", "silver", "platinum", "diamond", "pearl", "rose", "emerald", "sapphire", "ruby", "topaz"],
  sport: ["active", "energy", "power", "speed", "endurance", "football", "basketball", "tennis", "running", "gym"],
  cosmetic: ["glow", "radiant", "luminous", "bright", "shimmer", "pink", "red", "purple", "gold", "silver"]
};

function generateColors(count) {
  const colors = [];
  const usedHues = new Set();
  const usedSaturation = new Set();
  
  // Start with base colors - ensure they're all unique
  BASE_COLORS.forEach((color, i) => {
    if (colors.some((item) => item.hex.toLowerCase() === color.toLowerCase())) return;
    colors.push({ hex: color, name: COLOR_NAMES[i] || `Color ${i + 1}` });
    const hsl = hexToHSL(color);
    if (hsl) {
      usedHues.add(Math.round(hsl.h / 10) * 10); // Group by 10-degree segments
      usedSaturation.add(Math.round(hsl.s / 10) * 10);
    }
  });
  
  // Generate additional colors using HSL with better distribution
  const hueSteps = 24; // Divide color wheel into 24 segments
  const hueStep = 360 / hueSteps;
  let hueIndex = 0;
  let attempts = 0;
  
  while (colors.length < count && attempts < count * 5) {
    attempts++;
    
    // Cycle through hue segments systematically
    const baseHue = (hueIndex * hueStep) % 360;
    hueIndex++;
    
    // Add some randomness within the segment
    const h = (baseHue + Math.floor(Math.random() * hueStep * 0.8)) % 360;
    const s = 55 + Math.floor(Math.random() * 35); // 55-90% saturation for vibrant colors
    const l = 40 + Math.floor(Math.random() * 30); // 40-70% lightness
    
    // Check if this hue segment is already well-represented
    const hueKey = Math.round(h / 10) * 10;
    const satKey = Math.round(s / 10) * 10;
    
    // Skip if we already have too many colors in this hue/saturation range
    const existingInRange = colors.filter(c => {
      const hsl = hexToHSL(c.hex);
      if (!hsl) return false;
      const cHue = Math.round(hsl.h / 15) * 15;
      const cSat = Math.round(hsl.s / 15) * 15;
      return Math.abs(cHue - hueKey) < 15 && Math.abs(cSat - satKey) < 15;
    }).length;
    
    if (existingInRange > 3 && Math.random() > 0.2) continue;
    
    const hex = hslToHex(h, s, l);
    const name = generateColorName(h, s, l);
    
    if (!colors.some(c => c.hex === hex)) {
      colors.push({ hex, name });
      usedHues.add(hueKey);
      usedSaturation.add(satKey);
    }
  }
  
  // Shuffle the colors for variety
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  
  return colors.slice(0, count);
}

function hexToHSL(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateColorName(h, s, l) {
  const hueNames = [
    [0, "Red"], [30, "Orange"], [60, "Yellow"], [90, "Lime"],
    [120, "Green"], [150, "Mint"], [180, "Cyan"], [210, "Sky"],
    [240, "Blue"], [270, "Purple"], [300, "Pink"], [330, "Rose"], [360, "Red"]
  ];
  
  let hueName = "Color";
  for (const [threshold, name] of hueNames) {
    if (h < threshold) { hueName = name; break; }
  }
  
  if (s < 30) return `Gray-${l > 50 ? "Light" : "Dark"}`;
  if (l < 30) return `Dark ${hueName}`;
  if (l > 70) return `Light ${hueName}`;
  return hueName;
}

// Build full template list with variations
const ALL_TEMPLATE_IDS = [...TEMPLATE_IDS];
TEMPLATE_IDS.forEach((base) => {
  const variations = TEMPLATE_VARIATIONS[base] || [];
  variations.forEach((v) => ALL_TEMPLATE_IDS.push(`${base}-${v}`));
});
// Ensure we have 100+ templates
while (ALL_TEMPLATE_IDS.length < 120) {
  const base = TEMPLATE_IDS[ALL_TEMPLATE_IDS.length % TEMPLATE_IDS.length];
  const variations = TEMPLATE_VARIATIONS[base] || [];
  const v = variations[ALL_TEMPLATE_IDS.length % variations.length] || `v${ALL_TEMPLATE_IDS.length}`;
  if (!ALL_TEMPLATE_IDS.includes(`${base}-${v}`)) {
    ALL_TEMPLATE_IDS.push(`${base}-${v}`);
  }
}

const TEMPLATES_PER_PAGE = 24;
let currentTemplatePage = 0;
let generatedTemplateThemes = {};

function generateTemplateTheme(templateId) {
  if (generatedTemplateThemes[templateId]) return generatedTemplateThemes[templateId];
  
  const baseId = templateId.includes("-") ? templateId.split("-")[0] : templateId;
  const variation = templateId.includes("-") ? templateId.split("-").slice(1).join("-") : null;
  
  // Start with base theme
  const baseTheme = getBaseTheme(baseId);
  if (!variation) {
    generatedTemplateThemes[templateId] = baseTheme;
    return baseTheme;
  }
  
  // Apply variation colors
  const variationColors = getVariationColors(variation);
  const theme = { ...baseTheme, ...variationColors };
  generatedTemplateThemes[templateId] = theme;
  return theme;
}

function getBaseTheme(baseId) {
  const baseThemes = {
    market: { bg: "#f8fafb", ink: "#101820", soft: "#e7f4ef", accent: "#12b981", alt: "#ef4444" },
    luxe: { bg: "#101820", ink: "#fff8ef", soft: "#22313b", accent: "#d89a4c", alt: "#f59e0b" },
    pulse: { bg: "#fef08a", ink: "#101820", soft: "#ffffff", accent: "#2563eb", alt: "#ef4444" },
    clean: { bg: "#ffffff", ink: "#101820", soft: "#eef4f7", accent: "#12b981", alt: "#2563eb" },
    mono: { bg: "#f9fafb", ink: "#111827", soft: "#eef2f7", accent: "#12b981", alt: "#06b6d4" },
    social: { bg: "#101820", ink: "#ffffff", soft: "#172530", accent: "#12b981", alt: "#f59e0b" },
    urban: { bg: "#111827", ink: "#ffffff", soft: "#1f2937", accent: "#06b6d4", alt: "#ff3b5c" },
    minimal: { bg: "#fbfcfd", ink: "#101820", soft: "#eef2f7", accent: "#12b981", alt: "#111827" },
    retro: { bg: "#17324d", ink: "#fff7ed", soft: "#fee2b3", accent: "#f97316", alt: "#ec4899" },
    bold: { bg: "#ef4444", ink: "#ffffff", soft: "#fff7ed", accent: "#f59e0b", alt: "#84cc16" },
    fresh: { bg: "#e9fbf8", ink: "#102a43", soft: "#ffffff", accent: "#12b981", alt: "#2563eb" },
    gallery: { bg: "#f8fafc", ink: "#111827", soft: "#ffffff", accent: "#12b981", alt: "#db2777" },
    royal: { bg: "#241332", ink: "#fff7ed", soft: "#3b214f", accent: "#f8c471", alt: "#14b8a6" },
    neon: { bg: "#060b13", ink: "#f8fafc", soft: "#111827", accent: "#22d3ee", alt: "#f43f5e" },
    sunrise: { bg: "#fff7ed", ink: "#172554", soft: "#ffedd5", accent: "#fb7185", alt: "#f59e0b" },
    coffee: { bg: "#2a1810", ink: "#fff7ed", soft: "#4a2c1d", accent: "#d6a15d", alt: "#22c55e" },
    tech: { bg: "#07111f", ink: "#e0f2fe", soft: "#102a43", accent: "#38bdf8", alt: "#a3e635" },
    boutique: { bg: "#fff1f2", ink: "#312e81", soft: "#ffffff", accent: "#e11d48", alt: "#7c3aed" },
    harar: { bg: "#0f2f2b", ink: "#fffbea", soft: "#174a43", accent: "#f6c453", alt: "#ef4444" },
    addis: { bg: "#f8fafc", ink: "#0f172a", soft: "#e0f2fe", accent: "#16a34a", alt: "#dc2626" },
    rift: { bg: "#ecfeff", ink: "#164e63", soft: "#ffffff", accent: "#0891b2", alt: "#f97316" },
    habesha: { bg: "#fff8e7", ink: "#111827", soft: "#fef3c7", accent: "#16a34a", alt: "#dc2626" },
    jewelry: { bg: "#0f172a", ink: "#fff7ed", soft: "#1e293b", accent: "#fbbf24", alt: "#f472b6" },
    sport: { bg: "#f8fafc", ink: "#101820", soft: "#e2e8f0", accent: "#84cc16", alt: "#ef4444" },
    cosmetic: { bg: "#fdf2f8", ink: "#831843", soft: "#ffffff", accent: "#db2777", alt: "#f59e0b" }
  };
  return baseThemes[baseId] || baseThemes.market;
}

function getVariationColors(variation) {
  const colorMap = {
    gold: { accent: "#f59e0b", alt: "#fbbf24" },
    silver: { accent: "#9ca3af", alt: "#d1d5db" },
    rose: { accent: "#f472b6", alt: "#fb7185" },
    midnight: { accent: "#1e3a5f", alt: "#3b82f6" },
    forest: { accent: "#16a34a", alt: "#22c55e" },
    ember: { accent: "#ea580c", alt: "#f97316" },
    frost: { accent: "#7dd3fc", alt: "#bae6fd" },
    aurora: { accent: "#818cf8", alt: "#c4b5fd" },
    onyx: { accent: "#374151", alt: "#6b7280" },
    sunset: { accent: "#f97316", alt: "#ef4444" },
    ocean: { accent: "#0ea5e9", alt: "#06b6d4" },
    fire: { accent: "#dc2626", alt: "#ef4444" },
    ice: { accent: "#67e8f9", alt: "#a5f3fc" },
    slate: { accent: "#64748b", alt: "#94a3b8" },
    pearl: { accent: "#f8fafc", alt: "#e2e8f0" },
    ash: { accent: "#78716c", alt: "#a8a29e" },
    mist: { accent: "#cbd5e1", alt: "#e2e8f0" },
    cloud: { accent: "#f1f5f9", alt: "#e2e8f0" },
    charcoal: { accent: "#1f2937", alt: "#4b5563" },
    ink: { accent: "#111827", alt: "#374151" },
    graphite: { accent: "#4b5563", alt: "#9ca3af" },
    obsidian: { accent: "#0f172a", alt: "#1e293b" },
    coral: { accent: "#fb7185", alt: "#fda4af" },
    mint: { accent: "#34d399", alt: "#6ee7b7" },
    lime: { accent: "#a3e635", alt: "#bef264" },
    peach: { accent: "#fdba74", alt: "#fed7aa" },
    sky: { accent: "#7dd3fc", alt: "#bae6fd" },
    asphalt: { accent: "#374151", alt: "#6b7280" },
    concrete: { accent: "#9ca3af", alt: "#d1d5db" },
    steel: { accent: "#6b7280", alt: "#9ca3af" },
    rust: { accent: "#c2410c", alt: "#ea580c" },
    linen: { accent: "#fef3c7", alt: "#fde68a" },
    silk: { accent: "#fce7f3", alt: "#fbcfe8" },
    cotton: { accent: "#f8fafc", alt: "#f1f5f9" },
    wool: { accent: "#e5e7eb", alt: "#d1d5db" },
    jute: { accent: "#d6d3d1", alt: "#a8a29e" },
    vintage: { accent: "#a16207", alt: "#ca8a04" },
    classic: { accent: "#1e40af", alt: "#3b82f6" },
    nostalgia: { accent: "#9333ea", alt: "#a855f7" },
    antique: { accent: "#92400e", alt: "#b45309" },
    heritage: { accent: "#7c2d12", alt: "#9a3412" },
    crimson: { accent: "#dc2626", alt: "#ef4444" },
    vermillion: { accent: "#ea580c", alt: "#f97316" },
    scarlet: { accent: "#be123c", alt: "#e11d48" },
    ruby: { accent: "#e11d48", alt: "#f43f5e" },
    garnet: { accent: "#881337", alt: "#9f1239" },
    neon: { accent: "#c026d3", alt: "#e879f9" },
    fluo: { accent: "#84cc16", alt: "#bef264" },
    acid: { accent: "#a3e635", alt: "#d9f99d" },
    electric: { accent: "#3b82f6", alt: "#60a5fa" },
    volt: { accent: "#facc15", alt: "#fde047" },
    seafoam: { accent: "#2dd4bf", alt: "#5eead4" },
    basil: { accent: "#65a30d", alt: "#84cc16" },
    eucalyptus: { accent: "#059669", alt: "#10b981" },
    aloe: { accent: "#047857", alt: "#059669" },
    spring: { accent: "#4ade80", alt: "#86efac" },
    summer: { accent: "#fbbf24", alt: "#fcd34d" },
    autumn: { accent: "#f97316", alt: "#fb923c" },
    winter: { accent: "#38bdf8", alt: "#7dd3fc" },
    monsoon: { accent: "#6366f1", alt: "#818cf8" },
    museum: { accent: "#78716c", alt: "#a8a29e" },
    studio: { accent: "#525252", alt: "#737373" },
    exhibit: { accent: "#52525b", alt: "#71717a" },
    showcase: { accent: "#71717a", alt: "#a1a1aa" },
    curated: { accent: "#57534e", alt: "#78716c" },
    white: { accent: "#f8fafc", alt: "#e2e8f0" },
    black: { accent: "#171717", alt: "#262626" },
    gray: { accent: "#6b7280", alt: "#9ca3af" },
    color: { accent: "#ec4899", alt: "#f472b6" },
    regal: { accent: "#7c3aed", alt: "#8b5cf6" },
    imperial: { accent: "#4f46e5", alt: "#6366f1" },
    majestic: { accent: "#6d28d9", alt: "#7c3aed" },
    noble: { accent: "#5b21b6", alt: "#6d28d9" },
    kingdom: { accent: "#581c87", alt: "#6b21a8" },
    purple: { accent: "#9333ea", alt: "#a855f7" },
    blue: { accent: "#2563eb", alt: "#3b82f6" },
    green: { accent: "#16a34a", alt: "#22c55e" },
    red: { accent: "#dc2626", alt: "#ef4444" },
    cyber: { accent: "#06b6d4", alt: "#22d3ee" },
    synth: { accent: "#d946ef", alt: "#e879f9" },
    retro: { accent: "#f97316", alt: "#fb923c" },
    future: { accent: "#8b5cf6", alt: "#a78bfa" },
    glow: { accent: "#fbbf24", alt: "#fcd34d" },
    pink: { accent: "#ec4899", alt: "#f472b6" },
    yellow: { accent: "#eab308", alt: "#facc15" },
    orange: { accent: "#f97316", alt: "#fb923c" },
    dawn: { accent: "#fda4af", alt: "#fecdd3" },
    golden: { accent: "#f59e0b", alt: "#fbbf24" },
    horizon: { accent: "#fb923c", alt: "#fdba74" },
    twilight: { accent: "#7c3aed", alt: "#8b5cf6" },
    mocha: { accent: "#78350f", alt: "#92400e" },
    espresso: { accent: "#451a03", alt: "#78350f" },
    latte: { accent: "#d6d3d1", alt: "#e7e5e4" },
    cappuccino: { accent: "#a8a29e", alt: "#d6d3d1" },
    americano: { accent: "#292524", alt: "#44403c" },
    dark: { accent: "#1c1917", alt: "#292524" },
    light: { accent: "#f5f5f4", alt: "#e7e5e4" },
    medium: { accent: "#78716c", alt: "#a8a29e" },
    strong: { accent: "#44403c", alt: "#57534e" },
    mild: { accent: "#d6d3d1", alt: "#e7e5e4" },
    circuit: { accent: "#22c55e", alt: "#4ade80" },
    digital: { accent: "#3b82f6", alt: "#60a5fa" },
    binary: { accent: "#171717", alt: "#404040" },
    pixel: { accent: "#f472b6", alt: "#f9a8d4" },
    data: { accent: "#06b6d4", alt: "#22d3ee" },
    ai: { accent: "#8b5cf6", alt: "#a78bfa" },
    vr: { accent: "#06b6d4", alt: "#67e8f9" },
    ar: { accent: "#f97316", alt: "#fb923c" },
    robot: { accent: "#6b7280", alt: "#9ca3af" },
    drone: { accent: "#374151", alt: "#4b5563" },
    chic: { accent: "#be185d", alt: "#db2777" },
    elegant: { accent: "#831843", alt: "#9d174d" },
    stylish: { accent: "#c026d3", alt: "#d946ef" },
    grace: { accent: "#a21caf", alt: "#c026d3" },
    poised: { accent: "#86198f", alt: "#a21caf" },
    ancient: { accent: "#92400e", alt: "#b45309" },
    traditional: { accent: "#78350f", alt: "#92400e" },
    cultural: { accent: "#b45309", alt: "#d97706" },
    timeless: { accent: "#78716c", alt: "#a8a29e" },
    modern: { accent: "#059669", alt: "#10b981" },
    contemporary: { accent: "#0d9488", alt: "#14b8a6" },
    vibrant: { accent: "#ea580c", alt: "#f97316" },
    dynamic: { accent: "#dc2626", alt: "#ef4444" },
    valley: { accent: "#0891b2", alt: "#06b6d4" },
    escarpment: { accent: "#0e7490", alt: "#0891b2" },
    highland: { accent: "#155e75", alt: "#0e7490" },
    plateau: { accent: "#164e63", alt: "#155e75" },
    summit: { accent: "#083344", alt: "#164e63" },
    cyan: { accent: "#06b6d4", alt: "#22d3ee" },
    teal: { accent: "#0d9488", alt: "#14b8a6" },
    aqua: { accent: "#22d3ee", alt: "#67e8f9" },
    navy: { accent: "#1e3a8a", alt: "#1d4ed8" },
    classic: { accent: "#991b1b", alt: "#b91c1c" },
    gold: { accent: "#d97706", alt: "#f59e0b" },
    rose: { accent: "#e11d48", alt: "#f43f5e" },
    emerald: { accent: "#059669", alt: "#10b981" },
    sapphire: { accent: "#1d4ed8", alt: "#3b82f6" },
    ruby: { accent: "#be123c", alt: "#e11d48" },
    topaz: { accent: "#d97706", alt: "#f59e0b" },
    active: { accent: "#22c55e", alt: "#4ade80" },
    energy: { accent: "#f97316", alt: "#fb923c" },
    power: { accent: "#dc2626", alt: "#ef4444" },
    speed: { accent: "#3b82f6", alt: "#60a5fa" },
    endurance: { accent: "#8b5cf6", alt: "#a78bfa" },
    football: { accent: "#16a34a", alt: "#22c55e" },
    basketball: { accent: "#ea580c", alt: "#f97316" },
    tennis: { accent: "#cbd5e1", alt: "#e2e8f0" },
    running: { accent: "#fbbf24", alt: "#fcd34d" },
    gym: { accent: "#6b7280", alt: "#9ca3af" },
    glow: { accent: "#fbbf24", alt: "#fcd34d" },
    radiant: { accent: "#f59e0b", alt: "#fbbf24" },
    luminous: { accent: "#fcd34d", alt: "#fde047" },
    bright: { accent: "#fef08a", alt: "#fef9c3" },
    shimmer: { accent: "#e879f9", alt: "#f0abfc" }
  };
  return colorMap[variation] || { accent: "#12b981", alt: "#ef4444" };
}

function createTemplateButton(templateId) {
  const button = document.createElement("button");
  button.className = "template";
  button.dataset.template = templateId;
  button.type = "button";
  
  const swatch = document.createElement("span");
  swatch.className = "template-swatch";
  
  // Set swatch color based on theme
  const baseId = templateId.includes("-") ? templateId.split("-")[0] : templateId;
  const theme = generateTemplateTheme(templateId) || getBaseTheme(baseId);
  if (theme && theme.accent) {
    swatch.style.background = `linear-gradient(135deg, ${theme.accent} 0%, ${theme.alt || theme.accent} 100%)`;
  }
  
  const name = document.createElement("span");
  name.textContent = formatTemplateName(templateId);
  
  const label = document.createElement("small");
  if (FREE_TEMPLATES.includes(baseId)) {
    label.textContent = "Free";
  }

  button.append(swatch, name, label);
  button.addEventListener("click", () => {
    state.template = templateId;
    state.designVisited = true;
    saveState();
    setActiveTemplate();
    drawPoster();
  });
  
  return button;
}

function formatTemplateName(templateId) {
  if (!templateId.includes("-")) return templateId.charAt(0).toUpperCase() + templateId.slice(1);
  const [base, variation] = templateId.split("-");
  return `${base.charAt(0).toUpperCase() + base.slice(1)} ${variation.charAt(0).toUpperCase() + variation.slice(1)}`;
}

function loadMoreTemplates() {
  const grid = document.getElementById("templateGrid");
  if (!grid) return;
  const start = grid.querySelectorAll(".template[data-template]").length;
  const end = Math.min(start + TEMPLATES_PER_PAGE, ALL_TEMPLATE_IDS.length);

  for (let i = start; i < end; i++) {
    const templateId = ALL_TEMPLATE_IDS[i];
    const button = createTemplateButton(templateId);
    grid.appendChild(button);
  }

  currentTemplatePage = Math.ceil(end / TEMPLATES_PER_PAGE);
  setActiveTemplate();

  const loadMoreBtn = document.getElementById("loadMoreTemplates");
  if (loadMoreBtn && end >= ALL_TEMPLATE_IDS.length) {
    loadMoreBtn.style.display = "none";
  }
}
const TRANSLATIONS = {
  en: {
    orderNow: "Order now",
    contact: "Contact",
    oldPrice: "Old price",
    freshDeal: "Fresh deal",
    paymentTitle: "SellSnap Studio payment",
    transaction: "Transaction hash"
  },
  om: {
    orderNow: "Amma ajajadhu",
    contact: "Quunnamtii",
    oldPrice: "Gatii duraanii",
    freshDeal: "Carraa haarawa",
    paymentTitle: "Kaffaltii SellSnap Studio",
    transaction: "Ragaa kaffaltii"
  },
  am: {
    orderNow: "አሁን ይዘዙ",
    contact: "መገናኛ",
    oldPrice: "የቀድሞ ዋጋ",
    freshDeal: "አዲስ ቅናሽ",
    paymentTitle: "የ SellSnap Studio ክፍያ",
    transaction: "የክፍያ ማስረጃ"
  }
};
const PUBLIC_KEY_JWK = {
  key_ops: ["verify"],
  ext: true,
  kty: "EC",
  x: "77439jExE2-fYb_fCLuKOEblK_7jAPZf901ud9wEbyA",
  y: "QbsjGOUpgqK-oMHqJj1S74zkZ4g9xjnI0yhiWq2ZeIE",
  crv: "P-256"
};

const DEFAULT_STATE = {
  shopName: "Audio Deals",
  productName: "Premium Earbuds",
  price: "49",
  oldPrice: "79",
  currency: "$",
  phone: "+1 555 0100",
  cta: "Order on WhatsApp",
  market: "foreign",
  language: "en",
  template: "market",
  accent: "#12b981",
  textColor: "",
  textColorTarget: "product",
  headerTextColor: "",
  productTextColor: "",
  priceTextColor: "",
  footerTextColor: "",
  timerTextColor: "",
  shopInfoTextColor: "",
  badge: true,
  badgeText: "HOT DEAL",
  bannerStyle: "ribbon",
  bannerPosition: "top",
  sticker: "none",
  pattern: false,
  patternType: "dots",
  textAlignment: "left",
  textEffect: "none",
  headerTextEffect: "none",
  productTextEffect: "none",
  priceTextEffect: "none",
  footerTextEffect: "none",
  timerTextEffect: "none",
  shopInfoTextEffect: "none",
  headerTextOpacity: 1,
  productTextOpacity: 1,
  priceTextOpacity: 1,
  footerTextOpacity: 1,
  timerTextOpacity: 1,
  shopInfoTextOpacity: 1,
  bannerOpacity: 1,
  designOpacity: 1,
  exportFormat: "png",
  campaignGoal: "sell",
  campaignTone: "direct",
  productEdited: false,
  designVisited: false,
  campaignVisited: false,
  zoom: 1,
  lift: 0,
  photo: DEFAULT_PRODUCT_IMAGE,
  captionIndex: 0,
  createdAt: "",
  selectedPlan: "yearly",
  saved: [],
  // New features
  discountTimer: "",
  shopRating: "4.8",
  shopLocation: "Addis Ababa, Ethiopia",
  showShade: false,
  bgRemoved: false,
  brushMode: "none",
  brushColor: "#ffffff",
  brushSize: 8,
  brushStrokes: [],
  imagePanX: 0,
  imagePanY: 0,
  headerPanX: 0,
  headerPanY: 0,
  productPanX: 0,
  productPanY: 0,
  pricePanX: 0,
  pricePanY: 0,
  footerPanX: 0,
  footerPanY: 0,
  timerPanX: 0,
  timerPanY: 0,
  shopInfoPanX: 0,
  shopInfoPanY: 0,
  textPanX: 0,
  textPanY: 0,
  stickerX: 0,
  stickerY: 0,
  // Text size per target
  headerTextSize: "medium",
  productTextSize: "medium",
  priceTextSize: "medium",
  footerTextSize: "medium",
  timerTextSize: "medium",
  shopInfoTextSize: "medium"
};

// Pinch-to-zoom state
let pinchState = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const canvas = $("#posterCanvas");
const ctx = canvas.getContext("2d");
const state = loadState();
let loadedImage = null;
let deviceCode = "";
let trialStatus = null;
let toastTimer = 0;

const elements = {
  licenseButton: $("#licenseButton"),
  licenseText: $("#licenseText"),
  accessStatus: $("#accessStatus"),
  accessDetail: $("#accessDetail"),
  deviceCode: $("#deviceCode"),
  modalDeviceCode: $("#modalDeviceCode"),
  proofContact: $("#proofContact"),
  modalProofContact: $("#modalProofContact"),
  paymentSummary: $("#paymentSummary"),
  modalPaymentSummary: $("#modalPaymentSummary"),
  paymentMethodLabel: $("#paymentMethodLabel"),
  paymentMethodValue: $("#paymentMethodValue"),
  modalPaymentMethodLabel: $("#modalPaymentMethodLabel"),
  modalPaymentMethodValue: $("#modalPaymentMethodValue"),
  walletAddress: $("#walletAddress"),
  cbeAccount: $("#cbeAccount"),
  copyCbeButton: $("#copyCbeButton"),
  photoInput: $("#photoInput"),
  fitImageButton: $("#fitImageButton"),
  resetDesignActionButton: $("#resetDesignActionButton"),
  exportButton: $("#exportButton"),
  shareButton: $("#shareButton"),
  saveProductButton: $("#saveProductButton"),
  nextStepTitle: $("#nextStepTitle"),
  nextStepDetail: $("#nextStepDetail"),
  nextStepButton: $("#nextStepButton"),
  zoomInput: $("#zoomInput"),
  liftInput: $("#liftInput"),
  badgeInput: $("#badgeInput"),
  badgeTextInput: $("#badgeTextInput"),
  textColorPicker: $("#textColorPicker"),
  textOpacityRange: $("#textOpacityRange"),
  textOpacityValue: $("#textOpacityValue"),
  bannerOpacityRange: $("#bannerOpacityRange"),
  bannerOpacityValue: $("#bannerOpacityValue"),
  designOpacityRange: $("#designOpacityRange"),
  designOpacityValue: $("#designOpacityValue"),
  resetDesignButton: $("#resetDesignButton"),
  patternInput: $("#patternInput"),
  patternTypeGroup: $("#patternTypeGroup"),
  shadeInput: $("#shadeInput"),
  bgRemoveInput: $("#bgRemoveInput"),
  brushSizeInput: $("#brushSizeInput"),
  discountTimerInput: $("#discountTimerInput"),
  shopRatingInput: $("#shopRatingInput"),
  shopLocationInput: $("#shopLocationInput"),
  campaignOutput: $("#campaignOutput"),
  smartRemixButton: $("#smartRemixButton"),
  copyCampaignButton: $("#copyCampaignButton"),
  exportPackButton: $("#exportPackButton"),
  offerScore: $("#offerScore"),
  offerDetail: $("#offerDetail"),
  captionOutput: $("#captionOutput"),
  captionNextButton: $("#captionNextButton"),
  copyCaptionButton: $("#copyCaptionButton"),
  whatsAppButton: $("#whatsAppButton"),
  copyDeviceButton: $("#copyDeviceButton"),
  copyWalletButton: $("#copyWalletButton"),
  copyProofButton: $("#copyProofButton"),
  copyPaymentButton: $("#copyPaymentButton"),
  proofActionButton: $("#proofActionButton"),
  unlockCodeInput: $("#unlockCodeInput"),
  unlockButton: $("#unlockButton"),
  paywallDialog: $("#paywallDialog"),
  modalCopyButton: $("#modalCopyButton"),
  modalProofActionButton: $("#modalProofActionButton"),
  toast: $("#toast"),
  savedList: $("#savedList")
};

init();

async function init() {
  if (!state.createdAt) {
    state.createdAt = new Date().toISOString();
    saveState();
  }

  deviceCode = await getDeviceCode();
  elements.deviceCode.textContent = deviceCode;
  elements.modalDeviceCode.textContent = deviceCode;
  elements.walletAddress.textContent = WALLET_ADDRESS;
  elements.cbeAccount.textContent = CBE_ACCOUNT;

  hydrateControls();
  updateProofContact();
  attachEvents();
  setInitialTab();
  await loadPhoto();
  await refreshLicense();
  renderAll();
  initStickerDrag();
  initBrush();

  // Only register PWA features when served over HTTP/HTTPS
  if (location.protocol === "http:" || location.protocol === "https:") {
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = "manifest.json";
    document.head.appendChild(manifestLink);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`service-worker.js?${APP_VERSION}`).catch(() => {});
    }
  }
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const next = { ...DEFAULT_STATE, ...stored };
    if (typeof stored.productEdited !== "boolean") {
      next.productEdited = productDiffersFromDemo(next);
    }
    return next;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function productDiffersFromDemo(value) {
  return ["shopName", "productName", "price", "oldPrice", "currency", "phone", "cta"].some(
    (field) => String(value[field] || "") !== String(DEFAULT_STATE[field] || "")
  );
}

function selectedMarket() {
  return state.market === "ethiopia" ? "ethiopia" : "foreign";
}

function selectedLanguage() {
  return ["en", "om", "am"].includes(state.language) ? state.language : "en";
}

function t(key) {
  return (TRANSLATIONS[selectedLanguage()] || TRANSLATIONS.en)[key] || TRANSLATIONS.en[key] || key;
}

function applyMarketDefaults() {
  if (selectedMarket() === "ethiopia") {
    state.shopName = state.shopName === DEFAULT_STATE.shopName ? "Addis Deals" : state.shopName;
    state.price = state.price === DEFAULT_STATE.price ? "3500" : state.price;
    state.oldPrice = state.oldPrice === DEFAULT_STATE.oldPrice ? "4200" : state.oldPrice;
    state.currency = "Birr";
    state.phone = state.phone === DEFAULT_STATE.phone ? "+251 900 000 000" : state.phone;
    updateCtaForLanguage();
    return;
  }

  if (state.currency === "Birr") state.currency = "$";
  if (/^\+251/.test(state.phone || "")) state.phone = DEFAULT_STATE.phone;
  if (/Telegram|WhatsApp|ቴሌግራም|ajajadhu/.test(state.cta || "")) state.cta = DEFAULT_STATE.cta;
}

function resetDesign() {
  state.designVisited = true;
  state.headerPanX = 0;
  state.headerPanY = 0;
  state.productPanX = 0;
  state.productPanY = 0;
  state.pricePanX = 0;
  state.pricePanY = 0;
  state.footerPanX = 0;
  state.footerPanY = 0;
  state.timerPanX = 0;
  state.timerPanY = 0;
  state.shopInfoPanX = 0;
  state.shopInfoPanY = 0;
  state.imagePanX = 0;
  state.imagePanY = 0;
  state.zoom = 1;
  state.lift = 0;
  state.textAlignment = "left";
  state.textColorTarget = "product";
  state.headerTextColor = "";
  state.productTextColor = "";
  state.priceTextColor = "";
  state.footerTextColor = "";
  state.timerTextColor = "";
  state.shopInfoTextColor = "";
  state.textEffect = "none";
  state.headerTextEffect = "none";
  state.productTextEffect = "none";
  state.priceTextEffect = "none";
  state.footerTextEffect = "none";
  state.timerTextEffect = "none";
  state.shopInfoTextEffect = "none";
  state.headerTextOpacity = 1;
  state.productTextOpacity = 1;
  state.priceTextOpacity = 1;
  state.footerTextOpacity = 1;
  state.timerTextOpacity = 1;
  state.shopInfoTextOpacity = 1;
  state.bannerStyle = "ribbon";
  state.bannerPosition = "top";
  state.badge = true;
  state.badgeText = "HOT DEAL";
  state.sticker = "none";
  state.pattern = false;
  state.patternType = "dots";
  state.showShade = false;
  state.bgRemoved = false;
  state.brushMode = "none";
  state.brushColor = "#ffffff";
  state.brushSize = 8;
  state.brushStrokes = [];
  saveState();
  hydrateControls();
  drawPoster();
  showToast("Design reset");
}

function updateCtaForLanguage() {
  const lang = selectedLanguage();
  if (lang === "am") {
    state.cta = "በቴሌግራም ወይም WhatsApp ይዘዙ";
  } else if (lang === "om") {
    state.cta = "Telegram ykn WhatsApp irratti ajajadhu";
  } else {
    state.cta = "Order on Telegram or WhatsApp";
  }
}

function getProofContact() {
  return selectedMarket() === "ethiopia" ? `@${TELEGRAM_USERNAME}` : PROOF_EMAIL;
}

function openProofContact() {
  if (selectedMarket() === "ethiopia") {
    window.open(`https://t.me/${TELEGRAM_USERNAME}`, "_blank", "noopener,noreferrer");
    return;
  }
  const subject = encodeURIComponent("SellSnap Studio payment proof");
  const body = encodeURIComponent(paymentMessage());
  window.location.href = `mailto:${PROOF_EMAIL}?subject=${subject}&body=${body}`;
}

function updateProofContact() {
  const contact = getProofContact();
  const isTelegram = selectedMarket() === "ethiopia";
  elements.proofContact.textContent = contact;
  elements.modalProofContact.textContent = contact;
  elements.proofActionButton.querySelector("span").textContent = isTelegram ? "Open Telegram" : "Email Payment Proof";
  elements.proofActionButton.querySelector("svg").innerHTML = isTelegram ? '<use href="#icon-telegram"></use>' : '<use href="#icon-mail"></use>';
  elements.modalProofActionButton.querySelector("span").textContent = isTelegram ? "Open Telegram" : "Email Payment Proof";
  elements.modalProofActionButton.querySelector("svg").innerHTML = isTelegram ? '<use href="#icon-telegram"></use>' : '<use href="#icon-mail"></use>';
}

function essentialProductDiffersFromDemo(value) {
  return ["shopName", "productName", "price", "phone"].some(
    (field) => String(value[field] || "") !== String(DEFAULT_STATE[field] || "")
  );
}

function hydrateControls() {
  $$("[data-field]").forEach((input) => {
    input.value = state[input.dataset.field] || "";
  });
  $$("[data-market]").forEach((button) => {
    button.classList.toggle("active", button.dataset.market === selectedMarket());
  });
  $$("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === selectedLanguage());
  });
  elements.zoomInput.value = state.zoom;
  elements.liftInput.value = state.lift;
  elements.badgeInput.checked = Boolean(state.badge);
  elements.badgeTextInput.value = state.badgeText || "";
  elements.patternInput.checked = Boolean(state.pattern);
  elements.shadeInput.checked = Boolean(state.showShade);
  elements.bgRemoveInput.checked = Boolean(state.bgRemoved);
  elements.brushSizeInput.value = state.brushSize || 8;
  elements.discountTimerInput.value = state.discountTimer || "";
  elements.shopRatingInput.value = state.shopRating || "";
  elements.shopLocationInput.value = state.shopLocation || "";
  const target = state.textColorTarget || "product";
  elements.textColorPicker.value = state[`${target}TextColor`] || "#111827";
  if (elements.textOpacityRange) {
    elements.textOpacityRange.value = Math.round((state[`${target}TextOpacity`] ?? 1) * 100);
  }
  if (elements.textOpacityValue) {
    elements.textOpacityValue.textContent = `${Math.round((state[`${target}TextOpacity`] ?? 1) * 100)}%`;
  }
  if (elements.bannerOpacityRange) {
    elements.bannerOpacityRange.value = Math.round((state.bannerOpacity ?? 1) * 100);
  }
  if (elements.bannerOpacityValue) {
    elements.bannerOpacityValue.textContent = `${Math.round((state.bannerOpacity ?? 1) * 100)}%`;
  }
  if (elements.designOpacityRange) {
    elements.designOpacityRange.value = Math.round((state.designOpacity ?? 1) * 100);
  }
  if (elements.designOpacityValue) {
    elements.designOpacityValue.textContent = `${Math.round((state.designOpacity ?? 1) * 100)}%`;
  }
  brushStrokes = state.brushStrokes || [];
  setActiveTemplate();
  setActiveColor();
  setActiveTextTarget();
  setActiveTextColor();
  setActiveTextSize();
  setActiveBanner();
  setActiveBannerPosition();
  setActiveSticker();
  setActivePatternType();
  setActiveAlignment();
  setActiveTextEffect();
  setActiveBrush();
  setActiveExportFormat();
  setActiveCampaignGoal();
  setActiveCampaignTone();
  setActivePlan();
  updatePatternVisibility();
  updateBrushCursor();
}

function attachEvents() {
  $$("[data-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.productEdited = true;
      state[input.dataset.field] = input.value;
      saveState();
      renderAll();
    });
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab, true));
  });

  $$("[data-guide-step]").forEach((button) => {
    button.addEventListener("click", () => openGuideStep(button.dataset.guideStep));
  });

  $$("[data-market]").forEach((button) => {
    button.addEventListener("click", () => {
      const previous = selectedMarket();
      state.market = button.dataset.market;
      if (previous !== state.market) applyMarketDefaults();
      saveState();
      hydrateControls();
      updateProofContact();
      renderAll();
    });
  });

  $$("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      if (!state.productEdited) applyMarketDefaults();
      updateCtaForLanguage();
      saveState();
      hydrateControls();
      renderAll();
    });
  });

  elements.nextStepButton.addEventListener("click", handleNextStep);

  $$(".template").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.template = button.dataset.template;
      saveState();
      setActiveTemplate();
      drawPoster();
    });
  });

  $$('[data-color]').forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.accent = button.dataset.color;
      document.documentElement.style.setProperty("--accent", state.accent);
      saveState();
      setActiveColor();
      drawPoster();
    });
  });

  $$('[data-text-target]').forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.textColorTarget = button.dataset.textTarget;
      saveState();
      setActiveTextTarget();
      setActiveTextColor();
    });
  });

  $$('[data-text-effect]').forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      const target = state.textColorTarget || "product";
      state[`${target}TextEffect`] = button.dataset.textEffect;
      saveState();
      setActiveTextEffect();
      drawPoster();
    });
  });

  if (elements.textOpacityRange) {
    elements.textOpacityRange.addEventListener("input", (event) => {
      state.designVisited = true;
      const target = state.textColorTarget || "product";
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      state[`${target}TextOpacity`] = value / 100;
      if (elements.textOpacityValue) {
        elements.textOpacityValue.textContent = `${value}%`;
      }
      saveState();
      drawPoster();
    });
  }

  if (elements.bannerOpacityRange) {
    elements.bannerOpacityRange.addEventListener("input", (event) => {
      state.designVisited = true;
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      state.bannerOpacity = value / 100;
      if (elements.bannerOpacityValue) {
        elements.bannerOpacityValue.textContent = `${value}%`;
      }
      saveState();
      drawPoster();
    });
  }

  if (elements.designOpacityRange) {
    elements.designOpacityRange.addEventListener("input", (event) => {
      state.designVisited = true;
      const value = Number(event.target.value);
      if (Number.isNaN(value)) return;
      state.designOpacity = value / 100;
      if (elements.designOpacityValue) {
        elements.designOpacityValue.textContent = `${value}%`;
      }
      saveState();
      drawPoster();
    });
  }

  $$('[data-text-color]').forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      const target = state.textColorTarget || "product";
      state[`${target}TextColor`] = button.dataset.textColor;
      if (elements.textColorPicker) elements.textColorPicker.value = button.dataset.textColor;
      saveState();
      setActiveTextColor();
      drawPoster();
    });
  });

  if (elements.textColorPicker) {
    elements.textColorPicker.addEventListener("input", (event) => {
      state.designVisited = true;
      const target = state.textColorTarget || "product";
      state[`${target}TextColor`] = event.target.value;
      saveState();
      setActiveTextColor();
      drawPoster();
    });
  }

  if (elements.fitImageButton) {
    elements.fitImageButton.addEventListener("click", () => {
      fitImage();
    });
  }

  if (elements.resetDesignActionButton) {
    elements.resetDesignActionButton.addEventListener("click", () => {
      resetDesign();
    });
  }

  if (elements.resetDesignButton) {
    elements.resetDesignButton.addEventListener("click", () => {
      resetDesign();
    });
  }

  $$("[data-banner]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.bannerStyle = button.dataset.banner;
      saveState();
      setActiveBanner();
      drawPoster();
    });
  });

  $$("[data-banner-pos]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.bannerPosition = button.dataset.bannerPos;
      saveState();
      setActiveBannerPosition();
      drawPoster();
    });
  });

  $$("[data-sticker]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.sticker = button.dataset.sticker;
      saveState();
      setActiveSticker();
      updateStickerCursor();
      drawPoster();
    });
  });

  $$("[data-pattern-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.patternType = button.dataset.patternType;
      saveState();
      setActivePatternType();
      drawPoster();
    });
  });

  $$("[data-align]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.textAlignment = button.dataset.align;
      saveState();
      setActiveAlignment();
      drawPoster();
    });
  });

  // Text size handlers
  $$("[data-text-size]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      const target = state.textColorTarget || "product";
      state[`${target}TextSize`] = button.dataset.textSize;
      saveState();
      setActiveTextSize();
      drawPoster();
    });
  });

  $$("[data-brush]").forEach((button) => {
    button.addEventListener("click", () => {
      state.designVisited = true;
      state.brushMode = button.dataset.brush || "none";
      saveState();
      setActiveBrush();
      updateBrushCursor();
    });
  });

  $$("[data-export-format]").forEach((button) => {
    button.addEventListener("click", () => {
      state.exportFormat = button.dataset.exportFormat;
      saveState();
      setActiveExportFormat();
    });
  });

  $$("[data-campaign-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      state.campaignVisited = true;
      state.campaignGoal = button.dataset.campaignGoal;
      saveState();
      setActiveCampaignGoal();
      updateCampaignKit();
    });
  });

  $$("[data-campaign-tone]").forEach((button) => {
    button.addEventListener("click", () => {
      state.campaignVisited = true;
      state.campaignTone = button.dataset.campaignTone;
      saveState();
      setActiveCampaignTone();
      updateCampaignKit();
    });
  });

  $$("[data-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPlan = button.dataset.plan;
      saveState();
      setActivePlan();
      updatePaymentSummary();
    });
  });

  document.getElementById("loadMoreTemplates").addEventListener("click", loadMoreTemplates);
  document.getElementById("loadMoreColors").addEventListener("click", loadMoreColors);
  document.getElementById("magicRemixButton").addEventListener("click", magicRemix);

  elements.zoomInput.addEventListener("input", () => {
    state.zoom = Number(elements.zoomInput.value);
    saveState();
    drawPoster();
  });

  elements.liftInput.addEventListener("input", () => {
    state.lift = Number(elements.liftInput.value);
    saveState();
    drawPoster();
  });

  elements.badgeInput.addEventListener("change", () => {
    state.designVisited = true;
    state.badge = elements.badgeInput.checked;
    saveState();
    drawPoster();
  });

  elements.badgeTextInput.addEventListener("input", () => {
    state.designVisited = true;
    state.badgeText = elements.badgeTextInput.value;
    saveState();
    drawPoster();
  });

  elements.patternInput.addEventListener("change", () => {
    state.designVisited = true;
    state.pattern = elements.patternInput.checked;
    saveState();
    updatePatternVisibility();
    drawPoster();
  });

  elements.shadeInput.addEventListener("change", () => {
    state.designVisited = true;
    state.showShade = elements.shadeInput.checked;
    saveState();
    drawPoster();
  });

  elements.bgRemoveInput.addEventListener("change", () => {
    state.designVisited = true;
    state.bgRemoved = elements.bgRemoveInput.checked;
    saveState();
    if (state.bgRemoved && loadedImage) {
      removeBackground();
      drawPoster();
    } else {
      drawPoster();
    }
  });

  elements.brushSizeInput.addEventListener("input", () => {
    state.brushSize = Number(elements.brushSizeInput.value);
    saveState();
  });

  elements.discountTimerInput.addEventListener("input", () => {
    state.discountTimer = elements.discountTimerInput.value;
    saveState();
    drawPoster();
  });

  elements.shopRatingInput.addEventListener("input", () => {
    state.shopRating = elements.shopRatingInput.value;
    saveState();
    drawPoster();
  });

  elements.shopLocationInput.addEventListener("input", () => {
    state.shopLocation = elements.shopLocationInput.value;
    saveState();
    drawPoster();
  });

  elements.photoInput.addEventListener("change", handlePhoto);
  elements.exportButton.addEventListener("click", () => exportPoster(false));
  elements.shareButton.addEventListener("click", sharePoster);
  elements.saveProductButton.addEventListener("click", saveProduct);
  elements.smartRemixButton.addEventListener("click", smartRemix);
  elements.copyCampaignButton.addEventListener("click", () => {
    state.campaignVisited = true;
    saveState();
    updateGuide();
    copyText(elements.campaignOutput.value, "Campaign kit copied");
  });
  elements.exportPackButton.addEventListener("click", exportCampaignPack);
  elements.captionNextButton.addEventListener("click", nextCaption);
  elements.copyCaptionButton.addEventListener("click", () => copyText(elements.captionOutput.value, "Caption copied"));
  elements.whatsAppButton.addEventListener("click", openWhatsApp);
  elements.copyDeviceButton.addEventListener("click", () => copyText(deviceCode, "Device code copied"));
  elements.copyWalletButton.addEventListener("click", () => copyText(WALLET_ADDRESS, "Wallet copied"));
  elements.copyCbeButton.addEventListener("click", () => copyText(CBE_ACCOUNT, "CBE account copied"));
  elements.copyProofButton.addEventListener("click", () => copyText(getProofContact(), "Proof contact copied"));
  elements.copyPaymentButton.addEventListener("click", copyPaymentDetails);
  elements.modalCopyButton.addEventListener("click", copyPaymentDetails);
  elements.proofActionButton.addEventListener("click", openProofContact);
  elements.modalProofActionButton.addEventListener("click", openProofContact);
  elements.unlockButton.addEventListener("click", activateLicense);
  elements.licenseButton.addEventListener("click", () => setTab("license", true));
  window.addEventListener("hashchange", setInitialTab);
}

function setInitialTab() {
  const tab = location.hash.replace("#", "");
  if (["product", "design", "campaign", "captions", "license"].includes(tab)) {
    setTab(tab, false);
  }
}

function setTab(name, updateHash = false) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${name}`));
  if (name === "campaign") {
    updateCampaignKit();
  }
  if (updateHash && location.hash !== `#${name}`) {
    history.replaceState(null, "", `#${name}`);
  }
  updateGuide();
}

function openGuideStep(step) {
  const routes = {
    product: () => {
      setTab("product", true);
      const target = cleanField(state.productName, "") ? $("[data-field='price']") : $("[data-field='productName']");
      if (target) target.focus();
    },
    photo: () => elements.photoInput.click(),
    design: () => setTab("design", true),
    campaign: () => setTab("campaign", true),
    export: () => (hasExportAccess() ? exportPoster(false) : setTab("license", true))
  };
  (routes[step] || routes.product)();
}

function handleNextStep() {
  openGuideStep(currentGuideStep().step);
}

function currentGuideStep() {
  const hasDetails = hasUserProductDetails();
  const hasPhoto = Boolean(state.photo && state.photo !== DEFAULT_PRODUCT_IMAGE);
  const hasDesign = Boolean(state.designVisited);
  const hasCampaign = Boolean(state.campaignVisited);

  if (!hasDetails) {
    return {
      step: "product",
      title: "Start with product details",
      detail: "Type the product name, price, and contact. The poster updates instantly.",
      action: "Enter Details"
    };
  }

  if (!hasPhoto) {
    return {
      step: "photo",
      title: "Add product photo",
      detail: "Upload one clean product photo. Use Fit if it is cropped.",
      action: "Choose Photo"
    };
  }

  if (!hasDesign) {
    return {
      step: "design",
      title: "Choose a design",
      detail: "Choose a template or tap Magic Remix for an instant design.",
      action: "Open Design"
    };
  }

  if (!hasCampaign) {
    return {
      step: "campaign",
      title: "Build campaign kit",
      detail: "Create captions, WhatsApp text, and the selling message.",
      action: "Open Campaign"
    };
  }

  if (!hasExportAccess() && !isFreeTemplate()) {
    return {
      step: "export",
      title: "Unlock premium export",
      detail: "Market is free with a light watermark; premium designs need Pro.",
      action: "Unlock Pro"
    };
  }

  return {
    step: "export",
    title: "Export poster",
    detail: "Download the poster or share it directly from your device.",
    action: "Export Poster"
  };
}

function updateGuide() {
  if (!elements.nextStepTitle) return;
  const guide = currentGuideStep();
  elements.nextStepTitle.textContent = guide.title;
  elements.nextStepDetail.textContent = guide.detail;
  elements.nextStepButton.textContent = guide.action;

  const done = {
    product: hasUserProductDetails(),
    photo: Boolean(state.photo && state.photo !== DEFAULT_PRODUCT_IMAGE),
    design: Boolean(state.designVisited),
    campaign: Boolean(state.campaignVisited),
    export: hasExportAccess() || isFreeTemplate()
  };

  $$("[data-guide-step]").forEach((button) => {
    const step = button.dataset.guideStep;
    button.classList.toggle("active", step === guide.step);
    button.classList.toggle("done", Boolean(done[step]));
  });
}

function hasUserProductDetails() {
  return Boolean(
    state.productEdited &&
      essentialProductDiffersFromDemo(state) &&
      cleanField(state.productName, "") &&
      cleanField(state.price, "")
  );
}

function setActiveTemplate() {
  $$(".template").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === state.template);
  });
}

function setActiveColor() {
  document.documentElement.style.setProperty("--accent", state.accent);
  $$('[data-color]').forEach((button) => {
    button.classList.toggle("active", button.dataset.color === state.accent);
  });
}

function setActiveTextTarget() {
  const target = state.textColorTarget || "product";
  $$('[data-text-target]').forEach((button) => {
    button.classList.toggle("active", button.dataset.textTarget === target);
  });
  if (elements.textColorPicker) {
    elements.textColorPicker.value = state[`${target}TextColor`] || "#111827";
  }
  setActiveTextEffect();
  if (elements.textOpacityRange) {
    elements.textOpacityRange.value = Math.round((state[`${target}TextOpacity`] ?? 1) * 100);
  }
  if (elements.textOpacityValue) {
    elements.textOpacityValue.textContent = `${Math.round((state[`${target}TextOpacity`] ?? 1) * 100)}%`;
  }
}

function setActiveTextColor() {
  const target = state.textColorTarget || "product";
  const textColor = state[`${target}TextColor`] || "";
  $$('[data-text-color]').forEach((button) => {
    button.classList.toggle("active", button.dataset.textColor === textColor);
  });
  if (elements.textColorPicker) {
    elements.textColorPicker.value = textColor || "#111827";
  }
}

function setActiveBanner() {
  const style = state.bannerStyle || "ribbon";
  $$("[data-banner]").forEach((button) => {
    button.classList.toggle("active", button.dataset.banner === style);
  });
}

function setActiveBannerPosition() {
  const position = state.bannerPosition || "top";
  $$("[data-banner-pos]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bannerPos === position);
  });
}

function setActiveSticker() {
  const sticker = state.sticker || "none";
  $$("[data-sticker]").forEach((button) => {
    button.classList.toggle("active", button.dataset.sticker === sticker);
  });
}

function setActivePatternType() {
  const type = state.patternType || "dots";
  $$("[data-pattern-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.patternType === type);
  });
}

function setActiveAlignment() {
  const align = state.textAlignment || "left";
  $$("[data-align]").forEach((button) => {
    button.classList.toggle("active", button.dataset.align === align);
  });
}

function setActiveTextSize() {
  const target = state.textColorTarget || "product";
  const size = state[`${target}TextSize`] || "medium";
  $$("[data-text-size]").forEach((button) => {
    button.classList.toggle("active", button.dataset.textSize === size);
  });
}

function setActiveTextEffect() {
  const target = state.textColorTarget || "product";
  const effect = state[`${target}TextEffect`] || state.textEffect || "none";
  $$("[data-text-effect]").forEach((button) => {
    button.classList.toggle("active", button.dataset.textEffect === effect);
  });
}

function setActiveExportFormat() {
  const format = state.exportFormat || "png";
  $$("[data-export-format]").forEach((button) => {
    button.classList.toggle("active", button.dataset.exportFormat === format);
  });
}

function setActiveCampaignGoal() {
  const goal = state.campaignGoal || "sell";
  $$("[data-campaign-goal]").forEach((button) => {
    button.classList.toggle("active", button.dataset.campaignGoal === goal);
  });
}

function setActiveCampaignTone() {
  const tone = state.campaignTone || "direct";
  $$("[data-campaign-tone]").forEach((button) => {
    button.classList.toggle("active", button.dataset.campaignTone === tone);
  });
}

function updatePatternVisibility() {
  elements.patternTypeGroup.hidden = !state.pattern;
}

function updateStickerCursor() {
  const canvas = document.getElementById("posterCanvas");
  if (state.sticker && state.sticker !== "none") {
    canvas.classList.add("sticker-draggable");
  } else {
    canvas.classList.remove("sticker-draggable");
  }
}

function setActiveBrush() {
  const mode = state.brushMode || "none";
  $$("[data-brush]").forEach((button) => {
    button.classList.toggle("active", button.dataset.brush === mode);
  });
}

function updateBrushCursor() {
  const canvas = document.getElementById("posterCanvas");
  if (state.brushMode === "draw") {
    canvas.style.cursor = "crosshair";
  } else if (state.brushMode === "erase") {
    canvas.style.cursor = "cell";
  } else {
    canvas.style.cursor = "default";
  }
}

function removeBackground() {
  if (!loadedImage) return;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = loadedImage.width;
  tempCanvas.height = loadedImage.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(loadedImage, 0, 0);
  
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  // Simple background removal - make light/white pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    
    // If pixel is very light (background), make it transparent
    if (brightness > 220 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
      data[i + 3] = 0;
    }
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  state.photo = tempCanvas.toDataURL("image/png");
  loadPhoto();
}

function drawShadeOverlay(theme) {
  if (!state.showShade) return;
  const W = canvas.width;
  const H = canvas.height;
  
  ctx.save();
  ctx.globalAlpha = 0.15;
  
  // Top shade
  const topGradient = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  topGradient.addColorStop(0, theme.ink);
  topGradient.addColorStop(1, "transparent");
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, W, H * 0.4);
  
  // Bottom shade
  const bottomGradient = ctx.createLinearGradient(0, H * 0.6, 0, H);
  bottomGradient.addColorStop(0, "transparent");
  bottomGradient.addColorStop(1, theme.ink);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  
  ctx.restore();
}

function drawDiscountTimer(theme) {
  if (!state.discountTimer) return;
  const W = canvas.width;
  const H = canvas.height;
  
  ctx.save();
  ctx.translate(Number(state.timerPanX || 0), Number(state.timerPanY || 0));
  ctx.fillStyle = theme.alt;
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  
  const timerText = `⏰ ${state.discountTimer}`;
  const timerWidth = ctx.measureText(timerText).width + 40;
  const timerX = (W - timerWidth) / 2;
  const timerY = H - 140;
  
  roundFill(timerX, timerY, timerWidth, 44, 22, theme.alt);
  ctx.fillStyle = state.timerTextColor || "#ffffff";
  drawFittedText(timerText, W / 2, timerY + 30, timerWidth, 28, "center", getTextEffectFor("timer"), getTextOpacity("timer"));
  ctx.restore();
}

function drawShopInfo(theme) {
  const W = canvas.width;
  const H = canvas.height;
  const rating = state.shopRating || "";
  const location = state.shopLocation || "";
  
  if (!rating && !location) return;
  
  ctx.save();
  ctx.translate(Number(state.shopInfoPanX || 0), Number(state.shopInfoPanY || 0));
  ctx.fillStyle = getShopInfoTextColor(theme);
  ctx.font = "600 24px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  
  let infoY = H - 100;
  let infoText = "";
  
  if (rating) {
    const stars = "★".repeat(Math.min(5, Math.round(Number(rating)))) + "☆".repeat(5 - Math.min(5, Math.round(Number(rating))));
    infoText += `${stars} ${rating}`;
  }
  
  if (location) {
    infoText += `  📍 ${location}`;
  }
  
  drawFittedText(infoText, 56, infoY, W - 112, 24, "left", getTextEffectFor("shopInfo"), getTextOpacity("shopInfo"));
  ctx.restore();
}

function drawBrushStrokes() {
  if (!state.brushStrokes || state.brushStrokes.length === 0) return;
  
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  state.brushStrokes.forEach((stroke) => {
    if (!stroke || stroke.points.length < 2) return;
    
    ctx.beginPath();
    if (stroke.mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color || state.brushColor || "#ffffff";
      ctx.globalAlpha = 0.85;
    }
    ctx.lineWidth = stroke.size;
    
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
  
  ctx.restore();
}

function selectedPlan() {
  return PLANS[state.selectedPlan] || PLANS.yearly;
}

function planPrice(plan = selectedPlan()) {
  if (selectedMarket() === "ethiopia") {
    return { amount: plan.etAmount, unit: plan.etUnit, method: "CBE", destination: CBE_ACCOUNT };
  }
  return { amount: plan.amount, unit: plan.unit, method: "USDT TRC20", destination: WALLET_ADDRESS };
}

function setActivePlan() {
  const plan = selectedPlan();
  $$("[data-plan]").forEach((button) => {
    button.classList.toggle("active", button.dataset.plan === plan.id);
  });
  updatePaymentSummary();
}

function updatePaymentSummary() {
  const plan = selectedPlan();
  const price = planPrice(plan);
  const text = `${price.amount} ${price.unit} for ${plan.label}`;
  elements.paymentSummary.textContent = text;
  elements.modalPaymentSummary.textContent = text;
  elements.paymentMethodLabel.textContent = price.method;
  elements.paymentMethodValue.textContent = price.destination;
  elements.modalPaymentMethodLabel.textContent = price.method;
  elements.modalPaymentMethodValue.textContent = price.destination;
}

async function handlePhoto(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  state.photo = await fileToDataUrl(file);
  state.zoom = 1;
  state.lift = 0;
  state.imagePanX = 0;
  state.imagePanY = 0;
  saveState();
  await loadPhoto();
  hydrateControls();
  drawPoster();
  showToast("Photo loaded");
}

function fitImage() {
  state.designVisited = true;
  state.zoom = 1;
  state.lift = 0;
  state.imagePanX = 0;
  state.imagePanY = 0;
  saveState();
  hydrateControls();
  drawPoster();
  showToast("Image fitted");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadPhoto() {
  loadedImage = null;
  if (!state.photo) return;
  loadedImage = await loadImage(state.photo).catch(() => null);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function refreshLicense() {
  const savedLicense = localStorage.getItem(LICENSE_KEY) || "";
  const license = savedLicense ? await parseAndVerifyLicense(savedLicense) : null;
  trialStatus = {
    unlocked: Boolean(license && license.valid),
    license
  };

  if (trialStatus.unlocked) {
    const plan = PLANS[license.payload.plan] || PLANS.yearly;
    elements.licenseText.textContent = license.payload.plan === "lifetime" ? "Pro Lifetime" : "Pro Active";
    elements.accessStatus.textContent = license.payload.plan === "lifetime" ? "Pro Lifetime" : plan.label;
    elements.accessDetail.textContent = license.payload.exp === "lifetime" ? "Never expires" : `Expires ${formatDate(license.payload.exp)}`;
  } else {
    elements.licenseText.textContent = "Preview";
    elements.accessStatus.textContent = "Preview mode";
    elements.accessDetail.textContent = "Watermarked preview; Pro unlocks clean export";
  }
  updateGuide();
}

function hasExportAccess() {
  return Boolean(trialStatus && trialStatus.unlocked);
}

function isFreeTemplate() {
  const baseTemplate = String(state.template || "").split("-")[0];
  return FREE_TEMPLATES.includes(baseTemplate);
}

function canExportCurrentPoster() {
  return hasExportAccess() || isFreeTemplate();
}

function renderAll() {
  updateCaption();
  updateCampaignKit();
  drawPoster();
  renderSaved();
  refreshLicense();
  updateProofContact();
}

function drawPoster(forceClean = false) {
  const W = canvas.width;
  const H = canvas.height;
  const theme = getTheme();
  const lockedPreview = !forceClean && trialStatus && !hasExportAccess() && !isFreeTemplate();
  const subtleFreeMark = !forceClean && trialStatus && !hasExportAccess() && isFreeTemplate();

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = Number(state.designOpacity || 1);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);
  drawTemplateBackground(theme);
  if (state.pattern) drawPattern(theme);

  const imageBox = getImageBox();
  drawProductImage(imageBox, theme);
  drawPosterText(theme);
  if (state.sticker && state.sticker !== "none") drawStickers(theme);
  drawBrushStrokes();
  drawShadeOverlay(theme);
  drawDiscountTimer(theme);
  drawShopInfo(theme);
  ctx.restore();

  if (lockedPreview) {
    drawLockedWatermark();
  } else if (subtleFreeMark) {
    drawSubtleWatermark();
  }
  updateGuide();
}

function getTheme() {
  const generated = generateTemplateTheme(state.template);
  if (generated) return generated;
  
  const accent = state.accent;
  const themes = {
    market: { bg: "#f8fafb", ink: "#101820", soft: "#e7f4ef", accent, alt: "#ef4444" },
    luxe: { bg: "#101820", ink: "#fff8ef", soft: "#22313b", accent: "#d89a4c", alt: state.accent },
    pulse: { bg: "#fef08a", ink: "#101820", soft: "#ffffff", accent: "#2563eb", alt: "#ef4444" },
    clean: { bg: "#ffffff", ink: "#101820", soft: "#eef4f7", accent, alt: "#2563eb" },
    mono: { bg: "#f9fafb", ink: "#111827", soft: "#eef2f7", accent, alt: "#06b6d4" },
    social: { bg: "#101820", ink: "#ffffff", soft: "#172530", accent, alt: "#f59e0b" },
    urban: { bg: "#111827", ink: "#ffffff", soft: "#1f2937", accent, alt: "#ff3b5c" },
    minimal: { bg: "#fbfcfd", ink: "#101820", soft: "#eef2f7", accent, alt: "#111827" },
    retro: { bg: "#17324d", ink: "#fff7ed", soft: "#fee2b3", accent: "#f97316", alt: "#ec4899" },
    bold: { bg: "#ef4444", ink: "#ffffff", soft: "#fff7ed", accent: "#f59e0b", alt: "#84cc16" },
    fresh: { bg: "#e9fbf8", ink: "#102a43", soft: "#ffffff", accent, alt: "#2563eb" },
    gallery: { bg: "#f8fafc", ink: "#111827", soft: "#ffffff", accent, alt: "#db2777" },
    royal: { bg: "#241332", ink: "#fff7ed", soft: "#3b214f", accent: "#f8c471", alt: "#14b8a6" },
    neon: { bg: "#060b13", ink: "#f8fafc", soft: "#111827", accent: "#22d3ee", alt: "#f43f5e" },
    sunrise: { bg: "#fff7ed", ink: "#172554", soft: "#ffedd5", accent: "#fb7185", alt: "#f59e0b" },
    coffee: { bg: "#2a1810", ink: "#fff7ed", soft: "#4a2c1d", accent: "#d6a15d", alt: "#22c55e" },
    tech: { bg: "#07111f", ink: "#e0f2fe", soft: "#102a43", accent: "#38bdf8", alt: "#a3e635" },
    boutique: { bg: "#fff1f2", ink: "#312e81", soft: "#ffffff", accent: "#e11d48", alt: "#7c3aed" },
    harar: { bg: "#0f2f2b", ink: "#fffbea", soft: "#174a43", accent: "#f6c453", alt: "#ef4444" },
    addis: { bg: "#f8fafc", ink: "#0f172a", soft: "#e0f2fe", accent: "#16a34a", alt: "#dc2626" },
    rift: { bg: "#ecfeff", ink: "#164e63", soft: "#ffffff", accent: "#0891b2", alt: "#f97316" },
    habesha: { bg: "#fff8e7", ink: "#111827", soft: "#fef3c7", accent: "#16a34a", alt: "#dc2626" },
    jewelry: { bg: "#0f172a", ink: "#fff7ed", soft: "#1e293b", accent: "#fbbf24", alt: "#f472b6" },
    sport: { bg: "#f8fafc", ink: "#101820", soft: "#e2e8f0", accent: "#84cc16", alt: "#ef4444" },
    cosmetic: { bg: "#fdf2f8", ink: "#831843", soft: "#ffffff", accent: "#db2777", alt: "#f59e0b" }
  };
  return themes[state.template] || themes.market;
}

function drawTemplateBackground(theme) {
  const W = canvas.width;
  const H = canvas.height;

  if (state.template === "market") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, theme.bg);
    gradient.addColorStop(1, colorMix(theme.bg, theme.accent, 0.15));
    block(0, 0, W, H, gradient);
    block(0, 0, W, 140, theme.accent);
    block(0, H - 280, W, 280, theme.ink);
    roundFill(W - 320, 60, 280, 280, 140, colorMix(theme.alt, "#ffffff", 0.3));
    roundFill(60, H - 340, 200, 200, 100, theme.accent);
    block(0, H - 280, W, 8, theme.accent);
  }

  if (state.template === "luxe") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#0a0a0a");
    gradient.addColorStop(0.5, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a0a");
    block(0, 0, W, H, gradient);
    strokeRect(40, 40, W - 80, H - 80, theme.accent, 3, 20);
    strokeRect(50, 50, W - 100, H - 100, colorMix(theme.accent, "#ffffff", 0.3), 1, 16);
    block(0, 0, W, 160, colorMix(theme.ink, "#000000", 0.3));
    roundFill(W - 280, 80, 240, 240, 120, colorMix(theme.accent, "#ffffff", 0.15));
    block(0, H - 200, W, 200, colorMix(theme.ink, "#000000", 0.2));
  }

  if (state.template === "pulse") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#fef9c3");
    gradient.addColorStop(0.5, "#fef08a");
    gradient.addColorStop(1, "#fde047");
    block(0, 0, W, H, gradient);
    block(0, 0, W, 160, theme.accent);
    block(0, H - 200, W, 200, theme.ink);
    roundFill(80, 200, 300, 300, 150, "#ffffff");
    roundFill(W - 380, H - 500, 280, 280, 140, colorMix(theme.alt, "#ffffff", 0.4));
    block(0, H - 200, W, 6, theme.alt);
  }

  if (state.template === "clean") {
    block(0, 0, W, H, "#ffffff");
    block(0, 0, W, 130, theme.ink);
    block(0, H - 180, W, 180, theme.accent);
    strokeRect(36, 170, W - 72, 760, "#e5e7eb", 3);
    block(60, 200, 8, H - 380, theme.accent);
    roundFill(W - 200, 60, 160, 160, 80, colorMix(theme.accent, "#ffffff", 0.2));
  }

  if (state.template === "mono") {
    block(0, 0, W, H, "#fafafa");
    block(0, 0, W, 120, theme.ink);
    block(0, H - 200, W, 200, "#ffffff");
    strokeRect(44, 160, W - 88, 760, "#e5e7eb", 3);
    block(44, 900, W - 88, 8, theme.accent);
    block(0, H - 200, W, 4, theme.accent);
  }

  if (state.template === "social") {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, theme.ink);
    gradient.addColorStop(0.3, colorMix(theme.ink, theme.accent, 0.3));
    gradient.addColorStop(1, theme.ink);
    block(0, 0, W, H, gradient);
    block(0, 0, W, 170, theme.accent);
    block(0, H - 200, W, 200, colorMix(theme.ink, "#000000", 0.3));
    roundFill(60, 220, 280, 280, 140, "#ffffff");
    roundFill(W - 340, H - 480, 260, 260, 130, theme.accent);
    block(0, H - 200, W, 5, theme.accent);
  }

  if (state.template === "urban") {
    block(0, 0, W, H, "#0f172a");
    block(0, 0, W, 140, colorMix(theme.ink, "#000000", 0.4));
    block(0, H - 220, W, 220, colorMix(theme.ink, "#000000", 0.3));
    diagonal(-100, 180, 500, 100, theme.alt);
    diagonal(W - 400, 100, 400, 100, theme.accent);
    diagonal(100, H - 300, 500, 120, colorMix(theme.accent, theme.alt, 0.5));
    strokeRect(48, 190, W - 96, 680, "rgba(255,255,255,0.1)", 3, 24);
    roundFill(70, 210, 240, 240, 120, colorMix(theme.accent, "#ffffff", 0.1));
  }

  if (state.template === "minimal") {
    block(0, 0, W, H, "#fafafa");
    block(0, 0, W, 100, "#ffffff");
    block(60, 140, 6, H - 320, theme.accent);
    strokeRect(90, 170, W - 180, 700, "#f3f4f6", 3, 16);
    block(0, H - 180, W, 180, "#ffffff");
    block(50, H - 196, W - 100, 6, theme.accent);
    roundFill(W - 180, 60, 140, 140, 70, colorMix(theme.accent, "#ffffff", 0.3));
  }

  if (state.template === "retro") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#1e3a5f");
    gradient.addColorStop(0.5, "#2d5a87");
    gradient.addColorStop(1, "#1e3a5f");
    block(0, 0, W, H, gradient);
    roundFill(-80, 120, 340, 340, 170, theme.accent);
    roundFill(W - 300, H - 420, 260, 260, 130, theme.alt);
    diagonal(200, H - 280, W - 400, 140, colorMix(theme.accent, "#ffffff", 0.3));
    block(0, H - 220, W, 220, "#fff7ed");
    strokeRect(56, 190, W - 112, 680, "rgba(255,247,237,0.6)", 4, 28);
  }

  if (state.template === "bold") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, theme.accent);
    gradient.addColorStop(0.5, colorMix(theme.accent, theme.alt, 0.3));
    gradient.addColorStop(1, theme.accent);
    block(0, 0, W, H, gradient);
    block(0, 0, W, 140, theme.ink);
    block(0, H - 240, W, 240, theme.ink);
    diagonal(-60, 160, 600, 140, theme.alt);
    diagonal(W - 500, 200, 500, 140, "#ffffff");
    roundFill(60, 200, 320, 320, 160, "rgba(255,255,255,0.15)");
    block(0, H - 240, W, 6, theme.alt);
  }

  if (state.template === "fresh") {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#ecfdf5");
    gradient.addColorStop(0.5, "#f0fdf4");
    gradient.addColorStop(1, "#dcfce7");
    block(0, 0, W, H, gradient);
    block(0, 0, W, 120, theme.ink);
    block(0, H - 190, W, 190, theme.ink);
    roundFill(50, 180, 340, 340, 170, "#ffffff");
    strokeRect(70, 200, W - 140, 680, colorMix(theme.accent, "#ffffff", 0.3), 3, 24);
    roundFill(W - 260, H - 420, 220, 220, 110, colorMix(theme.accent, "#ffffff", 0.2));
    block(0, H - 190, W, 5, theme.accent);
  }

  if (state.template === "gallery") {
    block(0, 0, W, H, "#f8fafc");
    block(0, 0, 120, H, theme.ink);
    block(120, 0, 12, H, theme.accent);
    block(180, 80, W - 240, 800, "#ffffff");
    strokeRect(180, 80, W - 240, 800, "#e5e7eb", 3, 8);
    block(0, H - 200, W, 200, "#ffffff");
    block(180, H - 218, W - 240, 8, theme.accent);
    roundFill(W - 160, 60, 120, 120, 60, colorMix(theme.accent, "#ffffff", 0.3));
  }

  if (!["market", "luxe", "pulse", "clean", "mono", "social", "urban", "minimal", "retro", "bold", "fresh", "gallery"].includes(state.template)) {
    drawPremiumBackground(theme);
  }
}

function drawPremiumBackground(theme) {
  const W = canvas.width;
  const H = canvas.height;
  const index = Math.max(0, TEMPLATE_IDS.indexOf(state.template));
  const family = index % 5;
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, theme.bg);
  gradient.addColorStop(0.5, theme.soft);
  gradient.addColorStop(1, colorMix(theme.accent, "#ffffff", 0.15));
  block(0, 0, W, H, gradient);

  if (family === 0) {
    block(0, 0, W, 150, colorMix(theme.ink, theme.bg, 0.15));
    block(0, H - 240, W, 240, colorMix(theme.ink, theme.bg, 0.1));
    roundFill(60, 200, W - 120, 660, 32, "rgba(255,255,255,0.92)");
    roundFill(W - 260, 80, 200, 200, 100, colorMix(theme.accent, "#ffffff", 0.25));
    roundFill(80, H - 320, 160, 160, 80, colorMix(theme.alt, "#ffffff", 0.2));
    block(0, H - 240, W, 5, theme.accent);
    return;
  }

  if (family === 1) {
    block(0, 0, W, H, theme.bg);
    strokeRect(44, 44, W - 88, H - 88, colorMix(theme.accent, "#ffffff", 0.2), 3, 24);
    roundFill(68, 180, W - 136, 700, 36, "rgba(255,255,255,0.95)");
    roundFill(W - 200, 60, 180, 180, 90, colorMix(theme.accent, "#ffffff", 0.2));
    block(0, H - 200, W, 200, colorMix(theme.ink, theme.bg, 0.12));
    block(0, H - 200, W, 4, theme.accent);
    return;
  }

  if (family === 2) {
    block(0, 0, W, 140, theme.accent);
    block(0, H - 220, W, 220, theme.ink);
    roundFill(-60, 140, 280, 280, 140, colorMix(theme.alt, "#ffffff", 0.15));
    roundFill(W - 240, 60, 240, 240, 120, colorMix(theme.accent, "#ffffff", 0.2));
    block(50, 210, W - 100, 680, "rgba(255,255,255,0.95)");
    block(0, H - 220, W, 5, theme.alt);
    return;
  }

  if (family === 3) {
    block(0, 0, 120, H, theme.ink);
    block(120, 0, 14, H, theme.accent);
    block(170, 90, W - 230, 780, "rgba(255,255,255,0.95)");
    roundFill(W - 180, 70, 150, 150, 75, colorMix(theme.accent, "#ffffff", 0.25));
    block(0, H - 200, W, 200, "#ffffff");
    block(170, H - 218, W - 230, 6, theme.accent);
    return;
  }

  block(0, 0, W, 120, colorMix(theme.ink, theme.bg, 0.2));
  block(0, H - 200, W, 200, colorMix(theme.ink, theme.bg, 0.1));
  strokeRect(56, 180, W - 112, 700, colorMix(theme.accent, "#ffffff", 0.3), 4, 32);
  roundFill(70, 200, 200, 200, 100, colorMix(theme.accent, "#ffffff", 0.2));
  roundFill(W - 270, H - 400, 180, 180, 90, colorMix(theme.alt, "#ffffff", 0.15));
  diagonal(-80, H - 350, 400, 100, theme.accent);
  block(0, H - 200, W, 4, theme.accent);
}

function colorMix(a, b, amount) {
  const first = hexToRgb(a);
  const second = hexToRgb(b);
  if (!first || !second) return a;
  const mix = (start, end) => Math.round(start * (1 - amount) + end * amount);
  return `rgb(${mix(first.r, second.r)}, ${mix(first.g, second.g)}, ${mix(first.b, second.b)})`;
}

function hexToRgb(value) {
  const hex = String(value || "").replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function getImageBox() {
  if (state.template === "clean") return { x: 72, y: 205, w: 936, h: 650, r: 26 };
  if (state.template === "mono") return { x: 88, y: 205, w: 904, h: 640, r: 18 };
  if (state.template === "social") return { x: 88, y: 270, w: 904, h: 585, r: 30 };
  if (state.template === "luxe") return { x: 92, y: 220, w: 896, h: 640, r: 34 };
  if (state.template === "pulse") return { x: 92, y: 252, w: 896, h: 630, r: 28 };
  if (state.template === "urban") return { x: 82, y: 242, w: 916, h: 604, r: 30 };
  if (state.template === "minimal") return { x: 118, y: 218, w: 844, h: 610, r: 20 };
  if (state.template === "retro") return { x: 94, y: 238, w: 892, h: 600, r: 36 };
  if (state.template === "bold") return { x: 92, y: 262, w: 896, h: 596, r: 24 };
  if (state.template === "fresh") return { x: 96, y: 232, w: 888, h: 620, r: 34 };
  if (state.template === "gallery") return { x: 196, y: 142, w: 792, h: 680, r: 8 };
  if (TEMPLATE_IDS.includes(state.template)) {
    const family = TEMPLATE_IDS.indexOf(state.template) % 5;
    if (family === 1) return { x: 104, y: 236, w: 872, h: 600, r: 36 };
    if (family === 2) return { x: 92, y: 270, w: 896, h: 590, r: 26 };
    if (family === 3) return { x: 204, y: 150, w: 778, h: 650, r: 12 };
    if (family === 4) return { x: 96, y: 230, w: 888, h: 620, r: 34 };
    return { x: 92, y: 250, w: 896, h: 610, r: 30 };
  }
  return { x: 54, y: 165, w: 972, h: 700, r: 28 };
}

function drawProductImage(box, theme) {
  roundedRect(box.x, box.y, box.w, box.h, box.r);
  ctx.save();
  ctx.clip();
  if (loadedImage) {
    drawImageCover(
      loadedImage,
      box.x,
      box.y,
      box.w,
      box.h,
      Number(state.zoom || 1),
      Number(state.lift || 0),
      Number(state.imagePanX || 0),
      Number(state.imagePanY || 0)
    );
  } else {
    drawSampleProduct(box, theme);
  }
  ctx.restore();
  strokeRect(box.x, box.y, box.w, box.h, "rgba(16,24,32,0.12)", 4, box.r);
}

function drawSampleProduct(box, theme) {
  const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  gradient.addColorStop(0, "#f7fafc");
  gradient.addColorStop(0.52, theme.soft);
  gradient.addColorStop(1, "#d7e0e7");
  block(box.x, box.y, box.w, box.h, gradient);

  ctx.save();
  ctx.translate(box.x + box.w * 0.5, box.y + box.h * 0.52);
  ctx.rotate(-0.1);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(16,24,32,0.24)";
  ctx.lineWidth = 9;
  roundFillStroke(-210, -180, 180, 360, 80);
  roundFillStroke(30, -180, 180, 360, 80);
  ctx.fillStyle = theme.accent;
  roundFill(-104, -38, 72, 76, 28);
  roundFill(136, -38, 72, 76, 28);
  ctx.restore();
}

function drawPosterText(theme) {
  const W = canvas.width;
  const H = canvas.height;
  const align = posterTextAlign();
  const headerBounds = state.template === "gallery"
    ? { x: 164, w: W - 220 }
    : { x: 54, w: W - 108 };
  const price = formatPrice(state.price);
  const oldPrice = state.oldPrice ? formatPrice(state.oldPrice) : "";
  const darkFooter = hasDarkFooter();
  const darkPriceBlock = ["clean", "mono", "minimal", "retro", "gallery", "addis", "rift", "habesha", "sport", "cosmetic"].includes(state.template);
  const headerEffect = getTextEffectFor("header");
  const productEffect = getTextEffectFor("product");
  const priceEffect = getTextEffectFor("price");
  const footerEffect = getTextEffectFor("footer");

  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.translate(Number(state.headerPanX || 0), Number(state.headerPanY || 0));
  ctx.fillStyle = getHeaderTextColor(theme);
  ctx.font = "900 52px Inter, system-ui, sans-serif";
  drawFittedText((state.shopName || "Your Shop").toUpperCase(), headerBounds.x, 84, headerBounds.w, 52, align, headerEffect, getTextOpacity("header"));
  ctx.restore();

  if (state.badge) drawOfferBadge(theme, oldPrice ? state.badgeText || "HOT DEAL" : state.badgeText || "NEW");

  const nameY = {
    clean: 970,
    minimal: 930,
    gallery: 930,
    retro: 940,
    bold: 940,
    fresh: 944
  }[state.template] || 948;
  ctx.save();
  ctx.translate(Number(state.productPanX || 0), Number(state.productPanY || 0));
  ctx.fillStyle = getMainTextColor(theme);
  ctx.font = "900 76px Inter, system-ui, sans-serif";
  wrapText(state.productName || "Product Name", 56, nameY, W - 112, 88, 2, align, productEffect, getTextOpacity("product"));
  ctx.restore();

  const priceY = H - 170;
  const priceBlockColor = darkPriceBlock ? "#101820" : "#ffffff";
  const priceTextColor = state.priceTextColor || (state.template === "luxe" ? "#101820" : darkPriceBlock ? "#ffffff" : theme.ink);
  const priceBox = getPriceBox(W);

  ctx.save();
  ctx.translate(Number(state.pricePanX || 0), Number(state.pricePanY || 0));
  if (state.template === "luxe") {
    roundFill(priceBox.x, priceY - 90, priceBox.w, 122, 18, "#d89a4c");
  } else if (darkPriceBlock) {
    roundFill(priceBox.x, priceY - 96, priceBox.w, 122, 18, "#101820");
  } else {
    roundFill(priceBox.x, priceY - 96, priceBox.w, 126, 18, priceBlockColor);
  }

  ctx.fillStyle = priceTextColor;
  ctx.font = "950 82px Inter, system-ui, sans-serif";
  drawFittedText(price || "$24", priceBox.x + 36, priceY, priceBox.w - 82, 84, "left", priceEffect, getTextOpacity("price"));

  if (oldPrice) {
    ctx.fillStyle = darkFooter || state.template === "luxe" ? "rgba(255,255,255,0.74)" : "rgba(16,24,32,0.58)";
    if (state.template === "clean") ctx.fillStyle = "#ffffff";
    ctx.font = "800 38px Inter, system-ui, sans-serif";
    const oldWidth = ctx.measureText(oldPrice).width;
    let ox = priceBox.x + priceBox.w + 32;
    let oy = priceY - 10;
    if (ox + oldWidth > W - 56) {
      ox = priceBox.x + 36;
      oy = priceY + 52;
    }
    ctx.fillText(oldPrice, ox, oy);
    ctx.lineWidth = 7;
    ctx.strokeStyle = theme.alt;
    ctx.beginPath();
    ctx.moveTo(ox - 4, oy - 16);
    ctx.lineTo(ox + oldWidth + 8, oy - 16);
    ctx.stroke();
  }
  ctx.restore();

  const cta = state.cta || t("orderNow");
  const phone = state.phone || "";
  const footerText = phone ? `${cta}  |  ${phone}` : cta;
  ctx.save();
  ctx.translate(Number(state.footerPanX || 0), Number(state.footerPanY || 0));
  ctx.fillStyle = getFooterTextColor(theme);
  ctx.font = "850 36px Inter, system-ui, sans-serif";
  drawFittedText(footerText, 56, H - 62, W - 112, 38, align, footerEffect, getTextOpacity("footer"));
  ctx.restore();
}

function posterTextAlign() {
  return ["left", "center", "right"].includes(state.textAlignment) ? state.textAlignment : "left";
}

function getTextSize(target) {
  const size = state[`${target}TextSize`] || "medium";
  const sizes = {
    small: 0.75,
    medium: 1,
    large: 1.35
  };
  return sizes[size] || 1;
}

function isDarkColor(color) {
  const rgb = hexToRgb(String(color));
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 150;
}

function contrastTextColor(background, darkColor = "#101820", lightColor = "#ffffff") {
  return isDarkColor(background) ? lightColor : darkColor;
}

function getFooterBackgroundColor(theme) {
  switch (state.template) {
    case "market":
    case "pulse":
    case "bold":
    case "fresh":
      return theme.ink;
    case "luxe":
      return colorMix(theme.ink, "#000000", 0.2);
    case "social":
    case "urban":
      return colorMix(theme.ink, "#000000", 0.3);
    case "clean":
      return theme.accent;
    case "minimal":
      return "#ffffff";
    case "retro":
      return "#fff7ed";
    case "gallery":
      return "#ffffff";
    default:
      return theme.bg;
  }
}

function getHeaderTextColor(theme) {
  if (state.headerTextColor) return state.headerTextColor;
  if (["market", "luxe", "pulse", "social", "urban", "retro", "bold", "fresh", "royal", "neon", "coffee", "tech", "harar", "jewelry"].includes(state.template)) {
    return "#ffffff";
  }
  return theme.ink;
}

function getMainTextColor(theme) {
  if (state.productTextColor) return state.productTextColor;
  if (["luxe", "social", "urban", "retro", "bold", "royal", "neon", "coffee", "tech", "harar", "jewelry"].includes(state.template)) {
    return "#ffffff";
  }
  return theme.ink;
}

function getFooterTextColor(theme) {
  if (state.footerTextColor) return state.footerTextColor;
  return contrastTextColor(getFooterBackgroundColor(theme), theme.ink, "#ffffff");
}

function getShopInfoTextColor(theme) {
  if (state.shopInfoTextColor) return state.shopInfoTextColor;
  return getFooterTextColor(theme);
}

function getTextEffectFor(target) {
  return state[`${target}TextEffect`] || state.textEffect || "none";
}

function getTextOpacity(target) {
  return Math.max(0, Math.min(1, Number(state[`${target}TextOpacity`] ?? 1)));
}

function hasDarkFooter() {
  return ["market", "luxe", "social", "urban", "bold", "fresh", "royal", "neon", "coffee", "tech", "harar", "jewelry", "pulse"].includes(state.template);
}

function formatPrice(value) {
  const price = cleanField(value, "");
  const currency = cleanField(state.currency, "");
  if (!price) return selectedMarket() === "ethiopia" ? `0 ${currency || "Birr"}` : `${currency || "$"}0`;
  if (selectedMarket() === "ethiopia") return `${price} ${currency || "Birr"}`;
  return `${currency || "$"}${price}`;
}

function getPriceBox(W) {
  const width = state.template === "luxe" ? 430 : 448;
  const align = posterTextAlign();
  if (align === "center") return { x: (W - width) / 2, w: width };
  if (align === "right") return { x: W - width - 56, w: width };
  return { x: state.template === "luxe" ? 72 : 56, w: width };
}

function drawOfferBadge(theme, text) {
  const W = canvas.width;
  const H = canvas.height;
  const style = state.bannerStyle || "ribbon";
  const position = state.bannerPosition || "top";
  const label = String(text || "HOT DEAL").toUpperCase();
  ctx.save();
  ctx.globalAlpha = Number(state.bannerOpacity || 1);
  const top = state.template === "luxe" ? 156 : state.template === "social" ? 174 : 128;

  if (style === "corner") {
    drawCornerBadge(theme, label, position);
    ctx.restore();
    return;
  }

  if (style === "band") {
    drawBandBadge(theme, label, position, top);
    ctx.restore();
    return;
  }

  if (style === "arc") {
    drawArcBadge(theme, label, position, top);
    ctx.restore();
    return;
  }

  if (style === "wave") {
    drawWaveBadge(theme, label, position, top);
    ctx.restore();
    return;
  }

  if (style === "slash") {
    drawSlashBadge(theme, label, position, top);
    ctx.restore();
    return;
  }

  if (style === "badge") {
    drawBadgeStyle(theme, label, position, top);
    ctx.restore();
    return;
  }

  const isPill = style === "pill";
  const box = {
    w: isPill ? 270 : 238,
    h: isPill ? 76 : 82,
    r: isPill ? 38 : 18
  };
  const place = getBadgePlacement(W, H, box, position, top);

  ctx.save();
  ctx.translate(place.x, place.y);
  ctx.rotate(isPill ? 0 : place.rotation);
  roundFill(0, 0, box.w, box.h, box.r, theme.alt);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px Inter, system-ui, sans-serif";
  drawFittedText(label, 28, Math.round(box.h * 0.64), box.w - 56, 30, "center");
  ctx.restore();
  ctx.restore();
}

function getBadgePlacement(W, H, box, position, top) {
  const align = posterTextAlign();
  const centeredX = (W - box.w) / 2;
  const defaultX = align === "right" ? 72 : W - box.w - 72;
  const placements = {
    top: { x: align === "center" ? centeredX : defaultX, y: top, rotation: -0.18 },
    right: { x: W - box.w - 70, y: top + 188, rotation: 0.12 },
    bottom: { x: align === "center" ? centeredX : 72, y: H - 354, rotation: -0.08 },
    left: { x: 72, y: top + 188, rotation: -0.12 }
  };
  return placements[position] || placements.top;
}

function drawBandBadge(theme, label, position, top) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = theme.alt;
  if (position === "left" || position === "right") {
    const x = position === "left" ? 0 : W - 86;
    block(x, 0, 86, H, theme.alt);
    ctx.translate(x + 43, H / 2);
    ctx.rotate(position === "left" ? -Math.PI / 2 : Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px Inter, system-ui, sans-serif";
    drawFittedText(label, -330, 12, 660, 34, "center");
    ctx.restore();
    return;
  }

  const y = position === "bottom" ? H - 348 : top;
  block(0, y, W, 82, theme.alt);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 34px Inter, system-ui, sans-serif";
  drawFittedText(label, 58, y + 54, W - 116, 34, "center");
  ctx.restore();
}

function drawArcBadge(theme, label, position, top) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = theme.alt;
  
  const cx = W / 2;
  const cy = position === "bottom" ? H - 120 : top + 60;
  const rx = W * 0.4;
  const ry = 50;
  
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
  ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  drawFittedText(label, cx - rx + 20, cy - 10, rx * 2 - 40, 30, "center");
  ctx.restore();
}

function drawWaveBadge(theme, label, position, top) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = theme.alt;
  
  const y = position === "bottom" ? H - 200 : top;
  ctx.beginPath();
  ctx.moveTo(0, y);
  for (let x = 0; x <= W; x += 10) {
    ctx.lineTo(x, y + Math.sin(x * 0.03) * 20);
  }
  ctx.lineTo(W, y + 60);
  ctx.lineTo(0, y + 60);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px Inter, system-ui, sans-serif";
  drawFittedText(label, 58, y + 38, W - 116, 30, "center");
  ctx.restore();
}

function drawSlashBadge(theme, label, position, top) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = theme.alt;
  
  const x = position === "right" ? W - 200 : position === "left" ? 0 : W * 0.3;
  const y = position === "bottom" ? H - 200 : top;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 300, y);
  ctx.lineTo(x + 280, y + 70);
  ctx.lineTo(x - 20, y + 70);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px Inter, system-ui, sans-serif";
  drawFittedText(label, x + 20, y + 45, 260, 28, "center");
  ctx.restore();
}

function drawBadgeStyle(theme, label, position, top) {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  
  const isTop = position === "top";
  const isRight = position === "right";
  const isBottom = position === "bottom";
  const isLeft = position === "left";
  
  let x, y, rotation = 0;
  const badgeW = 180;
  const badgeH = 50;
  
  if (isTop) { x = W / 2 - badgeW / 2; y = top; }
  else if (isBottom) { x = W / 2 - badgeW / 2; y = H - badgeH - 40; }
  else if (isRight) { x = W - badgeW - 30; y = H / 2 - badgeH / 2; rotation = 0.15; }
  else { x = 30; y = H / 2 - badgeH / 2; rotation = -0.15; }
  
  ctx.translate(x + badgeW / 2, y + badgeH / 2);
  ctx.rotate(rotation);
  
  roundFill(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2, theme.alt);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 14), 0, 8);
  ctx.restore();
}

function drawCornerBadge(theme, label, position) {
  const W = canvas.width;
  const H = canvas.height;
  const size = 250;
  ctx.save();
  ctx.fillStyle = theme.alt;

  if (position === "left") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();
    ctx.translate(92, 96);
    ctx.rotate(-0.78);
  } else if (position === "bottom") {
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W - size, H);
    ctx.lineTo(W, H - size);
    ctx.closePath();
    ctx.fill();
    ctx.translate(W - 96, H - 92);
    ctx.rotate(-0.78);
  } else {
    ctx.beginPath();
    ctx.moveTo(W - size, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, size);
    ctx.closePath();
    ctx.fill();
    ctx.translate(W - 92, 96);
    ctx.rotate(0.78);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 29px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 12), 0, 0);
  ctx.restore();
}

function drawPattern(theme) {
  const W = canvas.width;
  const H = canvas.height;
  const type = state.patternType || "dots";
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = theme.accent;
  ctx.fillStyle = theme.accent;
  ctx.lineWidth = 4;

  if (type === "stripes") {
    ctx.rotate(-0.18);
    for (let x = -W; x < W * 1.7; x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, -120);
      ctx.lineTo(x, H + 220);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === "grid") {
    for (let x = 60; x < W; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 72; y < H; y += 96) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === "waves") {
    for (let row = 0; row < 8; row += 1) {
      ctx.beginPath();
      const yOffset = row * 140 + 70;
      for (let x = 0; x <= W; x += 5) {
        const y = yOffset + Math.sin(x * 0.02 + row) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === "circles") {
    for (let r = 30; r < Math.max(W, H); r += 60) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === "triangles") {
    for (let row = 0; row < 6; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const x = col * 140 + (row % 2 ? 70 : 0);
        const y = row * 120;
        ctx.beginPath();
        ctx.moveTo(x, y + 60);
        ctx.lineTo(x + 60, y);
        ctx.lineTo(x + 120, y + 60);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  if (type === "hexagons") {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const x = col * 100 + (row % 2 ? 50 : 0);
        const y = row * 86;
        drawHexagon(x, y, 40);
      }
    }
    ctx.restore();
    return;
  }

  if (type === "diamonds") {
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        const x = col * 90 + (row % 2 ? 45 : 0);
        const y = row * 80;
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 30, y);
        ctx.lineTo(x, y + 30);
        ctx.lineTo(x - 30, y);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  if (type === "crosshatch") {
    for (let i = -H; i < W + H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i + H, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (type === "zigzag") {
    ctx.beginPath();
    for (let y = 40; y < H; y += 30) {
      for (let x = 0; x <= W; x += 20) {
        const zy = y + (x % 40 === 0 ? 0 : 15);
        if (x === 0 && y === 40) ctx.moveTo(x, zy);
        else ctx.lineTo(x, zy);
      }
    }
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Default: dots
  for (let y = 86; y < H; y += 86) {
    for (let x = 70; x < W; x += 92) {
      ctx.beginPath();
      ctx.arc(x + ((y / 86) % 2) * 28, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHexagon(x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawStickers(theme) {
  const W = canvas.width;
  const H = canvas.height;
  const sticker = state.sticker || "none";
  ctx.save();
  
  if (state.stickerX || state.stickerY) {
    ctx.translate(Number(state.stickerX || 0), Number(state.stickerY || 0));
  }

  if (sticker === "spark") {
    drawStar(116, 230, 42, 18, theme.alt);
    drawStar(W - 128, 860, 34, 14, theme.accent);
    drawStar(W - 178, 224, 24, 10, "#ffffff");
  }

  if (sticker === "sale") {
    drawMiniSticker(86, 882, 174, 70, "FAST SALE", theme.alt);
    drawMiniSticker(W - 246, 218, 168, 68, "LIMITED", theme.accent);
  }

  if (sticker === "hearts") {
    drawHeart(116, H - 376, 42, theme.alt);
    drawHeart(W - 122, 238, 34, theme.accent);
    drawHeart(W - 182, 875, 24, "#ffffff");
  }

  if (sticker === "confetti") {
    const colors = [theme.accent, theme.alt, "#ffffff", "#f59e0b", "#06b6d4"];
    for (let i = 0; i < 32; i += 1) {
      const x = i % 2 ? 76 + (i * 43) % 240 : W - 280 + (i * 37) % 220;
      const y = 160 + (i * 61) % 760;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i % 7) * 0.28);
      roundFill(-8, -4, 16, 8, 3, colors[i % colors.length]);
      ctx.restore();
    }
  }

  if (sticker === "stars") {
    const colors = [theme.accent, theme.alt, "#fbbf24", "#ffffff", "#f59e0b"];
    for (let i = 0; i < 12; i += 1) {
      const x = 80 + (i * 97) % (W - 160);
      const y = 180 + (i * 83) % (H - 360);
      const size = 18 + (i % 3) * 10;
      drawStar(x, y, size, size * 0.4, colors[i % colors.length]);
    }
  }

  if (sticker === "lightning") {
    ctx.fillStyle = theme.alt;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, 180);
    ctx.lineTo(W * 0.35, 260);
    ctx.lineTo(W * 0.32, 260);
    ctx.lineTo(W * 0.45, 380);
    ctx.lineTo(W * 0.38, 340);
    ctx.lineTo(W * 0.42, 340);
    ctx.lineTo(W * 0.3, 180);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(W * 0.65, 600);
    ctx.lineTo(W * 0.7, 680);
    ctx.lineTo(W * 0.67, 680);
    ctx.lineTo(W * 0.8, 800);
    ctx.lineTo(W * 0.73, 760);
    ctx.lineTo(W * 0.77, 760);
    ctx.lineTo(W * 0.65, 600);
    ctx.fill();
  }

  if (sticker === "fire") {
    drawFlameShape(W * 0.25, H * 0.7, 60, theme.alt);
    drawFlameShape(W * 0.75, H * 0.6, 50, theme.accent);
    drawFlameShape(W * 0.5, H * 0.8, 45, "#f59e0b");
  }

  if (sticker === "snow") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 20; i += 1) {
      const x = 60 + (i * 53) % (W - 120);
      const y = 140 + (i * 71) % (H - 280);
      const r = 4 + (i % 4) * 2;
      drawSnowflake(x, y, r);
    }
  }

  if (sticker === "music") {
    ctx.fillStyle = theme.accent;
    drawMusicNote(W * 0.2, H * 0.3, 40);
    ctx.fillStyle = theme.alt;
    drawMusicNote(W * 0.7, H * 0.5, 35);
    ctx.fillStyle = "#fbbf24";
    drawMusicNote(W * 0.4, H * 0.7, 30);
  }

  if (sticker === "crown") {
    drawCrown(W * 0.5, H * 0.2, 80, theme.accent);
  }

  if (sticker === "trophy") {
    drawTrophy(W * 0.3, H * 0.25, 50, theme.alt);
    drawTrophy(W * 0.7, H * 0.7, 45, theme.accent);
  }

  if (sticker === "rocket") {
    drawRocket(W * 0.5, H * 0.3, 60, theme.accent);
    drawRocket(W * 0.2, H * 0.6, 40, theme.alt);
  }

  if (sticker === "diamond") {
    drawDiamond(W * 0.5, H * 0.25, 50, theme.accent);
    drawDiamond(W * 0.25, H * 0.65, 35, theme.alt);
    drawDiamond(W * 0.75, H * 0.55, 40, "#fbbf24");
  }

  if (sticker === "flame") {
    drawFlameShape(W * 0.5, H * 0.3, 70, theme.alt);
    drawFlameShape(W * 0.3, H * 0.6, 50, theme.accent);
    drawFlameShape(W * 0.7, H * 0.5, 55, "#f59e0b");
  }

  if (sticker === "burst") {
    const colors = [theme.accent, theme.alt, "#fbbf24", "#ffffff", "#f59e0b"];
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const x = W * 0.5 + Math.cos(angle) * 120;
      const y = H * 0.5 + Math.sin(angle) * 120;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-4, -20, 8, 40);
      ctx.restore();
    }
  }

  if (sticker === "arrow") {
    ctx.fillStyle = theme.accent;
    drawArrow(W * 0.3, H * 0.3, 50);
    ctx.fillStyle = theme.alt;
    drawArrow(W * 0.7, H * 0.6, 45);
  }

  if (sticker === "check") {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(W * 0.35, H * 0.35);
    ctx.lineTo(W * 0.45, H * 0.5);
    ctx.lineTo(W * 0.65, H * 0.25);
    ctx.stroke();
    ctx.strokeStyle = theme.alt;
    ctx.beginPath();
    ctx.moveTo(W * 0.6, H * 0.6);
    ctx.lineTo(W * 0.7, H * 0.75);
    ctx.lineTo(W * 0.9, H * 0.55);
    ctx.stroke();
  }

  if (sticker === "starburst") {
    drawStarBurst(W * 0.5, H * 0.3, 60, theme.accent);
    drawStarBurst(W * 0.25, H * 0.6, 45, theme.alt);
    drawStarBurst(W * 0.75, H * 0.5, 50, "#fbbf24");
  }

  if (sticker === "snowflake") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i += 1) {
      const x = 100 + (i * 117) % (W - 200);
      const y = 160 + (i * 89) % (H - 320);
      drawSnowflake(x, y, 15);
    }
  }

  if (sticker === "wave") {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let x = 60; x < W - 60; x += 5) {
      const y = H * 0.4 + Math.sin(x * 0.03) * 30;
      if (x === 60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = theme.alt;
    ctx.beginPath();
    for (let x = 60; x < W - 60; x += 5) {
      const y = H * 0.6 + Math.sin(x * 0.03 + 1) * 30;
      if (x === 60) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawMiniSticker(x, y, w, h, label, fill) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.08);
  roundFill(-w / 2, -h / 2, w, h, 18, fill);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 25px Inter, system-ui, sans-serif";
  drawFittedText(label, -w / 2 + 18, 9, w - 36, 25, "center");
  ctx.restore();
}

function drawStar(cx, cy, outer, inner, fill) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawHeart(cx, cy, size, fill) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size / 32, size / 32);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-28, -10, -18, -32, 0, -18);
  ctx.bezierCurveTo(18, -32, 28, -10, 0, 10);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawFlameShape(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.5, -size * 0.5, size * 0.8, size * 0.2, 0, size);
  ctx.bezierCurveTo(-size * 0.8, size * 0.2, -size * 0.5, -size * 0.5, 0, -size);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 6; i += 1) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size);
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(-size * 0.3, -size * 0.7);
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(size * 0.3, -size * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMusicNote(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillRect(-size * 0.15, -size, size * 0.3, size);
  ctx.beginPath();
  ctx.ellipse(-size * 0.2, 0, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.3, -size * 0.3, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrown(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(-size, size * 0.3);
  ctx.lineTo(-size, -size * 0.3);
  ctx.lineTo(-size * 0.5, size * 0.1);
  ctx.lineTo(0, -size * 0.5);
  ctx.lineTo(size * 0.5, size * 0.1);
  ctx.lineTo(size, -size * 0.3);
  ctx.lineTo(size, size * 0.3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawTrophy(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size);
  ctx.lineTo(size * 0.4, -size);
  ctx.lineTo(size * 0.5, size * 0.3);
  ctx.quadraticCurveTo(size * 0.6, size * 0.6, size * 0.2, size * 0.6);
  ctx.lineTo(-size * 0.2, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.6, size * 0.6, -size * 0.5, size * 0.3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillRect(-size * 0.15, size * 0.6, size * 0.3, size * 0.4);
  ctx.restore();
}

function drawRocket(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.5, -size * 0.5, size * 0.5, size * 0.3, size * 0.3, size * 0.5);
  ctx.lineTo(-size * 0.3, size * 0.5);
  ctx.bezierCurveTo(-size * 0.5, size * 0.3, -size * 0.5, -size * 0.5, 0, -size);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.5);
  ctx.lineTo(-size * 0.5, size);
  ctx.lineTo(0, size * 0.7);
  ctx.lineTo(size * 0.5, size);
  ctx.lineTo(size * 0.3, size * 0.5);
  ctx.fillStyle = theme.alt;
  ctx.fill();
  ctx.restore();
}

function drawDiamond(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.6);
  ctx.lineTo(size * 0.3, 0);
  ctx.lineTo(0, size * 0.6);
  ctx.lineTo(-size * 0.3, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();
  ctx.restore();
}

function drawStarBurst(x, y, size, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = fill;
  for (let i = 0; i < 12; i += 1) {
    ctx.save();
    ctx.rotate((i / 12) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.15, -size);
    ctx.lineTo(size * 0.15, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

function drawArrow(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(-size, -size * 0.3);
  ctx.lineTo(size * 0.3, -size * 0.3);
  ctx.lineTo(size * 0.3, -size);
  ctx.lineTo(size * 0.8, 0);
  ctx.lineTo(size * 0.3, size);
  ctx.lineTo(size * 0.3, size * 0.3);
  ctx.lineTo(-size, size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLockedWatermark() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.fillStyle = "rgba(16, 24, 32, 0.18)";
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.45);
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.font = "950 86px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PREVIEW MODE", 0, 0);
  ctx.font = "850 34px Inter, system-ui, sans-serif";
  ctx.fillText("Clean export requires Pro", 0, 60);
  ctx.restore();
}

function drawSubtleWatermark() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.translate(W - 238, H - 98);
  ctx.rotate(-0.08);
  ctx.fillStyle = "rgba(16, 24, 32, 0.12)";
  ctx.font = "900 26px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Made with SellSnap", 0, 0);
  ctx.fillStyle = "rgba(16, 24, 32, 0.07)";
  ctx.font = "850 18px Inter, system-ui, sans-serif";
  ctx.fillText("Free design", 0, 28);
  ctx.restore();
}

function drawImageCover(image, x, y, w, h, zoom, lift, panX = 0, panY = 0) {
  const baseScale = Math.max(w / image.width, h / image.height) * zoom;
  const sw = w / baseScale;
  const sh = h / baseScale;
  const sx = Math.min(image.width - sw, Math.max(0, (image.width - sw) / 2 + panX / baseScale));
  const sy = Math.min(image.height - sh, Math.max(0, (image.height - sh) / 2 - lift / baseScale + panY / baseScale));
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(text, x, y, maxWidth, lineHeight, maxLines, align = "left", effect = "none", opacity = 1) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) {
    visible[visible.length - 1] = `${visible[visible.length - 1].replace(/\.+$/, "")}...`;
  }
  visible.forEach((lineText, index) => {
    drawFittedText(lineText, x, y + index * lineHeight, maxWidth, parseFontSize(ctx.font), align, effect, opacity);
  });
}

function getAutoTextOutlineColor(fillStyle) {
  const rgb = hexToRgb(String(fillStyle));
  if (!rgb) return "rgba(0,0,0,0.2)";
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 150 ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.32)";
}

function drawFittedText(text, x, y, maxWidth, startSize, align = "left", effect = "none", opacity = 1) {
  ctx.save();
  ctx.globalAlpha = Number(opacity || 1);
  const currentFont = ctx.font;
  const family = currentFont.replace(/^[^ ]+ [0-9]+px /, "");
  const weight = currentFont.match(/^([^ ]+)/)?.[1] || "800";
  const previousAlign = ctx.textAlign;
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  ctx.textAlign = align;
  const drawX = align === "center" ? x + maxWidth / 2 : align === "right" ? x + maxWidth : x;
  
  const settings = TEXT_EFFECTS[effect] || TEXT_EFFECTS.none;
  const outlineColor = settings.outline > 0 ? "rgba(0,0,0,0.5)" : getAutoTextOutlineColor(ctx.fillStyle);
  const outlineWidth = settings.outline > 0 ? settings.outline : 2;
  
  ctx.lineWidth = outlineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(text, drawX, y);
  
  if (settings.shadow > 0) {
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = settings.shadow;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  
  if (settings.glow > 0) {
    ctx.shadowColor = state.accent;
    ctx.shadowBlur = settings.glow;
  }
  
  ctx.fillText(text, drawX, y);
  ctx.textAlign = previousAlign;
  ctx.restore();
}

function drawFittedTextOn(target, text, x, y, maxWidth, startSize, align = "left") {
  const currentFont = target.font;
  const family = currentFont.replace(/^[^ ]+ [0-9]+px /, "");
  const weight = currentFont.match(/^([^ ]+)/)?.[1] || "800";
  const previousAlign = target.textAlign;
  let size = startSize;
  target.font = `${weight} ${size}px ${family}`;
  while (target.measureText(text).width > maxWidth && size > 18) {
    size -= 2;
    target.font = `${weight} ${size}px ${family}`;
  }
  target.textAlign = align;
  const drawX = align === "center" ? x + maxWidth / 2 : align === "right" ? x + maxWidth : x;
  target.fillText(text, drawX, y);
  target.textAlign = previousAlign;
}

function parseFontSize(font) {
  const match = font.match(/([0-9]+)px/);
  return match ? Number(match[1]) : 40;
}

function updateCaption() {
  const price = formatPrice(state.price);
  const old = state.oldPrice ? `${t("oldPrice")}: ${formatPrice(state.oldPrice)}\n` : "";
  const phone = state.phone ? `\n${t("contact")}: ${state.phone}` : "";
  const captions = [
    `${state.productName}\nNow ${price}\n${old}${state.cta}${phone}`,
    `Fresh deal from ${state.shopName}\n${state.productName} for ${price}\nLimited stock available.${phone}`,
    `Upgrade your day with ${state.productName}.\nPrice: ${price}\n${state.cta}${phone}`,
    `${state.productName} is ready for pickup or delivery.\nToday: ${price}\nMessage now to order.${phone}`
  ];
  elements.captionOutput.value = captions[state.captionIndex % captions.length];
}

function updateCampaignKit() {
  const kit = buildCampaignKit();
  elements.campaignOutput.value = kit.text;
  elements.offerScore.textContent = kit.score;
  elements.offerDetail.textContent = kit.detail;
}

function buildCampaignKit() {
  const shop = cleanField(state.shopName, "Your shop");
  const product = cleanField(state.productName, "Product");
  const price = formatPrice(state.price) || "best price";
  const cta = cleanField(state.cta, t("orderNow"));
  const phone = cleanField(state.phone, "");
  const discount = discountPercent();
  const goal = state.campaignGoal || "sell";
  const tone = state.campaignTone || "direct";
  const angle = campaignAngle(goal, tone, product, price, discount);
  const hashtags = buildHashtags(product, shop);
  const score = campaignScore(discount, phone, state.oldPrice, state.badgeText);
  const contact = phone ? `\nContact: ${phone}` : "";

  return {
    score: `${score.value}/100`,
    detail: score.detail,
    text: [
      `WhatsApp`,
      `${angle.whatsapp}\n${cta}.${contact}`,
      ``,
      `Instagram`,
      `${angle.instagram}\n${hashtags}`,
      ``,
      `Facebook`,
      `${angle.facebook}\n${phone ? `Message or call ${phone}.` : cta}`,
      ``,
      `Short caption`,
      `${product} - ${price}. ${cta}.`,
      ``,
      `Ad headline`,
      `${angle.headline}`,
      ``,
      `Seller note`,
      `${shop} | ${discount ? `${discount}% off | ` : ""}${state.badgeText || t("freshDeal")}`
    ].join("\n")
  };
}

function campaignAngle(goal, tone, product, price, discount) {
  const savings = discount ? ` Save ${discount}% while stock lasts.` : "";
  const toneOpeners = {
    direct: {
      sell: `${product} is ready now for ${price}.`,
      clear: `${product} clearance is live at ${price}.`,
      launch: `${product} just landed at ${price}.`,
      premium: `${product} brings a cleaner, premium upgrade for ${price}.`
    },
    friendly: {
      sell: `Good news: ${product} is available today for ${price}.`,
      clear: `A nice deal before it goes: ${product} is now ${price}.`,
      launch: `New arrival for your daily setup: ${product} at ${price}.`,
      premium: `Treat yourself to ${product}, now available for ${price}.`
    },
    bold: {
      sell: `Stop scrolling. ${product} is ${price} today.`,
      clear: `Final call: ${product} is moving fast at ${price}.`,
      launch: `Fresh drop: ${product} is here for ${price}.`,
      premium: `Premium pick: ${product} is built to stand out at ${price}.`
    }
  };
  const opener = (toneOpeners[tone] || toneOpeners.direct)[goal] || toneOpeners.direct.sell;
  return {
    whatsapp: `${opener}${savings}`,
    instagram: `${opener}${savings}\nDM to order or reserve yours.`,
    facebook: `${opener}${savings} Pickup and delivery options available.`,
    headline: goal === "clear" ? `Limited ${product} deal` : goal === "launch" ? `New ${product} available` : `${product} for ${price}`
  };
}

function buildHashtags(product, shop) {
  const tokens = `${product} ${shop}`.toLowerCase().match(/[a-z0-9]+/g) || [];
  const useful = tokens.filter((token) => token.length > 2).slice(0, 4);
  return [...new Set(["#shopnow", "#deal", "#forsale", ...useful.map((token) => `#${token}`)])].slice(0, 8).join(" ");
}

function campaignScore(discount, phone, oldPrice, badgeText) {
  let value = 48;
  if (discount >= 10) value += 18;
  if (discount >= 25) value += 8;
  if (phone) value += 10;
  if (oldPrice) value += 8;
  if (badgeText) value += 6;
  value = Math.min(100, value);
  const detail = value >= 88 ? "Strong offer" : value >= 72 ? "Good offer" : "Add proof or urgency";
  return { value, detail };
}

function discountPercent() {
  const price = parseMoney(state.price);
  const oldPrice = parseMoney(state.oldPrice);
  if (!price || !oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function parseMoney(value) {
  const parsed = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanField(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function nextCaption() {
  state.captionIndex += 1;
  saveState();
  updateCaption();
}

function smartRemix() {
  const product = `${state.productName} ${state.cta}`.toLowerCase();
  const goal = state.campaignGoal || "sell";
  state.designVisited = true;
  state.campaignVisited = true;

  if (goal === "premium" || /watch|perfume|jewelry|lux|premium|leather/.test(product)) {
    Object.assign(state, {
      template: "luxe",
      accent: "#f59e0b",
      bannerStyle: "pill",
      bannerPosition: "top",
      sticker: "spark",
      pattern: false,
      textAlignment: "center"
    });
  } else if (goal === "clear") {
    Object.assign(state, {
      template: "bold",
      accent: "#84cc16",
      bannerStyle: "band",
      bannerPosition: "top",
      sticker: "sale",
      pattern: true,
      patternType: "stripes",
      textAlignment: "left"
    });
  } else if (/shoe|shirt|dress|bag|fashion|wear/.test(product)) {
    Object.assign(state, {
      template: "retro",
      accent: "#f97316",
      bannerStyle: "corner",
      bannerPosition: "right",
      sticker: "confetti",
      pattern: false,
      textAlignment: "center"
    });
  } else if (/phone|earbud|audio|speaker|charger|tech|laptop/.test(product)) {
    Object.assign(state, {
      template: "urban",
      accent: "#06b6d4",
      bannerStyle: "ribbon",
      bannerPosition: "top",
      sticker: "spark",
      pattern: true,
      patternType: "grid",
      textAlignment: "left"
    });
  } else {
    Object.assign(state, {
      template: "fresh",
      accent: "#14b8a6",
      bannerStyle: "pill",
      bannerPosition: "top",
      sticker: "none",
      pattern: true,
      patternType: "dots",
      textAlignment: "left"
    });
  }

  saveState();
  hydrateControls();
  updateCampaignKit();
  drawPoster();
  showToast("Campaign remixed");
}

async function exportCampaignPack() {
  await refreshLicense();
  if (!hasExportAccess()) {
    showPaywall();
    return;
  }

  const formats = [
    { id: "instagram-feed", label: "Instagram Feed", w: 1080, h: 1350, mode: "cover", cta: "DM to order", phone: "" },
    { id: "facebook-square", label: "Facebook Post", w: 1080, h: 1080, mode: "cover", cta: "Message to order", phone: state.phone },
    { id: "instagram-story", label: "Instagram Story", w: 1080, h: 1920, mode: "story", cta: "Reply to order", phone: "" },
    { id: "whatsapp-status", label: "WhatsApp Status", w: 1080, h: 1920, mode: "story", cta: "Order on WhatsApp", phone: state.phone }
  ];

  for (const format of formats) {
    const base = renderPosterSnapshot({ cta: format.cta, phone: format.phone });
    const output = renderCampaignFormat(base, format);
    const blob = await canvasElementToBlob(output);
    if (blob) {
      downloadBlobAs(blob, `${fileSafe(`${state.productName || "poster"}-${format.id}`)}.${exportExtension()}`);
    }
  }
  drawPoster();
  showToast("Campaign pack exported");
}

function renderPosterSnapshot(overrides = {}) {
  const previous = {};
  Object.keys(overrides).forEach((key) => {
    previous[key] = state[key];
    state[key] = overrides[key];
  });

  drawPoster(true);
  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext("2d").drawImage(canvas, 0, 0);

  Object.keys(previous).forEach((key) => {
    state[key] = previous[key];
  });
  return snapshot;
}

function renderCampaignFormat(base, format) {
  const output = document.createElement("canvas");
  output.width = format.w;
  output.height = format.h;
  const out = output.getContext("2d");
  const theme = getTheme();
  drawCampaignBackground(out, format.w, format.h, theme);

  if (format.mode === "story") {
    const maxW = format.w * 0.86;
    const maxH = format.h * 0.72;
    const scale = Math.min(maxW / base.width, maxH / base.height);
    const dw = base.width * scale;
    const dh = base.height * scale;
    const dx = (format.w - dw) / 2;
    const dy = 88;
    drawCanvasShadow(out, dx, dy, dw, dh, 28);
    out.drawImage(base, dx, dy, dw, dh);
    drawStoryFooter(out, format.w, format.h, theme, format);
    return output;
  }

  const scale = Math.max(format.w / base.width, format.h / base.height);
  const dw = base.width * scale;
  const dh = base.height * scale;
  const dx = (format.w - dw) / 2;
  const dy = (format.h - dh) / 2;
  out.drawImage(base, dx, dy, dw, dh);
  return output;
}

function drawCampaignBackground(out, W, H, theme) {
  const gradient = out.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, theme.bg);
  gradient.addColorStop(0.6, "#ffffff");
  gradient.addColorStop(1, theme.soft);
  out.fillStyle = gradient;
  out.fillRect(0, 0, W, H);
  out.fillStyle = theme.accent;
  out.globalAlpha = 0.92;
  out.fillRect(0, 0, W, 22);
  out.fillStyle = theme.alt;
  out.fillRect(0, H - 22, W, 22);
  out.globalAlpha = 1;
}

function drawCanvasShadow(out, x, y, w, h, r) {
  out.save();
  out.shadowColor = "rgba(16, 24, 32, 0.24)";
  out.shadowBlur = 34;
  out.shadowOffsetY = 18;
  roundedRectPath(out, x, y, w, h, r);
  out.fillStyle = "#ffffff";
  out.fill();
  out.restore();
}

function drawStoryFooter(out, W, H, theme, format) {
  const product = cleanField(state.productName, "Product");
  const price = formatPrice(state.price) || "best price";
  const cta = cleanField(format.cta, state.cta || t("orderNow"));
  const phone = cleanField(format.phone, "");
  const label = cleanField(format.label, "Story");
  const y = H - 330;

  out.fillStyle = "rgba(16, 24, 32, 0.92)";
  roundedRectPath(out, 78, y, W - 156, 228, 28);
  out.fill();
  out.fillStyle = "rgba(255, 255, 255, 0.68)";
  out.font = "850 24px Inter, system-ui, sans-serif";
  drawFittedTextOn(out, label.toUpperCase(), 104, y + 24, W - 208, 24);
  out.fillStyle = theme.accent;
  roundedRectPath(out, 104, y + 28, 210, 74, 18);
  out.fill();
  out.fillStyle = "#ffffff";
  out.font = "950 52px Inter, system-ui, sans-serif";
  out.fillText(price, 136, y + 82);
  out.font = "900 44px Inter, system-ui, sans-serif";
  drawFittedTextOn(out, product, 104, y + 150, W - 208, 44);
  out.font = "800 30px Inter, system-ui, sans-serif";
  drawFittedTextOn(out, phone ? `${cta} | ${phone}` : cta, 104, y + 196, W - 208, 30);
}

function canvasElementToBlob(target) {
  return new Promise((resolve) => {
    target.toBlob((blob) => resolve(blob), exportMimeType(), state.exportFormat === "jpeg" ? 0.9 : 0.96);
  });
}

async function exportPoster(returnBlob) {
  await refreshLicense();
  if (!canExportCurrentPoster()) {
    showPaywall();
    return null;
  }

  drawPoster(hasExportAccess());
  const blob = await canvasToBlob();
  drawPoster();
  if (!blob) {
    showToast("Export failed");
    return null;
  }

  if (returnBlob) return blob;

  downloadBlob(blob);
  showToast("Poster exported");
  return blob;
}

function canvasToBlob() {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), exportMimeType(), state.exportFormat === "jpeg" ? 0.9 : 0.96);
  });
}

async function sharePoster() {
  const blob = await exportPoster(true);
  if (!blob) return;

  const file = new File([blob], `${fileSafe(state.productName || "poster")}.${exportExtension()}`, { type: blob.type || exportMimeType() });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], text: elements.captionOutput.value }).catch(() => {});
    return;
  }
  downloadBlob(blob);
  showToast("Poster exported");
}

function downloadBlob(blob) {
  const name = `${fileSafe(`${state.productName || "poster"}-sellsnap`)}.${exportExtension()}`;
  downloadBlobAs(blob, name);
}

function downloadBlobAs(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function exportMimeType() {
  return state.exportFormat === "jpeg" ? "image/jpeg" : "image/png";
}

function exportExtension() {
  return state.exportFormat === "jpeg" ? "jpg" : "png";
}

function openWhatsApp() {
  const text = encodeURIComponent(elements.captionOutput.value);
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
}

function saveProduct() {
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    shopName: state.shopName,
    productName: state.productName,
    price: state.price,
    oldPrice: state.oldPrice,
    currency: state.currency,
    phone: state.phone,
    cta: state.cta,
    template: state.template,
    accent: state.accent,
    badge: state.badge,
    badgeText: state.badgeText,
    bannerStyle: state.bannerStyle,
    bannerPosition: state.bannerPosition,
    sticker: state.sticker,
    pattern: state.pattern,
    patternType: state.patternType,
    textAlignment: state.textAlignment,
    exportFormat: state.exportFormat,
    campaignGoal: state.campaignGoal,
    campaignTone: state.campaignTone,
    productEdited: true,
    photo: state.photo,
    zoom: state.zoom,
    lift: state.lift,
    discountTimer: state.discountTimer,
    shopRating: state.shopRating,
    shopLocation: state.shopLocation,
    showShade: state.showShade,
    brushStrokes: state.brushStrokes
  };
  state.saved = [item, ...state.saved.filter((saved) => saved.productName !== item.productName)].slice(0, 12);
  saveState();
  renderSaved();
  showToast("Product saved");
}

function renderSaved() {
  elements.savedList.innerHTML = "";
  if (!state.saved.length) {
    const empty = document.createElement("div");
    empty.className = "saved-empty";
    empty.textContent = "No saved products yet";
    elements.savedList.append(empty);
    return;
  }

  state.saved.forEach((item) => {
    const row = document.createElement("div");
    row.className = "saved-item";

    const loadButton = document.createElement("button");
    loadButton.className = "secondary-button saved-product";
    loadButton.type = "button";
    loadButton.textContent = `${item.productName || "Product"} - ${item.currency || ""}${item.price || ""}`;
    loadButton.addEventListener("click", async () => {
      Object.assign(state, {
        bannerPosition: DEFAULT_STATE.bannerPosition,
        sticker: DEFAULT_STATE.sticker,
        pattern: DEFAULT_STATE.pattern,
        patternType: DEFAULT_STATE.patternType,
        textAlignment: DEFAULT_STATE.textAlignment,
        exportFormat: DEFAULT_STATE.exportFormat,
        campaignGoal: DEFAULT_STATE.campaignGoal,
        campaignTone: DEFAULT_STATE.campaignTone,
        productEdited: true
      }, item);
      saveState();
      hydrateControls();
      await loadPhoto();
      renderAll();
      showToast("Product loaded");
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-button";
    deleteButton.type = "button";
    deleteButton.title = "Delete product";
    deleteButton.innerHTML = '<svg><use href="#icon-trash"></use></svg>';
    deleteButton.addEventListener("click", () => {
      state.saved = state.saved.filter((saved) => saved.id !== item.id);
      saveState();
      renderSaved();
    });

    row.append(loadButton, deleteButton);
    elements.savedList.append(row);
  });
}

async function activateLicense() {
  const code = elements.unlockCodeInput.value.trim();
  const result = await parseAndVerifyLicense(code);
  if (!result.valid) {
    showToast(result.reason || "Invalid unlock code");
    return;
  }
  localStorage.setItem(LICENSE_KEY, code);
  await refreshLicense();
  drawPoster();
  showToast("Pro activated - save your code");
}

async function parseAndVerifyLicense(code) {
  try {
    const [payloadB64, signatureB64] = code.split(".");
    if (!payloadB64 || !signatureB64) return { valid: false, reason: "Invalid format" };

    const payload = JSON.parse(textDecode(base64UrlToBytes(payloadB64)));
    const signature = base64UrlToBytes(signatureB64);
    const key = await crypto.subtle.importKey(
      "jwk",
      PUBLIC_KEY_JWK,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const verified = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      signature,
      textEncode(payloadB64)
    );

    if (!verified) return { valid: false, reason: "Signature failed" };
    if (payload.app !== APP_ID) return { valid: false, reason: "Wrong app" };
    if (payload.device !== deviceCode) return { valid: false, reason: "Wrong device" };
    if (payload.exp !== "lifetime" && new Date(payload.exp).getTime() < Date.now()) {
      return { valid: false, reason: "License expired" };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "Invalid unlock code" };
  }
}

async function getDeviceCode() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  const digest = await crypto.subtle.digest("SHA-256", textEncode(id));
  return `SS-${toBase32(new Uint8Array(digest)).slice(0, 16).match(/.{1,4}/g).join("-")}`;
}

function showPaywall() {
  elements.modalDeviceCode.textContent = deviceCode;
  if (typeof elements.paywallDialog.showModal === "function") {
    elements.paywallDialog.showModal();
  } else {
    setTab("license");
  }
}

function copyPaymentDetails() {
  copyText(paymentMessage(), "Payment message copied");
}

function paymentMessage() {
  const plan = selectedPlan();
  const price = planPrice(plan);
  const isEt = selectedMarket() === "ethiopia";
  return [
    t("paymentTitle"),
    isEt ? `Send proof to: @${TELEGRAM_USERNAME} on Telegram (screenshot)` : `Send proof to: ${PROOF_EMAIL}`,
    `Market: ${isEt ? "Ethiopia" : "Foreign"}`,
    `Plan: ${plan.label}`,
    `Amount: ${price.amount} ${price.unit}`,
    isEt ? `Payment method: CBE` : `Network: TRC20`,
    isEt ? `CBE account: ${CBE_ACCOUNT}` : `Wallet: ${WALLET_ADDRESS}`,
    `Device code: ${deviceCode}`,
    `${t("transaction")}: `
  ].join("\n");
}

function openProofEmail() {
  const isEt = selectedMarket() === "ethiopia";
  if (isEt) {
    window.open(`https://t.me/${TELEGRAM_USERNAME}`, "_blank", "noopener,noreferrer");
    return;
  }
  const subject = encodeURIComponent("SellSnap Studio payment proof");
  const body = encodeURIComponent(paymentMessage());
  window.location.href = `mailto:${PROOF_EMAIL}?subject=${subject}&body=${body}`;
}

function copyText(text, message) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(message),
      () => fallbackCopy(text, message)
    );
    return;
  }
  fallbackCopy(text, message);
}

function fallbackCopy(text, message) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  showToast(copied ? message : "Copy failed");
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function textEncode(value) {
  return new TextEncoder().encode(value);
}

function textDecode(bytes) {
  return new TextDecoder().decode(bytes);
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toBase32(bytes) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let bits = 0;
  let value = 0;
  let output = "";
  bytes.forEach((byte) => {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  });
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function fileSafe(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "poster";
}

function block(x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function diagonal(x, y, w, h, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  block(0, 0, w, h, fill);
  ctx.restore();
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function roundedRectPath(target, x, y, w, h, r) {
  target.beginPath();
  target.moveTo(x + r, y);
  target.arcTo(x + w, y, x + w, y + h, r);
  target.arcTo(x + w, y + h, x, y + h, r);
  target.arcTo(x, y + h, x, y, r);
  target.arcTo(x, y, x + w, y, r);
  target.closePath();
}

function roundFill(x, y, w, h, r, fill) {
  roundedRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundFillStroke(x, y, w, h, r) {
  roundedRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
}

function strokeRect(x, y, w, h, color, width, r = 0) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (r) roundedRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.stroke();
  ctx.restore();
}

function centerText(text, x, y) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.restore();
}
