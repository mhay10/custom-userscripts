# AGENTS.md - Scryfall Dark Mode

Rules for the Scryfall Dark Mode userscript in `userscripts/scryfall-dark-mode`. Repo-wide rules (reply format, checks, working style) are in the root `AGENTS.md`.

## Project layout

- `src/main.ts` imports every stylesheet with `?inline`, joins them, and injects one `<style id="scryfall-dark-mode-styles">`. It also adds the light/dark toggle button to `#header`
- `lib/styles/variables.css` holds every color as a `--sdm-*` custom property. It is loaded first
- `lib/styles/global.css` holds site-wide styles
- `lib/styles/card.css`, `advanced.css`, `sets.css`, `docs.css` and `docs-syntax.css` hold page-specific styles. `docs.css` covers every `/docs/*` page through the shared `.reference-doc` and `.prose` markup
- `lib/toggle-light.svg` and `lib/toggle-dark.svg` are the toggle icons
- `dist/` is build output. Rebuild it after every change

## Styling rules

- Do not hard-code colors in the page stylesheets. Add or reuse a variable in `variables.css`
- Name new variables `--sdm-<group>-<name>` (for example `--sdm-btn-text`, `--sdm-text-muted-more`). The prefix is `sdm`, not `smd`
- Do not repeat what `global.css` or `variables.css` already provide. Only target an element when the site overrides the global style
    - Example: if the global text color is light but a site rule turns `p` near-black, target `p` in the page stylesheet and set it back
- Scryfall's own rules usually win, so the dark mode rules use `!important`. Match the specificity of the site rule when it is not enough
- Soften colors instead of using the site's saturated defaults. Keep each color recognizable by hue (for example mana symbols, rarity stars, prices and pills)
- Icons and arrows drawn as `background-image` SVGs cannot take a CSS color. Add a recolored data URI variable in `variables.css` and note that the color is baked in so it must be kept in sync. Mana symbols are softened with a filter instead
- Keep the header from shifting between themes. The dark-mode toggle button must stay the same width as the site's `.header-link.icon-only`
- Keep the card search icon. Reset `background-color` on the header search elements, not the `background` shorthand
- Match the existing file's indent. `.prettierrc` uses 4 spaces, but some older stylesheets in this project still use 2. Do not reformat unrelated lines

## Build and checks

- Build with `npm run build` inside this folder. Always rebuild after editing CSS or `main.ts`, and wait for the edit to finish first so the build contains it
- From the repo root, run `npx eslint userscripts/scryfall-dark-mode/src` and `npx prettier --check` on the files you changed

## Testing with a browser

- Test every visual change in a real browser with the Playwright browser tools. Do not rely only on reading the CSS
- Inject the built `dist/Scryfall-Dark-Mode.user.js` into the live page
    - Serve it through a `page.route` on a `scryfall.com` URL such as `https://scryfall.com/__dm.js**`, then load it with `addScriptTag`. Scryfall's CSP blocks inline scripts
    - The CSP also blocks the inline `<style>` the script adds. Copy the injected style text into a `CSSStyleSheet` and set `document.adoptedStyleSheets`
    - Set styles from code with the DOM style API, not `style=""` attributes
    - Remove the route and any preview elements when finished
- Check both computed styles (`getComputedStyle`) and a screenshot
    - Screenshots can be taken mid-transition, so wait about two seconds after applying styles and re-screenshot before judging a color. A first screenshot that looks unstyled is usually stale
    - When an element is hidden or in a closed state (a select2 dropdown, a menu), open it before checking
- Compare against the site's own rules when something does not apply. Walk `document.styleSheets` for rules that match the element and see which one wins
- To prove a refactor changed nothing, build before and after and compare computed colors for every element on the page
- Browser pages close between turns. Reopen the page when a tool says it was not found. Very large pages (such as `/docs/tagger-tags` and `/sets`) can time out. Use a lighter page of the same template if needed
- Use these pages
    - `/card`: `https://scryfall.com/card/roe/8/not-of-this-world` (card images may not load on this network. If they load, check image borders against the real image. If they do not, use a dark stand-in image). `https://scryfall.com/card/mh2/250/misty-rainforest` for rarity stars and related searches. `https://scryfall.com/card/sld/2050/rift-bolt?random=%2A&unique=cards` for the `/random` banner
    - `/advanced`, `/sets`, `/docs/syntax` and any `/docs/*` page at their own URLs
- Firefox and Violentmonkey behave differently from Chromium. The click handler must look up the live toggle button, because the original element reference can go stale. When a bug only shows in the user's Waterfox and Violentmonkey setup, reproduce it with Firefox and the Violentmonkey add-on

## Selectors and names

- Use the user's wording for selectors and variable names. Confirm the actual selector on the live page before writing CSS
- If the user's note contains an apparent typo (for example a wrong variable prefix), use the correct existing name and say so in the summary
