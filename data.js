/**
 * Turkish Mood - Data Engine & Fallback Products
 * ===============================================
 * Contains local fallback dataset (30 products) for offline/local file preview,
 * plus asynchronous sync with Google Sheets CSV if configured.
 */

const DEFAULT_PRODUCTS = [
  {
    "id": 1,
    "name": "قهوة تركي بن سادة فاتح (كيس)",
    "brand": "Kocatepe",
    "category": "قهوة تركي سادة",
    "weight": "100 جرام",
    "price": 230,
    "image": "cropped/IMG-20261107-WA0023.jpg",
    "available": true,
    "variant_group": "kocatepe-plain-light",
    "variant_label": "كيس 100 جرام",
    "description": "قهوة تركية أصلية فاخرة بن سادة تحميص فاتح ناعم ورائحة زكية من شركة كوجاتبه العريقة.",
    "original_image": "IMG-20261107-WA0023.jpg"
  },
  {
    "id": 2,
    "name": "قهوة تركي بن سادة فاتح (علبة)",
    "brand": "Kocatepe",
    "category": "قهوة تركي سادة",
    "weight": "ربع كيلو (250 جرام)",
    "price": 600,
    "image": "cropped/IMG-20261107-WA0010.jpg",
    "available": true,
    "variant_group": "kocatepe-plain-light",
    "variant_label": "علبة صفيح 250 جرام",
    "description": "علبة صفيح محكمة الغلق تحفظ نكهة ورائحة القهوة التركية الفاتحة المميزة لأطول فترة.",
    "original_image": "IMG-20261107-WA0010.jpg"
  },
  {
    "id": 3,
    "name": "قهوة تركي بن فاتح (علبة)",
    "brand": "Café Crown",
    "category": "قهوة تركي سادة",
    "weight": "ربع كيلو (250 جرام)",
    "price": 550,
    "image": "cropped/IMG-20261107-WA0024.jpg",
    "available": true,
    "description": "قهوة كافيه كراون التركية الفاخرة تحميص فاتح مميز بقوام غني ووش كثيف.",
    "original_image": "IMG-20261107-WA0024.jpg"
  },
  {
    "id": 4,
    "name": "قهوة تركي بن سادة وسط",
    "brand": "Keyfe",
    "category": "قهوة تركي سادة",
    "weight": "100 جرام",
    "price": 250,
    "image": "cropped/IMG-20261107-WA0017.jpg",
    "available": true,
    "description": "توازن مثالي بين التحميص الفاتح والغامق لعشاق التحميص الوسط من كيفة.",
    "original_image": "IMG-20261107-WA0017.jpg"
  },
  {
    "id": 5,
    "name": "قهوة تركي بن غامق (علبة)",
    "brand": "Keyfe Özel Seri",
    "category": "قهوة تركي سادة",
    "weight": "ربع كيلو (250 جرام)",
    "price": 500,
    "image": "cropped/IMG-20261107-WA0025.jpg",
    "available": true,
    "description": "إصدار خاص (Özel Seri) تحميص غامق لعشاق النكهة القوية والمركزة.",
    "original_image": "IMG-20261107-WA0025.jpg"
  },
  {
    "id": 6,
    "name": "قهوة تركي بن غامق",
    "brand": "Üstad",
    "category": "قهوة تركي سادة",
    "weight": "100 جرام",
    "price": 230,
    "image": "cropped/IMG-20261107-WA0008.jpg",
    "available": true,
    "description": "قهوة أستاذ بن غامق تقليدي بنكهة تحميص أصيلة ونكهة مكثفة.",
    "original_image": "IMG-20261107-WA0008.jpg"
  },
  {
    "id": 7,
    "name": "قهوة تركي باللبن (Menengiç)",
    "brand": "Keyfe Sütlü",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "150 جرام",
    "price": 270,
    "image": "cropped/IMG-20261107-WA0021.jpg",
    "available": true,
    "description": "قهوة منينغيش التركية بالحليب وقرون البطم البري بدون كافيين، ناعمة وصحية.",
    "original_image": "IMG-20261107-WA0021.jpg"
  },
  {
    "id": 8,
    "name": "قهوة تركي بلبن (Menengiç)",
    "brand": "Osso",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0020.jpg",
    "available": true,
    "description": "خلطة أوسو الشهيرة لقهوة المنينغيش باللبن بطعم كريمي غني ومذاق ساحر.",
    "original_image": "IMG-20261107-WA0020.jpg"
  },
  {
    "id": 9,
    "name": "قهوة يمنية (Dibek)",
    "brand": "Osso",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0022.jpg",
    "available": true,
    "description": "قهوة ديبك اليمنية المطحونة في الهاون الحجري مع خلطة بهارات وأعشاب ملكية فريدة.",
    "original_image": "IMG-20261107-WA0022.jpg"
  },
  {
    "id": 10,
    "name": "قهوة تركي عثماني بن محوج بلبن",
    "brand": "Keyfe Osmanlı",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0016.jpg",
    "available": true,
    "description": "الخلطة العثمانية المتوارثة محوجة بالهيل واللبن ومستخلصات البهارات الشرقية.",
    "original_image": "IMG-20261107-WA0016.jpg"
  },
  {
    "id": 11,
    "name": "قهوة عثماني بالمستكة",
    "brand": "Osso Damla Sakızlı",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0013.jpg",
    "available": true,
    "description": "مذاق المستكة الأصلية (Damla Sakızı) ممزوج مع البن التركي المحوج الفاخر من أوسو.",
    "original_image": "IMG-20261107-WA0013.jpg"
  },
  {
    "id": 12,
    "name": "قهوة عثماني",
    "brand": "Osso Osmanlı",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0015.jpg",
    "available": true,
    "description": "القهوة العثمانية الأصلية من أوسو بسبعة مكونات فاخرة تمنحك إحساس القصور العثمانية.",
    "original_image": "IMG-20261107-WA0015.jpg"
  },
  {
    "id": 13,
    "name": "قهوة تركي بالبندق",
    "brand": "Osso Fındıklı",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "200 جرام",
    "price": 285,
    "image": "cropped/IMG-20261107-WA0026.jpg",
    "available": true,
    "description": "تناغم رائع بين عبق البن التركي ونكهة البندق المحمص اللذيذة.",
    "original_image": "IMG-20261107-WA0026.jpg"
  },
  {
    "id": 14,
    "name": "قهوة تركي بالشوكولاتة",
    "brand": "Hacı Olabi",
    "category": "قهوة تركي محوجة وبالنكهات",
    "weight": "ربع كيلو (250 جرام)",
    "price": 750,
    "image": "cropped/IMG-20261107-WA0009.jpg",
    "available": true,
    "description": "ابتكار فاخر من حاجي علبي يجمع بين حبوب البن الفاخرة والشوكولاتة المخملية الغنية.",
    "original_image": "IMG-20261107-WA0009.jpg"
  },
  {
    "id": 15,
    "name": "اسبريسو تركي كولومبي الأصل",
    "brand": "Hacı Olabi",
    "category": "إسبريسو ونسكافيه",
    "weight": "خيارات متعددة",
    "price": 700,
    "image": "cropped/IMG-20261107-WA0019.jpg",
    "available": true,
    "interactive": true,
    "options": {
      "grinds": [
        "حبوب",
        "مطحون"
      ],
      "weights": [
        {
          "label": "ربع كيلو (250 جرام)",
          "weight": "250g",
          "price": 700
        },
        {
          "label": "نصف كيلو (500 جرام)",
          "weight": "500g",
          "price": 1200
        }
      ]
    },
    "description": "بن إسبريسو كولومبي 100% سنغل أوريجين بنكهات فواكه وحمضية متوازنة وكريمة ذهبية كثيفة.",
    "original_image": "IMG-20261107-WA0019.jpg"
  },
  {
    "id": 16,
    "name": "اسبريسو تركي برازيلي الأصل",
    "brand": "Hacı Olabi",
    "category": "إسبريسو ونسكافيه",
    "weight": "خيارات متعددة",
    "price": 600,
    "image": "cropped/IMG-20261107-WA0014.jpg",
    "available": true,
    "interactive": true,
    "options": {
      "grinds": [
        "حبوب",
        "مطحون"
      ],
      "weights": [
        {
          "label": "ربع كيلو (250 جرام)",
          "weight": "250g",
          "price": 600
        },
        {
          "label": "نصف كيلو (500 جرام)",
          "weight": "500g",
          "price": 1000
        }
      ]
    },
    "description": "بن إسبريسو برازيلي كلاسيكي بقوام شوكولاتي ممتلئ ونكهة مكسرات محمصة بدون حمضية.",
    "original_image": "IMG-20261107-WA0014.jpg"
  },
  {
    "id": 17,
    "name": "نيسكافية بلاك (Klasik)",
    "brand": "Cafex",
    "category": "إسبريسو ونسكافيه",
    "weight": "100 جرام",
    "price": 260,
    "image": "cropped/IMG-20261107-WA0018.jpg",
    "available": true,
    "description": "قهوة سريعة التحضير نقية 100% سريعة الذوبان بنكهة قوية ومنعشة من كافيكس.",
    "original_image": "IMG-20261107-WA0018.jpg"
  },
  {
    "id": 18,
    "name": "نيسكافية 2×1",
    "brand": "Cafex",
    "category": "إسبريسو ونسكافيه",
    "weight": "400 جرام",
    "price": 450,
    "image": "cropped/IMG-20261107-WA0012.jpg",
    "available": true,
    "description": "مزيج القهوة ومبيض الحليب غير المحلى بدون سكر مضاف، لقوام ناعم وخفيف.",
    "original_image": "IMG-20261107-WA0012.jpg"
  },
  {
    "id": 19,
    "name": "نيسكافية 3×1",
    "brand": "Cafex",
    "category": "إسبريسو ونسكافيه",
    "weight": "نصف كيلو (500 جرام)",
    "price": 500,
    "image": "cropped/IMG-20261107-WA0011.jpg",
    "available": true,
    "description": "كيس عائلي اقتصادي كبير نصف كيلو من خلطة 3 في 1 اللذيذة سريعة التحضير.",
    "original_image": "IMG-20261107-WA0011.jpg"
  },
  {
    "id": 20,
    "name": "شوكولاتة تركي بالبندق",
    "brand": "Vince",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "80 جرام",
    "price": 170,
    "image": "cropped/IMG-20261107-WA0032.jpg",
    "available": true,
    "description": "شوكولاتة بالحليب غنية بحبات البندق التركي الفاخر المحمص المقرمش.",
    "original_image": "IMG-20261107-WA0032.jpg"
  },
  {
    "id": 21,
    "name": "شوكولاتة تركي بكريمة البندق",
    "brand": "Tambol",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "100 جرام",
    "price": 180,
    "image": "cropped/IMG-20261107-WA0029.jpg",
    "available": true,
    "description": "بار شوكولاتة محشو بكريمة البندق الناعمة المذابة تذوب بالفم بسلاسة.",
    "original_image": "IMG-20261107-WA0029.jpg"
  },
  {
    "id": 22,
    "name": "وايت شوكليت تركي",
    "brand": "Karmen",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "80 جرام",
    "price": 170,
    "image": "cropped/IMG-20261107-WA0028.jpg",
    "available": true,
    "description": "شوكولاتة بيضاء فاخرة بمذاق الحليب الصافي وزبدة الكاكاو النقية من كارمن.",
    "original_image": "IMG-20261107-WA0028.jpg"
  },
  {
    "id": 23,
    "name": "شوكولاتة تركي بالتشيز كيك فراولة",
    "brand": "Vince Selection",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "100 جرام",
    "price": 180,
    "image": "cropped/IMG-20261107-WA0030.jpg",
    "available": true,
    "description": "إصدار خاص بنكهة حلوى التشيز كيك الغنية مع قطع الفراولة المنعشة والشوكولاتة الفاخرة.",
    "original_image": "IMG-20261107-WA0030.jpg"
  },
  {
    "id": 24,
    "name": "براونيز شوكولاتة (10 أكياس × 16 جرام)",
    "brand": "Eti Browni Intense",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "160 جرام (10 قطع)",
    "price": 400,
    "image": "cropped/IMG-20261107-WA0035.jpg",
    "available": true,
    "description": "كيك براوني إيتي إنتنس التركي الشهير مغطى بطبقة سميكة من الشوكولاتة الداكنة اللذيذة.",
    "original_image": "IMG-20261107-WA0035.jpg"
  },
  {
    "id": 25,
    "name": "شوكولاتة تركي دارك (57% كاكاو)",
    "brand": "Vince Bitter",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "80 جرام",
    "price": 170,
    "image": "cropped/IMG-20261107-WA0036.jpg",
    "available": true,
    "description": "شوكولاتة داكنة نقية بنسبة 57% كاكاو لمحبي المذاق الغني والمتوازن بدون مرارة حادة.",
    "original_image": "IMG-20261107-WA0036.jpg"
  },
  {
    "id": 26,
    "name": "شوكولاتة تركي بالفستق العنتابي المشهور",
    "brand": "Vince Antep Fıstıklı",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "80 جرام",
    "price": 170,
    "image": "cropped/IMG-20261107-WA0037.jpg",
    "available": true,
    "description": "شوكولاتة فاخرة محشوة بأجود حبات فستق عنتاب التركي الأخضر الطازج الشهير عالمياً.",
    "original_image": "IMG-20261107-WA0037.jpg"
  },
  {
    "id": 27,
    "name": "شوكولاتة تركي باللوز",
    "brand": "Vince Bademli",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "80 جرام",
    "price": 160,
    "image": "cropped/IMG-20261107-WA0033.jpg",
    "available": true,
    "description": "شوكولاتة بالحليب مع قطع اللوز التركي المحمص المقرمش لنكهة كلاسيكية رائعة.",
    "original_image": "IMG-20261107-WA0033.jpg"
  },
  {
    "id": 28,
    "name": "شوكولاتة تركي بالفراولة (ميل فوي)",
    "brand": "Tambol",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "100 جرام",
    "price": 180,
    "image": "cropped/IMG-20261107-WA0027.jpg",
    "available": true,
    "description": "مستوحاة من حلوى الميل فوي الفرنسية بلمسة تركية، طبقات مقرمشة مع كريمة الفراولة.",
    "original_image": "IMG-20261107-WA0027.jpg"
  },
  {
    "id": 29,
    "name": "شوكولاتة تركي بلبن",
    "brand": "Vince Bol Sütlü",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "100 جرام",
    "price": 200,
    "image": "cropped/IMG-20261107-WA0034.jpg",
    "available": true,
    "description": "شوكولاتة إضافية الحليب (Bol Sütlü) بقوام كريمي مخملي ناعم يذوب على الفور.",
    "original_image": "IMG-20261107-WA0034.jpg"
  },
  {
    "id": 30,
    "name": "شوكولاتة تركي قهوة لاتيه",
    "brand": "Tambol Caffé Latte",
    "category": "شوكولاتة وحلويات تركية",
    "weight": "100 جرام",
    "price": 180,
    "image": "cropped/IMG-20261107-WA0031.jpg",
    "available": true,
    "description": "الجمع المثالي بين نكهة قهوة اللاتيه الصباحية وحلاوة الشوكولاتة التركية المترفة.",
    "original_image": "IMG-20261107-WA0031.jpg"
  }
];

