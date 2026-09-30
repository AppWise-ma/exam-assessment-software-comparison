# Contributing

## Fix a wrong value

1. Find the product file in `data/products/`.
2. Change the cell's `value`, and set `source_url` to a page that shows the right value.
3. Set `verified_at` to today and `method` to how you checked (`docs`, `changelog`, `source-code`, or `hands-on` with a screenshot in `evidence/`).
4. Run `npm run check` and open a pull request.

If you prefer, open a [correction request](../../issues/new?template=correction.yml) and we will make the change.

## Propose a new product

Open an issue with the product name, its license, where the source is and its latest release. It must meet the rules in [METHODOLOGY.md](METHODOLOGY.md#what-is-included). Copy `data/products/_template.yaml` to start a file.

## Rules for every change

- No value without a source. Use `unverified` when you are not sure.
- `partial` and add-on values need a `note`.
- Plain language. `npm run lint:prose` lists phrases to rewrite.
- Vendors may contribute to their own product's file. Say so in the pull request.
