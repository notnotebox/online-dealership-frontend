# Frontend Testing

## Stack
- End-to-end tests: Playwright
- Static checks: ESLint

## Install browser locally
```bash
pnpm run test:e2e:install
```

## Run locally
```bash
pnpm run test:e2e
```

This command:
1. builds the Vite app
2. starts a local preview server on `127.0.0.1:4173`
3. runs the Playwright scenarios

## Useful commands
```bash
pnpm run test:e2e:ui
pnpm run test:e2e:report
pnpm run lint
```

## Main reports
- HTML Playwright report:
  - `playwright-report/index.html`
- JUnit XML report:
  - `test-results/junit/e2e-junit.xml`
- Trace / screenshots / raw outputs:
  - `test-results/`

## CI behavior
- Workflow: `.github/workflows/ci.yml`
- Runs:
  - install dependencies
  - install Chromium for Playwright
  - build + Playwright tests
- Uploads artifacts:
  - Playwright HTML report
  - raw test results
  - built `dist/`

## Lint
- Available manually with:
```bash
pnpm run lint
```
- It is intentionally not part of the test workflow for now, because the current UI codebase still contains existing lint debt unrelated to the E2E execution path.

## Notes
- Each local run rewrites the local report folders.
- On GitHub Actions, each workflow run keeps its own artifacts, so reports remain recoverable per run.
