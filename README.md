# Open-source exam software comparison

A sourced, hands-on comparison of open-source exam, quiz and assessment software: Joomla extensions, WordPress plugins, Odoo modules, standalone web apps, desktop and mobile apps.

> **Disclosure:** maintained by the team behind [Next Exams](https://www.nextsoftware.dev/joomla-extensions/next-exams). We apply the same tests to our own product and publish where it loses. If we got something wrong, [open a correction](../../issues/new?template=correction.yml).

Every value links to a source and a date. Read [how we test and pick winners](METHODOLOGY.md).

<!-- generated:start -->
### Products compared

_No products published yet._

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
```

## Contributing

Corrections and new products are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

```sh
npm install
npm run check    # schema, sourcing rules, style
npm test
npm run readme   # regenerate the tables above
```

## License

Data and text: [CC BY 4.0](LICENSE-DATA). Code: [MIT](LICENSE).
