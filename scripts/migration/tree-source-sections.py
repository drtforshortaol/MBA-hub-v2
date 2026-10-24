#!/usr/bin/env python3
"""Derive migrated search records directly from the complete original HTML.

Uses only Python's standard library; preserves itertext boundaries rather than
flattening all authored text. It grants no content or release approval.
"""
import html
from html.parser import HTMLParser
import json
import re
import sys

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

class SourceDocument(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.nodes = []
        self.stack = []

    def handle_starttag(self, tag, attrs):
        node = {'tag': tag, 'attrs': dict(attrs), 'parts': [], 'parent': self.stack[-1] if self.stack else None}
        self.nodes.append(node)
        if self.stack:
            self.stack[-1]['parts'].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for position in range(len(self.stack) - 1, -1, -1):
            if self.stack[position]['tag'] == tag:
                self.stack = self.stack[:position]
                break

    def handle_data(self, value):
        if not self.stack:
            return
        parts = self.stack[-1]['parts']
        if parts and isinstance(parts[-1], str):
            parts[-1] += value
        else:
            parts.append(value)

    def handle_comment(self, value):
        if self.stack:
            self.stack[-1]['parts'].append(None)


def itertext(node):
    for value in node['parts']:
        if isinstance(value, str):
            yield value
        elif value is not None:
            yield from itertext(value)


def text(node):
    return html.unescape(re.sub(r'<[^>]+>', ' ', ' '.join(itertext(node)))).strip()


def sections(source):
    parser = SourceDocument()
    parser.feed(source)
    parser.close()
    used, records = set(), []
    for node in parser.nodes:
        if node['tag'] not in ('h2', 'h3') and not (node['tag'] == 'summary' and node['parent'] and node['parent']['tag'] == 'details'):
            continue
        ancestor = node['parent']
        hidden = False
        while ancestor:
            hidden = hidden or 'data-v2-maintenance-hidden' in ancestor['attrs']
            ancestor = ancestor['parent']
        if hidden:
            continue
        title = text(node)
        if not title:
            continue
        target = node['parent'] if node['tag'] == 'summary' else node
        identifier = target['attrs'].get('id') or re.sub(r'[^a-zA-Z0-9_-]+', '-', title).strip('-') or 'section'
        if identifier in used:
            identifier += '-' + str(len(used))
        used.add(identifier)
        records.append({'id': identifier, 'title': title, 'text': text(node['parent'])[:20000], 'aliases': []})
    return records

if __name__ == '__main__':
    print(json.dumps(sections(sys.stdin.read()), ensure_ascii=False))
