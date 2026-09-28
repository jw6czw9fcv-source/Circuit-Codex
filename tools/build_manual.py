"""Build the in-app manual from MANUAL.md.

    python tools/build_manual.py            text, index and PDF
    python tools/build_manual.py --shots    also retake every screenshot

MANUAL.md is the only thing edited by hand. This turns it into:

  manual.html          the manual as a page of the app, index first
  manual/img/<id>.jpg  a screenshot of each tool, as it looks on an iPhone
  manual.pdf           the same page printed, for download
  js/manual-index.js   which tools have a section, so the app can link to them

Screenshots and the PDF come from headless Chrome against a throwaway local
server, so nothing has to be running first and nothing is done by hand.
"""

import hashlib
import html
import http.server
import io
import os
import re
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse

import markdown
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]
PORT = 8765
# The target phone, an iPhone 15 Pro Max, is 430 x 932 CSS pixels. Taken at
# twice that, a shot stays sharp when the page shows it at half width on a
# 3x screen, and JPEG keeps 84 of them to a few megabytes.
SHOT_W, SHOT_H, SHOT_SCALE = 430, 932, 2


def read(path):
    with io.open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def write(path, text):
    with io.open(os.path.join(ROOT, path), "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def file_hash(path):
    with open(os.path.join(ROOT, path), "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:10]


# ---------- the app's own structure, read from js/data.js ----------

def app_tools():
    """calc id -> where the tool lives, in the app's own order.

    The route to a tool is its domain id and its section and tool indices, so
    they are counted here the same way the app counts them."""
    src = read("js/data.js")
    events = []
    for m in re.finditer(r'\bid: "([a-z-]+)",\s*\n\s*title: "([^"]+)"', src):
        events.append((m.start(), "domain", m.group(1), m.group(2)))
    for m in re.finditer(r'\btitle: "([^"]+)",\s*(?:\n\s*)?tools:', src):
        events.append((m.start(), "section", m.group(1), None))
    # A tool entry is { name, then optional fields (was, wasSection, calc) }.
    for m in re.finditer(r'\{ name: "([^"]+)"([^}]*)\}', src):
        calc = re.search(r'calc: "([^"]+)"', m.group(2))
        events.append((m.start(), "tool", m.group(1), calc.group(1) if calc else None))
    events.sort()

    tools, order = {}, []
    domain = dtitle = None
    si = ti = -1
    for _, kind, a, b in events:
        if kind == "domain":
            domain, dtitle, si = a, b, -1
        elif kind == "section":
            si, ti, stitle = si + 1, -1, a
        elif kind == "tool":
            ti += 1
            if b:
                tools[b] = {
                    "name": a, "domain": domain, "domain_title": dtitle,
                    "section": stitle, "route": f"{domain}:{si}:{ti}",
                }
                order.append(b)
    return tools, order


def domain_colours():
    src = read("js/data.js")
    out = {}
    for m in re.finditer(r'\bid: "([a-z-]+)",\s*\n\s*title: "[^"]+",\s*\n\s*subtitle: "[^"]*",\s*\n\s*color: "(#[0-9A-Fa-f]{6})"', src):
        out[m.group(1)] = m.group(2)
    return out


# ---------- MANUAL.md into sections ----------

def sections_from_manual():
    """calc id -> (title, markdown body). Only tool sections: the preamble
    and "How a section is written" are for whoever writes the manual."""
    text = read("MANUAL.md").replace("\r\n", "\n")
    out = {}
    for m in re.finditer(r'<a id="([a-z0-9-]+)"></a>\n## ([^\n]+)\n(.*?)(?=\n---\n|\Z)', text, re.S):
        cid, title, body = m.group(1), m.group(2), m.group(3)
        if cid == "index":
            continue
        # The breadcrumb line and the back link are the page template's job.
        body = re.sub(r"^`calc: [^`]+`[^\n]*\n", "", body.lstrip("\n"))
        body = re.sub(r"\n\[↑ Index\]\(#index\)\s*$", "", body.rstrip())
        out[cid] = (title, body)
    return out


# ---------- a throwaway server and headless Chrome ----------

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    # Chrome will not make a window narrower than about 500 px, even headless,
    # so a 430 px window lays the app out at 500 and the shot cuts its right
    # edge off. /__frame holds the app in an iframe of exactly the phone's
    # size instead, and the shot is cropped to it.
    def do_GET(self):
        if self.path.startswith("/__frame?"):
            src = html.escape(urllib.parse.unquote(self.path.split("?", 1)[1]))
            body = (f'<!DOCTYPE html><html><body style="margin:0;background:#0B0D10">'
                    f'<iframe src="{src}" width="{SHOT_W}" height="{SHOT_H}" '
                    f'style="border:0;display:block"></iframe></body></html>').encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *a):
        pass


def serve():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), QuietHandler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def chrome():
    for p in CHROME_PATHS:
        if os.path.exists(p):
            return p
    sys.exit("No Chrome or Edge found; screenshots and PDF need one.")


