# ops.0xray.dev

AI Fleet OPS consulting arm. Forge plant. Dist HOLD.

Copy rules for the site live in [docs/AEO-SEO-PLAYBOOK.md](docs/AEO-SEO-PLAYBOOK.md). Public pages say "public posts" and "after GO". They do not print the internal lane token.

## Content battery

The site is the category manual for AI Fleet OPS: one plane, one queue, and the operating guides. It is a hub, five category guides, four kit guides (install, config, first ticket, pitfalls), four house guides, and a glossary. Industry language leads. In-house names live in the glossary, industry term first.

Railway runs `npm start` (`node server.mjs`). That serves `public/` and `POST /api/consult`. The form emails consult@0xray.dev through Resend. Set `RESEND_API_KEY` on the host. `RESEND_FROM` is optional and defaults to `AI Fleet OPS <consult@0xray.dev>`. No Tally.

| Path | What it is |
| --- | --- |
| `/` | Category hub and consult form |
| `/guides/` | Guide map: category path, kit guides, then house guides |
| `/guides/control-plane/` | Agentic control plane layer map |
| `/guides/what-is-ai-fleet-ops/` | What AI fleet ops means |
| `/guides/framework-vs-ops/` | Frameworks versus ops checklist |
| `/guides/pilot-to-production/` | Pilot to governed production |
| `/guides/spend-governance/` | Agent spend and policy |
| `/guides/install/` | Install the multi-agent ops stack |
| `/guides/config/` | Seats, gates, and limits |
| `/guides/first-ticket/` | Run one ticket through the loop |
| `/guides/fleet-pitfalls/` | Fleet pitfalls and fixes |
| `/guides/ship-gates/` | Release gates (house) |
| `/guides/stand-up/` | Standing up a team (house) |
| `/guides/eng-vs-dist/` | Build lane vs public posts (house) |
| `/guides/compute-discipline/` | Model spend and compute (house) |
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
