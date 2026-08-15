# Meska AI Diploma Media Asset Manifest

Updated: 2026-08-15

Implementation status: local Codex implementation complete; Framer upload pending.

## Hosting policy

- Every essential media reference in the local landing page resolves from `/public/media`.
- External URLs in this document are provenance/retrieval references only. They are not used by the rendered page.
- Before Framer publication, upload every selected original or presentation asset to Framer and replace the local paths with Framer-hosted asset URLs.
- Do not use a third-party production URL for an essential image, logo, poster, or video.

## Shared placement behavior

### TESTIMONIAL-BEHAVIOR

- Section: testimonial carousel after Curriculum and before the footer.
- Order: IMG-01 through IMG-09.
- Desktop: three cards visible, previous/next buttons, keyboard-operable controls, drag/swipe, numeric position indicator.
- Tablet: two cards visible with the same controls.
- Mobile: one card visible with touch swipe/drag, visible previous/next buttons, and numeric position indicator.
- Crop: none. Each complete screenshot uses natural responsive height with `object-fit: contain`; no fixed-height media well.
- Interaction: no click destination, expansion, autoplay, or tracking.

### VIDEO-BEHAVIOR

- Section: existing main-video position directly below the Hero.
- Desktop/tablet/mobile: contained 16:9 presentation at the section's full available width.
- Playback: user-initiated, visible controls, `playsInline`, `preload="metadata"`, never autoplay.
- Crop: none.
- Caption/transcript: none requested.
- Click destination and tracking: none.

### LOGO-BEHAVIOR

- Section: logo-grid position after Outcomes and before Curriculum.
- Meaning: organizations represented by professionals who learned AI with Meska. These are not labeled partners, clients, sponsors, certifications, or corporate-training customers.
- Desktop at 1200px+: static 8×2 grid.
- Tablet at 700–1199px: two 2×2 pages/four columns visible with manual horizontal paging.
- Mobile below 700px: four ordered 2×2 swipe pages with scroll snap.
- Presentation: equal cells, contained artwork, consistent theme-blue monochrome treatment, controlled optical sizing.
- Interaction: manual scroll/swipe only; no autoplay, click destination, or tracking.
- Accessibility: one semantic instance per logo; no duplicated loop content and no moving-content pause requirement.

## Main diploma video

