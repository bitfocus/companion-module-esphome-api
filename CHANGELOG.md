# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Light** feedbacks: brightness percentage comparison (`Change from light brightness (%)`), color temperature (`Light color temperature` value and `Change from light color temperature` boolean with Mireds/Kelvin unit selection), and white/cold-white/warm-white channel percentage value feedbacks.

## [3.0.0] - 2026-11-25

### Added

- Noise PSK encryption support (`ESPHome 2026.1+`) via `esphome-client` (`^2`), with the encryption key stored in Companion `secret-text` secrets.
- Dynamic per-entity state variables and auto-generated button presets across entity adapters.
- Capability-gated actions and boolean/value feedbacks:
  - **Climate**: target temperature, target temperature range (low/high), fan mode, preset, swing mode, target humidity, action feedback, and current/target temperature value feedbacks.
  - **Cover**: stop, tilt, position (%) value feedback, and operation boolean feedback.
  - **Fan**: speed levels, oscillation, direction, presets, and corresponding feedbacks.
  - **Light**: colorpicker (`Set light color`), RGB, color temperature (mireds), white level, cold/warm white, effects, transition length, brightness value, color, contrast text color, and color-sync presets.
  - **Lock**: PIN code support when `requiresCode` is enabled, plus human-readable lock state labels.
- Upgrade scripts in `src/upgrades.ts` to backfill light `transition` options and migrate v2 bare `objectId` references to `{type}-{objectId}`.
- Capped exponential backoff retry (`5s` to `60s`) on initial connection failures, skipping retries on `PermanentError`.

### Changed

- Migrated to `@companion-module/base` (`~2.1.3`), ESM (`dist/index.js`), Node `26` (`^26.5`), and Yarn `4.18.1`.
- Updated host config validation from `Regex.IP` to `Regex.HOSTNAME` (`Target Host / IP`) and clamped `psk` field width to `12`.
- Scoped `'state'` telemetry updates to refresh only the changed entity's variable and check only that entity's feedback IDs.
- Updated `companion/HELP.md` for v3 configuration, actions, feedbacks, variables, and presets.

### Removed

- Plaintext password authentication (deprecated in ESPHome `2026.1`).
- Custom protobuf/socket implementation, unused `@protobuf-ts/*` and `corepack` dependencies, and legacy `.eslintrc.js`.

## [2.0.1] - 2026-11-24

### Changed

- Updated runtime to Node 26, `@companion-module/base` to `~1.15.1`, and `@companion-module/tools` to `^2.9.1`.

## [2.0.0] - 2022-12-05

### Added

- Initial Companion v3 (`@companion-module/base`) release supporting ESPHome native API entity discovery, actions, and feedbacks over TCP with optional password authentication.

[Unreleased]: https://github.com/bitfocus/companion-module-esphome-api/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/bitfocus/companion-module-esphome-api/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/bitfocus/companion-module-esphome-api/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/bitfocus/companion-module-esphome-api/releases/tag/v2.0.0
