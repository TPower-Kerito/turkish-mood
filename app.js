/**
 * Turkish Mood - Main Client Application Logic
 * =============================================
 * Handles:
 *  1. Theme Switching (Dark Luxury, Cream Minimalist, Compact Café Menu)
 *  2. Image Mode Switching (Smart Crop top 78% vs Full Original Image)
 *  3. Size Grouping (Separate Cards vs Merged Variants with dynamic image/price switch)
 *  4. Google Sheets Hybrid Data Sync & Dynamic Category Generation
 *  5. Search, Filter, & Sort Engine
 *  6. Interactive Espresso Options (Grind & Weight switches)
 *  7. Lightbox Zoom Modal
 *  8. Hidden / Modular WhatsApp Cart Module (Phase 2 ready)
 */

(function () {
  "use strict";

  // State Management
  const AppState = {
    products: [],
    activeCategory: "all",
    searchQuery: "",
    sortBy: "default",
    
    // UI Preview & Owner Settings (persisted in localStorage)
    theme: localStorage.getItem("turkish_mood_theme") || (window.CONFIG ? window.CONFIG.DEFAULT_THEME : "dark-luxury"),
    imageMode: localStorage.getItem("turkish_mood_image_mode") || (window.CONFIG ? window.CONFIG.DEFAULT_IMAGE_MODE : "crop"),
    grouping: localStorage.getItem("turkish_mood_grouping") || (window.CONFIG ? window.CONFIG.DEFAULT_GROUPING : "separate"),
    
    // Phase 2 WhatsApp toggle (controlled by CONFIG or preview panel)
    enableWhatsApp: (window.CONFIG && window.CONFIG.ENABLE_WHATSAPP) || (localStorage.getItem("turkish_mood_preview_wa") === "true"),

    // Interactive selections per card [productId -> { grind, weight, price, image, label }]
    interactiveState: {}
  };

  // DOM Elements cache
  const DOM = {
    body: document.body,
    grid: document.getElementById("productsGrid"),
    categoriesContainer: document.getElementById("categoriesContainer"),
    searchInput: document.getElementById("searchInput"),
    searchClearBtn: document.getElementById("searchClearBtn"),
    sortSelect: document.getElementById("sortSelect"),
    resultsCount: document.getElementById("resultsCount"),
    emptyState: document.getElementById("emptyState"),
    resetSearchBtn: document.getElementById("resetSearchBtn"),
    
    // Preview widget elements
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
    applyTheme(AppState.theme);
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

  // =========================================================
  // 2. Settings & Preview Widget Controls
  // =========================================================
  function applyTheme(themeName) {
    AppState.theme = themeName;
    document.body.setAttribute("data-theme", themeName);
    localStorage.setItem("turkish_mood_theme", themeName);
    
    // Update preview radio buttons
    if (DOM.themeChoiceBtns) {
      DOM.themeChoiceBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-set-theme") === themeName);
      });
    }
  }

  function applyImageMode(mode) {
    AppState.imageMode = mode;
    document.body.setAttribute("data-image-mode", mode);
    localStorage.setItem("turkish_mood_image_mode", mode);

    if (DOM.imageModeBtns) {
      DOM.imageModeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-set-image-mode") === mode);
      });
    }
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
  // 3. Dynamic Categories Generator (Requirement 3 & Rule 6)
  // =========================================================
  function renderDynamicCategories() {
    if (!DOM.categoriesContainer) return;

    // Extract unique categories from current products
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

    // Attach click listeners to tabs
    DOM.categoriesContainer.querySelectorAll(".category-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        AppState.activeCategory = btn.getAttribute("data-category");
        renderDynamicCategories();
        renderCatalog();
      });
    });
  }

  // =========================================================
  // 4. Catalog Preparation & Filtering
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

    // Handle Size Grouping Toggle (Separate vs Merged Variants)
    if (AppState.grouping === "merged") {
      const mergedList = [];
      const groups = new Map();

      items.forEach(item => {
        if (item.variant_group) {
          if (!groups.has(item.variant_group)) {
            groups.set(item.variant_group, []);
          }
          groups.get(item.variant_group).push(item);
        } else {
          mergedList.push(item);
        }
      });

      // Transform each grouped set into a single composite card
      groups.forEach((variants, groupKey) => {
        if (variants.length === 1) {
          mergedList.push(variants[0]);
        } else {
          // Sort variants by price or weight
          variants.sort((a, b) => a.price - b.price);
          const base = variants[0];
          
          const compositeItem = {
            id: `group-${groupKey}`,
            isMergedCard: true,
            groupKey: groupKey,
            name: base.name.replace(/\s*\(كيس\)|\s*\(علبة\)/g, ""),
            brand: base.brand,
            category: base.category,
            description: base.description,
            variants: variants.map(v => ({
              id: v.id,
              name: v.name,
              weight: v.weight,
              price: v.price,
              image: v.image,
              variant_label: v.variant_label || v.weight
            })),
            activeVariantIndex: 0
          };
          mergedList.push(compositeItem);
        }
      });

      return mergedList;
    }

    return items;
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
    
    // Default interactive state if not set
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

    let interactiveHtml = "";
    if (isInteractive) {
      // Grind pills
      let grindsHtml = product.options.grinds.map(g => `
        <button type="button" class="option-pill-btn ${selectedGrind === g ? 'active' : ''}" data-card-id="${product.id}" data-action="set-grind" data-value="${g}">
          ${g}
        </button>
      `).join("");

      // Weight pills
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
          
          <div class="interactive-label" style="margin-top:0.3rem;">
            <span>حجم العبوة:</span>
          </div>
          <div class="pill-group">${weightsHtml}</div>
        </div>
      `;
    }

    const waBtnHtml = AppState.enableWhatsApp ? `
      <button type="button" class="whatsapp-action-btn" style="display:flex;" data-wa-product="${product.id}" data-wa-name="${product.name}" data-wa-price="${displayPrice}" data-wa-weight="${displayWeight}">
        <svg style="width:18px;height:18px;fill:currentColor" viewBox="0 0 24 24">
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
        
        <div class="product-image-container" data-action="zoom" data-img="${product.image}" data-title="${product.name}" data-brand="${product.brand}" data-price="${displayPrice}" data-weight="${displayWeight}">
          <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
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

  // Render Merged Variants Card (e.g. Kocatepe Light 100g Pouch & 250g Tin)
  function renderMergedVariantCard(composite) {
    const currentState = AppState.interactiveState[composite.id] || { variantIdx: 0 };
    const activeVar = composite.variants[currentState.variantIdx || 0];

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
        <svg style="width:18px;height:18px;fill:currentColor" viewBox="0 0 24 24">
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
        
        <div class="product-image-container" data-action="zoom" data-img="${activeVar.image}" data-title="${activeVar.name}" data-brand="${composite.brand}" data-price="${activeVar.price}" data-weight="${activeVar.weight}">
          <img src="${activeVar.image}" alt="${activeVar.name}" class="product-image" loading="lazy">
          <button class="zoom-hint-btn" title="تكبير الصورة">
            <svg style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        <div class="product-content">
          <div>
            <div class="product-category-text">${composite.category} (خيارات متعددة)</div>
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
    // Zoom / Lightbox triggers
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

    // Grind pill switchers
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

    // Weight pill switchers (Espresso)
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

    // Variant pill switchers (Merged Variants)
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

    // WhatsApp Order triggers (Phase 2)
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

  // =========================================================
  // 8. Phase 2 WhatsApp Inquiry Handler
  // =========================================================
  function handleWhatsAppInquiry(name, weight, price) {
    const phone = (window.CONFIG && window.CONFIG.WHATSAPP_PHONE) ? window.CONFIG.WHATSAPP_PHONE : "201000000000";
    const msg = `مرحباً Turkish Mood، أود الاستفسار وطلب:\n- المنتج: ${name}\n- الحجم/الوزن: ${weight}\n- السعر: ${price} ج.م\nشكراً لكم!`;
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    window.open(waUrl, "_blank");
  }

  // =========================================================
  // 9. Event Listeners Setup
  // =========================================================
  function setupEventListeners() {
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

    // Reset search button in empty state
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

    // Preview Panel Toggle
    if (DOM.previewToggleBtn) {
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

    // Close popover when clicking outside
    document.addEventListener("click", (e) => {
      if (DOM.previewPopover && DOM.previewPopover.classList.contains("open")) {
        if (!DOM.previewPopover.contains(e.target) && !DOM.previewToggleBtn.contains(e.target)) {
          DOM.previewPopover.classList.remove("open");
        }
      }
    });

    // Theme Switchers
    DOM.themeChoiceBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyTheme(btn.getAttribute("data-set-theme"));
      });
    });

    // Image Mode Switchers
    DOM.imageModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyImageMode(btn.getAttribute("data-set-image-mode"));
      });
    });

    // Grouping Switchers
    DOM.groupingBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        applyGrouping(btn.getAttribute("data-set-grouping"));
      });
    });

    // Google Sheet URL Sync button inside panel
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

    // Phase 2 WhatsApp live test button inside floating panel
    if (DOM.waToggleBtn) {
      DOM.waToggleBtn.addEventListener("click", () => {
        AppState.enableWhatsApp = !AppState.enableWhatsApp;
        localStorage.setItem("turkish_mood_preview_wa", AppState.enableWhatsApp ? "true" : "false");
        updateSyncStatusUI();
        renderCatalog();
      });
    }

    // Lightbox Modal Close
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

  // Bootstrap when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
