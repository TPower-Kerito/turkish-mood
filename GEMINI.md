# Project Rules & Guardrails for Antigravity

1. **Communication Language**: Always reply to the user in clear Arabic (Egyptian/Modern Standard Arabic) after completing any step or when asking questions.
2. **Asset Preservation**: NEVER delete, rename, or overwrite any `.jpg` image files in the project directory.
3. **Architecture**: Build a pure, lightweight, fast-loading static web application (HTML5, Tailwind CSS or Vanilla CSS, and modular Vanilla JavaScript). No backend server or paid database is allowed.
4. **RTL & Arabic Typography**: Enforce strict Right-to-Left (`dir="rtl"`) layout and use clean Arabic Google Fonts (`Cairo` and `Tajawal`).
5. **Catalog-Only Mode (Phase 1)**: Do NOT enable online checkout or active WhatsApp ordering buttons yet. Build the WhatsApp Cart/Inquiry logic as a modular, disabled/hidden feature (`ENABLE_WHATSAPP_ORDER = false`) ready to be toggled on in Phase 2.
6. **Dynamic Categories & Hybrid Data**: Never hardcode category buttons in HTML. Always generate categories dynamically from the active dataset (`products.json` local fallback + optional Google Sheets CSV/JSON URL override).
7. **Smart Image Cropping**: Default to cropping out the bottom ~22% price banner baked into the product images using CSS (`object-fit: cover; object-position: top center; aspect-ratio: 1 / 1.05;`), while providing a live UI toggle to switch between "Cropped Package Focus" and "Full Original Image".