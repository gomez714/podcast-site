<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git: never commit or push

**Do not run `git commit`, `git push`, or anything that creates commits or updates a remote** (including `git commit --amend`, `git merge`, `git rebase`, `git tag`, or opening pull requests). The project owner reviews and commits all changes personally. Leave work as uncommitted changes in the working tree and summarize what changed.

Read-only git commands (`git status`, `git diff`, `git log`) are fine.

## Project guide

- The product/design/engineering spec is [`docs/THE_BOTTOM_LEFT_PANE_WEBSITE_SPEC.md`](docs/THE_BOTTOM_LEFT_PANE_WEBSITE_SPEC.md). Read it before changing code and implement only the current phase.
- Use npm. Before reporting work as done, run `npm run typecheck`, `npm run lint`, `npm run format:check` and `npm test`.
