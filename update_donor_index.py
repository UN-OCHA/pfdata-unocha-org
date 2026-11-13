#!/usr/bin/env python3
"""
Weekly refresh of the CBPF donor attribution index page
(https://pfdata.unocha.org/attrib/cbpf/index.html).

What it does
  1. Downloads the CBPF contributions CSV from the CBPF API.
  2. Collects every donor (GMSDonorID / GMSDonorName) with a contribution
     from FIRST_YEAR onwards.
  3. Keeps every donor already on the current index.html, including their
     icon/flag and attribution ID (so hand-curated rows such as
     "Private Contributions" or "Basque Agency..." are preserved).
  4. For every donor and every year folder, checks whether
     <BASE>/<year>/report_<Donor Name>_<year>.pdf exists, and links it only if it does.
  5. Writes the new index.html atomically (temp file + rename).

Only the Python standard library is used.

Usage
  python3 update_donor_index.py --out /path/to/attrib/cbpf/index.html
  python3 update_donor_index.py --out index.html --dry-run   # print summary only

Weekly cron (Mondays 06:15):
  15 6 * * 1  /usr/bin/python3 /opt/scripts/update_donor_index.py --out /var/www/pfdata/attrib/cbpf/index.html >> /var/log/donor_index.log 2>&1
"""

import argparse
import csv
import datetime as dt
import html
import io
import os
import re
import sys
import tempfile
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote

CSV_URL = "https://cbpfapi.unocha.org/vo1/odata/Contribution?poolfundAbbrv=&$format=csv"
BASE = "https://pfdata.unocha.org/attrib/cbpf"
FIRST_YEAR = 2024          # earliest report folder / contribution year considered
TIMEOUT = 60
RETRIES = 3

# Icons for donors that have no country flag (used only for donors not already on the page)
NON_COUNTRY_ICON = "🌐"
PRIVATE_ICON = "🏢"
# CountryCode values in the API that are not real ISO-2 country codes
NON_COUNTRY_CODES = {"", "UNF", "UN", "XX", "PRV", "OTH"}


