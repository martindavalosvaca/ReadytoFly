#!/usr/bin/env python3
"""
ReadytoFly Website Builder
Combines HTML components and generates SEO pages
"""

import os
import re
from pathlib import Path
from datetime import datetime

# Build configuration
BUILD_CONFIG = {
    'site_name': 'ReadytoFly',
    'site_url': 'https://readytofly.com',
    'description': 'Evidence-based fear of flying program using CBT and exposure therapy',
    'og_image': './images/hero-background.png'
}

# SEO page configurations
SEO_PAGES = [
    {
        'filename': 'how-it-works.html',
        'title': 'How ReadytoFly Works | Evidence-Based Flight Anxiety Treatment',
        'description': 'Learn how our CBT-based program helps overcome fear of flying with proven techniques',
        'canonical': '/how-it-works',
        'section_ids': ['evidence', 'features', 'comparison']
    },
    {
        'filename': 'reviews.html',
        'title': 'ReadytoFly Reviews | Success Stories from Our Program',
        'description': 'Read testimonials from people who overcame their fear of flying with ReadytoFly',
        'canonical': '/reviews',
        'section_ids': ['testimonials', 'advisors']
    },
    {
        'filename': 'program.html',
        'title': 'Fear of Flying Program | Personalized CBT Treatment',
        'description': 'Our personalized program uses exposure therapy and CBT to help you fly confidently',
        'canonical': '/program',
        'section_ids': ['features', 'resources', 'comparison']
    },
    {
        'filename': 'faq.html',
        'title': 'Frequently Asked Questions | ReadytoFly',
        'description': 'Common questions about our fear of flying program, CBT techniques, and success rates',
        'canonical': '/faq',
        'section_ids': ['faq', 'advisors']
    }
]

def load_component(filepath):
    """Load HTML component from file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: {filepath} not found, using placeholder")
        return f"<!-- {filepath} component not found -->\n"

def load_section(section_name):
    """Load section HTML from src/sections/"""
    return load_component(f'src/sections/{section_name}.html')

def generate_meta_tags(config):
    """Generate meta tags for a page"""
    title = config.get('title', BUILD_CONFIG['site_name'])
    description = config.get('description', BUILD_CONFIG['description'])
    canonical = config.get('canonical', '')
    
    meta_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{BUILD_CONFIG['site_url']}{canonical}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{BUILD_CONFIG['site_url']}{canonical}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{BUILD_CONFIG['og_image']}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{BUILD_CONFIG['site_url']}{canonical}">
    <meta property="twitter:title" content="{title}">
    <meta property="twitter:description" content="{description}">
    <meta property="twitter:image" content="{BUILD_CONFIG['og_image']}">
    
    <!-- Styles -->
    <link rel="stylesheet" href="css/styles.css">
"""
    return meta_html

def build_page(sections, config=None):
    """Build a complete HTML page from sections"""
    if config is None:
        config = {
            'title': 'ReadytoFly - Evidence-Based Fear of Flying Program',
            'description': BUILD_CONFIG['description'],
            'canonical': '/'
        }
    
    # Start with meta tags
    html = generate_meta_tags(config)
    html += "</head>\n<body>\n"
    
    # Add skip link and progress bar
    html += """    <!-- Accessibility -->
    <a href="#main" class="skip-link">Skip to main content</a>
    <div class="progress-bar" role="progressbar" aria-label="Page scroll progress"></div>
    
"""
    
    # Add header
    html += "    <!-- Header -->\n"
    html += load_component('src/components/header.html')
    html += "\n"
    
    # Add main content
    html += "    <!-- Main Content -->\n    <main id=\"main\">\n"
    
    # Add sections
    for section in sections:
        section_html = load_section(section)
        if section_html:
            html += f"        <!-- {section.title()} Section -->\n"
            html += "        " + section_html.replace("\n", "\n        ")
            html += "\n\n"
    
    html += "    </main>\n\n"
    
    # Add footer
    html += "    <!-- Footer -->\n"
    html += load_component('src/components/footer.html')
    html += "\n"
    
    # Add modal (commented out as per original)
    html += """    <!-- Waitlist Modal - Not currently in use (CTAs link directly to quiz.html)
         Preserved for potential future use -->
    <!--
    <div class="modal" id="waitlist-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__content">
            <button class="modal__close" aria-label="Close modal">×</button>
            <h3 id="modal-title" class="modal__title">Join the Waitlist</h3>
            <p class="modal__subtitle">Be among the first to access our evidence-based program</p>
            
            <form id="waitlist-form" aria-label="Join waitlist form">
                <div class="form__group">
                    <label for="name" class="form__label">Your Name</label>
                    <input type="text" id="name" name="name" class="form__input" required aria-required="true">
                </div>
                <div class="form__group">
                    <label for="email" class="form__label">Email Address</label>
                    <input type="email" id="email" name="email" class="form__input" required aria-required="true">
                </div>
                <button type="submit" class="btn">Join the Waitlist</button>
                <div class="form__status" role="status" aria-live="polite"></div>
            </form>
        </div>
    </div>
    -->

"""
    
    # Add sticky CTA
    html += """    <!-- Sticky CTA -->
    <a href="quiz.html" class="sticky-cta" aria-label="Take the quiz">
        Take the Quiz
    </a>

"""
    
    # Add footer disclaimer
    html += """    <!-- Footer Disclaimer -->
    <footer class="footer-disclaimer">
        <p>*Numbers shown are illustrative placeholders—replace with verified sources before publishing. This is an educational wellness program, not medical treatment.</p>
    </footer>

"""
    
    # Add JavaScript
    html += "    <script src=\"js/main.js\"></script>\n"
    html += "</body>\n</html>"
    
    return html

