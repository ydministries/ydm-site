#!/usr/bin/env python3
"""Agent 2 — WordPress Theme Parser for YDM Migration
Extracts design tokens from theme files and generates CSS custom properties."""

import argparse
import json
import os
import re
from pathlib import Path


def extract_css_variables(css_text):
    """Extract CSS custom properties from CSS text."""
    variables = {}
    matches = re.findall(r'(--[\w-]+)\s*:\s*([^;}{]+)', css_text)
    for name, value in matches:
        variables[name.strip()] = value.strip()
    return variables


def extract_colors(css_text):
    """Extract all color values from CSS."""
    colors = set()
    # Hex
    for m in re.findall(r'#(?:[0-9a-fA-F]{3,8})\b', css_text):
        colors.add(m.lower())
    # RGB/RGBA
    for m in re.findall(r'rgba?\([^)]+\)', css_text):
        colors.add(m)
    # HSL
    for m in re.findall(r'hsla?\([^)]+\)', css_text):
        colors.add(m)
    return colors


def extract_fonts(css_text):
    """Extract font declarations from CSS."""
    families = set()
    sizes = set()
    weights = set()
    line_heights = set()

    for m in re.findall(r'font-family\s*:\s*([^;}{]+)', css_text):
        families.add(m.strip().strip('"\''))
    for m in re.findall(r'font-size\s*:\s*([^;}{]+)', css_text):
        sizes.add(m.strip())
    for m in re.findall(r'font-weight\s*:\s*([^;}{]+)', css_text):
        weights.add(m.strip())
    for m in re.findall(r'line-height\s*:\s*([^;}{]+)', css_text):
        line_heights.add(m.strip())

    return {
        'families': sorted(list(families)),
        'sizes': sorted(list(sizes)),
        'weights': sorted(list(weights)),
        'line_heights': sorted(list(line_heights))
    }


def extract_spacing(css_text):
    """Extract common spacing values."""
    padding_vals = set()
    margin_vals = set()
    gap_vals = set()

    for m in re.findall(r'padding\s*:\s*([^;}{]+)', css_text):
        padding_vals.add(m.strip())
    for m in re.findall(r'margin\s*:\s*([^;}{]+)', css_text):
        margin_vals.add(m.strip())
    for m in re.findall(r'gap\s*:\s*([^;}{]+)', css_text):
        gap_vals.add(m.strip())

    return {
        'padding': sorted(list(padding_vals))[:20],
        'margin': sorted(list(margin_vals))[:20],
        'gap': sorted(list(gap_vals))[:20]
    }


def extract_border_radius(css_text):
    """Extract border-radius values."""
    values = set()
    for m in re.findall(r'border-radius\s*:\s*([^;}{]+)', css_text):
        values.add(m.strip())
    return sorted(list(values))


def extract_shadows(css_text):
    """Extract box-shadow values."""
    values = set()
    for m in re.findall(r'box-shadow\s*:\s*([^;}{]+)', css_text):
        val = m.strip()
        if val != 'none':
            values.add(val)
    return sorted(list(values))


def parse_php_templates(theme_dir):
    """Parse PHP template files for structure info."""
    templates = []
    for php_file in Path(theme_dir).rglob('*.php'):
        rel_path = str(php_file.relative_to(theme_dir))
        content = php_file.read_text(errors='ignore')

        # Find template name
        template_match = re.search(r'Template Name:\s*(.+)', content)
        template_name = template_match.group(1).strip() if template_match else None

        # Find widget areas / dynamic sidebars
        sidebars = re.findall(r'dynamic_sidebar\(\s*[\'"]([^\'"]+)', content)

        # Find get_template_part calls
        parts = re.findall(r'get_template_part\(\s*[\'"]([^\'"]+)', content)

        if template_name or sidebars or (rel_path.count('/') == 0):
            templates.append({
                'file': rel_path,
                'template_name': template_name,
                'sidebars': sidebars,
                'template_parts': parts
            })

    return templates