class ProductDataService {
  constructor() {
    this.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    this.source = "local"; // "local" | "sheets"
    this.lastSync = null;
  }

  // Load products from JSON or fallback
  async loadInitialData() {
    try {
      // Try fetching products.json (works on HTTP/HTTPS)
      const res = await fetch("products.json");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          this.products = json;
          this.source = "products.json";
        }
      }
    } catch (e) {
      // Fallback to inline DEFAULT_PRODUCTS (works seamlessly on file:// or offline)
      console.info("Using embedded default products dataset:", e.message);
      this.source = "local (fallback)";
    }

    // Now check if Google Sheets CSV sync is requested
    const customUrl = localStorage.getItem("turkish_mood_custom_sheet_url");
    const activeUrl = customUrl || (window.CONFIG && window.CONFIG.GOOGLE_SHEET_CSV_URL);
    
    if (activeUrl && activeUrl.trim().length > 0) {
      await this.syncFromGoogleSheet(activeUrl.trim());
    }

    return this.products;
  }

  // Parse CSV string into objects
  parseCSV(csvText) {
    const lines = csvText.trim().split(/\r\n|\n|\r/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/["']/g, ""));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle quotes in CSV values
      const values = [];
      let current = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx].replace(/^["']|["']$/g, "") : "";
      });
      rows.push(rowObj);
    }
    return rows;
  }

  // Sync Google Sheets CSV
  async syncFromGoogleSheet(sheetUrl) {
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const csvText = await res.text();
      const rows = this.parseCSV(csvText);

      if (rows && rows.length > 0) {
        let updatedCount = 0;
        rows.forEach(row => {
          const id = parseInt(row.id, 10);
          const product = this.products.find(p => p.id === id || (row.name && p.name.includes(row.name.trim())));
          if (product) {
            if (row.price) {
              const pVal = parseFloat(row.price);
              if (!isNaN(pVal)) product.price = pVal;
            }
            if (row.category) product.category = row.category.trim();
            if (row.name) product.name = row.name.trim();
            if (row.brand) product.brand = row.brand.trim();
            if (row.weight) product.weight = row.weight.trim();
            if (row.available !== undefined && row.available !== "") {
              product.available = String(row.available).toLowerCase() === "true" || row.available === "1";
            }
            // If espresso has price_half_kg
            if (row.price_half_kg && product.options && product.options.weights && product.options.weights[1]) {
              const halfVal = parseFloat(row.price_half_kg);
              if (!isNaN(halfVal)) {
                product.options.weights[1].price = halfVal;
              }
            }
            updatedCount++;
          }
        });

        this.source = "Google Sheets CSV";
        this.lastSync = new Date();
        console.log(`Synced ${updatedCount} products from Google Sheets successfully.`);
        return { success: true, count: updatedCount };
      }
      return { success: false, error: "لم يتم العثور على صفوف بيانات في الملف" };
    } catch (err) {
      console.warn("Failed to sync from Google Sheets, using local data:", err);
      return { success: false, error: err.message };
    }
  }

  getProducts() {
    return this.products;
  }
}

// Global data service instance
if (typeof window !== "undefined") {
  window.ProductDataService = new ProductDataService();
}
if (typeof module !== "undefined") {
  module.exports = { DEFAULT_PRODUCTS, ProductDataService };
}