def create_directories():
    """Create necessary directories if they don't exist"""
    dirs = [
        'css',
        'js',
        'src/components',
        'src/sections'
    ]
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)

def extract_sections_from_html(html_file='index.html'):
    """Extract sections from existing HTML file to create component files"""
    if not os.path.exists(html_file):
        print(f"Warning: {html_file} not found")
        return
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract sections using regex
    sections = {
        'hero': r'<!-- Hero Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'evidence': r'<!-- Evidence Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'testimonials': r'<!-- Testimonials Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'features': r'<!-- Features Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'comparison': r'<!-- Comparison Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'resources': r'<!-- Resources Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'advisors': r'<!-- Advisors Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)',
        'faq': r'<!-- FAQ Section -->.*?(?=<!-- \w+ Section -->|<!-- Footer -->)'
    }
    
    for section_name, pattern in sections.items():
        match = re.search(pattern, content, re.DOTALL)
        if match:
            section_content = match.group(0)
            # Remove the comment and clean up
            section_content = re.sub(r'^\s*<!-- \w+ Section -->\s*\n', '', section_content)
            section_content = section_content.strip()
            
            # Save to file
            section_path = f'src/sections/{section_name}.html'
            with open(section_path, 'w', encoding='utf-8') as f:
                f.write(section_content)
            print(f"Extracted {section_name} section to {section_path}")
    
    # Extract header
    header_match = re.search(r'<!-- Header -->.*?(?=<!-- Main Content -->)', content, re.DOTALL)
    if header_match:
        header_content = header_match.group(0)
        header_content = re.sub(r'^\s*<!-- Header -->\s*\n', '', header_content).strip()
        with open('src/components/header.html', 'w', encoding='utf-8') as f:
            f.write(header_content)
        print("Extracted header component")
    
    # Extract footer (everything from footer-main to before modal)
    footer_match = re.search(r'<footer class="footer-main">.*?</footer>', content, re.DOTALL)
    if footer_match:
        with open('src/components/footer.html', 'w', encoding='utf-8') as f:
            f.write(footer_match.group(0))
        print("Extracted footer component")

def main():
    """Main build process"""
    print("ReadytoFly Website Builder")
    print("-" * 40)
    
    # Create directories
    create_directories()
    
    # Check if we need to extract components first
    if not os.path.exists('src/sections/hero.html'):
        print("Components not found, attempting to extract from index.html...")
        extract_sections_from_html()
        print()
    
    # Build main index.html
    print("Building index.html...")
    main_sections = ['hero', 'evidence', 'testimonials', 'features', 
                     'comparison', 'resources', 'advisors', 'faq']
    
    index_html = build_page(main_sections)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("✓ index.html built successfully")
    
    # Build SEO pages
    print("\nBuilding SEO pages...")
    for page_config in SEO_PAGES:
        filename = page_config['filename']
        sections = page_config['section_ids']
        
        page_html = build_page(sections, page_config)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(page_html)
        print(f"✓ {filename} built successfully")
    
    print("\n" + "-" * 40)
    print(f"Build completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total pages built: {len(SEO_PAGES) + 1}")

if __name__ == "__main__":
    main()