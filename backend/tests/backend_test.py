"""Backend pytest suite for Almacén Zetor API.

Covers:
- Health/site config/categories/models
- Products list, detail, filters, search
- Blog list/detail
- Contact lead creation
- Auth login/me/logout (cookie + bearer)
- Admin product CRUD + duplicate SKU
- Admin blog CRUD
- Admin leads list + delete
- Image upload
- _id is excluded from responses
"""
import io
import os
import time
import uuid

import pytest
import requests

# ----- Setup -----
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback to frontend .env
    fe = "/app/frontend/.env"
    if os.path.exists(fe):
        for line in open(fe):
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@almacenzetorrepuestos.com"
ADMIN_PASSWORD = "ZetorAdmin2026!"


@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin(http, auth_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {auth_token}"})
    return s


# ----- Health & site config -----
class TestHealth:
    def test_root(self, http):
        r = http.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data.get("service")

    def test_site_config(self, http):
        r = http.get(f"{API}/site/config")
        assert r.status_code == 200
        data = r.json()
        assert data["whatsapp"] == "573202453457"
        assert "Calle 19B 35-2" in data["address"]
        assert data["domain"] == "www.almacenzetorrepuestos.com"
        assert len(data["systems"]) == 5
        assert len(data["models"]) == 4
        slugs = {s["slug"] for s in data["systems"]}
        assert slugs == {"motor", "hidraulico", "transmision", "frenos", "filtros"}

    def test_categories(self, http):
        r = http.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert len(cats) == 5
        for c in cats:
            assert "slug" in c and "nombre" in c and "count" in c
            assert isinstance(c["count"], int)

    def test_models(self, http):
        r = http.get(f"{API}/models")
        assert r.status_code == 200
        models = r.json()
        assert len(models) == 4
        slugs = {m["slug"] for m in models}
        assert slugs == {"5211", "6211", "7211", "8011"}


# ----- Products -----
class TestProducts:
    def test_list_products(self, http):
        r = http.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "total" in data
        assert data["total"] >= 1
        assert len(data["items"]) > 0
        first = data["items"][0]
        assert "_id" not in first
        assert "id" in first and "slug" in first and "sku" in first

    def test_filter_sistema(self, http):
        r = http.get(f"{API}/products", params={"sistema": "motor"})
        assert r.status_code == 200
        items = r.json()["items"]
        for it in items:
            assert it["sistema"] == "motor"

    def test_filter_modelo(self, http):
        r = http.get(f"{API}/products", params={"modelo": "5211"})
        assert r.status_code == 200
        for it in r.json()["items"]:
            assert "5211" in it["compatibilidad"]

    def test_search_q(self, http):
        r = http.get(f"{API}/products", params={"q": "kit"})
        assert r.status_code == 200
        # Just ensure it returns valid structure
        assert "items" in r.json()

    def test_destacado(self, http):
        r = http.get(f"{API}/products", params={"destacado": "true"})
        assert r.status_code == 200
        for it in r.json()["items"]:
            assert it["destacado"] is True

    def test_get_product_by_slug(self, http):
        r = http.get(f"{API}/products")
        first_slug = r.json()["items"][0]["slug"]
        r2 = http.get(f"{API}/products/{first_slug}")
        assert r2.status_code == 200
        p = r2.json()
        assert p["slug"] == first_slug
        assert "_id" not in p

    def test_get_product_404(self, http):
        r = http.get(f"{API}/products/non-existent-slug-xyz-12345")
        assert r.status_code == 404


# ----- Blog -----
class TestBlog:
    def test_list_blog(self, http):
        r = http.get(f"{API}/blog/posts")
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) >= 3
        for p in items:
            assert "_id" not in p
            assert "slug" in p and "titulo" in p

    def test_blog_detail(self, http):
        items = http.get(f"{API}/blog/posts").json()["items"]
        slug = items[0]["slug"]
        r = http.get(f"{API}/blog/posts/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_blog_404(self, http):
        r = http.get(f"{API}/blog/posts/no-such-blog-xyz")
        assert r.status_code == 404


# ----- Contact -----
class TestContact:
    def test_create_contact(self, http):
        payload = {
            "nombre": "TEST_Tester",
            "telefono": "+573000000000",
            "mensaje": "TEST_lead from pytest",
        }
        r = http.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert "lead_id" in data


# ----- Auth -----
class TestAuth:
    def test_login_success_sets_cookie(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and len(data["access_token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert "password_hash" not in data["user"]
        # Cookie set?
        cookie_header = r.headers.get("set-cookie", "")
        assert "access_token=" in cookie_header.lower()
        assert "httponly" in cookie_header.lower()

    def test_login_wrong_password(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, http, auth_token):
        r = http.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {auth_token}"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password_hash" not in data

    def test_me_without_token(self, http):
        s = requests.Session()  # fresh, no cookies
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401


# ----- Admin Products CRUD -----
class TestAdminProducts:
    created_id = None
    created_sku = f"TEST-{uuid.uuid4().hex[:8].upper()}"

    def test_create_unauth(self):
        # Use fresh session to avoid auth cookie from login fixture
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        r = s.post(f"{API}/admin/products", json={
            "sku": "X", "nombre": "X", "sistema": "motor"
        })
        assert r.status_code == 401

    def test_create_product(self, admin):
        payload = {
            "sku": TestAdminProducts.created_sku,
            "nombre": "TEST_Producto Pytest",
            "sistema": "motor",
            "descripcion": "TEST",
            "compatibilidad": ["5211"],
            "destacado": False,
        }
        r = admin.post(f"{API}/admin/products", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["sku"] == TestAdminProducts.created_sku
        assert "id" in data and "slug" in data
        assert "_id" not in data
        TestAdminProducts.created_id = data["id"]

    def test_duplicate_sku_returns_400(self, admin):
        payload = {
            "sku": TestAdminProducts.created_sku,
            "nombre": "TEST_Duplicado",
            "sistema": "motor",
        }
        r = admin.post(f"{API}/admin/products", json=payload)
        assert r.status_code == 400

    def test_update_product(self, admin):
        pid = TestAdminProducts.created_id
        assert pid
        r = admin.put(f"{API}/admin/products/{pid}", json={"nombre": "TEST_Actualizado"})
        assert r.status_code == 200
        assert r.json()["nombre"] == "TEST_Actualizado"

    def test_delete_product(self, admin):
        pid = TestAdminProducts.created_id
        assert pid
        r = admin.delete(f"{API}/admin/products/{pid}")
        assert r.status_code == 200
        # verify removal via admin list filter by sku
        r2 = admin.get(f"{API}/admin/products", params={"q": TestAdminProducts.created_sku})
        assert r2.status_code == 200
        items = r2.json()["items"]
        assert all(it["id"] != pid for it in items)


# ----- Image Upload -----
class TestUpload:
    def test_upload_image(self, auth_token):
        # Minimal 1x1 PNG
        png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff"
            b"\xff?\x00\x05\xfe\x02\xfe\xa3v\x9eL\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = requests.post(
            f"{API}/admin/upload",
            files=files,
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["url"].startswith("/api/uploads/")
        # try fetching the file
        full = f"{BASE_URL}{data['url']}"
        r2 = requests.get(full)
        assert r2.status_code == 200


# ----- Admin Blog CRUD -----
class TestAdminBlog:
    post_id = None

    def test_create_blog(self, admin):
        r = admin.post(f"{API}/admin/blog", json={
            "titulo": f"TEST_Post_{uuid.uuid4().hex[:6]}",
            "resumen": "TEST resumen",
            "contenido": "TEST contenido",
            "tags": ["test"],
            "publicado": True,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and "slug" in data
        TestAdminBlog.post_id = data["id"]

    def test_update_blog(self, admin):
        pid = TestAdminBlog.post_id
        assert pid
        r = admin.put(f"{API}/admin/blog/{pid}", json={
            "titulo": f"TEST_Updated_{uuid.uuid4().hex[:6]}",
            "resumen": "TEST upd",
            "contenido": "TEST upd",
            "publicado": True,
        })
        assert r.status_code == 200

    def test_delete_blog(self, admin):
        pid = TestAdminBlog.post_id
        assert pid
        r = admin.delete(f"{API}/admin/blog/{pid}")
        assert r.status_code == 200


# ----- Admin Leads -----
class TestAdminLeads:
    def test_leads_requires_auth(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/leads")
        assert r.status_code == 401

    def test_leads_list_and_delete(self, http, admin):
        # Create a lead first
        r = http.post(f"{API}/contact", json={
            "nombre": "TEST_LeadDelete",
            "telefono": "+573000000001",
            "mensaje": "TEST delete",
        })
        assert r.status_code == 200
        lead_id = r.json()["lead_id"]

        # List leads
        r2 = admin.get(f"{API}/admin/leads")
        assert r2.status_code == 200
        items = r2.json()["items"]
        assert any(item["id"] == lead_id for item in items)
        # Ensure no _id present
        for it in items:
            assert "_id" not in it

        # Delete lead
        r3 = admin.delete(f"{API}/admin/leads/{lead_id}")
        assert r3.status_code == 200
