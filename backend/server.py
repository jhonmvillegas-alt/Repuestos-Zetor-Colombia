from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import json
import logging
import uuid
import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from slugify import slugify
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ----- Constants -----
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for admin convenience
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SYSTEMS = {
    "motor": "Motor",
    "hidraulico": "Hidráulico",
    "transmision": "Transmisión",
    "frenos": "Frenos",
    "filtros": "Filtros",
}
MODELS = ["5211", "6211", "7211", "8011"]

# ----- DB -----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Almacén Zetor API")
api_router = APIRouter(prefix="/api")

# Mount uploads
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ----- Helpers -----
def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def make_slug(name: str, sku: str) -> str:
    base = slugify(name)
    return f"{base}-{sku.lower()}" if base else sku.lower()

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ----- Models -----
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProductBase(BaseModel):
    sku: str
    nombre: str
    sistema: str  # motor|hidraulico|transmision|frenos|filtros
    categoria_original: Optional[str] = None
    descripcion: Optional[str] = None
    observacion_tecnica: Optional[str] = None
    compatibilidad: List[str] = Field(default_factory=list)  # ["5211","6211"]
    imagen_principal: Optional[str] = None
    galeria: List[str] = Field(default_factory=list)
    disponibilidad: str = "Disponible"  # Disponible | Bajo pedido | Agotado
    destacado: bool = False
    activo: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    nombre: Optional[str] = None
    sistema: Optional[str] = None
    categoria_original: Optional[str] = None
    descripcion: Optional[str] = None
    observacion_tecnica: Optional[str] = None
    compatibilidad: Optional[List[str]] = None
    imagen_principal: Optional[str] = None
    galeria: Optional[List[str]] = None
    disponibilidad: Optional[str] = None
    destacado: Optional[bool] = None
    activo: Optional[bool] = None

class Product(ProductBase):
    id: str
    slug: str
    created_at: str
    updated_at: str

class BlogPostBase(BaseModel):
    titulo: str
    resumen: str
    contenido: str
    imagen: Optional[str] = None
    autor: str = "Equipo Zetor"
    tags: List[str] = Field(default_factory=list)
    publicado: bool = True

class BlogPost(BlogPostBase):
    id: str
    slug: str
    created_at: str
    updated_at: str

class ContactRequest(BaseModel):
    nombre: str
    telefono: str
    email: Optional[EmailStr] = None
    ciudad: Optional[str] = None
    modelo_tractor: Optional[str] = None
    mensaje: str

# ----- Auth Endpoints -----
@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, path="/",
    )
    return {
        "access_token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name"), "role": user.get("role")},
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ----- Public Catalog Endpoints -----
@api_router.get("/categories")
async def get_categories():
    out = []
    for slug, label in SYSTEMS.items():
        count = await db.products.count_documents({"sistema": slug, "activo": True})
        out.append({"slug": slug, "nombre": label, "count": count})
    return out

@api_router.get("/models")
async def get_models():
    out = []
    for m in MODELS:
        count = await db.products.count_documents({"compatibilidad": m, "activo": True})
        out.append({"slug": m, "nombre": f"Zetor {m}", "count": count})
    return out

@api_router.get("/products")
async def list_products(
    sistema: Optional[str] = None,
    modelo: Optional[str] = None,
    q: Optional[str] = None,
    destacado: Optional[bool] = None,
    page: int = 1,
    limit: int = 24,
):
    query = {"activo": True}
    if sistema:
        query["sistema"] = sistema
    if modelo:
        query["compatibilidad"] = modelo
    if destacado is not None:
        query["destacado"] = destacado
    if q:
        regex = re.compile(re.escape(q), re.IGNORECASE)
        query["$or"] = [{"nombre": regex}, {"sku": regex}, {"descripcion": regex}]
    total = await db.products.count_documents(query)
    skip = max(0, (page - 1) * limit)
    cursor = db.products.find(query, {"_id": 0}).sort("destacado", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items, "total": total, "page": page, "limit": limit}

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug, "activo": True}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

