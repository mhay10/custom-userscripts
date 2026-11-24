# AGENTS.md

Repo-wide instructions for AI agents. They come from how the owner has asked for work to be done. Each userscript can add its own `AGENTS.md` with project rules, for example `userscripts/scryfall-dark-mode/AGENTS.md`. Read the one for the project you are changing.

## Replying

- When changes are complete, reply with only a simple bulleted list that summarizes what was done and changed
- Never include code blocks in replies, for any reason
- Keep the summary short and factual. Name the file, the selector or variable, and the value that changed
- Say plainly what was and was not verified. Do not claim a check that was not run
- If a request has an empty or unclear item, handle the clear ones and point out the unclear one in the summary. Use the question tool only when a decision is needed before work can start

## Repository

- This is an npm workspaces monorepo. Each userscript lives in `userscripts/<name>` and shared helpers live in `common-utils` (`@repo/common-utils`)
- Do not edit `old/`
- `.prettierrc` sets 4-space indent, double quotes and a 100-character line width. Match the indent of the file you are editing and do not reformat unrelated lines

## Checks

- Run `npx eslint` and `npx prettier --check` on the files you changed. Use `npm run build -w @userscripts/<name>` to build one userscript
- Test visual or interface changes in a real browser with the Playwright browser tools. Do not rely only on reading the code. A project's own `AGENTS.md` describes how
- Do not add tooling or dependencies unless the task needs them. Do not leave test files, helper scripts, routes or browser downloads behind
- Do not commit unless asked. Commits use the `Co-authored-by` trailer required by the environment

## Working style

- Make small, scoped changes that fully solve the request. Do not make unrelated fixes or refactors
- Follow the order the user gives. Handle each bullet in a list separately and report on each
- Ask before large or irreversible work. For a broad audit or crawl, report findings and wait before changing code
- Do not create markdown files for notes or planning. The `AGENTS.md` files are the exception
