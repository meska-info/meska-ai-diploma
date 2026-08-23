# Meska AI Diploma Media Asset Manifest

Updated: 2026-08-16

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

### MAIN-VIDEO-BEHAVIOR

- Section: existing main-video position directly below the Hero.
- Desktop/tablet/mobile: contained 16:9 presentation at the section's full available width.
- Playback: user-initiated, visible controls, `playsInline`, `preload="metadata"`, never autoplay.
- Crop: none.
- Caption/transcript: none requested.
- Click destination and tracking: none.

### PORTRAIT-VIDEO-BEHAVIOR

- Sections: graduation story and nine-card Inside the Diploma carousel on the thank-you page.
- All selected source files are native 1080×1920 portrait videos; local presentation derivatives are 720×1280 H.264/AAC MP4s with fast-start metadata and stripped nonessential metadata.
- Poster frames are 720×1280 WebP derivatives from the supplied videos.
- Playback is user-initiated with visible native controls, `playsInline`, `preload="metadata"`, and no autoplay.
- Starting any portrait video pauses every other video on the page. Moving a session clip out of the active carousel position pauses it.
- The graduation video emits first-play `VideoPlay` with `thank_you_graduation_video`. Session videos emit first-play `VideoPlay` with their ordered `inside_diploma_video_XX` IDs.
- Crop: none; use the natural 9:16 frame and preserve faces and embedded captions.

### LOGO-BEHAVIOR

- Section: logo-grid position after Outcomes and before Curriculum.
- Meaning: organizations represented by professionals who learned AI with Meska. These are not labeled partners, clients, sponsors, certifications, or corporate-training customers.
- Mobile/tablet/desktop: one continuous, seamless horizontal marquee at a restrained 62-second linear duration.
- Presentation: transparent, borderless slots around 180×96px at base and 214×108px from 700px; contained artwork in 64/72px wells, consistent CSS greyscale treatment, preserved aspect ratios and controlled optical sizing. No individual cards, backgrounds or visible track.
- Interaction: no click destination or tracking. Motion pauses on hover and keyboard focus.
- Accessibility: one semantic sequence with organization-name alt text plus one visual-only duplicated sequence marked `aria-hidden` and using empty image alt text.
- Reduced motion: stop animation, remove the duplicated sequence from layout, and leave one manually scrollable sequence.

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
| Responsive behavior | MAIN-VIDEO-BEHAVIOR |
| Alt/accessibility label | Meska AI Co-Pilot Diploma overview |
| Caption | None |
| Crop/focal point | No crop; retain the natural 16:9 frame. Poster keeps the presenter and Arabic title visible. |
| Authorization | User supplied and approved on 2026-08-15 |
| Tracking | None; no play/progress/completion hooks |
| Framer upload | Pending |

The original 1080p file is used for local delivery with conservative metadata preloading. A trial 720p system transcode was rejected because it increased the file to approximately 95 MiB; it is not part of the project.

## Official Meska logo

