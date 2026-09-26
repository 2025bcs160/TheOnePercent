"""Quick contact sheet of raw windows for picking examples: preview.py out.png SYM,TF,start,end ..."""
import sys, glob, os
sys.path.insert(0, os.path.dirname(__file__))
import render as R
from playwright.sync_api import sync_playwright
from PIL import Image
out = sys.argv[1]; wins = [w.split(",") for w in sys.argv[2:]]
exe = glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell"))[0]
ims = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=exe); pg = b.new_page(viewport={"width": R.W, "height": R.H})
    for k, (s, tf, a, e) in enumerate(wins):
        spec = {"id": "p", "symbol": s, "tf": tf, "start": a, "end": e, "stamp": f"{a} → {e}", "room": 2}
        open("/tmp/p.html", "w").write(R.page(R.render(spec))); pg.goto("file:///tmp/p.html"); pg.wait_for_timeout(100)
        pg.screenshot(path=f"/tmp/p{k}.png"); ims.append(Image.open(f"/tmp/p{k}.png"))
    b.close()
cols = 2 if len(ims) > 1 else 1; rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (R.W * cols, R.H * rows))
for k, im in enumerate(ims): sheet.paste(im, ((k % cols) * R.W, (k // cols) * R.H))
sheet.resize((sheet.width // 2, sheet.height // 2)).save(out)
