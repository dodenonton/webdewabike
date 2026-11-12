#!/usr/bin/env python3
"""
Dewa Bike Tour — English -> Indonesian (/id/) Mirror Sync Script
------------------------------------------------------------------
Reads the primary English HTML pages (default language), updates SEO
hreflang alternates and the EN|ID header switcher, and generates/syncs
all corresponding Indonesian pages under /id/ using curated translations
from i18n/id_translations.json plus updates to sitemap.xml.

Usage:
  python3 scripts/sync_id.py          # Sync EN switcher/hreflang, /id/ pages & sitemap.xml
  python3 scripts/sync_id.py --check  # Dry-run audit for any untranslated English strings
  python3 scripts/sync_id.py --id-only # Only regenerate /id/ pages without modifying EN files
"""

from __future__ import annotations

import argparse
import copy
import datetime
import html as html_lib
import json
import os
import re
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

BASE_URL = "https://www.dewabike.com"
REPO_ROOT = Path(__file__).resolve().parent.parent
DICT_PATH = REPO_ROOT / "i18n" / "id_translations.json"

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
PHRASING_TAGS = {
    "strong", "b", "em", "i", "u", "small", "sub", "sup",
    "mark", "br", "wbr", "span", "a", "svg",
}
SEMANTIC_BLOCKS = {
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "td", "th",
    "dt", "dd", "label", "option", "button", "a", "figcaption", "blockquote",
}
INLINE_OR_CONTAINER_LEAVES = {
    "div", "span", "li", "strong", "b", "em", "i", "u", "small",
}
TEXT_ATTRS = {"alt", "placeholder", "title", "aria-label", "label", "data-role", "data-bio"}
META_KEYS = {"description", "keywords", "og:title", "og:description", "twitter:title", "twitter:description"}
LD_SKIP_KEYS = {
    "@context", "@type", "@id", "url", "image", "logo", "hasMap", "email",
    "telephone", "priceRange", "currenciesAccepted", "priceCurrency",
    "dayOfWeek", "opens", "closes", "addressCountry", "postalCode",
    "addressRegion", "addressLocality", "streetAddress", "sameAs",
    "ratingValue", "bestRating", "worstRating", "ratingCount",
    "latitude", "longitude", "price", "availability",
}


class Node:
    """Represents a single HTML element node in our lossless DOM tree."""

    def __init__(self, tag: str, attrs=None, raw_tag: str = ""):
        self.tag = tag
        self.attrs = list(attrs) if attrs else []
        self.raw_tag = raw_tag
        self.dirty_attrs = False
        self.children: list = []  # tuples ("raw", str) or child Node instances
        self.closed_raw: str | None = None

    def get_attr(self, name: str) -> str | None:
        for k, v in self.attrs:
            if k == name:
                return v
        return None

    def set_attr(self, name: str, value: str | None) -> None:
        for i, (k, _) in enumerate(self.attrs):
            if k == name:
                self.attrs[i] = (name, value)
                self.dirty_attrs = True
                return
        self.attrs.append((name, value))
        self.dirty_attrs = True

    def has_class(self, cls_name: str) -> bool:
        cls_val = self.get_attr("class") or ""
        return cls_name in cls_val.split()

    def build_start_tag(self) -> str:
        if not self.dirty_attrs and self.raw_tag:
            return self.raw_tag
        parts = [f"<{self.tag}"]
        for k, v in self.attrs:
            if v is None:
                parts.append(f" {k}")
            else:
                esc = v.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")
                parts.append(f' {k}="{esc}"')
        if self.raw_tag.endswith("/>") and self.tag in VOID_TAGS:
            parts.append("/>")
        else:
            parts.append(">")
        return "".join(parts)


