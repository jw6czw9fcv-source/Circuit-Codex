"""Check every tool of the app, as it runs, on the target phone's screen.

    python tools/check_app.py

For each tool: it opens, nothing is wider than the screen, the first result
sits above the tab bar, no JavaScript error is raised, and the reference
cases in tools/check_cases.js give the values they were checked against.
Exits non-zero if anything fails, so it can gate a commit.
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_manual import PORT, ROOT, run_chrome, serve  # noqa: E402

import subprocess  # noqa: E402
import tempfile  # noqa: E402
import shutil  # noqa: E402

from build_manual import chrome  # noqa: E402


def dump_dom(url):
    profile = tempfile.mkdtemp(prefix="cc-check-")
    try:
        out = subprocess.run(
            [chrome(), "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
             f"--user-data-dir={profile}", "--window-size=560,1000",
             "--virtual-time-budget=600000", "--dump-dom", url],
            capture_output=True, timeout=600)
        return out.stdout.decode("utf-8", "replace")
    finally:
        shutil.rmtree(profile, ignore_errors=True)


def main():
    httpd = serve()
    try:
        dom = dump_dom(f"http://127.0.0.1:{PORT}/tools/check.html")
    finally:
        httpd.shutdown()
    # Anchored on the <pre>: the page's own script also contains the markers.
    m = re.search(r'<pre id="report">REPORT(.*?)END</pre>', dom, re.S)
    if not m:
        sys.exit("The check page did not finish; no report found.")
    report = json.loads(m.group(1).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"'))
    if isinstance(report, dict) and "fatal" in report:
        sys.exit(f"The check page failed: {report['fatal']}")

    bad = 0
    cases = sum(r["cases"] for r in report)
    for r in report:
        issues = r["problems"] + r["failed"]
        if issues:
            bad += 1
            print(f"✗ {r['name']} ({r['calc']})")
            for i in issues:
                print(f"    {i}")
    tight = sorted((r for r in report if "clearance" in r and 0 <= r["clearance"] < 20), key=lambda r: r["clearance"])
    for r in tight:
        print(f"  note: {r['name']} ({r['calc']}) has only {r['clearance']} px above the tab bar")
    print(f"{len(report)} tools, {cases} reference cases: "
          + ("all passed" if not bad else f"{bad} tool(s) with problems"))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
