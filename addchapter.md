# Add Chapter Process

Follow this step-by-step process to extract key points from a new chapter of the Dominion epub and produce a complete set of slides with artwork for the visual journey app.

---

## Prerequisites

- The epub lives at: `Dominion_ How the Christian Revolution Remade the World by Tom Holland.epub`
- The Vite app lives at: `app/`
- Slide data lives at: `app/src/data/slides.js`
- Public images live at: `app/public/images/`
- Extracted image backups live at: `extracted_images/`

---

## Step 1 — Extract the Chapter Text

Use Python (ebooklib + BeautifulSoup) to extract the raw text of the target chapter from the epub.

```bash
python3 -c "
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

book = epub.read_epub('Dominion_ How the Christian Revolution Remade the World by Tom Holland.epub')
for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
    soup = BeautifulSoup(item.get_content(), 'html.parser')
    text = soup.get_text()
    # Print chapter titles/headings to identify the right section
    if 'CHAPTER_KEYWORD' in text.upper():
        print('=== FOUND:', item.get_name(), '===')
        print(text[:500])
"
```

Once you identify the correct item(s), extract the full chapter text to a working file:

```bash
python3 extract_chapter.py --chapter N --output chapter_N_raw.txt
```

Or do it inline. The goal is to have the full chapter text available for analysis.

---

## Step 2 — Identify 12 Key Points

Read the full chapter text carefully. Extract exactly **12 key points** that form a narrative arc through the chapter. Each point should have:

| Field | Description |
|---|---|
| `number` | Roman numeral (I–XII) |
| `heading` | A short, evocative title in ALL CAPS (2–5 words) |
| `bridge` | One sentence that links this point to the previous one — the narrative thread |
| `body` | A rich paragraph (4–8 sentences) drawn closely from Holland's actual text, using direct quotes where possible. Should feel weighty and specific, not summarised. |

### Guidelines for selecting points

- Follow Holland's own narrative arc — he builds arguments cumulatively
- Prioritise moments with vivid imagery, named people, specific dates, and direct quotes
- Each point should feel like a scene, not a thesis statement
- The 12th point should feel like a culmination or pivot that sets up the next chapter
- Use Holland's actual language wherever possible (quote directly with page context)

---

## Step 3 — Select Artwork for Each Point

For each of the 12 points, choose a famous artwork that resonates with the theme. Preference order:

1. **Historical paintings** from major museums (pre-1900, public domain)
2. **Classical sculptures or reliefs** photographed in museums
3. **Illuminated manuscripts** or mosaics
4. **Archaeological artifacts** relevant to the period

For each artwork, record:

| Field | Description |
|---|---|
| `artworkTitle` | Formal title of the work |
| `artworkCredit` | Artist name, date |
| `artworkCaption` | 1–2 sentences connecting the artwork's mood/content to the chapter point |

### Sourcing artwork images with Firecrawl

Use the Firecrawl MCP to search Wikimedia Commons for each artwork:

```
1. Search Wikimedia Commons for the artwork title + artist name
2. Scrape the file page to find the direct image URL (look for the full-resolution or 800px version)
3. Download the image using curl/wget
```

Example flow:

```bash
# Use firecrawl to scrape the Wikimedia Commons page for the artwork
# Then extract the image URL from the page content
# Then download:
curl -L -o "app/public/images/slide_N_img_0.jpg" "https://upload.wikimedia.org/wikipedia/commons/..."
```

**Fallback if Firecrawl is not available:** Search the web for `"Artwork Title" artist site:commons.wikimedia.org`, find the direct file URL, and download with curl.

**Image requirements:**
- JPEG format for paintings/photos
- Minimum 500px on shortest side
- Public domain or CC-licensed only
- Save as: `slide_{SLIDE_NUMBER}_img_0.jpg`

---

## Step 4 — Generate Location Maps

For each point, generate a dark-themed map showing the relevant location. Use Python with matplotlib and cartopy (or a similar approach):

