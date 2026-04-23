#!/usr/bin/env python3
"""
YDM WordPress XML Export Parser
Parses the WordPress WXR export file and converts all content to structured JSON.
Usage: python xml_parser.py --input exports/wordpress-export.xml --output scrape/pages/
"""

import xml.etree.ElementTree as ET
import json
import os
import re
import argparse
import html
from datetime import datetime

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='Path to wordpress-export.xml')
    parser.add_argument('--output', default='./scrape', help='Output directory')
    return parser.parse_args()

# WordPress XML namespaces
NAMESPACES = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}

def clean_html(raw_html):
    """Strip WordPress-specific shortcodes and clean HTML."""
    if not raw_html:
        return ''
    # Remove shortcodes
    cleaned = re.sub(r'\[/?[^\]]+\]', '', raw_html)
    return cleaned.strip()

def slugify(text):
    """Convert text to URL slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def parse_wordpress_xml(xml_file, output_dir):
    print(f"\n📂 Parsing WordPress export: {xml_file}\n")
    
    tree = ET.parse(xml_file)
    root = tree.getroot()
    channel = root.find('channel')

    # Site metadata
    site_info = {
        'title': channel.findtext('title', ''),
        'link': channel.findtext('link', ''),
        'description': channel.findtext('description', ''),
        'language': channel.findtext('language', ''),
        'exportDate': channel.findtext('{http://wordpress.org/export/1.2/}wxr_version', ''),
    }

    pages = []
    posts = []
    custom_types = {}
    media_items = []
    menus = []
    categories = []
    tags = []

    items = channel.findall('item')
    print(f"Found {len(items)} items to process...\n")

    for item in items:
        post_type = item.findtext('{http://wordpress.org/export/1.2/}post_type', '')
        post_status = item.findtext('{http://wordpress.org/export/1.2/}status', '')
        
        title = item.findtext('title', '')
        content = item.findtext('{http://purl.org/rss/1.0/modules/content/}encoded', '')
        excerpt = item.findtext('{http://wordpress.org/export/1.2/}post_excerpt', '')
        link = item.findtext('link', '')
        slug = item.findtext('{http://wordpress.org/export/1.2/}post_name', '') or slugify(title)
        post_date = item.findtext('{http://wordpress.org/export/1.2/}post_date', '')
        post_id = item.findtext('{http://wordpress.org/export/1.2/}post_id', '')
        
        # Extract custom fields (post meta)
        custom_fields = {}
        for meta in item.findall('{http://wordpress.org/export/1.2/}postmeta'):
            key = meta.findtext('{http://wordpress.org/export/1.2/}meta_key', '')
            value = meta.findtext('{http://wordpress.org/export/1.2/}meta_value', '')
            if key and not key.startswith('_'):
                custom_fields[key] = value

        # Extract featured image
        featured_image = ''
        for meta in item.findall('{http://wordpress.org/export/1.2/}postmeta'):
            if meta.findtext('{http://wordpress.org/export/1.2/}meta_key', '') == '_thumbnail_id':
                featured_image = meta.findtext('{http://wordpress.org/export/1.2/}meta_value', '')

        # Extract categories and tags
        item_cats = []
        item_tags = []
        for cat in item.findall('category'):
            domain = cat.get('domain', '')
            nicename = cat.get('nicename', '')
            text = cat.text or ''
            if domain == 'category':
                item_cats.append({'name': text, 'slug': nicename})
            elif domain == 'post_tag':
                item_tags.append({'name': text, 'slug': nicename})

        # Parse Gutenberg blocks from content
        blocks = parse_gutenberg_blocks(content)

        record = {
            'id': post_id,
            'title': title,
            'slug': slug,
            'url': link,
            'status': post_status,
            'date': post_date,
            'content': html.unescape(clean_html(content)),
            'contentRaw': content,
            'excerpt': html.unescape(excerpt),
            'featuredImageId': featured_image,
            'customFields': custom_fields,
            'categories': item_cats,
            'tags': item_tags,
            'blocks': blocks,
        }

        if post_type == 'page':
            pages.append(record)
            print(f"  📄 Page: {title} (/{slug})")
            # Save individual page
            with open(f"{output_dir}/pages/{slug or 'home'}.json", 'w') as f:
                json.dump(record, f, indent=2, default=str)

        elif post_type == 'post':
            posts.append(record)
            print(f"  📝 Post: {title}")

        elif post_type == 'attachment':
            media_items.append({
                'id': post_id,
                'title': title,
                'url': item.findtext('{http://wordpress.org/export/1.2/}attachment_url', link),
                'slug': slug,
            })

        elif post_type == 'nav_menu_item':
            menus.append(record)

        elif post_type not in ('', 'revision', 'wp_global_styles', 'wp_navigation',
                                'wp_template', 'wp_template_part', 'wp_block'):
            if post_type not in custom_types:
                custom_types[post_type] = []
            custom_types[post_type].append(record)
            print(f"  🔧 Custom type '{post_type}': {title}")

    # Save all collections
    os.makedirs(f"{output_dir}/pages", exist_ok=True)

    def save_json(filepath, data):
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    save_json(f"{output_dir}/site-info.json", site_info)
    save_json(f"{output_dir}/all-pages.json", pages)
    save_json(f"{output_dir}/all-posts.json", posts)
    save_json(f"{output_dir}/media-library.json", media_items)
    save_json(f"{output_dir}/menus.json", menus)

    for ctype, records in custom_types.items():
        save_json(f"{output_dir}/custom-{ctype}.json", records)

    # Site map
    site_map = {
        'siteInfo': site_info,
        'totalPages': len(pages),
        'totalPosts': len(posts),
        'totalMedia': len(media_items),
        'customTypes': list(custom_types.keys()),
        'pages': [{'title': p['title'], 'slug': p['slug'], 'url': p['url']} for p in pages],
    }
    save_json(f"{output_dir}/site-map.json", site_map)

    print(f"""
✅ WordPress export parsed successfully!

📊 Results:
   Pages:        {len(pages)}
   Posts:        {len(posts)}
   Media items:  {len(media_items)}
   Custom types: {list(custom_types.keys())}

📁 Output: {output_dir}/
""")

def parse_gutenberg_blocks(content):
    """Extract Gutenberg block structure from content."""
    if not content:
        return []
    
    blocks = []
    # Match Gutenberg block comments
    block_pattern = re.compile(r'<!-- wp:([^\s\}]+)(\s+(\{[^}]*\}))? -->(.*?)<!-- /wp:\1 -->', re.DOTALL)
    
    for match in block_pattern.finditer(content):
        block_type = match.group(1)
        block_attrs_str = match.group(3) or '{}'
        block_content = match.group(4).strip()
        
        try:
            block_attrs = json.loads(block_attrs_str)
        except:
            block_attrs = {}
        
        blocks.append({
            'type': block_type,
            'attrs': block_attrs,
            'content': clean_html(block_content),
        })
    
    return blocks

if __name__ == '__main__':
    args = get_args()
    os.makedirs(args.output, exist_ok=True)
    os.makedirs(f"{args.output}/pages", exist_ok=True)
    parse_wordpress_xml(args.input, args.output)