# ----- Admin Product Endpoints -----
@api_router.post("/admin/products")
async def create_product(payload: ProductCreate, user: dict = Depends(get_current_user)):
    if payload.sistema not in SYSTEMS:
        raise HTTPException(status_code=400, detail="Sistema inválido")
    existing = await db.products.find_one({"sku": payload.sku})
    if existing:
        raise HTTPException(status_code=400, detail="SKU ya existe")
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = make_slug(payload.nombre, payload.sku)
    # ensure unique slug
    n = 1
    base_slug = doc["slug"]
    while await db.products.find_one({"slug": doc["slug"]}):
        n += 1
        doc["slug"] = f"{base_slug}-{n}"
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, payload: ProductUpdate, user: dict = Depends(get_current_user)):
    update_doc = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "sistema" in update_doc and update_doc["sistema"] not in SYSTEMS:
        raise HTTPException(status_code=400, detail="Sistema inválido")
    if "nombre" in update_doc or "sku" in update_doc:
        prod = await db.products.find_one({"id": product_id})
        if not prod:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        nombre = update_doc.get("nombre", prod["nombre"])
        sku = update_doc.get("sku", prod["sku"])
        update_doc["slug"] = make_slug(nombre, sku)
    update_doc["updated_at"] = now_iso()
    result = await db.products.update_one({"id": product_id}, {"$set": update_doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    return p

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"ok": True}

@api_router.get("/admin/products")
async def admin_list_products(user: dict = Depends(get_current_user), q: Optional[str] = None, limit: int = 200):
    query = {}
    if q:
        regex = re.compile(re.escape(q), re.IGNORECASE)
        query["$or"] = [{"nombre": regex}, {"sku": regex}]
    items = await db.products.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return {"items": items, "total": len(items)}

# ----- Image Upload -----
@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Formato no permitido")
    fname = f"{uuid.uuid4().hex}{ext}"
    fpath = UPLOAD_DIR / fname
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo mayor a 10MB")
    fpath.write_bytes(content)
    return {"url": f"/api/uploads/{fname}", "filename": fname}

# ----- Blog Endpoints -----
@api_router.get("/blog/posts")
async def list_blog():
    items = await db.blog_posts.find({"publicado": True}, {"_id": 0}).sort("created_at", -1).to_list(length=200)
    return {"items": items}

@api_router.get("/blog/posts/{slug}")
async def get_blog(slug: str):
    p = await db.blog_posts.find_one({"slug": slug, "publicado": True}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return p

@api_router.post("/admin/blog")
async def create_blog(payload: BlogPostBase, user: dict = Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = slugify(payload.titulo)
    n = 1
    base = doc["slug"]
    while await db.blog_posts.find_one({"slug": doc["slug"]}):
        n += 1
        doc["slug"] = f"{base}-{n}"
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.blog_posts.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/blog/{post_id}")
async def update_blog(post_id: str, payload: BlogPostBase, user: dict = Depends(get_current_user)):
    update = payload.model_dump()
    update["slug"] = slugify(payload.titulo)
    update["updated_at"] = now_iso()
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return await db.blog_posts.find_one({"id": post_id}, {"_id": 0})

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog(post_id: str, user: dict = Depends(get_current_user)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return {"ok": True}

@api_router.get("/admin/blog")
async def admin_list_blog(user: dict = Depends(get_current_user)):
    items = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return {"items": items}

# ----- Contact / Leads -----
@api_router.post("/contact")
async def create_contact(payload: ContactRequest):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    doc["status"] = "nuevo"
    await db.leads.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "lead_id": doc["id"]}

@api_router.get("/admin/leads")
async def list_leads(user: dict = Depends(get_current_user)):
    items = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=500)
    return {"items": items}

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, user: dict = Depends(get_current_user)):
    await db.leads.delete_one({"id": lead_id})
    return {"ok": True}

# ----- Site config (public) -----
@api_router.get("/site/config")
async def site_config():
    return {
        "company_name": os.environ.get("COMPANY_NAME", "Almacén de Repuestos Zetor"),
        "address": os.environ.get("COMPANY_ADDRESS", ""),
        "domain": os.environ.get("COMPANY_DOMAIN", ""),
        "whatsapp": os.environ.get("WHATSAPP_NUMBER", ""),
        "systems": [{"slug": k, "nombre": v} for k, v in SYSTEMS.items()],
        "models": [{"slug": m, "nombre": f"Zetor {m}"} for m in MODELS],
    }

# ----- Health -----
@api_router.get("/")
async def root():
    return {"ok": True, "service": "Zetor API"}

# ----- Admin seeding & data seeding -----
DEFAULT_BLOG_POSTS = [
    {
        "titulo": "Cómo identificar el repuesto correcto para tu Zetor 5211",
        "resumen": "Guía técnica para reconocer compatibilidad por número de chasis, modelo y sistema antes de comprar.",
        "contenido": "Identificar el repuesto correcto evita devoluciones, daños mecánicos y pérdida de tiempo en campo. En Zetor el primer paso es ubicar la placa de identificación del tractor, donde encontrarás el modelo (5211/6211/7211/8011) y el número de chasis. Con esa referencia, valida el sistema afectado: motor, hidráulico, transmisión, frenos o filtros. Cada sistema tiene sub-referencias que cambian entre años de fabricación, por eso recomendamos enviar fotos del repuesto desmontado vía WhatsApp para que nuestro equipo confirme antes del despacho.",
        "imagen": "https://images.unsplash.com/photo-1759850425725-41216a62b6e0?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
        "autor": "Taller Zetor",
        "tags": ["compatibilidad", "5211", "guía"],
    },
    {
        "titulo": "Mantenimiento del sistema hidráulico Zetor: errores comunes",
        "resumen": "Fugas, presión baja y bomba ruidosa. Diagnóstico rápido y repuestos clave del sistema hidráulico.",
        "contenido": "El sistema hidráulico es uno de los puntos más sensibles en tractores Zetor. Una fuga lenta puede convertirse en daño costoso si no se detecta. Verifica el nivel del depósito, inspecciona retenedores y bomba de alce, y revisa las mangueras. Repuestos críticos: bomba de alce hidráulico, depósito 1 y 2 salidas, y bomba de dirección. Antes de comprar, valida la referencia con nosotros vía WhatsApp.",
        "imagen": "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
        "autor": "Equipo Zetor",
        "tags": ["hidráulico", "mantenimiento"],
    },
    {
        "titulo": "Kit motor 102M vs 95M vs 110 Turbo: cuál necesita tu tractor",
        "resumen": "Diferencias técnicas, modelos compatibles y cuándo conviene un overhaul completo.",
        "contenido": "Los kits motor son la inversión más estratégica para extender la vida útil del tractor. El 95M es estándar para motores naturales medianos, el 102M cubre la gama media-alta, y el 110 Turbo es para potencia turboalimentada. Cada kit incluye anillos, camisas, pistones y empaquetaduras compatibles. La elección depende del modelo y del estado del bloque. Te recomendamos enviarnos el número de chasis y fotos del motor desarmado para validar la referencia exacta.",
        "imagen": "https://images.unsplash.com/photo-1667339240140-1aee60bea0e5?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
        "autor": "Taller Zetor",
        "tags": ["motor", "kit", "overhaul"],
    },
]

async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower().strip()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": "Administrador",
            "role": "admin",
            "created_at": now_iso(),
        })
        logging.info(f"Admin seeded: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password)}},
        )
        logging.info(f"Admin password updated: {email}")

