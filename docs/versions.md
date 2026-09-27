# Updating Versions of Java and/or node

## Updating the Java version

When updating the version of Java used, the following places need to be adjusted:

* `pom.xml` file (`<java.version>`; also check that the versions of `jacoco-maven-plugin` and
  `pitest-maven` support the new Java version, since both read compiled class files)
* `.java-version` file (used by the Github Actions workflows in `ucsb-cs156/workflows`)
* `system.properties` file (`java.runtime.version`, used by the Heroku/Dokku Java buildpack)
* `Dockerfile` used for deploying on Dokku (the `openjdk-NN-jdk` package and the `JAVA_HOME` path)
* `docs/installation.md` (names the Java version in step 1)

## Updating the node version

Places that name the node version in this repo:

* `engines` section in `frontend/package.json` (also used by Github Actions: the shared workflows in
  `ucsb-cs156/workflows` and the Chromatic workflows call `actions/setup-node` with
  `node-version-file: frontend/package.json`, so no workflow edit is needed)
* `frontend/.nvmrc` (used by developers running `nvm use`; keep in sync with `engines`)
* `pom.xml`: the `app.frontend.nodeVersion` property, referenced by the two `frontend-maven-plugin`
  configurations (`integration` and `production` profiles)
* `Dockerfile`: the `ENV NODE_VERSION=...` line (unlike some sibling repos, this Dockerfile installs
  node itself via nvm rather than through `frontend-maven-plugin`)

npm 11 (bundled with node 24) warns about dependency install scripts not covered by `allowScripts`;
review them, then `npm install-scripts approve --all` in `frontend/` and commit the resulting
`allowScripts` block in `package.json` (here: `@swc/core`, `esbuild`, `fsevents`, `msw`).

Then check `grep -rIn "<old version>" --exclude-dir=node_modules --exclude-dir=target .` for anything else.

After changing the version, if a local `mvn` build fails in `npm ci` with
`Class extends value undefined is not a constructor or null`, delete `target/node` and
`target/node_modules` (stale npm from the previous node version left in the plugin's install dir).

### Updating frontend dependencies

Notes from the modernization to the org baseline
([issue #342](https://github.com/ucsb-cs156/proj-happycows/issues/342), done ahead of the Node 24
LTS bump, [issue #341](https://github.com/ucsb-cs156/proj-happycows/issues/341)); the template was
proj-courses ([issue 355](https://github.com/ucsb-cs156/proj-courses/issues/355) /
[PR 356](https://github.com/ucsb-cs156/proj-courses/pull/356)), whose `docs/versions.md` has the
full checklist. Findings specific to this repo:

* npm 10 (bundled with node 22) can crash with `Cannot read properties of null (reading 'edgesOut')`
  while resolving the new dependency tree from scratch. Workaround: generate the lockfile with
  npm 11 (`npx -y npm@11 install`) while still on node 22; `npm ci` with npm 10 then works fine.
* jsdom 30 pulls in `@asamuzakjp/css-color@7`, whose `engines` wants node `^22.22.2 || ^24.15.0`.
  On the exact `v22.18.0` previously pinned in `pom.xml`, `npm ci` printed an `EBADENGINE` *warning*
  (installed and worked anyway); resolved by the Node 24 bump (#341).
* jsdom 30 computes styles that jsdom 16 reported as declared: `rem`/`vh` resolve to `px`
  (1rem = 16px; viewport is 1024x768, so 50vh = 384px), color keywords resolve to `rgb(...)`, and
  `font-weight: bold` computes to `700` — but `border-radius` keeps its declared value. Several
  `toHaveStyle` assertions needed their expected strings updated to the computed forms.
* vitest 4's AST-aware V8 coverage counts implicit-else branches that vitest 3 missed; two
  previously "covered" files dropped below 100% branches (an unreachable guard in
  `CountHistogram.jsx`, since removed, and the `if (gameId)` effect in `PlayPage.jsx`, which got a
  new test).
* The `DashboardPageStories` tests render all eight dashboard sections at once and can exceed the
  default 5s test timeout under full-suite or Stryker-dry-run CPU load; they carry an explicit
  `{ timeout: 20000 }`.
* recharts 3 animation: not an issue here — `TimeSeries.jsx` already renders `Line` with
  `isAnimationActive={false}`, so chart tests are deterministic.
* Held back on purpose (same reasons as proj-courses):
  * `vitest`/`@vitest/coverage-v8` stay on 4.x (with vitest 5, Stryker maps no tests to mutants and
    every mutant silently survives).
  * `eslint`/`@eslint/js` stay on 9.x (`eslint-plugin-react` 7.37.5, still the latest, crashes on
    ESLint 10 and its peer range caps at eslint 9).
  * `react`/`react-dom` stay on 18 and `react-query` on 3 (react-query 3 has no React 19 support;
    it is also the source of the remaining `inflight`/`rimraf@3`/`glob@7` deprecation warnings).
  * `react-router` stays on 7 (v8 shipped after the proj-courses baseline; migrating is separate work).
  * `react-table` stays on the unmaintained 7.x: migrating `OurTable.jsx`/`PagedJobsTable.jsx` to
    `@tanstack/react-table` changes the column API (`Header`/`accessor` → `header`/`accessorKey`)
    used by every table in `src/main`, so it is deferred as its own migration.
* Stryker 10's new `CallExpression` mutator is excluded in `stryker.config.mjs` (alongside `Regex`),
  keeping the same strictness as Stryker 9. Re-enabling it needs new tests for bare call statements.
* eslint-plugin-react-hooks 7: this repo needed `react-hooks/purity` and `react-hooks/immutability`
  turned off in addition to the two rules proj-courses disabled (`set-state-in-effect`,
  `incompatible-library`).
