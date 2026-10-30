# AEO + SEO playbook

Site source of truth for ops.0xray.dev. Seats load the Grok skill. This file is the passed body for the site, including the herald and magnet fixes from 2026-10-30.

Public pages do not use the internal lane token. This file names the ban. It is not a public page. `npm start` serves `public/` only.

## 0. Query stems

Answer these queries. Do not turn them into ranking, directory, or best-of pages.

- multi-agent systems
- agent orchestration
- AI agent operations
- agent reliability
- human-in-the-loop governance
- evals and observability
- release gates for agents
- AI spend and cost control
- standing up an agent team
- best practices

"Best practices" is a query stem only. Do not seed a listicle from it.

## 1. Voice

Industry language leads: multi-agent operations, orchestration, reliability, governance, and spend.

Stack names are not H1s, titles, meta descriptions, FAQ questions, or the first line of a page. Map a product name once, after that frame, or on the glossary with the industry term first and our name second.

Never print the internal public-lane token in public copy. Say public posts, or after GO.

No ranking tables, directory placements, or top-N lists.

## 2. Page shape

- One H1. At most 8 words and 60 characters.
- The hub H1 names the plane and the queue ("one plane", "one queue"). It is not a stack term.
- The paragraph under the H1 is a direct answer of 40 to 60 words. It starts with "Yes." It states the outcome and the how.
- Every H2 is a follow-up question.
- Three to five FAQ questions. The visible answer and the `FAQPage` JSON-LD answer are the same words.
- Also emit `Article` and `BreadcrumbList` JSON-LD.
- Canonical URLs use `https://ops.0xray.dev`.
- The title ends with ` | 0xRay` and is at most 60 characters.
- The meta description is at most 155 characters.
- A guide body is 800 to 1200 words.
- A guide has 2 to 4 live links in the body copy.
- The hub links every guide. Each guide links the hub.

## 3. Call to action

One consult destination: `https://ops.0xray.dev/#consult`.

The form posts to `/api/consult`. The server sends through Resend to consult@0xray.dev. The host key is `RESEND_API_KEY`. Tally is still later.

## 4. Discovery

On this site only, once the guides exist:

- `public/sitemap.xml`
- `public/llms.txt`
- `public/robots.txt` (allow `/`, sitemap URL)

Do not submit the site to offsite directories.

## 5. Public posts

Public posts stay on hold until the owner gives a go. Do not publish offsite posts from this plant. The website may ship after Critic PASS. The manual is not a launch post.

## 6. Add a guide

1. Create `public/guides/<slug>/index.html` using `public/assets/site.css` and the nav Hub, Guides, Lexicon, Consult.
2. Follow section 2. Link the new guide from the hub, `public/guides/index.html`, `public/sitemap.xml`, `public/llms.txt`, and the glossary when a word needs a row.
3. Point the consult link at `https://ops.0xray.dev/#consult`.