class LosslessTreeBuilder(HTMLParser):
    """Builds a DOM tree whose serialization is byte-for-byte lossless."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("document")
        self.stack = [self.root]

    def handle_decl(self, decl):
        self.stack[-1].children.append(("raw", f"<!{decl}>"))

    def handle_pi(self, data):
        self.stack[-1].children.append(("raw", f"<?{data}>"))

    def handle_comment(self, data):
        self.stack[-1].children.append(("raw", f"<!--{data}-->"))

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.get_starttag_text())
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, attrs, self.get_starttag_text())
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            self.stack[-1].children.append(("raw", f"</{tag}>"))
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack[i].closed_raw = f"</{tag}>"
                del self.stack[i:]
                return
        self.stack[-1].children.append(("raw", f"</{tag}>"))

    def handle_data(self, data):
        self.stack[-1].children.append(("raw", data))

    def handle_entityref(self, name):
        self.stack[-1].children.append(("raw", f"&{name};"))

    def handle_charref(self, name):
        self.stack[-1].children.append(("raw", f"&#{name};"))


def parse_html(raw: str) -> Node:
    tb = LosslessTreeBuilder()
    tb.feed(raw)
    tb.close()
    return tb.root


def serialize(node: Node) -> str:
    out = []
    if node.tag != "document":
        out.append(node.build_start_tag())
    for c in node.children:
        if isinstance(c, tuple):
            out.append(c[1])
        else:
            out.append(serialize(c))
    if node.closed_raw:
        out.append(node.closed_raw)
    return "".join(out)


def find_first(root: Node, tag: str | None = None, cls: str | None = None) -> Node | None:
    for c in root.children:
        if isinstance(c, Node):
            if (tag is None or c.tag == tag) and (cls is None or c.has_class(cls)):
                return c
            found = find_first(c, tag, cls)
            if found:
                return found
    return None


def iter_elements(node: Node):
    for c in node.children:
        if isinstance(c, Node):
            yield c
            yield from iter_elements(c)


def discover_english_pages() -> list[Path]:
    pages = []
    for p in sorted(REPO_ROOT.rglob("*.html")):
        rel = p.relative_to(REPO_ROOT)
        parts = rel.parts
        if parts[0] in ("id", "1", ".git", "scripts", "i18n") or str(rel) == "1.html":
            continue
        pages.append(rel)
    pages.sort(key=lambda r: (0 if r.as_posix() == "index.html" else 1, r.as_posix()))
    return pages


def rel_to_route_paths(rel: Path) -> tuple[str, str]:
    s = rel.as_posix()
    if s == "index.html":
        return "/", "/id/"
    if s.endswith("/index.html"):
        base = "/" + s[:-11] + "/"
        return base, "/id" + base
    slug = "/" + s[:-5]
    return slug, "/id" + slug


def prepend_parent_dir(path_val: str) -> str:
    """Shift a relative asset path one directory deeper for /id/ mirror pages."""
    if not path_val:
        return path_val
    low = path_val.lower()
    if low.startswith(("http://", "https://", "data:", "mailto:", "tel:", "javascript:", "#", "//")):
        return path_val
    if low.startswith("/"):
        return path_val
    if path_val.startswith("./"):
        return "../" + path_val[2:]
    return "../" + path_val


def rewrite_style_urls(style_val: str) -> str:
    def _repl(match):
        quote = match.group(1) or ""
        inner = match.group(2).strip()
        return f"url({quote}{prepend_parent_dir(inner)}{quote})"

    return re.sub(r"url\(\s*(['\"]?)(.+?)\1\s*\)", _repl, style_val)


def rewrite_internal_href(href: str) -> str:
    if not href:
        return href
    if href.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "#", "//")):
        return href
    if href == "/id" or href.startswith("/id/") or href.startswith("/id#") or href.startswith("/id?"):
        return href
    if href == "/":
        return "/id/"
    if href.startswith("/#") or href.startswith("/?"):
        return "/id" + href
    if href.startswith("/"):
        return "/id" + href
    return href


def normalize_space(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def has_letters(s: str) -> bool:
    clean = re.sub(r"<[^>]+>|\{SVG_\d+\}", " ", html_lib.unescape(s))
    return bool(re.search(r"[A-Za-z]", clean))


def has_only_phrasing(node: Node) -> bool:
    for c in node.children:
        if isinstance(c, Node):
            if c.tag not in PHRASING_TAGS:
                return False
            if c.tag != "svg" and not has_only_phrasing(c):
                return False
    return True


def direct_text_has_letters(node: Node) -> bool:
    txt = "".join(c[1] for c in node.children if isinstance(c, tuple))
    return bool(re.search(r"[A-Za-z]", html_lib.unescape(txt)))


def render_children_with_svg_tokens(node: Node, svgs: list[Node]) -> str:
    parts = []
    for c in node.children:
        if isinstance(c, tuple):
            parts.append(c[1])
        elif c.tag == "svg":
            svgs.append(c)
            parts.append(f"{{SVG_{len(svgs) - 1}}}")
        elif c.tag in VOID_TAGS:
            parts.append(c.build_start_tag())
        else:
            inner = render_children_with_svg_tokens(c, svgs)
            close_tag = c.closed_raw or f"</{c.tag}>"
            parts.append(f"{c.build_start_tag()}{inner}{close_tag}")
    return "".join(parts)


class Translator:
    def __init__(self, data: dict):
        self.skip = set(data.get("skip", []))
        self.head = data.get("head", {})
        self.ld = data.get("ld", {})
        self.attrs = data.get("attrs", {})
        self.body = data.get("body", {})
        self.patterns = [
            (re.compile(p["match"]), p["replace"])
            for p in data.get("patterns", [])
        ]
        # Unified cross-lookup fallback (exact normalized key or unescaped key)
        self.merged = {}
        for section in (self.body, self.attrs, self.head, self.ld):
            for k, v in section.items():
                self.merged[normalize_space(k)] = v
        self.unescaped_merged = {
            normalize_space(html_lib.unescape(k)): v
            for k, v in self.merged.items()
        }

    def should_skip(self, key: str) -> bool:
        if key in self.skip:
            return True
        if re.match(r"^https?://\S+$", key):
            return True
        if re.match(r"^[\d\s\.,\-\+\*/:•✓✔✕✖🔶🔷🔘🌾🌿⚡⭐⛰️🌋🌊🚜🚴🧭⏱️📏📍💬📸➕🍽️🎒🚗🌅🌇]+$", key):
            return True
        if re.match(r"^Rp\.?\s*[\d\.,]+$", key, re.I):
            return True
        return False

    def lookup(self, key: str, primary: dict, unescaped_allowed: bool = False) -> tuple[str | None, bool]:
        norm = normalize_space(key)
        if not norm or not has_letters(norm) or norm in self.skip:
            return None, True

        if norm in primary:
            return primary[norm], True
        if norm in self.merged:
            return self.merged[norm], True

        for rx, repl in self.patterns:
            m = rx.match(norm)
            if m:
                return m.expand(repl), True

        unesc = normalize_space(html_lib.unescape(norm))
        if unesc in self.skip:
            return None, True
        if unesc in self.unescaped_merged:
            val = self.unescaped_merged[unesc]
            if unescaped_allowed and "<" not in val:
                return val, True
            if "<" not in val:
                return val, True

        if self.should_skip(norm):
            return None, True

        return None, False


def upsert_hreflang_and_locale(head_node: Node, en_url: str, id_url: str, is_id: bool) -> None:
    """Cleanly replace hreflang alternates, og:locale, and og:locale:alternate right after canonical link."""
    new_children = []
    i = 0
    children = head_node.children
    while i < len(children):
        c = children[i]
        if isinstance(c, Node):
            if c.tag == "link" and c.get_attr("rel") == "alternate" and c.get_attr("hreflang"):
                if i + 1 < len(children) and isinstance(children[i + 1], tuple) and children[i + 1][1].strip() == "":
                    i += 1
                i += 1
                continue
            if c.tag == "meta" and c.get_attr("property") in ("og:locale", "og:locale:alternate"):
                if i + 1 < len(children) and isinstance(children[i + 1], tuple) and children[i + 1][1].strip() == "":
                    i += 1
                i += 1
                continue
        new_children.append(c)
        i += 1

    alt_tags = [
        ("raw", "\n  "),
        Node("link", [("rel", "alternate"), ("hreflang", "en"), ("href", en_url)], ""),
        ("raw", "\n  "),
        Node("link", [("rel", "alternate"), ("hreflang", "id"), ("href", id_url)], ""),
        ("raw", "\n  "),
        Node("link", [("rel", "alternate"), ("hreflang", "x-default"), ("href", en_url)], ""),
        ("raw", "\n  "),
        Node("meta", [("property", "og:locale"), ("content", "id_ID" if is_id else "en_US")], ""),
        ("raw", "\n  "),
        Node("meta", [("property", "og:locale:alternate"), ("content", "en_US" if is_id else "id_ID")], ""),
    ]
    for item in alt_tags:
        if isinstance(item, Node):
            item.dirty_attrs = True

    inserted = False
    final_children = []
    for c in new_children:
        final_children.append(c)
        if not inserted and isinstance(c, Node) and c.tag == "link" and c.get_attr("rel") == "canonical":
            final_children.extend(alt_tags)
            inserted = True

    if not inserted:
        final_children.extend(alt_tags)
        final_children.append(("raw", "\n"))

    head_node.children = final_children


def upsert_lang_switcher(body_node: Node, en_route: str, id_route: str, is_id: bool) -> None:
    """Insert or refresh .lang-switcher inside .header-actions right before .mobile-toggle."""
    header_actions = find_first(body_node, tag="div", cls="header-actions")
    if not header_actions:
        return

    cleaned = []
    i = 0
    ch = header_actions.children
    while i < len(ch):
        c = ch[i]
        if isinstance(c, Node) and c.has_class("lang-switcher"):
            if cleaned and isinstance(cleaned[-1], tuple) and cleaned[-1][1].strip() == "":
                cleaned.pop()
            i += 1
            continue
        cleaned.append(c)
        i += 1

    switcher = Node(
        "div",
        [
            ("class", "lang-switcher"),
            ("role", "group"),
            ("aria-label", "Pengalih bahasa" if is_id else "Language switcher"),
        ],
        "",
    )
    switcher.dirty_attrs = True
    switcher.closed_raw = "</div>"

    btn_en = Node(
        "a",
        [
            ("href", en_route),
            ("class", "lang-btn" if is_id else "lang-btn active"),
            ("lang", "en"),
            ("hreflang", "en"),
            ("title", "English"),
        ],
        "",
    )
    btn_en.dirty_attrs = True
    btn_en.closed_raw = "</a>"
    btn_en.children = [("raw", "EN")]

    btn_id = Node(
        "a",
        [
            ("href", id_route),
            ("class", "lang-btn active" if is_id else "lang-btn"),
            ("lang", "id"),
            ("hreflang", "id"),
            ("title", "Bahasa Indonesia"),
        ],
        "",
    )
    btn_id.dirty_attrs = True
    btn_id.closed_raw = "</a>"
    btn_id.children = [("raw", "ID")]

    switcher.children = [
        ("raw", "\n          "),
        btn_en,
        ("raw", "\n          "),
        btn_id,
        ("raw", "\n        "),
    ]

    final_children = []
    inserted = False
    for c in cleaned:
        if not inserted and isinstance(c, Node) and c.tag == "button" and c.has_class("mobile-toggle"):
            if final_children and isinstance(final_children[-1], tuple) and "\n" in final_children[-1][1]:
                ws = final_children[-1][1]
            else:
                ws = "\n        "
            final_children.append(switcher)
            final_children.append(("raw", ws))
            inserted = True
        final_children.append(c)

    if not inserted:
        final_children.append(("raw", "\n        "))
        final_children.append(switcher)
        final_children.append(("raw", "\n      "))

    header_actions.children = final_children


def translate_json_ld(obj, translator: Translator, missing: list[tuple[str, str]], rel_str: str):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in ("@id", "url", "item") and isinstance(v, str) and v.startswith(BASE_URL):
                suffix = v[len(BASE_URL):]
                if not suffix.startswith("/id"):
                    if suffix == "" or suffix == "/":
                        out[k] = f"{BASE_URL}/id/"
                    elif suffix.startswith("/#"):
                        out[k] = f"{BASE_URL}/id{suffix}"
                    else:
                        out[k] = f"{BASE_URL}/id{suffix}"
                else:
                    out[k] = v
                continue
            if k == "inLanguage" and isinstance(v, str):
                out[k] = "id"
                continue
            if k in LD_SKIP_KEYS:
                out[k] = v
                continue
            if isinstance(v, str) and re.search(r"[A-Za-z]", v):
                tr, ok = translator.lookup(v, translator.ld, unescaped_allowed=True)
                if tr is not None:
                    out[k] = tr
                else:
                    if not ok:
                        missing.append((rel_str, f"[ld:{k}] {v}"))
                    out[k] = v
            elif isinstance(v, list) and k in ("alternateName", "touristType"):
                new_list = []
                for item in v:
                    if isinstance(item, str) and re.search(r"[A-Za-z]", item):
                        tr, ok = translator.lookup(item, translator.ld, unescaped_allowed=True)
                        if tr is not None:
                            new_list.append(tr)
                        else:
                            if not ok:
                                missing.append((rel_str, f"[ld:{k}] {item}"))
                            new_list.append(item)
                    else:
                        new_list.append(item)
                out[k] = new_list
            else:
                out[k] = translate_json_ld(v, translator, missing, rel_str)
        return out
    if isinstance(obj, list):
        return [translate_json_ld(x, translator, missing, rel_str) for x in obj]
    return obj


def process_attrs_and_paths(node: Node, translator: Translator, missing: list[tuple[str, str]], rel_str: str) -> None:
    if node.has_class("lang-switcher"):
        return

    for k, v in list(node.attrs):
        if v is None:
            continue
        if k == "src" and node.tag in ("img", "script"):
            new_src = prepend_parent_dir(v)
            if new_src != v:
                node.set_attr("src", new_src)
        elif k == "href" and node.tag == "link":
            rel_val = (node.get_attr("rel") or "").lower()
            if any(x in rel_val for x in ("stylesheet", "icon", "preload", "apple-touch-icon")):
                new_href = prepend_parent_dir(v)
                if new_href != v:
                    node.set_attr("href", new_href)
        elif k == "data-img":
            node.set_attr("data-img", prepend_parent_dir(v))
        elif k == "style" and "url(" in v:
            new_style = rewrite_style_urls(v)
            if new_style != v:
                node.set_attr("style", new_style)
        elif k == "href" and node.tag == "a":
            if "wa.me" in v and "text=" in v:
                tr, ok = translator.lookup(v, translator.attrs, unescaped_allowed=True)
                if tr is not None:
                    node.set_attr("href", tr)
                elif not ok:
                    missing.append((rel_str, f"[wa] {v}"))
            elif v.startswith("/"):
                node.set_attr("href", rewrite_internal_href(v))
        elif k in TEXT_ATTRS and re.search(r"[A-Za-z]", v):
            tr, ok = translator.lookup(v, translator.attrs, unescaped_allowed=True)
            if tr is not None:
                node.set_attr(k, tr)
            elif not ok:
                missing.append((rel_str, f"[attr:{k}] {v}"))


def translate_inline_links(raw_html: str) -> str:
    """Rewrite any internal <a href="/..."> inside a translated HTML fragment."""
    def _repl(m):
        prefix, href, suffix = m.group(1), m.group(2), m.group(3)
        return f"{prefix}{rewrite_internal_href(href)}{suffix}"

    return re.sub(r'(<a\b[^>]*href=["\'])(/[^"\']*)(["\'][^>]*>)', _repl, raw_html)


def build_id_document(en_raw: str, rel: Path, translator: Translator, missing: list[tuple[str, str]]) -> str:
    rel_str = rel.as_posix()
    en_route, id_route = rel_to_route_paths(rel)
    en_url = BASE_URL + en_route
    id_url = BASE_URL + id_route

    doc = parse_html(en_raw)
    html_node = find_first(doc, tag="html")
    if html_node:
        html_node.set_attr("lang", "id")

    head_node = find_first(doc, tag="head")
    if head_node:
        for el in iter_elements(head_node):
            if el.tag == "title":
                raw_inner = render_children_with_svg_tokens(el, [])
                norm = normalize_space(raw_inner)
                tr, ok = translator.lookup(norm, translator.head)
                if tr is not None:
                    el.children = [("raw", tr)]
                elif not ok:
                    missing.append((rel_str, f"[title] {norm}"))
            elif el.tag == "meta":
                key = el.get_attr("name") or el.get_attr("property") or ""
                content = el.get_attr("content")
                if key in META_KEYS and content:
                    tr, ok = translator.lookup(content, translator.head, unescaped_allowed=True)
                    if tr is not None:
                        el.set_attr("content", tr)
                    elif not ok:
                        missing.append((rel_str, f"[meta:{key}] {content}"))
                elif key == "og:url":
                    el.set_attr("content", id_url)
            elif el.tag == "link":
                rel_val = (el.get_attr("rel") or "").lower()
                if rel_val == "canonical":
                    el.set_attr("href", id_url)
                elif any(x in rel_val for x in ("stylesheet", "icon", "preload", "apple-touch-icon")):
                    href = el.get_attr("href")
                    if href:
                        el.set_attr("href", prepend_parent_dir(href))
            elif el.tag == "script":
                if el.get_attr("type") == "application/ld+json":
                    txt = "".join(c[1] for c in el.children if isinstance(c, tuple))
                    try:
                        ld_obj = json.loads(txt)
                        tr_obj = translate_json_ld(ld_obj, translator, missing, rel_str)
                        el.children = [("raw", "\n  " + json.dumps(tr_obj, indent=2, ensure_ascii=False).replace("\n", "\n  ") + "\n  ")]
                    except json.JSONDecodeError as e:
                        print(f"WARNING: JSON-LD parse error in {rel_str}: {e}")
                elif el.get_attr("src"):
                    el.set_attr("src", prepend_parent_dir(el.get_attr("src")))

        upsert_hreflang_and_locale(head_node, en_url, id_url, is_id=True)

    body_node = find_first(doc, tag="body")
    if body_node:
        def walk_translate(node: Node):
            if node.tag in ("style", "svg") or node.has_class("lang-switcher"):
                return

            process_attrs_and_paths(node, translator, missing, rel_str)

            if node.tag == "script":
                return

            child_els = [c for c in node.children if isinstance(c, Node)]
            d_letters = direct_text_has_letters(node)
            only_phrasing = has_only_phrasing(node)
            is_single_link_wrap = (not d_letters and len(child_els) == 1 and child_els[0].tag == "a")
            is_semantic = (node.tag in SEMANTIC_BLOCKS) and only_phrasing and not is_single_link_wrap
            is_div_span = (
                (node.tag in INLINE_OR_CONTAINER_LEAVES)
                and (not is_single_link_wrap)
                and only_phrasing
                and (d_letters or not [c for c in child_els if c.tag != "svg"])
            )

            if is_semantic or is_div_span:
                # Transform attributes on nested elements inside this phrasing unit (e.g. inline <a>, <svg>)
                for sub in iter_elements(node):
                    if sub.tag != "svg":
                        process_attrs_and_paths(sub, translator, missing, rel_str)

                svgs: list[Node] = []
                raw_inner = render_children_with_svg_tokens(node, svgs)
                norm = normalize_space(raw_inner)
                if has_letters(norm) and not re.match(r"^https?://\S+$", norm):
                    tr, ok = translator.lookup(norm, translator.body)
                    if tr is not None:
                        lead_m = re.match(r"^\s*", raw_inner)
                        trail_m = re.search(r"\s*$", raw_inner)
                        lead_ws = lead_m.group(0) if lead_m else ""
                        trail_ws = trail_m.group(0) if trail_m else ""
                        restored = translate_inline_links(tr)
                        for idx, svg_node in enumerate(svgs):
                            restored = restored.replace(f"{{SVG_{idx}}}", serialize(svg_node))
                        node.children = [("raw", f"{lead_ws}{restored}{trail_ws}")]
                    elif not ok:
                        missing.append((rel_str, norm))
                return

            for c in child_els:
                walk_translate(c)

        walk_translate(body_node)
        upsert_lang_switcher(body_node, en_route, id_route, is_id=True)

    return serialize(doc)


def update_english_document(en_raw: str, rel: Path) -> str:
    en_route, id_route = rel_to_route_paths(rel)
    en_url = BASE_URL + en_route
    id_url = BASE_URL + id_route

    doc = parse_html(en_raw)
    head_node = find_first(doc, tag="head")
    if head_node:
        upsert_hreflang_and_locale(head_node, en_url, id_url, is_id=False)

    body_node = find_first(doc, tag="body")
    if body_node:
        upsert_lang_switcher(body_node, en_route, id_route, is_id=False)

    return serialize(doc)


def update_sitemap(pages: list[Path]) -> None:
    sitemap_path = REPO_ROOT / "sitemap.xml"
    today = datetime.date.today().isoformat()

    priority_map = {
        "/": ("weekly", "1.0"),
        "/bike-tours/all-cycling-packages": ("weekly", "0.9"),
        "/bike-tours/regular-packages/kintamani-downhill": ("weekly", "0.9"),
        "/bike-tours/regular-packages/ubud-rice-fields": ("weekly", "0.9"),
        "/bike-tours/regular-packages/e-bike-ubud-rice": ("weekly", "0.9"),
        "/other-tours/other-activities/ubud-rice-field-trekking": ("weekly", "0.85"),
        "/other-tours/other-activities/atv-adventures": ("monthly", "0.7"),
        "/other-tours/other-activities/river-rafting": ("monthly", "0.7"),
        "/other-tours/other-activities/river-tubing": ("monthly", "0.7"),
        "/about/about-us": ("monthly", "0.8"),
        "/about/our-facilities": ("monthly", "0.8"),
        "/contact": ("monthly", "0.8"),
    }

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]

    for rel in pages:
        en_route, id_route = rel_to_route_paths(rel)
        freq, prio = priority_map.get(en_route, ("weekly", "0.8"))
        en_url = BASE_URL + en_route
        id_url = BASE_URL + id_route

        for loc_url in (en_url, id_url):
            lines.extend([
                "  <url>",
                f"    <loc>{loc_url}</loc>",
                f'    <xhtml:link rel="alternate" hreflang="en" href="{en_url}"/>',
                f'    <xhtml:link rel="alternate" hreflang="id" href="{id_url}"/>',
                f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en_url}"/>',
                f"    <lastmod>{today}</lastmod>",
                f"    <changefreq>{freq}</changefreq>",
                f"    <priority>{prio}</priority>",
                "  </url>",
            ])

    lines.append("</urlset>\n")
    sitemap_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync English pages to /id/ Indonesian mirror pages.")
    parser.add_argument("--check", action="store_true", help="Dry-run audit without modifying any files.")
    parser.add_argument("--id-only", action="store_true", help="Only write /id/ pages without updating EN hreflang/switcher.")
    args = parser.parse_args()

    if not DICT_PATH.exists():
        print(f"ERROR: Translation dictionary not found at {DICT_PATH}")
        return 1

    dict_data = json.loads(DICT_PATH.read_text(encoding="utf-8"))
    translator = Translator(dict_data)
    pages = discover_english_pages()

    missing: list[tuple[str, str]] = []
    en_updated = 0
    id_written = 0

    for rel in pages:
        en_file = REPO_ROOT / rel
        en_raw = en_file.read_text(encoding="utf-8")

        if not args.id_only:
            new_en = update_english_document(en_raw, rel)
            if new_en != en_raw:
                en_updated += 1
                if not args.check:
                    en_file.write_text(new_en, encoding="utf-8")
            en_raw_for_id = new_en
        else:
            en_raw_for_id = en_raw

        id_html = build_id_document(en_raw_for_id, rel, translator, missing)
        id_file = REPO_ROOT / "id" / rel
        if not args.check:
            id_file.parent.mkdir(parents=True, exist_ok=True)
            id_file.write_text(id_html, encoding="utf-8")
        id_written += 1

    if not args.check and not args.id_only:
        update_sitemap(pages)

    print(f"Synced {id_written} /id/ pages (EN files updated: {en_updated}, mode={'DRY-RUN' if args.check else 'WRITE'}).")
    if missing:
        seen = set()
        unique_missing = []
        for f, txt in missing:
            if (f, txt) not in seen:
                seen.add((f, txt))
                unique_missing.append((f, txt))
        print(f"\nWARNING: {len(unique_missing)} untranslated item(s) detected:")
        for f, txt in unique_missing:
            print(f"  [{f}] {txt}")
        return 2 if args.check else 0

    print("100% of extracted text, attributes, metadata, and JSON-LD translated cleanly (0 missing).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
