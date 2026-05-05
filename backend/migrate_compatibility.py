"""
Migrate product compatibility from old fixed models (5211/6211/7211/8011)
to new model series ranges:
  5511-5545, 5711-5745, 6711-6745, 6911-6945, 7011-7045, 7211-7245, 8011-12045
"""
import asyncio, os, re
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

from motor.motor_asyncio import AsyncIOMotorClient

ALL_SERIES = ["5511-5545", "5711-5745", "6711-6745", "6911-6945", "7011-7045", "7211-7245", "8011-12045"]

def infer_series(name: str):
    n = (name or "").lower()
    series = set()
    # Specific number mentions in product names
    if "6911" in n: series.add("6911-6945")
    if "7011" in n: series.add("7011-7045")
    if "7211" in n or "7245" in n: series.add("7211-7245")
    if "8011" in n or "8045" in n: series.add("8011-12045")
    if "5511" in n or "5545" in n: series.add("5511-5545")
    if "5711" in n or "5745" in n: series.add("5711-5745")
    if "6711" in n or "6745" in n: series.add("6711-6745")
    # Engine kit hints
    if "95m" in n or "95 m" in n:
        series.update({"5511-5545", "5711-5745"})
    if "102m" in n or "102 m" in n:
        series.update({"6711-6745", "6911-6945"})
    if "110 turbo" in n:
        series.add("8011-12045")
    elif "110" in n:
        series.update({"7011-7045", "7211-7245", "8011-12045"})
    # Default: applies to all series (general parts)
    if not series:
        series = set(ALL_SERIES)
    return sorted(series, key=lambda s: ALL_SERIES.index(s))

async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    cursor = db.products.find({}, {"_id": 0, "id": 1, "nombre": 1, "compatibilidad": 1})
    products = await cursor.to_list(length=2000)
    updated = 0
    for p in products:
        new_compat = infer_series(p.get("nombre", ""))
        if new_compat != p.get("compatibilidad"):
            await db.products.update_one(
                {"id": p["id"]},
                {"$set": {"compatibilidad": new_compat}},
            )
            updated += 1
            print(f"{p['nombre'][:35]:35} -> {new_compat}")
    print(f"\nDone. Updated={updated}/{len(products)}")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
