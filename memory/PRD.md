# Almacén de Repuestos Zetor — PRD

## Original Problem Statement
Sitio web corporativo + catálogo técnico para Almacén de Repuestos Zetor (Colombia). Empresa que vende repuestos para tractores Zetor con asesoría técnica especializada (fundador fue mecánico). Conversión principal: WhatsApp. No es e-commerce, es catálogo. WordPress era la idea inicial, pero se construyó en React + FastAPI + MongoDB para tener un sitio funcional y robusto.

## Datos de Negocio
- **WhatsApp principal**: +57 320 245 3457
- **Dirección**: Calle 19B 35-2, Bogotá, Colombia
- **Dominio**: www.almacenzetorrepuestos.com
- **Hero imagen**: https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Gemini_Generated_Image_n0vlzqn0vlzqn0vl-1-scaled.png
- **Hero video**: https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Agent_video_Pippit_20260429224100.mp4

## User Personas
1. **Dueño de finca con tractor Zetor**: necesita repuesto urgente, sabe el modelo, no la referencia exacta.
2. **Mecánico de taller**: identifica la referencia, valida compatibilidad, cotiza varios repuestos.
3. **Administrador del almacén**: gestiona productos, sube imágenes, responde leads.

## Arquitectura Técnica
- **Frontend**: React 19 + react-router-dom + Tailwind CSS + shadcn/ui base + lucide-react.
- **Backend**: FastAPI + Motor (MongoDB async) + JWT (PyJWT) + bcrypt + python-multipart.
- **DB**: MongoDB (`zetor_repuestos`).
- **Auth**: Login admin → cookie httpOnly + Bearer token (localStorage fallback). 7 días de expiración.
- **Almacenamiento de imágenes**: `/app/backend/uploads`, servido en `/api/uploads/{filename}`.

## Stack de Ruteo

### Público
| Ruta | Página |
|------|--------|
| `/` | Home con hero split-screen + 6 bloques + CTA final |
| `/catalogo` | Catálogo con filtros (sistema, modelo, búsqueda) |
| `/producto/:slug` | Ficha de producto |
| `/modelo/:modelo` | Landing por modelo (5211/6211/7211/8011) |
| `/asesoria` | Asesoría técnica |
| `/nosotros` | Quiénes somos |
| `/blog` | Listado de artículos |
| `/blog/:slug` | Detalle de artículo |
| `/contacto` | Formulario + mapa Bogotá |

### Admin (protegidas)
| Ruta | Página |
|------|--------|
| `/admin/login` | Login |
| `/admin` | Dashboard (stats) |
| `/admin/productos` | CRUD productos + upload imagen |
| `/admin/blog` | CRUD posts |
| `/admin/leads` | Listado de leads (responder por WhatsApp) |

## Modelo de Datos

### Product
- `id`, `sku` (único), `slug` (único)
- `nombre`, `descripcion`, `observacion_tecnica`
- `sistema` ∈ {motor, hidraulico, transmision, frenos, filtros}
- `categoria_original` (texto libre)
- `compatibilidad`: array de modelos ["5211","6211","7211","8011"]
- `imagen_principal`, `galeria` (array URLs)
- `disponibilidad` ∈ {Disponible, Bajo pedido, Agotado}
- `destacado`, `activo`

### BlogPost
- `id`, `slug` (único), `titulo`, `resumen`, `contenido`, `imagen`, `autor`, `tags`, `publicado`

### Lead (Contacto)
- `id`, `nombre`, `telefono`, `email`, `ciudad`, `modelo_tractor`, `mensaje`, `status`, `created_at`

### User (admin)
- `id`, `email` (único), `password_hash` (bcrypt), `name`, `role`

## Implementado (Dec 2025)
- Hero split-screen con imagen + video (igual al mockup del usuario)
- Top red bar con WhatsApp y leyenda "Importador Oficial"
- Navbar dark sticky con búsqueda + CTA WhatsApp + responsive mobile menu
- 5 sistemas y 4 modelos cards en Home
- Sección Asesoría con foto, stats "+30 años", lista de beneficios
- Productos destacados (8 items)
- Bloque "Cómo funciona" 4 pasos
- CTA final WhatsApp banner rojo
- Floating WhatsApp button con pulse animation
- Catálogo con filtros sistema/modelo/búsqueda y query params
- Ficha de producto con galería, compatibilidad clickeable, mensaje de confianza, formulario de modelo+ciudad para WhatsApp prefill
- Landings por modelo con specs técnicos (HP, motor, caja, peso, aplicación)
- Blog con 3 artículos seed
- Contacto con form → /api/contact + mapa de Google Maps embed
- Footer con enlaces sistemas/modelos + dirección
- Admin: login, dashboard, productos (CRUD + upload), blog, leads
- 47 productos seed cargados desde xlsx del usuario, mapeados a 5 sistemas
- Compatibilidad heurística por nombre (95M, 102M, 110, 6911, 7011 → 5211/6211/7211/8011)
- WhatsApp deep links con mensaje precargado: nombre, SKU, sistema, link, modelo, ciudad
- SEO: title, meta description, og tags, slugs limpios, h1 único por página
- Backend: 30/30 tests pytest pasando
- Frontend: e2e Playwright pasando flows críticos

## Backlog (Prioridad)

### P0 — Próxima iteración
- Cargar los 800 productos restantes (admin debe poder bulk-import desde xlsx o CSV).
- Reemplazar imágenes Unsplash por fotos reales del inventario al subirlas el admin.
- Subir las imágenes reales de Google Drive del catálogo seed (necesitan reupload manual al ser links de Drive).

### P1
- Importador masivo CSV/XLSX desde panel admin.
- Galería de imágenes drag-to-reorder.
- Filtro adicional por categoría_original (sub-categorías) en /catalogo.
- Sitemap.xml dinámico + robots.txt.
- Schema.org Product structured data en fichas.

### P2
- Newsletter / suscripción para campañas.
- Comparador de productos.
- Modo oscuro opcional.
- Multi-idioma (EN) si se exporta.
- Brute-force lockout en /api/auth/login.

## Credenciales y Setup
- Admin: `admin@almacenzetorrepuestos.com` / `ZetorAdmin2026!`
- Variables `.env` backend: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`, `COMPANY_*`
- Inicio: backend auto-seeds admin + 47 productos + 3 blog posts en `startup`
