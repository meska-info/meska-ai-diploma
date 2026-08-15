# Meska AI Diploma Media Placement Plan

Status: **Approved by user on 2026-08-15 and implemented locally**

Prepared: 2026-08-15

## Scope and constraints

- This plan covers the nine approved testimonial screenshots, the approved diploma video, and the approved organization-logo rail.
- It did not independently authorize unrelated changes. The later user-approved layout correction removed redundant sections while preserving the conversion goal, application flow, tracking, pricing, dates, and program details; the final order below records that approved state.
- Essential production media must not be hotlinked. Source URLs are retrieval sources only.
- Approved assets will be stored locally for the Codex implementation and later uploaded to Framer. The Framer implementation must use Framer-hosted asset URLs.
- Final user approval was received before local implementation began.

## Final section order

1. Header
2. Hero
3. Primary conversion cluster: main diploma video, dynamic pricing card, and one seven-field application form
4. Impact statistics
5. Outcomes
6. Organization logo grid
7. Nine-session curriculum disclosure
8. Testimonial carousel
9. Footer
10. Mobile sticky CTA and shared application modal

The removed orbit image, hero buttons, duplicate course-details bar, mid-page CTA blocks, and duplicate final form remain absent.

## Shared implementation rules

- Keep all media references and accessible labels in the central content/configuration layer.
- Use reusable semantic components compatible with native Framer Stack recreation.
- Define dimensions or aspect ratios before media loads to prevent layout shifts.
- Preserve untouched approved originals. Create optimized presentation copies separately.
- Do not fire new Meta Pixel events or other analytics for these assets.
- Do not make testimonial images or logos clickable.
- Validate at 320px, 360px, 390px, 430px, 768px, 1024px, 1440px, and 1920px when relevant.

## 1. Testimonial carousel

### Approved placement

- Section: existing testimonial carousel, after the curriculum and before the footer.
- Asset count: nine, replacing the six placeholders.
- Display role: testimonial/social-proof media.
- Sequence: IMG-01 through IMG-09 in the supplied order.
- Interaction: manual only; no automatic advancement.
- Click behavior: none.
- Expansion/lightbox: none.
- Tracking: none.

### Responsive behavior

| Breakpoint | Visible cards | Navigation | Media treatment |
| --- | ---: | --- | --- |
| Desktop, including 1440px | 3 | Previous/next buttons, keyboard navigation, drag/swipe, and position indicator | Natural responsive height; full screenshot visible |
| Tablet, including 768px | 2 | Previous/next buttons, keyboard navigation, drag/swipe, and position indicator | Natural responsive height; full screenshot visible |
| Mobile, including 320px, 390px, and 430px | 1 | Visible previous/next buttons, native touch swipe/drag, and position indicator | Natural responsive height; full screenshot visible |

The carousel uses horizontal scroll snapping. Images use `height: auto` and `object-fit: contain`; no fixed-height media well, embedded name, copy, or LinkedIn context is cropped. Cards align at their top edge and may differ in height because the source screenshots have different portrait ratios.

### Captions and labels

Each card will show the graduate's name and the neutral caption **AI Copilot Diploma graduate** below the image.

| Order | Asset ID | Supplied filename | Graduate name | Caption | Crop/focal point |
| ---: | --- | --- | --- | --- | --- |
| 1 | IMG-01 | `WhatsApp Image 2026-08-15 at 15.22.32.jpeg` | Ali Elsheikh | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 2 | IMG-02 | `WhatsApp Image 2026-08-15 at 15.22.15.jpeg` | Eslam Momtaz | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 3 | IMG-03 | `WhatsApp Image 2026-08-15 at 15.21.58.jpeg` | Eslam Osman | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 4 | IMG-04 | `WhatsApp Image 2026-08-15 at 15.21.28.jpeg` | Amr Mosallam | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 5 | IMG-05 | `WhatsApp Image 2026-08-15 at 15.20.55.jpeg` | Ibrahim Mubarak | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 6 | IMG-06 | `WhatsApp Image 2026-08-15 at 15.20.20.jpeg` | Reem Fahim | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 7 | IMG-07 | `WhatsApp Image 2026-08-15 at 15.17.22.jpeg` | Ali Shaker | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 8 | IMG-08 | `WhatsApp Image 2026-08-15 at 15.17.56.jpeg` | Dr. Khaled Said Salem | AI Copilot Diploma graduate | No crop; contain full screenshot |
| 9 | IMG-09 | `WhatsApp Image 2026-08-15 at 15.19.01.jpeg` | Kholoud Samy | AI Copilot Diploma graduate | No crop; contain full screenshot |

Alt text will identify the screenshot as a Meska AI post celebrating the named graduate. The embedded post text will not be transcribed into new marketing copy without separate approval.

## 2. Main diploma video

### Asset

- Asset ID: VID-01
- Source title: `NABIL 14.mp4`
- Source: user-supplied Google Drive URL
- Type: MP4, H.264 video with AAC audio
- Dimensions: 1920 × 1080
- Aspect ratio: 16:9
- Duration: 1 minute 55.84 seconds
- Size: 46,515,455 bytes (approximately 44.4 MiB)
- Visual description: HD studio talking-head video with a presenter seated at a desk, a blue-lit background, and Arabic title graphics.

### Approved placement and behavior