def categorize_colors(colors, css_vars):
    """Try to categorize colors into primary, secondary, accent, etc."""
    categorized = {}

    # Check CSS variables for named colors
    color_keywords = {
        'primary': ['primary', 'brand', 'main'],
        'secondary': ['secondary', 'accent'],
        'background': ['background', 'bg'],
        'text': ['text', 'body', 'content'],
        'heading': ['heading', 'title', 'h1', 'h2'],
        'link': ['link', 'anchor'],
        'border': ['border', 'divider', 'separator'],
        'success': ['success', 'green'],
        'error': ['error', 'danger', 'red'],
        'warning': ['warning', 'yellow', 'orange'],
    }

    for var_name, var_value in css_vars.items():
        var_lower = var_name.lower()
        for category, keywords in color_keywords.items():
            if any(kw in var_lower for kw in keywords):
                if any(c in var_value for c in ['#', 'rgb', 'hsl']):
                    categorized.setdefault(category, [])
                    categorized[category].append({
                        'variable': var_name,
                        'value': var_value
                    })

    return categorized


def run(theme_dir, output_path):
    print("\n=== AGENT 2: Theme Parser ===")
    print(f"Theme: {theme_dir}")
    print(f"Output: {output_path}\n")

    # Collect all CSS content
    all_css = ""
    css_files_found = 0
    for css_file in Path(theme_dir).rglob('*.css'):
        if '.min.' in str(css_file):
            continue  # Skip minified duplicates
        try:
            content = css_file.read_text(errors='ignore')
            all_css += f"\n/* === {css_file.name} === */\n{content}"
            css_files_found += 1
        except:
            pass

    print(f"[1/6] Parsed {css_files_found} CSS files")

    # Extract tokens
    css_vars = extract_css_variables(all_css)
    print(f"[2/6] Found {len(css_vars)} CSS variables")

    colors = extract_colors(all_css)
    categorized_colors = categorize_colors(colors, css_vars)
    print(f"[3/6] Found {len(colors)} unique colors")

    fonts = extract_fonts(all_css)
    print(f"[4/6] Found {len(fonts['families'])} font families")

    # Parse PHP templates
    templates = parse_php_templates(theme_dir)
    print(f"[5/6] Found {len(templates)} PHP templates")

    border_radii = extract_border_radius(all_css)
    shadows = extract_shadows(all_css)
    spacing = extract_spacing(all_css)

    # Build design tokens
    design_tokens = {
        'theme': {
            'name': 'Faith Connect',
            'version': '1.1.1',
            'author': 'cmsmasters'
        },
        'colors': {
            'all': sorted(list(colors)),
            'categorized': categorized_colors,
            'css_variables': {k: v for k, v in css_vars.items()
                           if any(c in v for c in ['#', 'rgb', 'hsl'])}
        },
        'fonts': fonts,
        'spacing': spacing,
        'borderRadius': border_radii,
        'shadows': shadows,
        'css_variables': css_vars,
        'templates': templates
    }

    # Save design tokens
    with open(output_path, 'w') as f:
        json.dump(design_tokens, f, indent=2, ensure_ascii=False)
    print(f"[6/6] Saved: {output_path}")

    # Generate tokens.css
    tokens_css_path = os.path.join(os.path.dirname(output_path), '..', 'src', 'styles', 'tokens.css')
    os.makedirs(os.path.dirname(tokens_css_path), exist_ok=True)

    lines = ['/* Auto-generated design tokens from WordPress theme */', ':root {']
    for var_name, var_value in sorted(css_vars.items()):
        lines.append(f'  {var_name}: {var_value};')
    lines.append('}')
    lines.append('')

    # Add font-face declarations if found
    font_faces = re.findall(r'@font-face\s*\{[^}]+\}', all_css)
    if font_faces:
        lines.append('/* Font faces from theme */')
        for ff in font_faces[:20]:  # Limit to avoid bloat
            lines.append(ff)
            lines.append('')

    with open(tokens_css_path, 'w') as f:
        f.write('\n'.join(lines))
    print(f"  Saved: {tokens_css_path}")

    print(f"\n=== Agent 2 Complete ===")
    print(f"  CSS Variables: {len(css_vars)}")
    print(f"  Colors: {len(colors)}")
    print(f"  Font families: {len(fonts['families'])}")
    print(f"  Templates: {len(templates)}")

    return design_tokens


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='WordPress Theme Parser')
    parser.add_argument('--theme-dir', required=True, help='Path to unzipped theme directory')
    parser.add_argument('--output', required=True, help='Output JSON path')
    args = parser.parse_args()

    run(args.theme_dir, args.output)
