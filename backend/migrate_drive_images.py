"""
Migrate product images from Google Drive share URLs to embeddable URLs.
Drive view URL: https://drive.google.com/file/d/{ID}/view?usp=drivesdk
Embeddable:    https://lh3.googleusercontent.com/d/{ID}=w800

Requires that the user has set the Drive files / parent folder to "Anyone with the link can view".
"""
import asyncio, json, os, re
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

from motor.motor_asyncio import AsyncIOMotorClient

DRIVE_RE = re.compile(r"/d/([a-zA-Z0-9_-]+)")

def to_embed(drive_url: str) -> str | None:
    if not drive_url:
        return None
    m = DRIVE_RE.search(drive_url)
    if not m:
        return None
    return f"https://lh3.googleusercontent.com/d/{m.group(1)}=w1200"

async def main():
    seed_path = ROOT.parent / "data" / "products_seed.json"
    raw = json.loads(seed_path.read_text(encoding="utf-8"))
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    updated = 0
    skipped = 0
    for item in raw:
        sku = item["sku"]
        embed = to_embed(item.get("drive_image"))
        if not embed:
            skipped += 1
            continue
        result = await db.products.update_one(
            {"sku": sku},
            {"$set": {"imagen_principal": embed}},
        )
        if result.matched_count:
            updated += 1
            print(f"UPDATED {sku} -> {embed}")
        else:
            print(f"NOT FOUND {sku}")
    print(f"\nDone. Updated={updated} Skipped(no drive_url)={skipped}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
