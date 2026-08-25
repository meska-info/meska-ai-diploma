# Phase 2 media and bandwidth audit

Measured locally on 25 August 2026. Production migration status must be verified again after deployment.

| Category | Repository payload | Decision |
| --- | ---: | --- |
| Videos | 158,936 KiB | Migrate active playback to Cloudflare Stream. Keep sources until Stream playback and production references are verified. |
| Images and posters | 2,292 KiB | Keep on Vercel. Existing optimized WebP files, explicit dimensions, posters, and lazy loading are proportionate for this payload. |
| Logos | 2,180 KiB including retained originals | Keep on Vercel. Runtime uses monochrome assets with explicit dimensions; the marquee waits for all runtime logos before moving. |
| Brand/instructor/other media | 376 KiB | Keep on Vercel. Migration would add complexity without a meaningful bandwidth benefit. |
| Fonts | 0 local files | Keep the existing system/Inter fallback stack; no font payload to migrate. |

The approximately 46.5 MB homepage MP4 is the largest single runtime asset. The thank-you videos contribute the rest of the substantial media payload. Only the homepage primary video may autoplay; below-the-fold players must remain user initiated and lazily loaded after Stream migration.