- Section: replace the existing main diploma video placeholder immediately below the hero.
- Display role: main informational diploma video.
- Desktop: full available section width within the existing content container, 16:9.
- Tablet: full available section width, 16:9.
- Mobile: full available section width, 16:9, with `playsInline` behavior.
- Crop: none; contain the natural 16:9 frame.
- Playback: user-initiated only, visible native controls, never autoplay.
- Preloading: conservative `preload="metadata"` behavior with an optimized poster image.
- Poster: create from a clear representative frame from the approved source video.
- Caption or transcript: none requested.
- Click destination: none beyond the native video controls.
- Tracking: none. Do not add or activate play/progress/completion hooks.
- Reduced motion: no autoplay or decorative motion is present; the video remains user-controlled.

The original video will be preserved. Any optimized delivery version or poster will be a separate derivative and documented in the asset manifest.

## 3. Organization logo rail

### Approved placement and relationship

- Section: replace the existing logo placeholder grid in its current position after Outcomes and before Curriculum.
- Display role: professional-affiliation logos.
- Relationship statement: organizations represented by professionals who learned AI with Meska.
- The section must not describe these organizations as Meska partners, clients, sponsors, certifications, or corporate-training customers.

### Approved copy

- Eyebrow: **Our Impact**
- Heading: **Professionals from Egypt’s Leading Corporations Learn AI with Meska**
- Supporting copy: **Professionals across these organizations have joined Meska’s AI learning experiences.**

The heading follows the supplied Meska Offline Diploma reference page. The supporting line clarifies the relationship without making a partner or client claim.

### Selected assets and order

| Order | Asset ID | Organization | Role/category | Treatment | Notes |
| ---: | --- | --- | --- | --- | --- |
| 1 | LOGO-01 | SODIC | Professional-affiliation logo | Monochrome presentation copy | Cached raster source; inspect carefully after normalization |
| 2 | LOGO-05 | Banque Misr | Professional-affiliation logo | Monochrome presentation copy | High-resolution transparent source |
| 3 | LOGO-08 | AXA | Professional-affiliation logo | Monochrome presentation copy | Transparent source |
| 4 | LOGO-13 | WUZZUF | Professional-affiliation logo | Monochrome presentation copy | Wide transparent wordmark |
| 5 | LOGO-03 | Emirates NBD | Professional-affiliation logo | Monochrome presentation copy | Trim excess transparent canvas in presentation copy only |
| 6 | LOGO-07 | Palm Hills Developments | Professional-affiliation logo | Monochrome presentation copy | Flag if raster artifacts remain visible at final size |
| 7 | LOGO-14 | Orange | Professional-affiliation logo | Monochrome SVG presentation copy | Replacement approved SVG, 283.5 × 283.5 viewBox, 2,475 bytes |
| 8 | LOGO-02 | Orascom Development | Professional-affiliation logo | Monochrome presentation copy | Preserve GIF original; use a normalized static presentation copy |
| 9 | LOGO-16 | The American University in Cairo | Professional-affiliation logo | Monochrome presentation copy | Detailed mark; control optical size |
| 10 | LOGO-04 | Wadi Group | Professional-affiliation logo | Monochrome presentation copy | Trim excess transparent canvas in presentation copy only |
| 11 | LOGO-09 | National Bank of Egypt | Professional-affiliation logo | Monochrome presentation copy | Low-resolution source; flag if final rendering is soft |
| 12 | LOGO-06 | Hassan Allam Properties | Professional-affiliation logo | Monochrome presentation copy | Thin artwork; flag if recoloring loses clarity |
| 13 | LOGO-12 | G Developments | Professional-affiliation logo | Monochrome presentation copy | Small opaque raster source |
| 14 | LOGO-10 | saib | Professional-affiliation logo | Monochrome presentation copy | JPEG background requires careful masking |
| 15 | LOGO-15 | Arab Academy for Science, Technology & Maritime Transport | Professional-affiliation logo | Monochrome presentation copy | Detailed crest; control optical size |
| 16 | LOGO-17 | Orascom Construction | Professional-affiliation logo | Monochrome presentation copy | Selected attached source |

LOGO-11 and LOGO-18 are excluded from implementation as duplicate Orascom Construction inputs. LOGO-17 is the selected source. Excluded duplicates will be documented but will not be added as unnecessary duplicate project files.

### Responsive motion and layout

| Breakpoint | Rows | Motion | Cell behavior |
| --- | ---: | --- | --- |
| Desktop, 1200px and above | 2 | Static 8×2 grid | Equal cells, controlled maximum logo height, balanced optical sizing |
| Tablet, 700–1199px | 2 | Manual horizontal paging; two 2×2 pages/four columns visible at once | Equal contained cells with 12px gaps |
| Mobile, below 700px | 2 | Four ordered 2×2 swipe pages with scroll snap | Equal contained cells with 8px gaps |

- Render exactly one semantic instance of every logo; do not duplicate the set.
- Use native scrolling and scroll snap below 1200px; do not autoplay or transform the rail.
- No Pause/Resume control is required because there is no automatic motion.
- Logos remain static within their cells. They are not links and have no hover-to-original-color behavior unless separately approved.
- Use one approved theme color and consistent opacity for all presentation copies.
- Alt text uses the organization name.
- No interaction or tracking events.

## Implemented asset-management record

The approved local implementation:

1. Stores approved local media under `public/media`.
2. Uses lowercase descriptive filenames and preserves untouched originals.
3. Keeps optimized/presentation derivatives separate.
4. Records sources, specifications, placement, behavior, alt text, authorization, tracking, and Framer-upload status in `MEDIA_ASSET_MANIFEST.md`.
5. Uses reusable video, paged-logo-grid, and testimonial-carousel components while preserving the section order.
6. Validates 320, 390, 430, 768, 1024, 1440, and 1920px layouts.
7. Confirms that no essential rendered media depends on an external hotlink.

No publishing or Framer upload is authorized in this phase.
