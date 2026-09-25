# Custom Userscripts

A collection of custom userscripts that I occasionally use, built with TypeScript and Vite

## Installation

1. Install a userscript manager such as Tampermonkey or Violentmonkey
2. Install a script from the latest [GitHub Release](https://github.com/mhay10/custom-userscripts/releases) and by downloading its `.user.js` file
3. Visit a supported website for that script

## Scripts

- **Google Docs - No Gemini Bar**
    - Removes the floating Gemini prompt bar at the bottom of Google Docs documents
    - Supports:
        - https://docs.google.com/document/*

- **Better Github Dashboard**
    - A cleaner GitHub dashboard: hides Copilot and surfaces your active work
    - Supports:
        - https://github.com/
    - Features:
        - Hides dashboard's Copilot prompt box
        - Groups repositories by owner
        - Displays active pull requests and issues (review-requested PRs, authored PRs, assigned issues)
        - Custom styled sidebar UI

## Development

This repository is an npm workspaces monorepo: each userscript lives in its own workspace under `userscripts/`, and shared helpers live in the `@repo/common-utils` workspace

```bash
npm install                             # install dependencies and link workspaces

npm run dev -w @userscripts/<name>      # watch-build a single userscript
npm run build -w @userscripts/<name>    # build a single userscript (tsc + vite)
npm run build                           # build all userscripts

npm run lint                            # eslint across the repo
npm run lint:fix                        # eslint with auto-fix
npm run format                          # prettier across the repo
```

Pre-commit hooks (husky + lint-staged) automatically lint and format staged files

Shared utilities (logger, DOM helpers, time, etc.) are available in every userscript via:

```ts
import { createLogger, waitForElement } from "@repo/common-utils";
```

## Creating a New Userscript

Scaffold a new workspace with:

```bash
npm run create <name>                   # name in kebab-case, e.g. my-cool-script
npm run create <name> -- --desc "Does something cool"
```

This creates `userscripts/<name>/` with a `package.json`, `tsconfig.json`, `vite.config.ts`, and starter source files, then links it via `npm install`:

1. Set the `@match` pattern and icon in `userscripts/<name>/vite.config.ts` (currently placeholders)
2. Implement the logic in `userscripts/<name>/src/main.ts`

## Releasing

Releases are handled by the `Release Userscript` GitHub Actions workflow (`.github/workflows/build-release.yml`), triggered manually with the script's folder name

The workflow builds the workspace and publishes a GitHub release tagged `<name>-v<version>` (version taken from the workspace's `package.json`), attaching the built `*.user.js` and `*.meta.js` files

Userscript managers then install/update from the latest release via the `downloadURL`/`updateURL` in each script's header
