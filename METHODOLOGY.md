# Methodology

This comparison is maintained by the team that makes **Next Exams**. That is a conflict of interest, so this page explains exactly how we collect facts and pick winners. You can check each rule against the data in this repository.

## What is included

A product is listed when all four are true:

1. Its code is released under an OSI-approved license (GPL, LGPL, AGPL, MIT, Apache, MPL...).
2. The source can be obtained: a public repository, or the full source delivered with a paid GPL download. When the source is only available after purchase, we say so.
3. It had a release or real development activity in the last 24 months.
4. Exams, quizzes or assessment are a core feature, not a side module.

Free and paid products are both included. Hosted-only services with closed code are not.

## How a fact is recorded

Each product has one file in `data/products/`. Every feature value in it is a *cell* with:

| Field | Meaning |
|---|---|
| `value` | `yes`, `partial`, `addon-paid`, `addon-free`, `no`, a number, or short text |
| `method` | `hands-on` (we saw it), `docs`, `changelog` or `source-code` |
| `source_url` | Where anyone can check the claim |
| `evidence` | Screenshot under `evidence/<product>/<version>/` (for hands-on checks) |
| `verified_at` | Date we checked |
| `note` | Required for `partial` and add-on values: what is missing, or which add-on |

The build fails when a cell has no source, no date or no method. If we could not confirm something, the value is `unverified` and the site shows "Not checked". We do not fill gaps with guesses.

Some features, such as keyboard-only exam taking and phone-sized screens, only count when we tested them hands-on. Vendor claims are not enough for those.

Each feature has a written definition in [`data/features.yaml`](data/features.yaml) that says what earns a "yes". For example, "server-enforced timing" is only "yes" if changing the browser clock does not give the candidate more time.

## How we test

- We install each product, at the version in its file, on a clean test site.
- We build the same reference exam in each: 20 questions across the common types, a 30-minute limit, random question order, and one essay question.
- We take the exam as a candidate, grade it as a teacher and read the reports.
- Screenshots of what we checked go in `evidence/`.
- Our own product goes through the same steps.

## How winners are chosen

There is no overall score, no star rating and no "4.8/5". Numbers like that hide the judgement behind them.

Instead, each area (question bank, grading, proctoring...) gets a verdict in [`data/verdicts.yaml`](data/verdicts.yaml): the winner, a runner-up, and the reason, citing the cells that decided it. An area can have a tie or no winner at all.

Next Exams does not win every area. Where another product is better, the verdict says so.

## Freshness

Software changes. A cell older than 180 days is marked as stale on the site. A monthly job refreshes project-health numbers (last release, stars, license) from the GitHub or GitLab API and opens a pull request.

## Corrections

If something is wrong, open a [correction request](../../issues/new?template=correction.yml) with a link that shows the right value. Vendors are welcome to do this. Fixed errors are listed in [CHANGELOG.md](CHANGELOG.md).

## Writing style

Text in this repository is short and factual. A CI check rejects common marketing and filler phrases (see [`style/banned-phrases.txt`](style/banned-phrases.txt)). A sentence should say something that can be checked.
