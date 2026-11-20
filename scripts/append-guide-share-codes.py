#!/usr/bin/env python3
"""Write preview QR metadata for explicitly selected, deployed standalone apps.

Requires ReportLab. The public origin must already serve the selected apps
without sign-in. This command makes no changes to the public site.
"""

import argparse
from html import escape
import json
import hashlib
from pathlib import Path
import re
from urllib.parse import urlsplit

from reportlab.graphics.barcode.qrencoder import QRCode, QRErrorCorrectLevel


def public_origin(value):
    url = urlsplit(value)
    if (
        url.scheme != "https"
        or not url.hostname
        or not re.fullmatch(r"[a-z0-9.-]+", url.hostname)
        or url.netloc != url.hostname
        or url.path not in ("", "/")
        or url.query
        or url.fragment
    ):
        raise argparse.ArgumentTypeError("provide the HTTPS origin of the public app site")
    return f"https://{url.hostname}"


def qr_svg(url):
    code = QRCode(None, QRErrorCorrectLevel.M)
    code.addData(url)
    code.make()
    margin = 4
    size = code.getModuleCount() + 2 * margin
    modules = "".join(
        f"M{x + margin} {y + margin}h1v1h-1z"
        for y, row in enumerate(code.modules)
        for x, dark in enumerate(row)
        if dark
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}"'
        f' shape-rendering="crispEdges"><title>{escape(url)}</title>'
        f'<path fill="#fff" d="M0 0h{size}v{size}H0z"/>'
        f'<path fill="#000" d="{modules}"/></svg>\n'
    )


def embed_share_code(page, url, svg):
    source = page.read_text(encoding="utf-8")
    source = re.sub(r'<details data-blue-share\b[\s\S]*?</details>', '', source)
    code = svg.strip().replace(
        '<svg ', '<svg role="img" aria-label="App sharing QR code" width="200" height="200" '
        'style="display:block;max-width:100%;height:auto" ', 1
    )
    style = Path(__file__).with_name("guide-share.css").read_text(encoding="utf-8")
    label = 'Open visitor edition' if page.parent.name in VISITOR_EDITIONS else 'Open shared app'
    panel = (
        '<details data-blue-share>'
        '<summary>Share app · QR code</summary>'
        f'<style>{style}</style>'
        '<div data-blue-share-panel>'
        f'{code}<a href="{escape(url, quote=True)}">'
        f'{label}</a></div></details>'
    )
    updated, count = re.subn(r'</h[12]>', lambda match: match[0] + panel, source, count=1, flags=re.I)
    if count != 1:
        raise ValueError(f"Missing app title: {page}")
    page.write_text(updated, encoding="utf-8")


VISITOR_EDITIONS = {
    "california-kelp-field-guide", "el-nino", "information-center", "naturalist-field-notes",
}


def refresh_inventory(directory):
    release_path = directory / "release.json"
    worker_path = directory / "sw.js"
    release = json.loads(release_path.read_text(encoding="utf-8"))
    worker = worker_path.read_text(encoding="utf-8")
    marker = f"RELEASE='{release['release']}'"
    if worker.count(marker) != 1:
        raise ValueError("Service worker release does not match the offline inventory")
    resources = []
    for path in sorted(directory.rglob("*"), key=lambda path: path.as_posix()):
        name = path.relative_to(directory).as_posix()
        if path.is_file() and name not in {"release.json", "sw.js"}:
            data = path.read_bytes()
            resources.append({"url": name, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)})
    digest = hashlib.sha256(json.dumps(resources, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()[:16]
    release["resources"] = resources
    release["release"] = digest
    release_path.write_text(json.dumps(release, ensure_ascii=False, indent=2), encoding="utf-8")
    worker_path.write_text(worker.replace(marker, f"RELEASE='{digest}'"), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("build", type=Path)
    args = parser.parse_args()
    registry = json.loads((args.build / "registry.json").read_text(encoding="utf-8"))
    entries = {app["app_id"]: app["entry_point"] for app in registry["apps"]}
    if len(entries) != 40 or len(registry["apps"]) != 40:
        parser.error("Expected the 40 verified Blue apps")
    for app_id, entry in entries.items():
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", app_id) or entry != f"apps/{app_id}/index.html":
            parser.error(f"Unexpected guide entry: {entry}")
        url = f"https://mba-blue-app-share.drtforshort.chatgpt.site/{entry}?standalone=1"
        if app_id in {"giant-clam", "naturalist-briefing-20261118"}:
            url = f"https://drtforshortaol.github.io/MBA-hub-v2/{entry}"
        if app_id == "nearby-dining":
            url = "https://drtforshortaol.github.io/MBA-nearby-dining/"
        page = args.build / entry
        embed_share_code(page, url, qr_svg(url))
    refresh_inventory(args.build)
    print(f"Embedded share QR codes for {len(entries)} Blue apps")


if __name__ == "__main__":
    main()
