# companion-module-esphome-api

Bitfocus Companion module for controlling and monitoring [ESPHome][esphome] devices over the Native API with Noise encryption.

See [HELP.md](./companion/HELP.md) for usage and supported entities, [CHANGELOG.md](./CHANGELOG.md) for release notes, and [LICENSE](./LICENSE).

## Requirements

- **ESPHome**: `2026.1` or newer with Noise API encryption enabled (`api: encryption: key:`)
- **Node.js**: `^26.5`
- **Yarn**: `4.x` (via Corepack)

## Development

Install dependencies:

```bash
yarn install
```

Build the module (`dist/`):

```bash
yarn build
```

Watch and recompile on changes:

```bash
yarn build:watch
```

Run ESLint / Prettier checks or format files:

```bash
yarn lint
yarn format
```

Create a distributable module package (`.tgz`):

```bash
yarn package
```

### Pre-commit checks

Husky and `lint-staged` run automatically on `git commit` for staged files:

- `*.md`: runs `prettier --write` and `markdownlint-cli2` (configured via `.markdownlint.json`)
- `*.{css,json,scss}`: runs `prettier --write`
- `*.{ts,tsx,js,jsx}`: runs `yarn lint:raw --fix` (ESLint + Prettier)

### Upgrade Scripts

Companion config/action/feedback migrations live in `src/upgrades/` as numbered, single-purpose files (`NNNN_<description>.ts`) exported in order from `src/upgrades/index.ts`:

- Export each script as `upgradeNNNN_<camelCaseName>` (matching its file prefix).
- **Append-only**: Companion tracks which upgrade scripts have run per connection by array index in `UpgradeScripts`. Never reorder, remove, or insert before existing entries—always append new scripts to the end.

### Icons

Preset icons are pre-rendered at build time (`node scripts/generate-icons.mjs`) from [Material Design Icons][mdi] (`@iconify-json/mdi`, Apache-2.0) into `src/generated/icons.ts`.

[esphome]: https://esphome.io
[mdi]: https://pictogrammers.com/library/mdi/
