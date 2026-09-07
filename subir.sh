#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

python3 - <<'PY'
import os, json
IMGS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif")
names = sorted(f for f in os.listdir("images")
               if os.path.isfile(os.path.join("images", f)) and f.lower().endswith(IMGS))
with open("list.js", "w", encoding="utf-8") as fp:
    fp.write("window.WALLPAPER_LIST = " + json.dumps(names, ensure_ascii=False) + ";\n")
print(f"list.js regenerado: {len(names)} fondos")
PY

python3 "$(dirname "$0")/../gen_thumbs.py"

git add -A
if git diff --cached --quiet; then
  echo "Nada nuevo que subir (Git/images está al día)."
else
  msg="${1:-fondo nuevo}"
  git -c user.name="4peir0n" -c user.email="4peir0n@users.noreply.github.com" commit -m "$msg"
  git push
  echo "Subido a GitHub. La web se actualiza en ~1 min."
fi