| Field | Value |
| --- | --- |
| Asset ID | BRAND-01 |
| Drive folder | [Official Meska 2026 logo folder](https://drive.google.com/drive/folders/1gyyhN1Lh_jzHjUBPj64xYDRnUXE5EVyM) |
| Selected Drive file | `Meska2026 LOGO (1).png`; file ID `1pikI94As0PCxe_dIRrXg-02YcIV6T92E` |
| Rejected alternatives | `Meska2026 LOGO all white.png` and `Meska2026 LOGO white.png`; insufficient contrast on the accepted white/off-white header |
| Local path | `public/media/brand/original/meska-2026-logo.png` |
| Specifications | PNG; RGBA; 3283×576; 42,924 B |
| Placement | Header and footer on both routes |
| Treatment | Preserve intrinsic aspect ratio; no recolor, trace, distortion or substitute; accessible alt `Meska AI`; home link |
| Framer upload | Pending |

## Thank-you portrait videos

All supplied source videos were inspected as native `1080×1920` portrait MP4s. The local repository contains delivery derivatives rather than a duplicate 1.35GB original-source set. Original Drive links and filenames remain the retrieval source for Framer if a different encode is required.

| Order / ID | Drive source and original filename | Original size / duration | Local optimized video | Local poster | Tracking / placement | Framer upload |
| --- | --- | --- | --- | --- | --- | --- |
| Graduation / `thank_you_graduation_video` | [Drive](https://drive.google.com/file/d/14i_kNr4A6zqo0QJm06pvtVGSiRWyhG83/view?usp=sharing) · `SQ - 03 - winners Final.mp4` | 179,476,717 B · 141.909s | `public/media/videos/optimized/graduation-wave.mp4` · 20,853,440 B | `public/media/images/posters/graduation-wave.webp` · 27,434 B | Graduation story; first-play `VideoPlay` | Pending |
| 1 / `inside_diploma_video_01` | [Drive](https://drive.google.com/file/d/1ep9zRueGnOQPwfRRFml_MGK1kkOte0hm/view?usp=sharing) · `Day 1 - reel 06.mp4` | 104,890,189 B · 77.269s | `public/media/videos/optimized/inside-diploma-session-01.mp4` · 8,082,288 B | `public/media/images/posters/inside-diploma/session-01.webp` · 40,044 B | Carousel position 1; first-play `VideoPlay` | Pending |
| 2 / `inside_diploma_video_02` | [Drive](https://drive.google.com/file/d/1ca7Qu7VZZns0CqAlTCNe30sMc8ZS01Rc/view?usp=sharing) · `نسخة من DAY 9 - REEL 05.mp4` | 129,684,042 B · 95.659s | `public/media/videos/optimized/inside-diploma-session-02.mp4` · 12,429,103 B | `public/media/images/posters/inside-diploma/session-02.webp` · 34,120 B | Carousel position 2; first-play `VideoPlay` | Pending |
| 3 / `inside_diploma_video_03` | [Drive](https://drive.google.com/file/d/1TuRht3W-ELdrqQz2byQFCpnVDCS_29YB/view?usp=sharing) · `Day 1 - reel 02.mp4` | 76,799,417 B · 56.661s | `public/media/videos/optimized/inside-diploma-session-03.mp4` · 8,640,496 B | `public/media/images/posters/inside-diploma/session-03.webp` · 44,994 B | Carousel position 3; first-play `VideoPlay` | Pending |
| 4 / `inside_diploma_video_04` | [Drive](https://drive.google.com/file/d/1yXJ3K5aBNC6CYsG4ubn7wMJ-ZfOeElZX/view?usp=sharing) · `DAY 2- REEL 02.mp4` | 135,499,662 B · 100.224s | `public/media/videos/optimized/inside-diploma-session-04.mp4` · 10,565,399 B | `public/media/images/posters/inside-diploma/session-04.webp` · 37,592 B | Carousel position 4; first-play `VideoPlay` | Pending |
| 5 / `inside_diploma_video_05` | [Drive](https://drive.google.com/file/d/1rDlyJ6gUIn2RrfOhs7PfRQkSg6BeQVTk/view?usp=sharing) · `day 6- reel 02.mp4` | 139,810,515 B · 103.659s | `public/media/videos/optimized/inside-diploma-session-05.mp4` · 11,367,493 B | `public/media/images/posters/inside-diploma/session-05.webp` · 47,314 B | Carousel position 5; first-play `VideoPlay` | Pending |
| 6 / `inside_diploma_video_06` | [Drive](https://drive.google.com/file/d/1T0c0Z359zgP0HIhCqmO80Dlgm1aFZdzG/view?usp=sharing) · `day 7- reel 01.mp4` | 136,660,536 B · 101.525s | `public/media/videos/optimized/inside-diploma-session-06.mp4` · 11,557,964 B | `public/media/images/posters/inside-diploma/session-06.webp` · 51,278 B | Carousel position 6; first-play `VideoPlay` | Pending |
| 7 / `inside_diploma_video_07` | [Drive](https://drive.google.com/file/d/1daCymHLjKP-ZEP6-i-AaUdLbYAbzvwGO/view?usp=drive_link) · `R5.mp4` | 190,505,632 B · 147.755s | `public/media/videos/optimized/inside-diploma-session-07.mp4` · 14,940,217 B | `public/media/images/posters/inside-diploma/session-07.webp` · 42,250 B | Carousel position 7; first-play `VideoPlay` | Pending |
| 8 / `inside_diploma_video_08` | [Drive](https://drive.google.com/file/d/1_TKOnIQ-h20_AcUrIjdj5By5Zl_IAtQ1/view?usp=sharing) · `DAY 3- REEL 04-1.mp4` | 117,214,889 B · 86.123s | `public/media/videos/optimized/inside-diploma-session-08.mp4` · 8,714,150 B | `public/media/images/posters/inside-diploma/session-08.webp` · 22,852 B | Carousel position 8; first-play `VideoPlay` | Pending |
| 9 / `inside_diploma_video_09` | [Drive](https://drive.google.com/file/d/1MsqdLqX918aHMa5M5QXvgeQF_b36Lk1w/view?usp=sharing) · `R2.mp4` | 145,348,763 B · 112.640s | `public/media/videos/optimized/inside-diploma-session-09.mp4` · 9,060,285 B | `public/media/images/posters/inside-diploma/session-09.webp` · 43,322 B | Carousel position 9; first-play `VideoPlay` | Pending |

All optimized videos and posters use PORTRAIT-VIDEO-BEHAVIOR. Poster frames were inspected for legibility, faces and embedded captions; no heavy crop is applied.

## Instructor portraits

The first three portraits come from the current official [Offline Diploma page](https://meska.ai/offline-diploma). Omar’s portrait and role/biography were verified on the official [Meska About page](https://meska.ai/about). Rendered pages use only the local WebP derivatives.

| Order | Instructor | Official image source | Local presentation | Dimensions / size | Alt text | LinkedIn | Framer upload |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Nabil Khalifa | `https://framerusercontent.com/images/DbKw6C0vWczyCtCTJlj4xZ5nUSY.jpg?width=1080&height=1350` | `public/media/instructors/optimized/nabil-khalifa.webp` | 1080×1350 · 133,120 B | Nabil Khalifa speaking at a Meska AI event | `https://eg.linkedin.com/in/nabil-khalifa-96702090` | Pending |
| 2 | Dr. Amr Fahmy | `https://framerusercontent.com/images/34iEbemMv1sbKVf9KScOOJZ3M.jpg?width=1080&height=1350` | `public/media/instructors/optimized/amr-fahmy.webp` | 1080×1350 · 68,466 B | Dr. Amr Fahmy, L&D Director at Meska AI | `https://eg.linkedin.com/in/amrfahmyofficial` | Pending |
| 3 | Youssef Al Refaey | `https://framerusercontent.com/images/WXNVhyEuzkEBnp3JIt91IagwO5E.jpg?width=1080&height=1350` | `public/media/instructors/optimized/youssef-al-refaey.webp` | 1080×1350 · 60,810 B | Youssef Al Refaey, Growth Director at Meska AI | `https://eg.linkedin.com/in/youssef-al-refaey-361a6214a` | Pending |
| 4 | Omar El Monayar | `https://framerusercontent.com/images/rVqanVhsIIfMKXkYsqw8B6xKgc.jpg?width=800&height=800` | `public/media/instructors/optimized/omar-el-monayar.webp` | 800×800 · 72,906 B | Omar El Monayar, Co-Founder of Meska AI | `https://www.linkedin.com/in/omarelmonayar/` | Pending |

Portrait display is a consistent 4:5 frame with `object-fit: cover` and top-centered focal position. Do not substitute random portraits or restore Ahmed Mostafa.

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

- [ ] Upload BRAND-01 and preserve its intrinsic aspect ratio.
- [ ] Upload VID-01 and its poster to Framer.
- [ ] Upload the graduation video/poster and nine ordered session video/poster pairs.
- [ ] Upload all four instructor portrait derivatives.
- [ ] Replace every local media path with its matching Framer-hosted URL.
- [ ] Upload all nine optimized testimonial WebP files to Framer.
- [ ] Upload all sixteen monochrome logo presentation files to Framer.
- [ ] Preserve the original source files outside the presentation layer for future replacement or reprocessing.
- [ ] Confirm every Framer image/video URL belongs to Framer's asset hosting.
- [ ] Recheck image dimensions, aspect ratios, and video controls in Framer.
- [ ] Recheck the continuous marquee, semantic/visual duplicate split, hover/focus pause and reduced-motion fallback.
- [ ] Recheck that only one of the ten thank-you videos can play at a time and that inactive session clips pause.
- [ ] Confirm no essential production media remains externally hotlinked.