async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    seed_path = ROOT_DIR.parent / "data" / "products_seed.json"
    if not seed_path.exists():
        return
    raw = json.loads(seed_path.read_text(encoding="utf-8"))
    # default: products are compatible with all 4 main models unless a number appears in the name
    for i, item in enumerate(raw):
        name_lower = item["nombre"].lower()
        compat = []
        for m in MODELS:
            if m in name_lower or m[:2] in name_lower:
                # only match strict "5211" etc. not partial
                if m in name_lower:
                    compat.append(m)
        # heuristic: if name mentions 6911/7011 these are series, map to 6211/7211
        if "6911" in name_lower:
            compat.append("6211")
        if "7011" in name_lower:
            compat.append("7211")
        if "95m" in name_lower or "95 m" in name_lower:
            compat.extend(["5211", "6211"])
        if "102m" in name_lower or "102 m" in name_lower:
            compat.extend(["6211", "7211"])
        if "110" in name_lower:
            compat.extend(["7211", "8011"])
        if not compat:
            compat = ["5211", "6211", "7211", "8011"]
        compat = sorted(set(compat))

        # Drive image link → for now use system category fallback
        imagen = None  # we won't use Drive raw URLs (not displayable). Admin can upload later.
        sys_fallbacks = {
            "motor": "https://images.unsplash.com/photo-1759850425725-41216a62b6e0?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
            "hidraulico": "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
            "transmision": "https://images.unsplash.com/photo-1667339240140-1aee60bea0e5?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
            "frenos": "https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
            "filtros": "https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=800",
        }
        imagen = sys_fallbacks.get(item["sistema"])

        doc = {
            "id": str(uuid.uuid4()),
            "sku": item["sku"],
            "nombre": item["nombre"],
            "sistema": item["sistema"],
            "categoria_original": item.get("categoria_original"),
            "descripcion": f"Repuesto original Zetor — {item['nombre']}. Referencia {item['sku']}. Validamos compatibilidad antes del despacho.",
            "observacion_tecnica": "Antes de despachar validamos compatibilidad con tu modelo y número de chasis.",
            "compatibilidad": compat,
            "imagen_principal": imagen,
            "galeria": [],
            "disponibilidad": "Disponible",
            "destacado": i < 8,  # first 8 featured
            "activo": True,
            "slug": make_slug(item["nombre"], item["sku"]),
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        # ensure unique slug
        n = 1
        base = doc["slug"]
        while await db.products.find_one({"slug": doc["slug"]}):
            n += 1
            doc["slug"] = f"{base}-{n}"
        await db.products.insert_one(doc)
    logging.info(f"Seeded {len(raw)} products")

async def seed_blog():
    count = await db.blog_posts.count_documents({})
    if count > 0:
        return
    for p in DEFAULT_BLOG_POSTS:
        doc = {**p}
        doc["id"] = str(uuid.uuid4())
        doc["slug"] = slugify(p["titulo"])
        doc["publicado"] = True
        doc["created_at"] = now_iso()
        doc["updated_at"] = now_iso()
        await db.blog_posts.insert_one(doc)
    logging.info("Seeded blog posts")

async def ensure_indexes():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("sku", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.products.create_index([("sistema", 1), ("activo", 1)])
    await db.products.create_index("compatibilidad")
    await db.blog_posts.create_index("slug", unique=True)

@app.on_event("startup")
async def on_startup():
    await ensure_indexes()
    await seed_admin()
    await seed_products()
    await seed_blog()

# Include router
app.include_router(api_router)

# CORS - allow any origin with credentials via regex (Emergent preview supports this)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
