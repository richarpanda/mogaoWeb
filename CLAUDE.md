# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a **static site** — no build step, no package manager. To develop:
- Open `index.html` directly in a browser, or use a local dev server (e.g. `npx serve .` or VS Code Live Server) to avoid CORS issues with external requests.

## Architecture

**Mogao Web** is the public-facing landing page for Mogao Inmobiliaria. It is a single-page static site with no framework or bundler.

### File structure

```
index.html          # All page content (single file)
js/scripts.js       # Parallax, carousel, mobile nav, scroll reveal
styles/styles.css   # All styling (~2800 lines, mobile-first)
assets/images/      # Local images organized by section (hero/, properties/, clients/, logo/)
```

### Sections (in order in index.html)
Header → Hero → Client carousel → Services (collapsible `<details>`) → Properties gallery → About → Solutions → Testimonials → Contact → Footer → Sticky WhatsApp bar

Navigation uses hash anchors (`#inicio`, `#servicios`, `#galeria`, `#nosotros`, `#contacto`) with smooth scroll via JS.

### JavaScript patterns (`js/scripts.js`)
- **Intersection Observer** for `.reveal` → `.is-visible` scroll animations
- **requestAnimationFrame** for parallax scroll (disabled on `max-width: 1024px` and `prefers-reduced-motion`)
- **Parallax layers**: `.parallax-layer-1` (speed 0.5), `.parallax-layer-2` (0.1), `.parallax-layer-3` (0.2)
- No module system — all vanilla ES6, single file

### Styling conventions (`styles/styles.css`)
- CSS custom properties for all colors and spacing
- Responsive breakpoints: 1024px, 768px, 480px
- BEM-inspired class names (`.property-card`, `.property-image`, `.gallery-cta`, etc.)

### Color palette (CSS variables)
```css
--primary: #1a4a4a      /* dark teal */
--secondary: #2d5a5a    /* medium teal */
--accent: #d4af37       /* gold */
--accent-light: #f4e4a6 /* light gold */
--cream: #faf8f3
```
Note: slightly different values from the CRM palette — use these CSS variables, not the CRM Tailwind classes.

### External dependencies (CDN only)
- Font Awesome 6.4.0 — icons
- Google Fonts — Playfair Display (headings) + Inter (body)

### Hardcoded config values
- WhatsApp CTA: `https://wa.me/525537865554`
- Email: `mogaopatrimonios@gmail.com`
- Canonical URL: `https://www.mogaoinmobiliaria.com/`

## Planned feature: live property listings from Mogao CRM

The properties gallery section currently shows 3 hardcoded cards. The goal is to replace them with **live data fetched from the Supabase instance used by mogao-crm**.

**CRM Supabase tables involved:**
- `propiedades` — `id`, `titulo`, `descripcion`, `precio`, `ciudad`, `direccion`, `estatus`, `tipo`, `latitud`, `longitud`
- `propiedad_fotos` — `propiedad_id`, `url`, `orden`
- Filter: only show `estatus = 'disponible'`

**Integration approach (to be decided):** Since this is a static site, options are:
1. **Supabase JS client + public anon key** — fetch on page load with JS, render cards dynamically. Simple, but exposes anon key in client (acceptable with RLS).
2. **Build-time fetch** — add a small build script that writes a `properties.json` at deploy time; HTML fetches local JSON. No key exposure.

The implementation file for this feature will live in `js/properties.js` (new file) and be included before `</body>` in `index.html`.
