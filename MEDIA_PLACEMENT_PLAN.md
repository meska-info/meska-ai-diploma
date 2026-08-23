# Meska AI Co-Pilot Diploma — Media Placement Plan

Status: approved and implemented locally · 16 August 2026

This plan records the current placement and behavior of the official logo, eleven total site videos (one landing plus ten thank-you), poster frames, instructor portraits, testimonials and organization logos. `MEDIA_ASSET_MANIFEST.md` is the authoritative file-level inventory.

## Rules

- Rendered pages use local assets under `public/media`; external links are provenance only.
- Production Framer pages must use Framer-hosted assets, never Google Drive or source-page hotlinks.
- Preserve explicit dimensions/aspect ratios to prevent layout shift.
- Preserve the accepted section order and natural media framing.
- Do not invent captions, testimonial claims, organization relationships or instructor details.
- Do not add autoplay with sound.
- Validate 320, 375, 390, 768, 1024, 1280 and 1440px.

## Landing order

1. Official Meska logo in header.
2. Hero copy.
3. Main 16:9 overview video above the landing price card in the conversion media column.
4. Impact statistics.
5. Outcomes.
6. Continuous organization-logo marquee.
7. Curriculum disclosure.
8. Nine-image testimonial carousel.
9. Official Meska logo in footer.

## Thank-you order

1. Official Meska logo in header.
2. Application-capture confirmation.
3. Portrait graduation video paired with previous-wave copy.
4. Unified format/checkout card.
5. Nine portrait session videos in the supplied order.
6. Interactive skills-to-business-value matrix (no additional media).
7. Four official instructor portraits.
8. FAQ.
9. Official Meska logo in footer.

## 1. Official logo

- Asset: `public/media/brand/original/meska-2026-logo.png`.
- Selected after inspecting the official Drive variants because the blue/dark wordmark has correct contrast on white/off-white.
- Header/footer only; accessible home link and `Meska AI` alt text.
- Preserve intrinsic `3283×576` ratio. No recolor, recreation, tracing, stretching or substitute.

## 2. Main landing video

- Asset: `public/media/videos/original/meska-ai-diploma-main-video.mp4`.
- Poster: `public/media/images/posters/meska-ai-diploma-main-video-poster.webp`.
- Position: inside the primary conversion cluster after the one-line “Why We Built the Diploma” heading.
- Frame: natural 16:9, full available media-column width.
- Controls: native, user-initiated, inline, metadata preload, no autoplay.
- Crop: none; preserve presenter and Arabic graphics.
- Tracking: none; this existing informational video remains outside the new thank-you video-play tracking.

## 3. Graduation story video

- Video: `public/media/videos/optimized/graduation-wave.mp4`.
- Poster: `public/media/images/posters/graduation-wave.webp`.
- Position: immediately after the thank-you confirmation.
- Frame: natural 9:16; max 360px; centered on mobile; paired with copy from 700px.
- Controls: native, user-initiated, inline, metadata preload, no autoplay.
- Tracking: first play emits `VideoPlay` / `thank_you_graduation_video`.
- Coordination: starting it pauses any active session video; starting any session video pauses it.

## 4. Inside the Diploma videos

Exact order:

1. `inside-diploma-session-01.mp4` / `session-01.webp`
2. `inside-diploma-session-02.mp4` / `session-02.webp`
3. `inside-diploma-session-03.mp4` / `session-03.webp`
4. `inside-diploma-session-04.mp4` / `session-04.webp`
5. `inside-diploma-session-05.mp4` / `session-05.webp`
6. `inside-diploma-session-06.mp4` / `session-06.webp`
7. `inside-diploma-session-07.mp4` / `session-07.webp`
8. `inside-diploma-session-08.mp4` / `session-08.webp`
9. `inside-diploma-session-09.mp4` / `session-09.webp`

Videos live under `public/media/videos/optimized`; posters live under `public/media/images/posters/inside-diploma`.

Responsive presentation:

| Width | Cards | Behavior |
| --- | ---: | --- |
| below 700px | 86% primary card plus next peek | swipe, buttons, scroll snap |
| 700–1199px | 2 | swipe, buttons, scroll snap |
| 1200px+ | 3 | swipe, buttons, scroll snap |

- Each card uses the complete 9:16 frame; no crop.
- Native controls, inline playback, metadata preload, poster, no autoplay.
- Only one page video may play. Starting another or moving the active clip out of the selected slide pauses it.
- First play emits `VideoPlay` with `inside_diploma_video_01` through `_09` and 1-based index.
- Carousel movement itself is not tracked; the current analytics plan did not need a navigation event.

## 5. Instructor portraits

| Order | Instructor | Local asset |
| ---: | --- | --- |
| 1 | Nabil Khalifa | `public/media/instructors/optimized/nabil-khalifa.webp` |
| 2 | Dr. Amr Fahmy | `public/media/instructors/optimized/amr-fahmy.webp` |
| 3 | Youssef Al Refaey | `public/media/instructors/optimized/youssef-al-refaey.webp` |
| 4 | Omar El Monayar | `public/media/instructors/optimized/omar-el-monayar.webp` |

- Position: after the skills-to-business-value matrix and before FAQ.
- Frame: consistent 4:5, `object-fit: cover`, top-centered focal point.
- Cards: one/two/four columns at mobile/tablet/desktop and flex-balanced so biography length does not misalign LinkedIn buttons.
- Links: official verified LinkedIn destinations, new tab, `noopener noreferrer`, accessible new-tab label.
- Tracking: none; comparable outbound tracking did not already exist.

## 6. Testimonial carousel

- Nine approved screenshots, IMG-01 through IMG-09 in `MEDIA_ASSET_MANIFEST.md` order.
- Position: after curriculum, before footer.
- One/two/three cards at mobile/tablet/desktop.
- Preserve full screenshot at natural responsive height with `object-fit: contain`; no fixed-height crop.
- Manual controls and touch scroll; no autoplay, lightbox, click destination or tracking.
- Neutral caption: `AI Copilot Diploma graduate`.

## 7. Organization marquee

- Sixteen approved monochrome presentation assets in the existing `siteContent.media.organizationLogos` order.
- Meaning: professionals from these organizations have joined Meska’s AI learning experiences. Do not call them partners, clients, sponsors, certifications or corporate-training customers.
- Position: after Outcomes and before Curriculum.
- One semantic sequence with organization alt text.
- One visual-only duplicate sequence for a seamless loop; duplicate is `aria-hidden` and its images have empty alt.
- 62-second linear motion at all ordinary breakpoints; transparent borderless slots around 180×96px at base and 214×108px from 700px, with optically enlarged 64/72px contained image wells.
- Apply consistent greyscale through presentation styling; remove individual card backgrounds/borders and the visible rail/track without changing source assets.
- Pause on hover and keyboard focus.
- Reduced motion: stop animation, hide/remove duplicate sequence from layout and retain one manually scrollable sequence.
- No link, hover-to-original-color behavior or tracking.

## Framer upload sequence

1. Upload the official logo.
2. Upload main landing video/poster.
3. Upload graduation video/poster.
4. Upload nine session videos and map their nine posters without changing order.
5. Upload four instructor portraits.
6. Upload nine testimonial images.
7. Upload sixteen organization presentation logos.
8. Replace local paths with Framer-hosted URLs and verify dimensions before assigning media.
9. Recreate one-video-at-a-time coordination and inactive-slide pausing.
10. Recreate the semantic/visual marquee split and reduced-motion fallback.
11. Run complete responsive, keyboard, media, tracking and overflow QA before publication.

No publishing or Framer upload is authorized in the local implementation phase.
