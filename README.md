# ops.0xray.dev

AI Fleet OPS consulting arm. Forge plant. Dist HOLD.

Copy rules for the site live in [docs/AEO-SEO-PLAYBOOK.md](docs/AEO-SEO-PLAYBOOK.md). Public pages say "public posts" and "after GO". They do not print the internal lane token.

## Content battery

The site is the category manual for AI Fleet OPS: one plane, one queue, release gates, and a ceiling on model spend. It is a hub, six guides, and a glossary. Industry language leads. In-house names live in the glossary, industry term first.

Railway runs `npm start` (`node server.mjs`). That serves `public/` and `POST /api/consult`. The form emails consult@0xray.dev through Resend. Set `RESEND_API_KEY` on the host. `RESEND_FROM` is optional and defaults to `AI Fleet OPS <consult@0xray.dev>`. No Tally.

| Path | What it is |
| --- | --- |
| `/` | Category hub and consult form |
| `/guides/` | Guide map, with a path per job |
| `/guides/what-is-ai-fleet-ops/` | What AI Fleet OPS is |
| `/guides/control-plane/` | Queues, ownership, control plane |
| `/guides/ship-gates/` | Release gates |
| `/guides/stand-up/` | Standing up a team |
| `/guides/eng-vs-dist/` | Build lane vs public posts |
| `/guides/compute-discipline/` | Model spend and compute |
| `/lexicon/` | Glossary |
| `/llms.txt` | Page list for agents |
| `/sitemap.xml` | On-site URL list |
| `/robots.txt` | Allow the site, point at the sitemap |

## Add a guide

Follow [docs/AEO-SEO-PLAYBOOK.md](docs/AEO-SEO-PLAYBOOK.md) section 6. Short version:

1. Create `public/guides/<slug>/index.html` with `public/assets/site.css` and the nav Hub, Guides, Lexicon, Consult.
2. One short industry H1, a 40–60 word answer that starts with "Yes.", question H2s, and 3–5 FAQ answers duplicated in `FAQPage` JSON-LD, plus `Article` and `BreadcrumbList`.
3. Keep the guide between 800 and 1200 words, with 2–4 in-body links, a link home, and a consult link to `https://ops.0xray.dev/#consult`.
4. Add the page to the hub, `public/guides/index.html`, `public/sitemap.xml`, and `public/llms.txt`.
5. Do not add tool rankings, directories, or best-of lists.

## Dist HOLD

Public posts stay on hold until the owner calls the go. A reviewer PASS does not open that lane. Do not write offsite posts from this plant. This manual is not a launch post.
