"""Đẩy cấu hình từ .env lên GitHub Secrets.

Chạy:  .venv/bin/python scripts/dat-secrets.py

Đọc trực tiếp file .env nên bạn không phải gõ lại mật khẩu.
Script chỉ in tên khoá và độ dài, KHÔNG BAO GIỜ in giá trị.
"""

import subprocess
import sys
from pathlib import Path

from dotenv import dotenv_values

REPO = "louisle-hash/havas-inventory-intelligence"
CAN_DAT = [
    "MSSQL_HOST", "MSSQL_PORT", "MSSQL_DATABASE", "MSSQL_USER", "MSSQL_PASSWORD",
    "SUPABASE_URL", "SUPABASE_SECRET_KEY",
]

root = Path(__file__).resolve().parents[1]
env_file = root / ".env"
if not env_file.exists():
    sys.exit(f"Không thấy file {env_file}. Chạy: cp .env.example .env rồi điền giá trị.")

cfg = dotenv_values(env_file)
print(f"\nĐặt {len(CAN_DAT)} secret cho repo {REPO}\n")

loi = 0
for key in CAN_DAT:
    value = (cfg.get(key) or "").strip()
    if not value:
        print(f"  BỎ QUA   {key:<22} — đang trống trong .env")
        loi += 1
        continue
    r = subprocess.run(["gh", "secret", "set", key, "-R", REPO, "--body", value],
                       capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  OK       {key:<22} ({len(value)} ký tự)")
    else:
        print(f"  LỖI      {key:<22} → {r.stderr.strip()}")
        loi += 1

print()
r = subprocess.run(["gh", "secret", "list", "-R", REPO], capture_output=True, text=True)
print("Secrets hiện có trên repo:")
print("\n".join("  " + line for line in r.stdout.strip().splitlines()) or "  (trống)")

if loi:
    print(f"\n!! Còn {loi} khoá chưa đặt được — xem lại ở trên.\n")
    sys.exit(1)
print("\nXong. Chạy thử: gh workflow run 'Đồng bộ tồn kho' -R " + REPO + "\n")