```python
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature

fig, ax = plt.subplots(figsize=(5, 4), subplot_kw={'projection': ccrs.PlateCarree()})
ax.set_extent([WEST, EAST, SOUTH, NORTH])
ax.add_feature(cfeature.LAND, facecolor='#2a2a2a')
ax.add_feature(cfeature.OCEAN, facecolor='#1a1a1a')
ax.add_feature(cfeature.BORDERS, linewidth=0.3, edgecolor='#444')
ax.add_feature(cfeature.COASTLINE, linewidth=0.5, edgecolor='#555')
ax.set_facecolor('#1a1a1a')

# Plot location marker
ax.plot(LON, LAT, marker='o', color='#c9a84c', markersize=8,
        markeredgecolor='#c9a84c', markeredgewidth=2, markerfacecolor='none')
ax.plot(LON, LAT, marker='o', color='#c9a84c', markersize=3)
ax.text(LON + 1, LAT, 'Location Name', color='#c9a84c',
        fontsize=10, fontfamily='serif', fontstyle='normal')

fig.patch.set_facecolor('#1a1a1a')
plt.savefig(f'app/public/images/slide_{N}_img_1.png',
            dpi=100, bbox_inches='tight', pad_inches=0.1, facecolor='#1a1a1a')
plt.close()
```

**Map style must match existing maps:**
- Background: `#1a1a1a` (near-black)
- Land: `#2a2a2a` (dark grey)
- Text/markers: `#c9a84c` (antiquity gold)
- Font: serif
- Concentric circle marker (hollow outer ring + solid inner dot)
- Save as: `slide_{SLIDE_NUMBER}_img_1.png` at 500×400px

---

## Step 5 — Build the Slide Data

Add a new chapter entry to `app/src/data/slides.js`. Follow the exact structure of Chapter 1.

**Important:** Slide numbering continues from the last slide of the previous chapter. If Chapter 1 ends at slide 13, Chapter 2's title slide is 14, and content slides are 15–26.

### Title slide template

```javascript
{
  id: NEXT_ID,
  type: "title",
  title: "DOMINION",
  subtitle: "Chapter N — Chapter Title",
  tagline: "A short evocative tagline for this chapter",
  author: "Tom Holland",
  description: "A Visual Journey in Twelve Points",
},
```

### Content slide template

```javascript
{
  id: NEXT_ID,
  number: "I",          // Roman numeral I–XII, resets each chapter
  heading: "HEADING",
  bridge: "Bridge sentence...",
  body: "Rich paragraph...",
  artwork: "/images/slide_N_img_0.jpg",
  artworkTitle: "Artwork Title",
  artworkCredit: "Artist, Date",
  artworkCaption: "Caption connecting artwork to point...",
  map: "/images/slide_N_img_1.png",
},
```

---

## Step 6 — Copy Images to All Required Locations

Ensure images exist in both locations:

```bash
# Copy to public folder (served by Vite)
cp slide_N_img_0.jpg app/public/images/
cp slide_N_img_1.png app/public/images/

# Backup to extracted_images
cp slide_N_img_0.jpg extracted_images/
cp slide_N_img_1.png extracted_images/
```

---

## Step 7 — Update the App (if needed)

The app in `app/src/App.jsx` should already handle multiple chapters since it just maps over the slides array. However, check:

1. The title slide renderer handles the new chapter's subtitle
2. Navigation dots still work with the increased slide count
3. Consider adding chapter dividers or a chapter selector if this is the 3rd+ chapter

---

## Step 8 — Test

```bash
cd app && npm run dev
```

Verify:
- All 12 new artwork images load correctly
- All 12 new map images load correctly
- Slide text is legible and well-formatted
- Bridge sentences create a coherent narrative flow
- The transition from the previous chapter's final slide to the new title slide feels natural

---

## Step 9 — Export to PPTX and PDF (optional)

If a static export is needed, use the same approach as Chapter 1:

```bash
# Use python-pptx to generate the slide deck
python3 generate_pptx.py --chapter N
```

Name the outputs: `Dominion_ChN_Visual_Journey.pptx` and `Dominion_ChN_Visual_Journey.pdf`

---

## Quick Reference — File Naming Convention

| File | Pattern |
|---|---|
| Artwork image | `slide_{SLIDE_NUMBER}_img_0.jpg` |
| Map image | `slide_{SLIDE_NUMBER}_img_1.png` |
| Slide data | `app/src/data/slides.js` (append to array) |
| PPTX export | `Dominion_ChN_Visual_Journey.pptx` |

Where `SLIDE_NUMBER` is the global slide number (title slide + 1 for the first content slide of each chapter).

---

## Notes on Image Sourcing

**Firecrawl approach (preferred in Claude Code):**
Firecrawl is a web scraping MCP that can fetch and parse web pages. Use it to:
1. Search Wikimedia Commons for artwork by title/artist
2. Parse the page to extract the direct image file URL
3. Download the image via curl

This replaces the Cowork workflow where images were generated or sourced through the browser. The key insight is that all artworks selected should be **famous, public domain paintings** readily available on Wikimedia Commons — so scraping their URLs is reliable.

**For maps**, there is no web source — these must be generated programmatically using the Python script pattern in Step 4 above.