# --------------------------------------------------------------------------- network
def http(url, method="GET"):
    """Return (status, content_type, body_bytes_or_None). Retries on 5xx / network errors."""
    last = None
    for attempt in range(RETRIES):
        req = urllib.request.Request(url, method=method,
                                     headers={"User-Agent": "cbpf-donor-index-refresh/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = r.read() if method == "GET" else None
                return r.status, r.headers.get("Content-Type", ""), body
        except urllib.error.HTTPError as e:
            if e.code < 500:
                return e.code, "", None
            last = e
        except Exception as e:  # timeouts, resets
            last = e
        import time
        time.sleep(2 * (attempt + 1))
    print(f"  ! giving up on {url}: {last}", file=sys.stderr)
    return 0, "", None


def pdf_exists(name, year):
    url = f"{BASE}/{year}/report_{quote(name)}_{year}.pdf"
    status, ctype, _ = http(url, "HEAD")
    return status == 200 and "pdf" in ctype.lower()


# --------------------------------------------------------------------------- data
def load_api_donors():
    status, _, body = http(CSV_URL)
    if status != 200 or not body:
        sys.exit(f"ERROR: could not download contributions CSV (HTTP {status}); page left unchanged.")
    rows = list(csv.DictReader(io.StringIO(body.decode("utf-8-sig"))))
    if not rows or "GMSDonorID" not in rows[0]:
        sys.exit("ERROR: CSV format not recognised; page left unchanged.")
    donors = {}
    for r in rows:
        try:
            year = int(r.get("FiscalYear") or 0)
        except ValueError:
            continue
        did = (r.get("GMSDonorID") or "").strip()
        name = (r.get("GMSDonorName") or "").strip()
        if year < FIRST_YEAR or not did or not name:
            continue
        d = donors.setdefault(did, {"id": did, "name": name,
                                    "cc": (r.get("CountryCode") or "").strip(), "years": set()})
        d["years"].add(year)
    return donors, len(rows)


ROW_RE = re.compile(r'<div class="donor-row">(.*?)</div>\s*</div>\s*</div>', re.S)


def load_existing(path):
    """Parse donor rows from the current index.html -> {id: {name, icon_html}}."""
    if not os.path.exists(path):
        return {}
    text = open(path, encoding="utf-8").read()
    out = {}
    for block in re.findall(r'<div class="donor-row">.*?attribution\.html\?donor=\d+.*?</div>\s*</div>\s*</div>',
                            text, re.S):
        m_id = re.search(r'attribution\.html\?donor=(\d+)', block)
        m_name = re.search(r'<div class="donor-name">(.*?)</div>', block, re.S)
        if not (m_id and m_name):
            continue
        inner = m_name.group(1).strip()
        m_icon = re.match(r'(<img[^>]*>|<span class="donor-icon">.*?</span>)\s*(.*)', inner, re.S)
        if m_icon:
            icon_html, name = m_icon.group(1), m_icon.group(2)
        else:
            icon_html, name = "", inner
        out[m_id.group(1)] = {"id": m_id.group(1), "name": html.unescape(name.strip()),
                              "icon_html": icon_html}
    return out


def icon_for(name, cc):
    cc = (cc or "").upper()
    if "private" in name.lower():
        return f'<span class="donor-icon">{PRIVATE_ICON}</span>'
    if len(cc) == 2 and cc.isalpha() and cc not in NON_COUNTRY_CODES:
        return (f'<img class="flag-icon" src="https://flagcdn.com/w40/{cc.lower()}.png" '
                f'alt="{html.escape(name)} flag">')
    return f'<span class="donor-icon">{NON_COUNTRY_ICON}</span>'


# --------------------------------------------------------------------------- render
CSS = """
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;
            padding: 40px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 1.1em; opacity: 0.95; }
        .content { padding: 40px; }
        .donor-row { display: grid; grid-template-columns: 1fr; gap: 15px; padding: 20px;
            border-bottom: 1px solid #e0e0e0; align-items: start; }
        .donor-row:last-child { border-bottom: none; }
        .donor-row:hover { background-color: #f9f9f9; }
        .donor-name { display: flex; align-items: center; gap: 10px; font-weight: 600;
            font-size: 1.1em; color: #333; margin-bottom: 8px; }
        .flag-icon { width: 32px; height: 24px; object-fit: cover; border-radius: 3px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22); flex-shrink: 0; }
        .donor-icon { width: 32px; height: 24px; display: inline-flex; align-items: center;
            justify-content: center; font-size: 1.2em; flex-shrink: 0; }
        .year-links { display: flex; gap: 40px; flex-wrap: wrap; align-items: center; }
        .year-section { display: flex; gap: 10px; align-items: center; }
        .year-label { font-weight: 600; color: #667eea; min-width: 50px; }
        a { color: #667eea; text-decoration: none; font-weight: 500; transition: all 0.3s ease;
            padding: 6px 12px; border-radius: 4px; display: inline-block; }
        a:hover { background-color: #667eea; color: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
        .separator { color: #999; font-weight: 500; }
        .footer { background: #f5f5f5; padding: 20px 40px; text-align: center; font-size: 0.9em;
            color: #666; border-top: 1px solid #e0e0e0; }
        .footer a { color: #667eea; }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.8em; }
            .year-links { flex-direction: column; gap: 15px; align-items: flex-start; }
            .donor-row { padding: 15px; }
            a { padding: 5px 10px; font-size: 0.95em; }
        }
"""


def render_row(d):
    parts = [
        f'<div class="year-section"><span class="year-label">{y}</span>'
        f'<a href="{BASE}/{y}/report_{quote(d["name"])}_{y}.pdf">📄 Report</a></div>'
        for y in d["pdf_years"]
    ]
    parts.append(
        f'<div class="year-section"><a class="attrib-link" target="_blank" rel="noopener noreferrer" '
        f'href="{BASE}/attribution.html?donor={d["id"]}">📊 Attribution</a></div>')
    sep = '\n                    <span class="separator">;</span>\n                    '
    return (f'            <div class="donor-row">\n'
            f'                <div class="donor-name">{d["icon_html"]} {html.escape(d["name"])}</div>\n'
            f'                <div class="year-links">\n'
            f'                    {sep.join(parts)}\n'
            f'                </div>\n'
            f'            </div>')


def render_page(donors, years_with_pdfs, today):
    label = " &amp; ".join(str(y) for y in years_with_pdfs) or str(today.year)
    rows = "\n".join(render_row(d) for d in donors)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPF Donor Reports - {label}</title>
    <style>{CSS}    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 CPF Donor Reports</h1>
            <p> {label}</p>
        </div>

        <div class="content">
{rows}
        </div>

        <div class="footer">
            <p>📚 CPF Donor Reports Index | Last Updated: {today.isoformat()}</p>
        </div>
    </div>
</body>
</html>
"""


def write_atomic(path, text):
    d = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".index.", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True, help="path of index.html to read (existing rows) and write")
    ap.add_argument("--dry-run", action="store_true", help="show what would change, don't write")
    args = ap.parse_args()

    today = dt.date.today()
    report_years = list(range(FIRST_YEAR, today.year + 1))   # picks up new year folders automatically

    existing = load_existing(args.out)
    api, n_rows = load_api_donors()
    print(f"{today}: {n_rows} contribution rows, {len(api)} donors since {FIRST_YEAR}, "
          f"{len(existing)} on current page")

    merged = {}
    for did, e in existing.items():                       # keep curated rows as they are
        merged[did] = {"id": did, "name": e["name"], "icon_html": e["icon_html"] or icon_for(e["name"], "")}
    new_ids = []
    for did, a in api.items():
        if did not in merged:
            merged[did] = {"id": did, "name": a["name"], "icon_html": icon_for(a["name"], a["cc"])}
            new_ids.append(did)

    # PDF existence checks, in parallel
    jobs = [(did, y) for did in merged for y in report_years]
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(lambda j: pdf_exists(merged[j[0]]["name"], j[1]), jobs))
    for d in merged.values():
        d["pdf_years"] = []
    for (did, y), ok in zip(jobs, results):
        if ok:
            merged[did]["pdf_years"].append(y)
    years_with_pdfs = sorted({y for d in merged.values() for y in d["pdf_years"]})

    donors = sorted(merged.values(), key=lambda d: d["name"].casefold())
    for did in new_ids:
        d = merged[did]
        print(f"  + new donor: {d['name']} (ID {did}), PDFs: {d['pdf_years'] or 'none'}")
    if not new_ids:
        print("  no new donors")

    page = render_page(donors, years_with_pdfs, today)
    if args.dry_run:
        print(f"  dry run: would write {len(donors)} donors, {len(page)} bytes to {args.out}")
        return
    write_atomic(args.out, page)
    print(f"  wrote {len(donors)} donors to {args.out}")


if __name__ == "__main__":
    main()
