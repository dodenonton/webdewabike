#!/usr/bin/env python3
"""
Generate llms.txt dynamically from HTML pages and js/app.js.

Whenever you update package descriptions, prices, FAQs, or KTP/KITAS discount
rules in HTML or js/app.js, run:
    python3 scripts/generate_llms.py

To verify without modifying llms.txt:
    python3 scripts/generate_llms.py --check
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://www.dewabike.com"
OUTPUT_FILE = ROOT / "llms.txt"


def clean_text(raw: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    return " ".join(text.split())


def extract_meta_description(text: str) -> str:
    patterns = [
        r'<meta\s+name="description"\s+content="([^"]*)"',
        r"<meta\s+name='description'\s+content='([^']*)'",
        r'<meta\s+content="([^"]*)"\s+name="description"',
        r"<meta\s+content='([^']*)'\s+name='description'",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.I)
        if m:
            return html.unescape(m.group(1)).strip()
    return ""


def extract_h1(text: str) -> str:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", text, re.S | re.I)
    return clean_text(m.group(1)) if m else ""


def extract_title(text: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I)
    return clean_text(m.group(1)) if m else ""


def extract_json_lds(text: str) -> list[dict]:
    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        text,
        re.S | re.I,
    )
    parsed: list[dict] = []
    for block in blocks:
        try:
            data = json.loads(block.strip())
            if isinstance(data, list):
                parsed.extend([d for d in data if isinstance(d, dict)])
            elif isinstance(data, dict):
                parsed.append(data)
        except json.JSONDecodeError:
            continue
    return parsed


def load_ktp_discount_rate() -> float:
    app_js = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    m = re.search(r"const\s+KTP_DISCOUNT_RATE\s*=\s*([0-9.]+)\s*;", app_js)
    return float(m.group(1)) if m else 0.1667


def apply_ktp_discount(amount: int, rate: float) -> int:
    if amount <= 0:
        return 0
    return int(round((amount * (1.0 - rate)) / 5000.0) * 5000)


def format_idr(amount: int) -> str:
    return f"Rp {amount:,}".replace(",", ".")


def parse_idr_tokens(line: str) -> list[int]:
    vals: list[int] = []
    for m in re.finditer(r"Rp\.?\s*([\d.]+)(k|rb)?\b", line, re.I):
        num_str, suffix = m.group(1), m.group(2)
        if suffix:
            vals.append(int(num_str.replace(".", "")) * 1000)
        else:
            clean = num_str.replace(".", "")
            if clean.isdigit():
                val = int(clean)
                if val >= 10000:
                    vals.append(val)
    return vals


def extract_sidebar_lines(text: str) -> list[str]:
    # Capture inner HTML of .tour-sidebar-card up to booking button
    m = re.search(
        r'<div\s+class="tour-sidebar-card">(.*?)<button[^>]*open-booking-btn',
        text,
        re.S | re.I,
    )
    if not m:
        return []
    raw_html = m.group(1)
    # Remove HTML comments
    raw_html = re.sub(r"<!--.*?-->", "", raw_html, flags=re.S)
    # Normalize block boundaries to newlines
    raw_html = re.sub(r"<br\s*/?>", "\n", raw_html, flags=re.I)
    raw_html = re.sub(r"</(?:div|p|li|h3|h4|ul|span)>", "\n", raw_html, flags=re.I)
    stripped = re.sub(r"<[^>]+>", " ", raw_html)
    lines = [" ".join(html.unescape(line).split()) for line in stripped.splitlines()]
    lines = [line for line in lines if line and line not in ("•", "-", "🏷️", "✔️", "🚗")]
    return lines


def extract_pricing_summary(rel_path: str, text: str, ktp_rate: float) -> list[str]:
    """Extract clean, human- & LLM-readable pricing bullets directly from HTML."""
    lines = extract_sidebar_lines(text)
    if not lines:
        return []

    is_cycling = rel_path.startswith("bike-tours/")
    is_regular_cycling = rel_path.startswith("bike-tours/regular-packages/")
    out: list[str] = []

    merged: list[str] = []
    skip_prefixes = (
        "Payment by",
        "Pick up and return",
        "Optional Private Car",
        "Or you can use Grab",
        "Start Point Location",
        "Open in Google Maps",
        "What's Included",
        "Optional Add-ons",
        "Special Rate for KTP",
        "Special discounted prices",
        "Chat WhatsApp",
        "or",
        "Email",
        "Direct Price:",
    )

    section_headers = {"PRIVATE:", "SHARING:"}

    for line in lines:
        if any(line.startswith(p) for p in skip_prefixes):
            if line.startswith(("Payment by", "Pick up and return", "Optional Private Car", "What's Included", "Optional Add-ons")):
                break
            continue
        # Join fragment lines into concise statements
        if merged and (
            line.startswith("/")
            or line.startswith("(")
            or line.startswith("for ")
            or (
                merged[-1].endswith(":")
                and merged[-1] not in section_headers
                and (line.startswith("Rp") or line.startswith("Free"))
            )
            or (
                merged[-1].endswith(")")
                and (line.startswith("Rp") or line == "FREE")
            )
        ):
            sep = ": " if merged[-1].endswith(")") and (line.startswith("Rp") or line == "FREE") else " "
            merged[-1] = f"{merged[-1]}{sep}{line}"
        elif line.startswith("• "):
            merged.append(line[2:].strip())
        else:
            merged.append(line)

    # Second pass: filter noise and compute KTP/KITAS equivalent where applicable
    for item in merged:
        item_clean = item.lstrip("•* ").strip()
        if not item_clean:
            continue
        if item_clean.startswith(("PRICE LIST", "SPECIAL PARTNER RATE")):
            continue

        if is_cycling and "Rp" in item_clean:
            amounts = parse_idr_tokens(item_clean)
            if amounts:
                # Special rule: Regular 1-pax Private (Rp 650.000) is identical for Standard and KTP/KITAS
                if is_regular_cycling and amounts == [650000] and (
                    "Only 1 pax" in item_clean or item_clean.startswith("Rp. 650.000")
                ):
                    out.append(f"{item_clean} (Same rate for Standard & KTP/KITAS)")
                elif len(amounts) == 1:
                    ktp_price = apply_ktp_discount(amounts[0], ktp_rate)
                    if ktp_price != amounts[0]:
                        out.append(f"{item_clean} (KTP/KITAS: {format_idr(ktp_price)})")
                    else:
                        out.append(item_clean)
                else:
                    ktp_parts = [format_idr(apply_ktp_discount(amt, ktp_rate)) for amt in amounts]
                    out.append(f"{item_clean} | KTP/KITAS (-{ktp_rate*100:.2f}%): {' / '.join(ktp_parts)}")
                continue

        out.append(item_clean)

    # Deduplicate exact duplicates within the same tier while keeping PRIVATE:/SHARING: complete
    deduped: list[str] = []
    seen = set()
    for line in out:
        if line in section_headers:
            seen.clear()
            deduped.append(line)
            continue
        norm = line.lower()
        if norm not in seen:
            seen.add(norm)
            deduped.append(line)
    return deduped


def generate_llms_txt() -> str:
    ktp_rate = load_ktp_discount_rate()
    ktp_pct_str = f"{ktp_rate * 100:.2f}%"

    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    index_lds = extract_json_lds(index_html)

    biz = next(
        (d for d in index_lds if "LocalBusiness" in (d.get("@type") if isinstance(d.get("@type"), list) else [d.get("@type")])),
        {},
    )
    faq = next((d for d in index_lds if d.get("@type") == "FAQPage"), {})

    name = biz.get("name", "Dewa Bike Tour")
    biz_desc = biz.get("description") or extract_meta_description(index_html)
    phone = biz.get("telephone", "+6281339545689")
    wa_num = re.sub(r"\D", "", phone)
    email = biz.get("email", "dewabiketour@gmail.com")
    addr = biz.get("address", {})
    address_str = ", ".join(
        filter(
            None,
            [
                addr.get("streetAddress", ""),
                addr.get("addressLocality", ""),
                addr.get("addressRegion", ""),
                addr.get("postalCode", ""),
            ],
        )
    )
    hours_list = biz.get("openingHoursSpecification", [])
    opens = hours_list[0].get("opens", "06:00") if hours_list else "06:00"
    closes = hours_list[0].get("closes", "21:00") if hours_list else "21:00"
    rating = biz.get("aggregateRating", {})
    rating_val = rating.get("ratingValue", "5.0")
    rating_cnt = rating.get("ratingCount", "150")
    same_as = biz.get("sameAs", [])

    lines: list[str] = []
    lines.append(f"# {name}")
    lines.append("")
    lines.append(f"> {biz_desc}")
    lines.append("")
    lines.append("## Quick Facts")
    lines.append(f"- **Website (English)**: {BASE_URL}/")
    lines.append(f"- **Website (Indonesian)**: {BASE_URL}/id/")
    if address_str:
        lines.append(f"- **Location**: {address_str}, Indonesia")
    lines.append(f"- **Opening Hours**: Daily {opens} – {closes} WITA")
    lines.append(f"- **WhatsApp / Phone**: {phone} (https://wa.me/{wa_num})")
    lines.append(f"- **Email**: {email}")
    lines.append(f"- **Rating**: {rating_val}/5 ({rating_cnt}+ reviews)")
    lines.append(
        f"- **KTP & KITAS Special Rate**: Automatic **{ktp_pct_str} discount** applies to **Cycling Tours only** "
        "(Regular, Saving, and E-Bike packages) for Indonesian ID (KTP) and KITAS holders. "
        "Exception: Regular Cycling **Only 1 pax PRIVATE (Rp 650.000)** keeps the same rate for both Standard and KTP/KITAS guests. "
        "Combination Tours and Other Activities keep standard rates."
    )
    lines.append("")

    sections = [
        ("Regular Cycling Packages (Hotel Pickup & Indonesian Lunch Included)", sorted((ROOT / "bike-tours" / "regular-packages").glob("*.html"))),
        ("Saving Cycling Packages (Self-Drive to Meeting Point, Guided Ride)", sorted((ROOT / "bike-tours" / "saving-packages").glob("*.html"))),
        ("Combination Adventure Tours (Standard Rates Only)", sorted((ROOT / "other-tours" / "combination-tours").glob("*.html"))),
        ("Other Adventure & Cultural Activities (Standard Rates Only)", sorted((ROOT / "other-tours" / "other-activities").glob("*.html"))),
    ]

    for heading, file_paths in sections:
        lines.append(f"## {heading}")
        lines.append("")
        for fp in file_paths:
            rel = fp.relative_to(ROOT).as_posix()
            raw = fp.read_text(encoding="utf-8")
            pkg_title = extract_h1(raw) or extract_title(raw)
            pkg_desc = extract_meta_description(raw)
            url_en = f"{BASE_URL}/{rel}"
            url_id = f"{BASE_URL}/id/{rel}"

            lines.append(f"### [{pkg_title}]({url_en})")
            lines.append(f"- **Indonesian page**: {url_id}")
            if pkg_desc:
                lines.append(f"- **Summary**: {pkg_desc}")
            pricing = extract_pricing_summary(rel, raw, ktp_rate)
            if pricing:
                lines.append("- **Pricing**:")
                for p in pricing:
                    lines.append(f"  - {p}")
            lines.append("")

    lines.append("## Overview & Info Pages")
    lines.append("")
    overview_pages = [
        ("Home", "index.html"),
        ("All Cycling Packages", "bike-tours/all-cycling-packages.html"),
        ("See All Tours & Activities", "other-tours/see-all-tours.html"),
        ("About Us", "about/about-us.html"),
        ("Our Facilities", "about/our-facilities.html"),
        ("Photo Gallery", "gallery.html"),
        ("Contact & Location", "contact.html"),
    ]
    for label, rel in overview_pages:
        fp = ROOT / rel
        if fp.exists():
            raw = fp.read_text(encoding="utf-8")
            desc = extract_meta_description(raw)
            page_url = f"{BASE_URL}/" if rel == "index.html" else f"{BASE_URL}/{rel}"
            id_url = f"{BASE_URL}/id/" if rel == "index.html" else f"{BASE_URL}/id/{rel}"
            lines.append(f"- [{label}]({page_url}) ([ID]({id_url})): {desc}")
    lines.append("")

    main_entity = faq.get("mainEntity", [])
    if main_entity:
        lines.append("## Frequently Asked Questions")
        lines.append("")
        for item in main_entity:
            q = clean_text(item.get("name", ""))
            a = clean_text(item.get("acceptedAnswer", {}).get("text", ""))
            if q and a:
                lines.append(f"- **Q: {q}**")
                lines.append(f"  A: {a}")
        lines.append("")

    if same_as:
        lines.append("## Official Profiles & Reviews")
        lines.append("")
        for url in same_as:
            lines.append(f"- {url}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate llms.txt from HTML pages.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify whether llms.txt matches current HTML/JS without writing.",
    )
    args = parser.parse_args()

    content = generate_llms_txt()

    if args.check:
        if not OUTPUT_FILE.exists():
            print("ERROR: llms.txt does not exist. Run: python3 scripts/generate_llms.py")
            return 1
        existing = OUTPUT_FILE.read_text(encoding="utf-8")
        if existing != content:
            print("OUT OF SYNC: llms.txt differs from generated output. Run: python3 scripts/generate_llms.py")
            return 1
        print("OK: llms.txt is up to date.")
        return 0

    OUTPUT_FILE.write_text(content, encoding="utf-8")
    print(f"Generated {OUTPUT_FILE.relative_to(ROOT)} ({len(content.splitlines())} lines, {len(content.encode('utf-8'))} bytes).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
