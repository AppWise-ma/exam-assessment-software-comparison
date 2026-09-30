# Open-source exam software comparison

A sourced, hands-on comparison of open-source exam, quiz and assessment software: Joomla extensions, WordPress plugins, Odoo modules, standalone web apps, desktop and mobile apps.

> **Disclosure:** maintained by the team behind [Next Exams](https://www.nextsoftware.dev/joomla-extensions/next-exams). We apply the same tests to our own product and publish where it loses. If we got something wrong, [open a correction](../../issues/new?template=correction.yml).

Every value links to a source and a date. Read [how we test and pick winners](METHODOLOGY.md). The same data is published as a website at <https://appwise-ma.github.io/exam-assessment-software-comparison/>.

<!-- generated:start -->
### Products compared

| Product | Platform | License | Price model | Version tested | Features checked |
|---|---|---|---|---|---|
| [Moodle (Quiz activity)](https://moodle.org) | Web app | GPL-3.0-or-later | free | 5.2.3 | 41/50 |
| [Next Exams (ours)](https://www.nextsoftware.dev/joomla-extensions/next-exams) | Joomla | GPL-2.0-or-later | paid (GPL) | 6.1.0 | 39/50 |
| [Odoo Survey](https://www.odoo.com/app/surveys) | Odoo | LGPL-3.0-only | free | 20.0 | 25/50 |
| [Quiz and Survey Master](https://quizandsurveymaster.com) | WordPress | GPL-2.0-only | freemium | 11.2.7 | 30/50 |
| [QuizTools](https://extensions.joomla.org/extension/living/education-a-culture/quiztools/) | Joomla | GPL-2.0-or-later | free | 1.5.0 | 28/50 |
| [TAO Community Edition](https://www.taotesting.com/products/community-edition/) | Web app | AGPL-3.0-only | free | 2026.05-v1.1.1-public | 32/50 |
| [TCExam](https://tcexam.org) | Web app | AGPL-3.0-or-later | free | 17.2.8 | 34/50 |

### Best in each area

_Verdicts are published after hands-on testing is complete._
<!-- generated:end -->

## What is compared

Questions and question bank, exam delivery and anti-cheat, proctoring and live monitoring, grading, certificates, reporting, standards (QTI, LTI, SCORM), accessibility and languages, hosting, license and cost. The exact definitions are in [`data/features.yaml`](data/features.yaml).

## Repository layout

```
data/features.yaml        what is compared, and what counts as "yes"
data/products/*.yaml      one file per product, every value sourced
data/verdicts.yaml        winner per area, with the reason
data/health/*.json        release and activity data, fetched automatically
evidence/                 screenshots from hands-on tests
site/                     static website (Astro), built from data/ and deployed to GitHub Pages
```

## Contributing

Corrections and new products are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

```sh
npm install
npm run check    # schema, sourcing rules, style
npm test
npm run readme   # regenerate the tables above
npm run site:dev # preview the website locally
```

## License

Data and text: [CC BY 4.0](LICENSE-DATA). Code: [MIT](LICENSE).