| Field | Value |
| --- | --- |
| Asset ID | VID-01 |
| Category | Main informational diploma video |
| Original source | [Google Drive source](https://drive.google.com/file/d/1gPZaqKDdFWgYZNg-Jjp1OAklF8kGiTDI/view?usp=drive_link) |
| Original title | `NABIL 14.mp4` |
| Local original | `public/media/videos/original/meska-ai-diploma-main-video.mp4` |
| File type | MP4; H.264 video with AAC audio |
| Dimensions | 1920 × 1080 |
| Aspect ratio | 16:9 |
| Duration | 1:55.84 |
| File size | 46,515,455 bytes (approximately 44.4 MiB) |
| Poster | `public/media/images/posters/meska-ai-diploma-main-video-poster.webp`; 1200 × 675; 48,906 bytes |
| Approved section/position | Main video section immediately below Hero |
| Responsive behavior | VIDEO-BEHAVIOR |
| Alt/accessibility label | Meska AI Co-Pilot Diploma overview |
| Caption | None |
| Crop/focal point | No crop; retain the natural 16:9 frame. Poster keeps the presenter and Arabic title visible. |
| Authorization | User supplied and approved on 2026-08-15 |
| Tracking | None; no play/progress/completion hooks |
| Framer upload | Pending |

The original 1080p file is used for local delivery with conservative metadata preloading. A trial 720p system transcode was rejected because it increased the file to approximately 95 MiB; it is not part of the project.

## Testimonial screenshots

All testimonial originals are progressive RGB JPEG files without transparency. WebP presentation copies preserve the original dimensions and full screenshot content.

| ID | Graduate | Supplied source | Local original | Local presentation | Dimensions / original size / presentation size | Exact position | Alt text | Caption | Authorization | Tracking | Framer upload |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMG-01 | Ali Elsheikh | `WhatsApp Image 2026-08-15 at 15.22.32.jpeg` | `public/media/images/original/testimonial-ali-elsheikh.jpeg` | `public/media/images/optimized/testimonial-ali-elsheikh.webp` | 736×1326; 123,328 B; 99,376 B | Testimonial slide 1; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Ali Elsheikh | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-02 | Eslam Momtaz | `WhatsApp Image 2026-08-15 at 15.22.15.jpeg` | `public/media/images/original/testimonial-eslam-momtaz.jpeg` | `public/media/images/optimized/testimonial-eslam-momtaz.webp` | 734×1288; 111,348 B; 89,884 B | Testimonial slide 2; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Eslam Momtaz | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-03 | Eslam Osman | `WhatsApp Image 2026-08-15 at 15.21.58.jpeg` | `public/media/images/original/testimonial-eslam-osman.jpeg` | `public/media/images/optimized/testimonial-eslam-osman.webp` | 734×1068; 95,030 B; 76,084 B | Testimonial slide 3; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Eslam Osman | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-04 | Amr Mosallam | `WhatsApp Image 2026-08-15 at 15.21.28.jpeg` | `public/media/images/original/testimonial-amr-mosallam.jpeg` | `public/media/images/optimized/testimonial-amr-mosallam.webp` | 724×1096; 104,733 B; 85,218 B | Testimonial slide 4; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Amr Mosallam | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-05 | Ibrahim Mubarak | `WhatsApp Image 2026-08-15 at 15.20.55.jpeg` | `public/media/images/original/testimonial-ibrahim-mubarak.jpeg` | `public/media/images/optimized/testimonial-ibrahim-mubarak.webp` | 732×1216; 106,641 B; 89,492 B | Testimonial slide 5; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Ibrahim Mubarak | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-06 | Reem Fahim | `WhatsApp Image 2026-08-15 at 15.20.20.jpeg` | `public/media/images/original/testimonial-reem-fahim.jpeg` | `public/media/images/optimized/testimonial-reem-fahim.webp` | 732×1060; 97,076 B; 77,878 B | Testimonial slide 6; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Reem Fahim | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-07 | Ali Shaker | `WhatsApp Image 2026-08-15 at 15.17.22.jpeg` | `public/media/images/original/testimonial-ali-shaker.jpeg` | `public/media/images/optimized/testimonial-ali-shaker.webp` | 736×1112; 149,449 B; 143,576 B | Testimonial slide 7; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Ali Shaker | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-08 | Dr. Khaled Said Salem | `WhatsApp Image 2026-08-15 at 15.17.56.jpeg` | `public/media/images/original/testimonial-khaled-said-salem.jpeg` | `public/media/images/optimized/testimonial-khaled-said-salem.webp` | 730×1056; 110,559 B; 92,264 B | Testimonial slide 8; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Dr. Khaled Said Salem | AI Copilot Diploma graduate | User supplied/approved | None | Pending |
| IMG-09 | Kholoud Samy | `WhatsApp Image 2026-08-15 at 15.19.01.jpeg` | `public/media/images/original/testimonial-kholoud-samy.jpeg` | `public/media/images/optimized/testimonial-kholoud-samy.webp` | 726×1164; 107,034 B; 88,074 B | Testimonial slide 9; TESTIMONIAL-BEHAVIOR | Meska AI post celebrating AI Copilot Diploma graduate Kholoud Samy | AI Copilot Diploma graduate | User supplied/approved | None | Pending |

## Organization logos

All selected logos use LOGO-BEHAVIOR. Original files remain unchanged. Presentation copies are theme-blue monochrome assets trimmed only in the derived copy to remove unnecessary canvas. Alt text is the organization name. Captions, links, and tracking are all absent. Logo authorization was confirmed collectively by the user on 2026-08-15.

| Order / ID | Organization | Original source | Local original | Local monochrome presentation | Original specifications | Presentation specifications | Quality/status | Framer upload |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 / LOGO-01 | SODIC | [Supplied Google-cached URL](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXt4Rxy9Wqv5ejkXzgjczcXjYtH97-eTyVEJMjNPrawg&s=10) | `public/media/logos/original/sodic.png` | `public/media/logos/monochrome/sodic.png` | PNG; 738×189; 7,381 B; opaque | PNG; 738×189; 9,671 B | Usable at approved rail size; cached source | Pending |
| 2 / LOGO-05 | Banque Misr | [Supplied URL](https://blogs.realestate.gov.eg/wp-content/uploads/2024/10/Banque-Misr.png) | `public/media/logos/original/banque-misr.png` | `public/media/logos/monochrome/banque-misr.png` | PNG; 2560×1056; 418,293 B; alpha | PNG; 2560×1056; 287,024 B | High resolution | Pending |
| 3 / LOGO-08 | AXA | [Supplied URL](https://icisa.org/wp-content/uploads/2018/12/axa.png) | `public/media/logos/original/axa.png` | `public/media/logos/monochrome/axa.png` | PNG; 1500×900; 47,891 B; alpha | PNG; 855×855; 23,850 B | Clean presentation | Pending |
| 4 / LOGO-13 | WUZZUF | [Supplied URL](https://gemini.wuzzuf.net/lovable-uploads/78f28dbb-de4d-46f8-aff3-a83b0cee2e52.png) | `public/media/logos/original/wuzzuf.png` | `public/media/logos/monochrome/wuzzuf.png` | PNG; 1920×609; 37,846 B; alpha | PNG; 1696×272; 23,048 B | Clean wide wordmark | Pending |
| 5 / LOGO-03 | Emirates NBD | [Supplied URL](https://www.amd.com/content/dam/amd/en/images/logos/partners/2450100-amd-emirates-nbd-logo.png) | `public/media/logos/original/emirates-nbd.png` | `public/media/logos/monochrome/emirates-nbd.png` | PNG; 1200×675; 12,924 B; alpha | PNG; 1054×258; 13,978 B | Empty canvas removed from derivative | Pending |
| 6 / LOGO-07 | Palm Hills Developments | [Supplied URL](https://theaddress-eg.com/uploads/logo_85281718284.png) | `public/media/logos/original/palm-hills-developments.png` | `public/media/logos/monochrome/palm-hills-developments.png` | PNG; 1293×1271; 305,514 B; alpha | PNG; 962×764; 101,985 B | Minor raster artifacts remain acceptable at rail size | Pending |
| 7 / LOGO-14 | Orange | [Approved replacement SVG](https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original) | `public/media/logos/original/orange.svg` | `public/media/logos/monochrome/orange.svg` | SVG; 283.5×283.5 viewBox; 2,475 B | SVG; 283.5×283.5 viewBox; 2,474 B | Clean vector; orange field changed to theme blue only in derivative | Pending |
| 8 / LOGO-02 | Orascom Development | [Supplied URL](https://invest-gate.me/wp-content/uploads/2016/08/Orascom-Devel.gif) | `public/media/logos/original/orascom-development.gif` | `public/media/logos/monochrome/orascom-development.png` | GIF; 2714×1178; 27,414 B; alpha | PNG; 2244×630; 18,643 B | Static presentation derivative | Pending |
| 9 / LOGO-16 | The American University in Cairo | [Supplied URL](https://www.universitiesegypt.com/ImageHandler.ashx?Id=12734&SS=2f4b759a533e4ad5b1db622ff646146c) | `public/media/logos/original/american-university-cairo.png` | `public/media/logos/monochrome/american-university-cairo.png` | PNG; 400×400; 35,514 B; alpha | PNG; 301×186; 16,999 B | Detailed mark; optically sized | Pending |
| 10 / LOGO-04 | Wadi Group | [Supplied URL](https://syecommunity.com/wp-content/uploads/2023/05/Partner-1.png) | `public/media/logos/original/wadi-group.png` | `public/media/logos/monochrome/wadi-group.png` | PNG; 1080×1184; 15,096 B; alpha | PNG; 1007×349; 26,473 B | Empty canvas removed from derivative | Pending |
| 11 / LOGO-09 | National Bank of Egypt | [Supplied URL](https://mir-s3-cdn-cf.behance.net/projects/404/3c65d7240080589.Y3JvcCwxNDAwLDEwOTUsMCw4Ng.png) | `public/media/logos/original/national-bank-of-egypt.png` | `public/media/logos/monochrome/national-bank-of-egypt.png` | PNG; 404×316; 31,468 B; alpha | PNG; 184×217; 9,273 B | Lower resolution but legible at approved size | Pending |
| 12 / LOGO-06 | Hassan Allam Properties | [Supplied URL](https://www.xurustays.com/images/home/our-partners/hassan-allam-properties.png) | `public/media/logos/original/hassan-allam-properties.png` | `public/media/logos/monochrome/hassan-allam-properties.png` | PNG; 952×626; 38,638 B; alpha | PNG; 952×626; 20,714 B | Thin artwork strengthened without structural alteration | Pending |
| 13 / LOGO-12 | G Developments | [Supplied Google-cached URL](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS94jqSv7-pmkjZC04W1cU0tHVnnkqVL25AUJMqXzU1434jSSH16HSNGpE&s=10) | `public/media/logos/original/g-developments.png` | `public/media/logos/monochrome/g-developments.png` | PNG; 555×360; 4,302 B; opaque | PNG; 318×40; 5,925 B | Small source; clean at approved wordmark height | Pending |
| 14 / LOGO-10 | saib | [Supplied Google-cached URL](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXU1QSnDk5RGaWOUdHQ8EdE_X6zrWaAZrxZTtReueb4x9PFxomOsLUI-I&s=10) | `public/media/logos/original/saib.jpg` | `public/media/logos/monochrome/saib.png` | JPEG; 447×447; 16,304 B; opaque | PNG; 391×240; 35,909 B | Background removed from presentation copy | Pending |
| 15 / LOGO-15 | Arab Academy for Science, Technology and Maritime Transport | [Supplied URL](https://sakscholarship.org/wp-content/uploads/2025/07/Academy.png) | `public/media/logos/original/arab-academy.png` | `public/media/logos/monochrome/arab-academy.png` | PNG; 894×882; 158,194 B; alpha | PNG; 894×882; 125,697 B | Detailed crest; optically sized | Pending |
| 16 / LOGO-17 | Orascom Construction | User-supplied `codex-clipboard-a334120c-2042-41dd-983d-b177c3025c48.png` | `public/media/logos/original/orascom-construction.png` | `public/media/logos/monochrome/orascom-construction.png` | PNG; 3000×2000; 219,529 B; alpha | PNG; 2308×468; 66,102 B | Selected duplicate-free source | Pending |

### Excluded or superseded logo inputs

| ID | Input | Status | Reason |
| --- | --- | --- | --- |
| LOGO-11 | [Orascom Construction URL](https://www.orascomservices.com/wp-content/uploads/Orascom_Construction-Logo.wine_.png) | Excluded | Same organization/artwork as selected LOGO-17 |
| LOGO-18 | User-supplied `codex-clipboard-945e6106-31d9-4ad6-9a00-191c0e5d1490.png` | Excluded | Byte-for-byte duplicate of LOGO-17 |
| Superseded LOGO-14 source | `https://support.travel.orange.com/hc/theming_assets/01J213YJSH8J5F3G4Z426VY7RD` | Superseded | Source returned HTTP 403; replaced by approved Orange SVG |

## Framer upload checklist

- [ ] Upload VID-01 and its poster to Framer.
- [ ] Replace the local video and poster paths with Framer-hosted URLs.
- [ ] Upload all nine optimized testimonial WebP files to Framer.
- [ ] Upload all sixteen monochrome logo presentation files to Framer.
- [ ] Preserve the original source files outside the presentation layer for future replacement or reprocessing.
- [ ] Confirm every Framer image/video URL belongs to Framer's asset hosting.
- [ ] Recheck image dimensions, aspect ratios, and video controls in Framer.
- [ ] Recheck mobile/tablet paged grids and the static 8×2 desktop grid.
- [ ] Confirm no essential production media remains externally hotlinked.
