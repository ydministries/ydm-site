#!/usr/bin/env python3
"""
YDM WordPress Site Scraper
Extracts all content, styles, fonts, colors, and navigation from a WordPress site.
Usage: python scraper.py --url https://your-ydm-site.com --output ./scrape
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse
import argparse

def get_args():
    parser = argparse.ArgumentParser(description='Scrape WordPress site')
    parser.add_argument('--url', required=True, help='WordPress site URL')
    parser.add_argument('--output', default='./scrape', help='Output directory')
    return parser.parse_args()

class WordPressScraper:
    def __init__(self, base_url, output_dir):
        self.base_url = base_url.rstrip('/')
        self.output_dir = output_dir
        self.visited = set()
        self.pages = []
        self.styles = []
        self.fonts = []
        self.colors = set()
        self.images = []
        self.navigation = {}
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; YDM-Scraper/1.0)'
        })
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/pages", exist_ok=True)

    def scrape_page(self, url):
        if url in self.visited:
            return None
        self.visited.add(url)
        print(f"  Scraping: {url}")
        try:
            resp = self.session.get(url, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"  ERROR: {url} — {e}")
            return None

        soup = BeautifulSoup(resp.text, 'html.parser')
        page_data = self.extract_page_data(url, soup)
        self.extract_styles(soup, url)
        self.extract_fonts(soup)
        self.extract_images(soup, url)
        self.extract_navigation(soup)
        return page_data

    def extract_page_data(self, url, soup):
        slug = urlparse(url).path.strip('/') or 'home'
        title = soup.find('title')
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        h1 = soup.find('h1')

        # Extract all text content by section
        sections = []
        main = soup.find('main') or soup.find('div', class_=re.compile(r'content|main|page'))
        if main:
            for child in main.children:
                if hasattr(child, 'get_text'):
                    text = child.get_text(strip=True)
                    if text:
                        sections.append({
                            'tag': child.name,
                            'class': child.get('class', []),
                            'id': child.get('id', ''),
                            'html': str(child),
                            'text': text
                        })

        # Extract all headings
        headings = {}
        for level in range(1, 7):
            headings[f'h{level}'] = [h.get_text(strip=True) for h in soup.find_all(f'h{level}')]

        # Extract all paragraphs
        paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if p.get_text(strip=True)]

        # Extract all buttons/CTAs
        buttons = []
        for btn in soup.find_all(['button', 'a'], class_=re.compile(r'btn|button|cta')):
            buttons.append({'text': btn.get_text(strip=True), 'href': btn.get('href', '')})

        # Extract all links
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(self.base_url, href)
            if self.base_url in full_url and full_url not in self.visited:
                links.append(full_url)

        # Extract inline styles
        inline_styles = [tag.get('style') for tag in soup.find_all(style=True) if tag.get('style')]

        page_data = {
            'url': url,
            'slug': slug,
            'title': title.get_text(strip=True) if title else '',
            'metaDescription': meta_desc.get('content', '') if meta_desc else '',
            'h1': h1.get_text(strip=True) if h1 else '',
            'headings': headings,
            'paragraphs': paragraphs,
            'buttons': buttons,
            'sections': sections,
            'inlineStyles': inline_styles,
            'bodyClass': soup.find('body').get('class', []) if soup.find('body') else [],
            'fullHtml': str(soup),
        }

        # Save individual page file
        safe_slug = slug.replace('/', '_') or 'home'
        with open(f"{self.output_dir}/pages/{safe_slug}.json", 'w') as f:
            json.dump(page_data, f, indent=2, default=str)

        self.pages.append({'url': url, 'slug': slug, 'title': page_data['title']})
        return links

    def extract_styles(self, soup, page_url):
        # External stylesheets
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href', '')
            if href:
                full_url = urljoin(page_url, href)
                if full_url not in [s['url'] for s in self.styles]:
                    try:
                        resp = self.session.get(full_url, timeout=10)
                        css_content = resp.text
                        self.extract_colors_from_css(css_content)
                        self.styles.append({'url': full_url, 'content': css_content})
                        print(f"    CSS: {full_url}")
                    except:
                        pass

        # Inline style tags
        for style_tag in soup.find_all('style'):
            css_content = style_tag.string or ''
            if css_content:
                self.extract_colors_from_css(css_content)
                self.styles.append({'url': 'inline', 'content': css_content})

    def extract_colors_from_css(self, css):
        # Hex colors
        hex_colors = re.findall(r'#([0-9A-Fa-f]{3,8})\b', css)
        for c in hex_colors:
            self.colors.add(f'#{c}')
        # RGB colors
        rgb_colors = re.findall(r'rgb\([^)]+\)', css)
        for c in rgb_colors:
            self.colors.add(c)
        # CSS variables
        css_vars = re.findall(r'(--[\w-]+)\s*:\s*([^;]+)', css)
        for var, val in css_vars:
            if any(x in val for x in ['#', 'rgb', 'hsl']):
                self.colors.add(f'{var}: {val.strip()}')

    def extract_fonts(self, soup):
        # Google Fonts
        for link in soup.find_all('link', href=re.compile(r'fonts\.googleapis\.com')):
            href = link.get('href', '')
            self.fonts.append({'type': 'google', 'url': href})
            # Parse font family names
            families = re.findall(r'family=([^&]+)', href)
            for fam in families:
                name = fam.replace('+', ' ').split(':')[0]
                print(f"    Font: {name}")

        # @font-face in stylesheets
        for style in self.styles:
            font_faces = re.findall(r'@font-face\s*\{[^}]+\}', style.get('content', ''))
            for ff in font_faces:
                family = re.search(r'font-family:\s*["\']?([^"\';\n]+)', ff)
                if family:
                    self.fonts.append({'type': 'custom', 'declaration': ff, 'family': family.group(1).strip()})

        # font-family references in CSS
        for style in self.styles:
            used = re.findall(r'font-family:\s*([^;]+)', style.get('content', ''))
            for u in used:
                self.fonts.append({'type': 'used', 'value': u.strip()})

    def extract_images(self, soup, page_url):
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src:
                full_url = urljoin(page_url, src)
                self.images.append({
                    'url': full_url,
                    'alt': img.get('alt', ''),
                    'width': img.get('width', ''),
                    'height': img.get('height', ''),
                    'class': img.get('class', []),
                    'page': page_url
                })

    def extract_navigation(self, soup):
        # Header nav
        header = soup.find('header')
        if header:
            nav = header.find('nav') or header.find('ul')
            if nav:
                items = []
                for li in nav.find_all('li'):
                    a = li.find('a')
                    if a:
                        items.append({'text': a.get_text(strip=True), 'href': a.get('href', '')})
                if items:
                    self.navigation['header'] = items

        # Footer nav
        footer = soup.find('footer')
        if footer:
            links = []
            for a in footer.find_all('a'):
                links.append({'text': a.get_text(strip=True), 'href': a.get('href', '')})
            if links:
                self.navigation['footer'] = links

    def crawl(self):
        print(f"\n🕷️  Starting crawl: {self.base_url}\n")
        queue = [self.base_url]
        
        while queue:
            url = queue.pop(0)
            if url in self.visited:
                continue
            new_links = self.scrape_page(url)
            if new_links:
                for link in new_links:
                    if link not in self.visited and self.base_url in link:
                        queue.append(link)
            time.sleep(0.3)  # Be polite

        print(f"\n✅ Crawl complete. {len(self.pages)} pages scraped.\n")

    def save_results(self):
        print("💾 Saving results...")
        
        with open(f"{self.output_dir}/pages.json", 'w') as f:
            json.dump(self.pages, f, indent=2)

        with open(f"{self.output_dir}/styles.json", 'w') as f:
            json.dump(self.styles, f, indent=2, default=str)

        with open(f"{self.output_dir}/fonts.json", 'w') as f:
            # Deduplicate fonts
            seen = set()
            unique_fonts = []
            for font in self.fonts:
                key = json.dumps(font, sort_keys=True)
                if key not in seen:
                    seen.add(key)
                    unique_fonts.append(font)
            json.dump(unique_fonts, f, indent=2)

        with open(f"{self.output_dir}/colors.json", 'w') as f:
            json.dump(list(self.colors), f, indent=2)

        with open(f"{self.output_dir}/images.json", 'w') as f:
            json.dump(self.images, f, indent=2)

        with open(f"{self.output_dir}/navigation.json", 'w') as f:
            json.dump(self.navigation, f, indent=2)

        with open(f"{self.output_dir}/site-map.json", 'w') as f:
            json.dump({
                'baseUrl': self.base_url,
                'totalPages': len(self.pages),
                'pages': self.pages
            }, f, indent=2)

        print(f"""
📊 Extraction Summary:
   Pages:      {len(self.pages)}
   CSS files:  {len(self.styles)}
   Fonts:      {len(set(f.get('family', f.get('value', '')) for f in self.fonts))}
   Colors:     {len(self.colors)}
   Images:     {len(self.images)}
   
📁 Files saved to: {self.output_dir}/
""")

if __name__ == '__main__':
    args = get_args()
    scraper = WordPressScraper(args.url, args.output)
    scraper.crawl()
    scraper.save_results()
