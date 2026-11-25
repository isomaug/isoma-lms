import urllib.request
import re
import json

def fetch_books(id, abbrev):
    url = f'https://www.bible.com/bible/{id}/GEN.1.{abbrev}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        # Find the next data chunk that has books
        match = re.search(r'\"books\":(\[.*?\])', html)
        if match:
            books = json.loads(match.group(1))
            return books
    except Exception as e:
        print(f"Error for {abbrev}: {e}")
    return None

books = fetch_books(1441, 'BILK13')
if books:
    print([b['human'] for b in books[:5]])
