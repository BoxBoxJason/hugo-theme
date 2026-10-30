# hugo-theme

The shared look and feel of the documentation sites of the [boxboxjason](https://github.com/boxboxjason) projects.

It is a [Hugo module](https://gohugo.io/hugo-modules/) wrapping [Hextra](https://github.com/imfing/hextra): it pins Hextra, and layers the brand colors, favicon, footer and shared defaults (search, navbar, edit links, theme switch) on top of it. A reusable GitHub Actions workflow builds, checks and deploys the sites, so the toolchain is identical everywhere.

| What | Where |
| ---- | ----- |
| Brand colors and fonts | [`assets/css/custom.css`](assets/css/custom.css) |
| Footer | [`layouts/_partials/custom/footer.html`](layouts/_partials/custom/footer.html) |
| Favicon | [`static/favicon.svg`](static/favicon.svg) |
| Shared defaults (search, navbar, edit links, ...) | [`hugo.toml`](hugo.toml) |
| `spacer` shortcode | [`layouts/_shortcodes/spacer.html`](layouts/_shortcodes/spacer.html) |
| Build, link check and deploy | [`.github/workflows/docs.yml`](.github/workflows/docs.yml) |

Changing one of them here changes every site, the next time the site updates the module.

## Using it in a repository

1. Put the Markdown in `docs/content` and start from [`exampleSite/hugo.toml`](exampleSite/hugo.toml) for `docs/hugo.toml`.
2. Create the site module and pin the theme (this writes `docs/go.mod` and `docs/go.sum`, commit both):

   ```bash
   cd docs
   hugo mod init github.com/<owner>/<repository>/docs
   hugo mod get github.com/boxboxjason/hugo-theme@<tag>
   ```

3. Add the workflow, pinned to a commit of this repository:

   ```yaml
   name: Documentation
   on:
     workflow_dispatch:
     pull_request:
     push:
       branches: [main]
   permissions:
     contents: read
   jobs:
     docs:
       permissions:
         contents: read
         pages: write
         id-token: write
       uses: boxboxjason/hugo-theme/.github/workflows/docs.yml@<commit sha>
       with:
         deploy: ${{ github.event_name == 'push' || github.event_name == 'workflow_dispatch' }}
   ```

4. In the repository settings, set **Pages → Source** to **GitHub Actions**.

The site is then served from `https://<owner>.github.io/<repository>/`, deployed from an Actions artifact: there is no `gh-pages` branch to maintain.

## Updating

```bash
cd docs && hugo mod get -u github.com/boxboxjason/hugo-theme
```

Renovate does the same through the `go.mod` of the site. Hextra is updated here, once, and reaches the sites through this module.

## Working on the theme

`hugo mod` can use a local checkout instead of the published module. In a site, temporarily add this to `docs/go.mod` (do not commit it):

```text
replace github.com/boxboxjason/hugo-theme => ../../hugo-theme
```

## Notes

- Hugo does not merge `markup` settings from a theme, so each site sets its own (see the example).
- Hextra downloads FlexSearch from jsDelivr when the site is built (the version is pinned by Hextra). To avoid any network access at build time, vendor the file and set `params.search.flexsearch.js`.
- The Hugo version and its SHA-256 are pinned in the workflow: bump both together.