def run_chrome(args):
    profile = tempfile.mkdtemp(prefix="cc-manual-")
    try:
        subprocess.run(
            [chrome(), "--headless=new", "--disable-gpu", "--no-first-run",
             "--no-default-browser-check", f"--user-data-dir={profile}", *args],
            check=True, timeout=120, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    finally:
        shutil.rmtree(profile, ignore_errors=True)


def take_shot(cid, route):
    png = os.path.join(tempfile.gettempdir(), f"cc-shot-{cid}.png")
    app_url = f"/index.html%23/tool/{route.replace(':', '%253A')}/{cid}"
    url = f"http://127.0.0.1:{PORT}/__frame?{app_url}"
    run_chrome([f"--window-size={SHOT_W + 120},{SHOT_H + 40}", f"--force-device-scale-factor={SHOT_SCALE}",
                "--hide-scrollbars", "--virtual-time-budget=4000", f"--screenshot={png}", url])
    out = os.path.join(ROOT, "manual", "img", f"{cid}.jpg")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img = Image.open(png).convert("RGB").crop((0, 0, SHOT_W * SHOT_SCALE, SHOT_H * SHOT_SCALE))
    img.save(out, "JPEG", quality=80, optimize=True, progressive=True)
    os.remove(png)


# ---------- the page ----------

MD = markdown.Markdown(extensions=["tables", "sane_lists"])


def section_html(cid, title, body, tool, colour):
    MD.reset()
    content = MD.convert(body)
    # Section headings are ### in the source; they sit one level under the
    # tool's own h2 here.
    img = f"manual/img/{cid}.jpg"
    shot = ""
    if os.path.exists(os.path.join(ROOT, img)):
        shot = (f'<figure class="shot"><img src="{img}?h={file_hash(img)}" loading="lazy" '
                f'alt="{html.escape(tool["name"])} as it appears in the app" width="{SHOT_W}" height="{SHOT_H}"></figure>')
    crumb = f'{html.escape(tool["domain_title"])} › {html.escape(tool["section"])}'
    return f"""
<section class="tool" id="{cid}" style="--accent:{colour}">
  <div class="crumb">{crumb}</div>
  <h2>{html.escape(title)}</h2>
  {shot}
  {content}
  <p class="back"><a href="#index">↑ Index</a> · <a href="./#/tool/{tool['route'].replace(':', '%3A')}/{cid}">Open the tool</a></p>
</section>"""


def build_page(sections, tools, order, colours, pdf_ref):
    by_domain = {}
    for cid in order:
        if cid in sections:
            by_domain.setdefault(tools[cid]["domain"], []).append(cid)

    index = []
    for dom, cids in by_domain.items():
        t0 = tools[cids[0]]
        items = "".join(
            # The section's own title, not the app's short menu name: "Color
            # code" alone could be the resistor, capacitor or inductor one.
            f'<li><a href="#{c}"><span class="i-name">{html.escape(sections[c][0])}</span>'
            f'<span class="i-sec">{html.escape(tools[c]["section"])}</span></a></li>' for c in cids)
        index.append(f'<div class="i-domain" style="--accent:{colours.get(dom, "#8FC1F5")}">'
                     f'<h3>{html.escape(t0["domain_title"])}</h3><ul>{items}</ul></div>')

    body = "".join(section_html(c, *sections[c], tools[c], colours.get(tools[c]["domain"], "#8FC1F5"))
                   for dom, cids in by_domain.items() for c in cids)

    return f"""<!DOCTYPE html>
<!-- Generated by tools/build_manual.py from MANUAL.md. Do not edit: edit MANUAL.md and rebuild. -->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0B0D10">
<title>Circuit Codex — Manual</title>
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
{PAGE_CSS}
</style>
</head>
<body>
<header class="bar">
  <a class="btn" href="./#/home" aria-label="Back to the app">‹ App</a>
  <h1>Manual</h1>
  <a class="btn" href="{pdf_ref}" download="Circuit Codex manual.pdf">PDF</a>
</header>
<main>
<div class="cover">
  <div class="cover-title">Circuit Codex</div>
  <div class="cover-sub">User manual</div>
  <p>What each tool does, what its terms mean, and where its numbers come from.
  Tap a tool to go to its section.</p>
</div>
<nav id="index" class="index">
  <h2 class="index-title">Index</h2>
  {''.join(index)}
</nav>
{body}
</main>
</body>
</html>
"""


PAGE_CSS = """
:root {
  --bg: #0B0D10; --card: #15181D; --border: #22262D;
  --text: #E9EBEE; --soft: #9A9EA6; --muted: #6B7078;
  --formula: #8FC1F5; --link: #8FC1F5; --accent: #8FC1F5;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
a { color: var(--link); text-decoration: none; }
.bar {
  position: sticky; top: 0; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  background: rgba(11, 13, 16, 0.94); border-bottom: 1px solid var(--border);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
}
.bar h1 { margin: 0; font-size: 20px; font-weight: 600; }
.btn {
  min-width: 64px; text-align: center; padding: 6px 12px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--card); font-size: 15px; font-weight: 600;
}
main { max-width: 720px; margin: 0 auto; padding: 0 16px calc(env(safe-area-inset-bottom) + 40px); }
.cover { text-align: center; padding: 28px 0 8px; }
.cover-title { font-size: 30px; font-weight: 700; }
.cover-sub { color: var(--soft); font-size: 17px; margin-bottom: 10px; }
.cover p { color: var(--soft); margin: 0 auto; max-width: 420px; }
.index-title { font-size: 22px; margin: 26px 0 8px; }
.i-domain { margin-bottom: 14px; }
.i-domain h3 {
  margin: 0 0 6px; font-size: 14px; letter-spacing: .04em; text-transform: uppercase;
  color: var(--accent);
}
.i-domain ul { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.i-domain li + li { border-top: 1px solid var(--border); }
.i-domain a { display: flex; justify-content: space-between; gap: 12px; padding: 11px 14px; background: var(--card); color: var(--text); }
.i-sec { color: var(--muted); font-size: 14px; white-space: nowrap; }
section.tool { border-top: 1px solid var(--border); margin-top: 34px; padding-top: 22px; scroll-margin-top: 64px; }
.crumb { color: var(--accent); font-size: 13px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; }
section.tool h2 { font-size: 26px; line-height: 1.25; margin: 4px 0 14px; }
section.tool h3 { font-size: 18px; margin: 26px 0 6px; color: var(--text); }
p, li { color: #D5D8DC; }
strong { color: var(--text); }
.shot { margin: 6px auto 18px; width: 58%; max-width: 250px; }
.shot img { display: block; width: 100%; height: auto; border-radius: 22px; border: 1px solid var(--border); }
pre {
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  padding: 12px 14px; overflow-x: auto; margin: 12px 0;
}
pre code { color: var(--formula); font: 14.5px/1.55 "SF Mono", Menlo, Consolas, monospace; white-space: pre; }
code { font: 0.92em "SF Mono", Menlo, Consolas, monospace; color: var(--formula); }
table { border-collapse: collapse; margin: 12px 0; font-size: 14.5px; display: block; overflow-x: auto; }
th, td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; }
th { background: var(--card); }
.back { margin-top: 22px; font-size: 15px; }

@media print {
  @page { size: A4; margin: 16mm 16mm 18mm; }
  :root { --bg: #fff; --card: #F3F5F7; --border: #D5D9DE; --text: #111; --soft: #444; --muted: #666; --formula: #1B4E86; --link: #1B4E86; }
  body { font-size: 10.5pt; line-height: 1.5; }
  p, li { color: #222; }
  .bar, .back { display: none; }
  main { max-width: none; padding: 0; }
  .cover { padding: 70mm 0 0; page-break-after: always; }
  .cover-title { font-size: 34pt; }
  .index { page-break-after: always; }
  .i-domain { break-inside: avoid; }
  .i-domain a { background: #fff; }
  section.tool { page-break-before: always; border-top: none; margin-top: 0; padding-top: 0; }
  .crumb { color: #555; }
  .shot { float: right; width: 52mm; margin: 0 0 6mm 7mm; }
  .shot img { border-radius: 10px; }
  pre, table, figure { break-inside: avoid; }
  h3 { break-after: avoid; }
}
"""


def main():
    shots = "--shots" in sys.argv
    tools, order = app_tools()
    colours = domain_colours()
    sections = sections_from_manual()
    unknown = [c for c in sections if c not in tools]
    if unknown:
        sys.exit(f"MANUAL.md has sections for tools the app does not have: {unknown}")

    httpd = serve()
    try:
        if shots or any(not os.path.exists(os.path.join(ROOT, "manual", "img", f"{c}.jpg")) for c in sections):
            for c in order:
                if c in sections and (shots or not os.path.exists(os.path.join(ROOT, "manual", "img", f"{c}.jpg"))):
                    print("shot", c)
                    take_shot(c, tools[c]["route"])

        # Two passes: the page has to exist before Chrome can print it, and
        # the page links the PDF by its hash so a new PDF is never served
        # from a stale cache.
        write("manual.html", build_page(sections, tools, order, colours, "manual.pdf"))
        pdf = os.path.join(ROOT, "manual.pdf")
        run_chrome(["--no-pdf-header-footer", f"--print-to-pdf={pdf}", "--virtual-time-budget=8000",
                    f"http://127.0.0.1:{PORT}/manual.html"])
        write("manual.html", build_page(sections, tools, order, colours, f"manual.pdf?h={file_hash('manual.pdf')}"))
    finally:
        httpd.shutdown()

    ids = [c for c in order if c in sections]
    write("js/manual-index.js",
          "// Generated by tools/build_manual.py. Tools with a manual section, so the\n"
          "// app only offers a manual link where there is something to read.\n"
          f"const MANUAL_SECTIONS = new Set({ids!r});\n".replace("'", '"'))
    print(f"{len(ids)} sections, manual.pdf {os.path.getsize(pdf) // 1024} KB")


if __name__ == "__main__":
    main()
