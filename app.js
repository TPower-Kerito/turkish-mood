/**
 * Turkish Mood - Main Client Application Logic (Refined)
 * =======================================================
 * Features:
 *  1. Animated Dark/Light Sliding Pill Toggle Switch in Sticky Header
 *  2. Customer View Switcher (Standard Grid vs 2-Column Café Menu)
 *  3. In-Place Natural Position Merged Size Variants (Default ON)
 *  4. Clean Studio Pre-cropped Images (Zero Baked-in Price Banners)
 *  5. Hidden Admin/Owner Panel (Only shown with ?admin=1 in URL)
 *  6. Google Sheets CSV Hybrid Sync & Dynamic Category Tabs
 *  7. Instant Search, Filter & Sort Engine
 *  8. Lightbox Zoom Modal
 *  9. Modular Phase 2 WhatsApp Order Integration
 */

(function () {
  "use strict";

  // State Management
  const AppState = {
    products: [],
    activeCategory: "all",
    searchQuery: "",
    sortBy: "default",
    
    // UI Settings (persisted in localStorage)
    theme: localStorage.getItem("turkish_mood_theme") || (window.CONFIG ? window.CONFIG.DEFAULT_THEME : "dark"),
    viewMode: localStorage.getItem("turkish_mood_view_mode") || (window.CONFIG ? window.CONFIG.DEFAULT_VIEW_MODE : "grid"),
    imageMode: localStorage.getItem("turkish_mood_image_mode") || (window.CONFIG ? window.CONFIG.DEFAULT_IMAGE_MODE : "crop"),
    grouping: localStorage.getItem("turkish_mood_grouping") || (window.CONFIG ? window.CONFIG.DEFAULT_GROUPING : "merged"),
    
    // Phase 2 WhatsApp toggle
    enableWhatsApp: (window.CONFIG && window.CONFIG.ENABLE_WHATSAPP) || (localStorage.getItem("turkish_mood_preview_wa") === "true"),

    // Interactive card selections [productId -> { grind, weight, price, image, label }]
    interactiveState: {}
  };

  // Normalization for Theme names
  function normalizeTheme(t) {
    if (t === "cream-minimalist" || t === "light") return "light";
    return "dark";
  }

  // DOM Elements cache
  const DOM = {
    root: document.documentElement,
    body: document.body,
    grid: document.getElementById("productsGrid"),
    categoriesContainer: document.getElementById("categoriesContainer"),
    searchInput: document.getElementById("searchInput"),
    searchClearBtn: document.getElementById("searchClearBtn"),
    sortSelect: document.getElementById("sortSelect"),
    resultsCount: document.getElementById("resultsCount"),
    emptyState: document.getElementById("emptyState"),
    resetSearchBtn: document.getElementById("resetSearchBtn"),
    
    // Header Dark/Light Animated Toggle
    headerThemeToggle: document.getElementById("headerThemeToggle"),
    themeThumb: document.getElementById("themeThumb"),
    themeThumbIcon: document.getElementById("themeThumbIcon"),
    
    // Customer View Mode Switcher
    viewModeBtns: document.querySelectorAll("[data-set-view]"),
    
    // Admin / Owner Panel
    previewWidget: document.getElementById("previewWidget"),
    previewToggleBtn: document.getElementById("previewToggleBtn"),
    previewPopover: document.getElementById("previewPopover"),
    previewCloseBtn: document.getElementById("previewCloseBtn"),
    themeChoiceBtns: document.querySelectorAll("[data-set-theme]"),
    imageModeBtns: document.querySelectorAll("[data-set-image-mode]"),
    groupingBtns: document.querySelectorAll("[data-set-grouping]"),
    sheetUrlInput: document.getElementById("sheetUrlInput"),
    sheetSyncBtn: document.getElementById("sheetSyncBtn"),
    sheetSyncStatus: document.getElementById("sheetSyncStatus"),
    waToggleBtn: document.getElementById("waToggleBtn"),
    
    // Lightbox modal
    lightboxModal: document.getElementById("lightboxModal"),
    lightboxImage: document.getElementById("lightboxImage"),
    lightboxTitle: document.getElementById("lightboxTitle"),
    lightboxBrand: document.getElementById("lightboxBrand"),
    lightboxWeight: document.getElementById("lightboxWeight"),
    lightboxPrice: document.getElementById("lightboxPrice"),
    lightboxCloseBtn: document.getElementById("lightboxCloseBtn")
  };

  // =========================================================
  // 1. Initialization
  // =========================================================
  async function init() {
    checkAdminVisibility();
    applyTheme(normalizeTheme(AppState.theme));
    applyViewMode(AppState.viewMode);
    applyImageMode(AppState.imageMode);
    applyGrouping(AppState.grouping);
    setupEventListeners();

    // Load initial data (hybrid: local fallback + Google Sheets if configured)
    if (window.ProductDataService) {
      AppState.products = await window.ProductDataService.loadInitialData();
      updateSyncStatusUI();
    } else if (typeof DEFAULT_PRODUCTS !== "undefined") {
      AppState.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    }

    renderDynamicCategories();
    renderCatalog();
  }

  // Check URL for ?admin=1
  function checkAdminVisibility() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get("admin") === "1" || localStorage.getItem("turkish_mood_admin") === "1";
    if (isAdmin) {
      localStorage.setItem("turkish_mood_admin", "1");
      if (DOM.previewWidget) DOM.previewWidget.style.display = "block";
    } else {
      if (DOM.previewWidget) DOM.previewWidget.style.display = "none";
    }
  }

  // =========================================================
  // 2. Settings & Themes
  // =========================================================
  function applyTheme(themeName) {
    const norm = normalizeTheme(themeName);
    AppState.theme = norm;
    DOM.root.setAttribute("data-theme", norm);
    DOM.body.setAttribute("data-theme", norm);
    localStorage.setItem("turkish_mood_theme", norm);
    
    // Update header animated toggle icon
    if (DOM.themeThumbIcon) {
      if (norm === "light") {
        // Sun icon
        DOM.themeThumbIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        `;
      } else {
        // Moon icon
        DOM.themeThumbIcon.innerHTML = `
          <path d="M12.3 2a10 10 0 0 0-.19 20 10 10 0 0 0 8.35-4.5 1 1 0 0 0-.91-1.5 8 8 0 0 1-7.25-14 1 1 0 0 0 0-1.89z"/>
        `;
      }
    }

    // Sync admin panel radio buttons if open
    if (DOM.themeChoiceBtns) {
      DOM.themeChoiceBtns.forEach(btn => {
        btn.classList.toggle("active", normalizeTheme(btn.getAttribute("data-set-theme")) === norm);
      });
    }
  }

  function applyViewMode(viewMode) {
    AppState.viewMode = viewMode;
    DOM.root.setAttribute("data-view-mode", viewMode);
    DOM.body.setAttribute("data-view-mode", viewMode);
    localStorage.setItem("turkish_mood_view_mode", viewMode);

    if (DOM.viewModeBtns) {
      DOM.viewModeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-set-view") === viewMode);
      });
    }
  }

  function applyImageMode(mode) {
    AppState.imageMode = mode;
    DOM.body.setAttribute("data-image-mode", mode);
    localStorage.setItem("turkish_mood_image_mode", mode);

    if (DOM.imageModeBtns) {
      DOM.imageModeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-set-image-mode") === mode);
      });
    }
    renderCatalog();
  }

  function applyGrouping(groupingMode) {
    AppState.grouping = groupingMode;
    localStorage.setItem("turkish_mood_grouping", groupingMode);

    if (DOM.groupingBtns) {
      DOM.groupingBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-set-grouping") === groupingMode);
      });
    }
    renderCatalog();
  }

  function updateSyncStatusUI() {
    if (!DOM.sheetSyncStatus) return;
    const src = window.ProductDataService ? window.ProductDataService.source : "محلي";
    DOM.sheetSyncStatus.textContent = `المصدر الحالي: ${src}`;
    
    const savedCustomUrl = localStorage.getItem("turkish_mood_custom_sheet_url") || (window.CONFIG ? window.CONFIG.GOOGLE_SHEET_CSV_URL : "");
    if (DOM.sheetUrlInput && savedCustomUrl) {
      DOM.sheetUrlInput.value = savedCustomUrl;
    }

    if (DOM.waToggleBtn) {
      DOM.waToggleBtn.textContent = AppState.enableWhatsApp ? "مفعّل (انقر للتعطيل)" : "معطل (انقر لتجربة الشراء)";
      DOM.waToggleBtn.classList.toggle("active", AppState.enableWhatsApp);
    }
  }

  // =========================================================
  // 3. Dynamic Categories Generator
  // =========================================================
  function renderDynamicCategories() {
    if (!DOM.categoriesContainer) return;

    const categoriesMap = new Map();
    let totalCount = 0;

    AppState.products.forEach(p => {
      totalCount++;
      const cat = p.category || "أخرى";
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    let html = `
      <button type="button" class="category-tab-btn ${AppState.activeCategory === 'all' ? 'active' : ''}" data-category="all">
        <span>عرض الكل</span>
        <span class="category-badge-count">${totalCount}</span>
      </button>
    `;

    categoriesMap.forEach((count, catName) => {
      const isActive = AppState.activeCategory === catName;
      html += `
        <button type="button" class="category-tab-btn ${isActive ? 'active' : ''}" data-category="${catName}">
          <span>${catName}</span>
          <span class="category-badge-count">${count}</span>
        </button>
      `;
    });

    DOM.categoriesContainer.innerHTML = html;

    DOM.categoriesContainer.querySelectorAll(".category-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        AppState.activeCategory = btn.getAttribute("data-category");
        renderDynamicCategories();
        renderCatalog();
      });
    });
  }

  // =========================================================
  // 4. Catalog Preparation with Natural In-Place Merging
  // =========================================================
  function getPreparedDisplayItems() {
    let items = [...AppState.products];

    // Filter by Category
    if (AppState.activeCategory !== "all") {
      items = items.filter(p => p.category === AppState.activeCategory);
    }

    // Filter by Search Query
    const q = AppState.searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(p => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const weight = (p.weight || "").toLowerCase();
        return name.includes(q) || brand.includes(q) || cat.includes(q) || desc.includes(q) || weight.includes(q);
      });
    }

    // Sort items
    if (AppState.sortBy === "price-asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (AppState.sortBy === "price-desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (AppState.sortBy === "brand") {
      items.sort((a, b) => (a.brand || "").localeCompare(b.brand || "", "ar"));
    }

    // Natural In-Place Size Grouping (Merged Variants)
    // Ensures grouped items remain in their original category position at top!
    if (AppState.grouping === "merged") {
      const seenGroups = new Set();
      const mergedList = [];

      items.forEach(item => {
        if (item.variant_group) {
          if (seenGroups.has(item.variant_group)) {
            // Already merged and placed in-line at first occurrence!
            return;
          }
          seenGroups.add(item.variant_group);
          
          // Find all variants with this group in items
          const groupVariants = items.filter(p => p.variant_group === item.variant_group);
          if (groupVariants.length <= 1) {
            mergedList.push(item);
          } else {
            groupVariants.sort((a, b) => a.price - b.price);
            const base = groupVariants[0];
            const compositeItem = {
              id: `group-${item.variant_group}`,
              isMergedCard: true,
              groupKey: item.variant_group,
              name: base.name.replace(/\s*\(كيس\)|\s*\(علبة\)/g, "").trim(),
              brand: base.brand,
              category: base.category,
              description: base.description,
              variants: groupVariants.map(v => ({
                id: v.id,
                name: v.name,
                weight: v.weight,
                price: v.price,
                image: v.image,
                original_image: v.original_image || v.image.replace("cropped/", ""),
                variant_label: v.variant_label || v.weight
              })),
              activeVariantIndex: 0
            };
            mergedList.push(compositeItem);
          }
        } else {
          mergedList.push(item);
        }
      });

      return mergedList;
    }

    return items;
  }

  // Get active image based on display mode
  function getProductImage(item) {
    if (AppState.imageMode === "full") {
      return item.original_image || item.image.replace("cropped/", "");
    }
    return item.image;
  }

  // =========================================================
  // 5. Render Catalog Grid
  // =========================================================
  function renderCatalog() {
    if (!DOM.grid) return;

    const displayItems = getPreparedDisplayItems();

    if (DOM.resultsCount) {
      DOM.resultsCount.textContent = `عرض ${displayItems.length} من أصل ${AppState.products.length} منتج`;
    }

    if (displayItems.length === 0) {
      DOM.grid.innerHTML = "";
      if (DOM.emptyState) DOM.emptyState.style.display = "block";
      return;
    }

    if (DOM.emptyState) DOM.emptyState.style.display = "none";

    let html = "";
    displayItems.forEach(item => {
      if (item.isMergedCard) {
        html += renderMergedVariantCard(item);
      } else {
        html += renderSingleProductCard(item);
      }
    });

    DOM.grid.innerHTML = html;
    attachCardListeners();
  }

  // Render a Single Product Card
  function renderSingleProductCard(product) {
    const isInteractive = product.interactive && product.options;
    const currentState = AppState.interactiveState[product.id] || {};
    
    let displayPrice = product.price;
    let displayWeight = product.weight;
    let selectedGrind = currentState.grind || (isInteractive ? product.options.grinds[0] : null);

    if (isInteractive && product.options.weights) {
      const selectedWeightIdx = currentState.weightIdx !== undefined ? currentState.weightIdx : 0;
      const opt = product.options.weights[selectedWeightIdx];
      if (opt) {
        displayPrice = opt.price;
        displayWeight = opt.label;
      }
    }

    const imgSrc = getProductImage(product);

    let interactiveHtml = "";
    if (isInteractive) {
      let grindsHtml = product.options.grinds.map(g => `
        <button type="button" class="option-pill-btn ${selectedGrind === g ? 'active' : ''}" data-card-id="${product.id}" data-action="set-grind" data-value="${g}">
          ${g}
        </button>
      `).join("");

      let weightsHtml = product.options.weights.map((w, idx) => {
        const isAct = (currentState.weightIdx !== undefined ? currentState.weightIdx : 0) === idx;
        return `
          <button type="button" class="option-pill-btn ${isAct ? 'active' : ''}" data-card-id="${product.id}" data-action="set-weight" data-idx="${idx}">
            ${w.label}
          </button>
        `;
      }).join("");

      interactiveHtml = `
        <div class="product-interactive-box">
          <div class="interactive-label">
            <span>نوع الطحن:</span>
            <span style="color:var(--accent-gold); font-weight:800;">${selectedGrind}</span>
          </div>
          <div class="pill-group">${grindsHtml}</div>
          
          <div class="interactive-label" style="margin-top:0.25rem;">
            <span>حجم العبوة:</span>
          </div>
          <div class="pill-group">${weightsHtml}</div>
        </div>
      `;
    }

    const waBtnHtml = AppState.enableWhatsApp ? `
      <button type="button" class="whatsapp-action-btn" style="display:flex;" data-wa-product="${product.id}" data-wa-name="${product.name}" data-wa-price="${displayPrice}" data-wa-weight="${displayWeight}">
        <svg style="width:17px;height:17px;fill:currentColor" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
        </svg>
        <span>طلب عبر واتساب</span>
      </button>
    ` : "";

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="card-badges-overlay">
          <span class="brand-badge">${product.brand || "Turkish Mood"}</span>
          <span class="weight-badge">${displayWeight}</span>
        </div>
        
        <div class="product-image-container" data-action="zoom" data-img="${imgSrc}" data-title="${product.name}" data-brand="${product.brand}" data-price="${displayPrice}" data-weight="${displayWeight}">
          <img src="${imgSrc}" alt="${product.name}" class="product-image" loading="lazy">
          <button class="zoom-hint-btn" title="تكبير الصورة">
            <svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <div class="product-content">
          <div>
            <div class="product-category-text">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description || ""}</p>
            ${interactiveHtml}
          </div>

          <div class="product-card-footer">
            <div class="price-container">
              <span class="price-number">${displayPrice}</span>
              <span class="price-currency">${window.CONFIG ? window.CONFIG.CURRENCY : "ج.م"}</span>
            </div>
            <span class="stock-status-pill in-stock">متوفر بالمخزن</span>
          </div>

          ${waBtnHtml}
        </div>
      </div>
    `;
  }

  // Render Merged Variants Card (e.g. Kocatepe Light)
  function renderMergedVariantCard(composite) {
    const currentState = AppState.interactiveState[composite.id] || { variantIdx: 0 };
    const activeVar = composite.variants[currentState.variantIdx || 0];
    const imgSrc = getProductImage(activeVar);

    let variantPills = composite.variants.map((v, idx) => {
      const isAct = (currentState.variantIdx || 0) === idx;
      return `
        <button type="button" class="option-pill-btn ${isAct ? 'active' : ''}" data-composite-id="${composite.id}" data-action="set-variant" data-idx="${idx}">
          ${v.variant_label}
        </button>
      `;
    }).join("");

    const waBtnHtml = AppState.enableWhatsApp ? `
      <button type="button" class="whatsapp-action-btn" style="display:flex;" data-wa-product="${activeVar.id}" data-wa-name="${activeVar.name}" data-wa-price="${activeVar.price}" data-wa-weight="${activeVar.weight}">
        <svg style="width:17px;height:17px;fill:currentColor" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
        </svg>
        <span>طلب عبر واتساب</span>
      </button>
    ` : "";

    return `
      <div class="product-card merged-variant-card" data-composite-id="${composite.id}">
        <div class="card-badges-overlay">
          <span class="brand-badge">${composite.brand}</span>
          <span class="weight-badge">${activeVar.weight}</span>
        </div>
        
        <div class="product-image-container" data-action="zoom" data-img="${imgSrc}" data-title="${activeVar.name}" data-brand="${composite.brand}" data-price="${activeVar.price}" data-weight="${activeVar.weight}">
          <img src="${imgSrc}" alt="${activeVar.name}" class="product-image" loading="lazy">
          <button class="zoom-hint-btn" title="تكبير الصورة">
            <svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <div class="product-content">
          <div>
            <div class="product-category-text">${composite.category} (أحجام متعددة)</div>
            <h3 class="product-title">${composite.name}</h3>
            <p class="product-description">${composite.description || ""}</p>
            
            <div class="product-interactive-box">
              <div class="interactive-label">
                <span>اختر الحجم والعبوة:</span>
                <span style="color:var(--accent-gold); font-weight:800;">${activeVar.variant_label}</span>
              </div>
              <div class="pill-group">${variantPills}</div>
            </div>
          </div>

          <div class="product-card-footer">
            <div class="price-container">
              <span class="price-number">${activeVar.price}</span>
              <span class="price-currency">${window.CONFIG ? window.CONFIG.CURRENCY : "ج.م"}</span>
            </div>
            <span class="stock-status-pill in-stock">متوفر بالمخزن</span>
          </div>

          ${waBtnHtml}
        </div>
      </div>
    `;
  }

  // =========================================================
  // 6. Interactive Card Listeners
  // =========================================================
  function attachCardListeners() {
    DOM.grid.querySelectorAll('[data-action="zoom"]').forEach(el => {
      el.addEventListener("click", () => {
        openLightbox({
          img: el.getAttribute("data-img"),
          title: el.getAttribute("data-title"),
          brand: el.getAttribute("data-brand"),
          price: el.getAttribute("data-price"),
          weight: el.getAttribute("data-weight")
        });
      });
    });

    DOM.grid.querySelectorAll('[data-action="set-grind"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardId = btn.getAttribute("data-card-id");
        const val = btn.getAttribute("data-value");
        AppState.interactiveState[cardId] = AppState.interactiveState[cardId] || {};
        AppState.interactiveState[cardId].grind = val;
        renderCatalog();
      });
    });

    DOM.grid.querySelectorAll('[data-action="set-weight"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardId = btn.getAttribute("data-card-id");
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        AppState.interactiveState[cardId] = AppState.interactiveState[cardId] || {};
        AppState.interactiveState[cardId].weightIdx = idx;
        renderCatalog();
      });
    });

    DOM.grid.querySelectorAll('[data-action="set-variant"]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const compId = btn.getAttribute("data-composite-id");
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        AppState.interactiveState[compId] = AppState.interactiveState[compId] || {};
        AppState.interactiveState[compId].variantIdx = idx;
        renderCatalog();
      });
    });

    DOM.grid.querySelectorAll('[data-wa-product]').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = btn.getAttribute("data-wa-name");
        const price = btn.getAttribute("data-wa-price");
        const weight = btn.getAttribute("data-wa-weight");
        handleWhatsAppInquiry(name, weight, price);
      });
    });
  }

  // =========================================================
  // 7. Lightbox Modal Logic
  // =========================================================
  function openLightbox(data) {
    if (!DOM.lightboxModal) return;
    DOM.lightboxImage.src = data.img;
    DOM.lightboxImage.alt = data.title;
    DOM.lightboxTitle.textContent = data.title;
    DOM.lightboxBrand.textContent = data.brand || "Turkish Mood";
    DOM.lightboxWeight.textContent = data.weight || "";
    DOM.lightboxPrice.textContent = `${data.price} ${window.CONFIG ? window.CONFIG.CURRENCY : "ج.م"}`;
    DOM.lightboxModal.classList.add("open");
  }

  function closeLightbox() {
    if (DOM.lightboxModal) {
      DOM.lightboxModal.classList.remove("open");
    }
  }

  function handleWhatsAppInquiry(name, weight, price) {
    const phone = (window.CONFIG && window.CONFIG.WHATSAPP_PHONE) ? window.CONFIG.WHATSAPP_PHONE : "201000000000";
    const msg = `مرحباً Turkish Mood، أود الاستفسار وطلب:\n- المنتج: ${name}\n- الحجم/الوزن: ${weight}\n- السعر: ${price} ج.م\nشكراً لكم!`;
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    window.open(waUrl, "_blank");
  }

  // =========================================================
  // 8. Event Listeners Setup
  // =========================================================
  function setupEventListeners() {
    // Header Animated Theme Toggle Switch (64px x 32px pill)
    if (DOM.headerThemeToggle) {
      DOM.headerThemeToggle.addEventListener("click", () => {
        const current = normalizeTheme(AppState.theme);
        const next = current === "light" ? "dark" : "light";
        applyTheme(next);
      });
      DOM.headerThemeToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const current = normalizeTheme(AppState.theme);
          applyTheme(current === "light" ? "dark" : "light");
        }
      });
    }

    // Customer View Mode Switcher
    DOM.viewModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-set-view");
        applyViewMode(mode);
      });
    });

    // Search input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener("input", (e) => {
        AppState.searchQuery = e.target.value;
        if (DOM.searchClearBtn) {
          DOM.searchClearBtn.style.display = AppState.searchQuery ? "block" : "none";
        }
        renderCatalog();
      });
    }

    // Search clear button
    if (DOM.searchClearBtn) {
      DOM.searchClearBtn.addEventListener("click", () => {
        DOM.searchInput.value = "";
        AppState.searchQuery = "";
        DOM.searchClearBtn.style.display = "none";
        renderCatalog();
        DOM.searchInput.focus();
      });
    }

    // Sort select
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener("change", (e) => {
        AppState.sortBy = e.target.value;
        renderCatalog();
      });
    }

    // Reset search button
    if (DOM.resetSearchBtn) {
      DOM.resetSearchBtn.addEventListener("click", () => {
        AppState.searchQuery = "";
        AppState.activeCategory = "all";
        if (DOM.searchInput) DOM.searchInput.value = "";
        if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = "none";
        renderDynamicCategories();
        renderCatalog();
      });
    }

    // Admin Panel Controls
    if (DOM.previewToggleBtn && DOM.previewPopover) {
      DOM.previewToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        DOM.previewPopover.classList.toggle("open");
      });
    }

    if (DOM.previewCloseBtn) {
      DOM.previewCloseBtn.addEventListener("click", () => {
        DOM.previewPopover.classList.remove("open");
      });
    }

    document.addEventListener("click", (e) => {
      if (DOM.previewPopover && DOM.previewPopover.classList.contains("open")) {
        if (!DOM.previewPopover.contains(e.target) && !DOM.previewToggleBtn.contains(e.target)) {
          DOM.previewPopover.classList.remove("open");
        }
      }
    });

    DOM.themeChoiceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyTheme(btn.getAttribute("data-set-theme"));
      });
    });

    DOM.imageModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyImageMode(btn.getAttribute("data-set-image-mode"));
      });
    });

    DOM.groupingBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyGrouping(btn.getAttribute("data-set-grouping"));
      });
    });

    if (DOM.sheetSyncBtn && DOM.sheetUrlInput) {
      DOM.sheetSyncBtn.addEventListener("click", async () => {
        const url = DOM.sheetUrlInput.value.trim();
        if (!url) {
          localStorage.removeItem("turkish_mood_custom_sheet_url");
          DOM.sheetSyncStatus.textContent = "تم إزالة الرابط. جاري إعادة تحميل البيانات المحلية...";
          AppState.products = await window.ProductDataService.loadInitialData();
          renderDynamicCategories();
          renderCatalog();
          updateSyncStatusUI();
          return;
        }

        DOM.sheetSyncStatus.textContent = "جاري الاتصال والتحميل...";
        localStorage.setItem("turkish_mood_custom_sheet_url", url);
        const res = await window.ProductDataService.syncFromGoogleSheet(url);
        if (res.success) {
          DOM.sheetSyncStatus.textContent = `تم التحديث بنجاح (${res.count} منتج)`;
          AppState.products = window.ProductDataService.getProducts();
          renderDynamicCategories();
          renderCatalog();
          updateSyncStatusUI();
        } else {
          DOM.sheetSyncStatus.textContent = `تعذر التحديث: ${res.error}`;
        }
      });
    }

    if (DOM.waToggleBtn) {
      DOM.waToggleBtn.addEventListener("click", () => {
        AppState.enableWhatsApp = !AppState.enableWhatsApp;
        localStorage.setItem("turkish_mood_preview_wa", AppState.enableWhatsApp ? "true" : "false");
        updateSyncStatusUI();
        renderCatalog();
      });
    }

    if (DOM.lightboxCloseBtn) {
      DOM.lightboxCloseBtn.addEventListener("click", closeLightbox);
    }
    if (DOM.lightboxModal) {
      DOM.lightboxModal.addEventListener("click", (e) => {
        if (e.target === DOM.lightboxModal) closeLightbox();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
