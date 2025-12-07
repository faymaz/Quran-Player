#!/usr/bin/env python3
"""
Archive.org Quran Reciter Importer
Fetches MP3 links from archive.org pages and adds them to custom-reciters.json
"""

import argparse
import json
import re
import sys
from urllib.parse import urljoin
from urllib.request import urlopen, Request
from html.parser import HTMLParser


class ArchivePageParser(HTMLParser):
    """Parses archive.org page to extract MP3 links"""

    def __init__(self):
        super().__init__()
        self.mp3_links = []
        self.current_item = {}
        self.in_audioobject = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Detect AudioObject divs
        if tag == 'div':
            itemtype = attrs_dict.get('itemtype', '')
            if 'AudioObject' in itemtype:
                self.in_audioobject = True
                self.current_item = {}

        # Extract metadata and links
        if self.in_audioobject:
            if tag == 'meta':
                itemprop = attrs_dict.get('itemprop', '')
                content = attrs_dict.get('content', '')

                if itemprop == 'name':
                    self.current_item['name'] = content
                elif itemprop == 'duration':
                    self.current_item['duration'] = content

            elif tag == 'link':
                itemprop = attrs_dict.get('itemprop', '')
                href = attrs_dict.get('href', '')

                if itemprop == 'associatedMedia' and href.endswith('.mp3') and '_vbr.mp3' not in href:
                    self.current_item['url'] = href

    def handle_endtag(self, tag):
        if tag == 'div' and self.in_audioobject:
            if 'url' in self.current_item:
                self.mp3_links.append(self.current_item.copy())
            self.in_audioobject = False
            self.current_item = {}


def fetch_archive_page(url):
    """Fetch HTML content from archive.org URL"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}
        request = Request(url, headers=headers)
        with urlopen(request) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching page: {e}", file=sys.stderr)
        return None


def extract_mp3_links(html_content):
    """Extract MP3 links from HTML content"""
    parser = ArchivePageParser()
    parser.feed(html_content)
    return parser.mp3_links


def extract_base_url_and_pattern(mp3_links):
    """
    Extract common base URL and audio format pattern from MP3 links
    Returns: (base_url, audio_format, type, has_special_format, format_map)
    """
    if not mp3_links:
        return None, None, None, None, None

    # Get the first URL to extract base pattern
    first_url = mp3_links[0]['url']

    # Extract base URL (everything before the filename)
    base_url = first_url.rsplit('/', 1)[0] + '/'

    # Check if this is juz-based (30 parts) or surah-based (114 chapters)
    num_files = len(mp3_links)
    reciter_type = 'juz' if num_files <= 30 else 'surah'

    # Extract filenames and create format map
    filenames = []
    for item in mp3_links:
        filename = item['url'].rsplit('/', 1)[1]
        filenames.append(filename)

    # Check if filenames follow a pattern
    juz_pattern = re.compile(r'juz(\d+)', re.IGNORECASE)
    surah_pattern = re.compile(r'^(\d+)\.', re.IGNORECASE)  # Matches "01.", "114.", etc.
    has_special_format = False
    format_map = {}

    if reciter_type == 'juz':
        # Build format map for juz-based reciters
        for i, item in enumerate(mp3_links, 1):
            filename = item['url'].rsplit('/', 1)[1]
            match = juz_pattern.search(filename)

            if match:
                juz_num = int(match.group(1))
                format_map[str(juz_num)] = filename
                has_special_format = True

        audio_format = '%specialFormat%' if has_special_format else filenames[0]
    else:
        # For surah-based, check if files start with numbers (01., 114., etc.)
        # Try to build format map for all 114 surahs
        for item in mp3_links:
            filename = item['url'].rsplit('/', 1)[1]
            match = surah_pattern.search(filename)

            if match:
                surah_num = int(match.group(1))
                # URL decode the filename for proper storage
                from urllib.parse import unquote
                decoded_filename = unquote(filename)
                format_map[str(surah_num)] = decoded_filename
                has_special_format = True

        # Check if we successfully mapped all expected surahs
        if has_special_format and len(format_map) == num_files:
            audio_format = '%specialFormat%'
        else:
            # Fallback to simple pattern
            audio_format = '%id%.mp3'
            has_special_format = False
            format_map = {}

    return base_url, audio_format, reciter_type, has_special_format, format_map if has_special_format else None


def create_reciter_entry(name, base_url, audio_format, reciter_type, has_special_format=False, format_map=None):
    """Create a reciter entry dictionary"""
    entry = {
        "name": name,
        "baseUrl": base_url,
        "audioFormat": audio_format,
        "type": reciter_type
    }

    if has_special_format and format_map:
        entry["hasSpecialFormat"] = True
        entry["formatMap"] = format_map

    return entry


def load_custom_reciters(filepath):
    """Load existing custom-reciters.json file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {filepath} not found, will create new file", file=sys.stderr)
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        return None


def save_custom_reciters(filepath, reciters):
    """Save reciters list to JSON file"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(reciters, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving file: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Import Quran reciters from archive.org to custom-reciters.json'
    )
    parser.add_argument(
        'url',
        help='Archive.org URL (e.g., https://archive.org/details/uzbekquran)'
    )
    parser.add_argument(
        '--name',
        required=True,
        help='Name of the reciter to display'
    )
    parser.add_argument(
        '--output',
        default='custom-reciters.json',
        help='Path to custom-reciters.json file (default: custom-reciters.json)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Print the entry without adding to file'
    )

    args = parser.parse_args()

    # Fetch and parse the page
    print(f"Fetching page: {args.url}")
    html_content = fetch_archive_page(args.url)

    if not html_content:
        print("Failed to fetch page", file=sys.stderr)
        return 1

    print("Extracting MP3 links...")
    mp3_links = extract_mp3_links(html_content)

    if not mp3_links:
        print("No MP3 links found on the page", file=sys.stderr)
        return 1

    print(f"Found {len(mp3_links)} MP3 files")

    # Extract pattern
    base_url, audio_format, reciter_type, has_special_format, format_map = extract_base_url_and_pattern(mp3_links)

    if not base_url:
        print("Could not determine URL pattern", file=sys.stderr)
        return 1

    # Create reciter entry
    reciter_entry = create_reciter_entry(
        args.name,
        base_url,
        audio_format,
        reciter_type,
        has_special_format,
        format_map
    )

    print("\nReciter entry:")
    print(json.dumps(reciter_entry, indent=2, ensure_ascii=False))

    if args.dry_run:
        print("\n(Dry run - not adding to file)")
        return 0

    # Load existing reciters
    print(f"\nLoading {args.output}...")
    reciters = load_custom_reciters(args.output)

    if reciters is None:
        return 1

    # Check if reciter already exists
    existing_names = [r.get('name', '') for r in reciters]
    if args.name in existing_names:
        print(f"\nWarning: Reciter '{args.name}' already exists in the file")
        response = input("Overwrite? [y/N]: ")
        if response.lower() != 'y':
            print("Cancelled")
            return 0

        # Remove existing entry
        reciters = [r for r in reciters if r.get('name') != args.name]

    # Add new reciter
    reciters.append(reciter_entry)

    # Save file
    print(f"Saving to {args.output}...")
    if save_custom_reciters(args.output, reciters):
        print(f"Successfully added '{args.name}' to {args.output}")
        return 0
    else:
        return 1


if __name__ == '__main__':
    sys.exit(main())
