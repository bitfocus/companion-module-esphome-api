# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Light** feedbacks: brightness percentage comparison (`Change from light brightness (%)`), color temperature (`Light color temperature` value and `Change from light color temperature` boolean with Mireds/Kelvin unit selection), and white/cold-white/warm-white channel percentage value feedbacks.
- **Number** feedback: `Number value` numeric value feedback.
- **Sensor** feedback: `Sensor value` numeric value feedback (respecting `accuracyDecimals`).
- **Cover** feedbacks: position percentage comparison (`Change from cover position (%)`) and tilt percentage (`Cover tilt (%)`) value feedback.
- **Fan** feedbacks: speed level comparison (`Change from fan speed level`) and per-entity preset mode (`Change from fan preset`) boolean feedbacks.
- **Climate** feedbacks: two-point target temperature low/high and current/target humidity value feedbacks, current/target temperature threshold comparison booleans, and per-entity mode (filtered to `supportedModes`), fan mode, preset, and swing mode boolean feedbacks (with migration from legacy `climate_mode`).
- **Text Sensor** feedback: added `Match Type` (`Equals`, `Not Equals`, `Contains`, `Starts With`, `Regex`) to `Change from text sensor value`, with an upgrade script to backfill existing configs.

### Changed

- **Sensor** preset: upgraded to a layered icon preset (`entity.icon`, `deviceClass`, or unit-based MDI icon), appended `unitOfMeasurement` to display preset labels when defined, and added a dynamic percentage gauge for `%` / `battery` / `humidity` / `moisture` sensors.
- **Binary Sensor** preset: upgraded to a layered icon preset with `deviceClass`-aware MDI icons (including active/inactive state pairs) and feedback colors (alert/safety red, opening amber, activity/detection cyan, cold blue, status/power green, connectivity green/red).
- **Lock** presets: upgraded Lock and Unlock to layered icon presets with `LOCKING`/`UNLOCKING` (amber) and `JAMMED` (red alert) feedbacks, and added an **Open** preset for `supportsOpen` locks.
- **Cover** presets: upgraded Open/Close to layered icon presets with `CoverOperation` (`IS_OPENING`/`IS_CLOSING` amber) feedbacks, and added **Stop** (`supportsStop`) and **Position %** (with horizontal gauge) presets.
- **Fan** presets: upgraded Toggle to a layered icon preset (`fan-off`/`fan`), and added **Speed** (with horizontal gauge, speed-level icons, and step-cycling `1..N → Off` when `supportedSpeedCount <= 5`, plus discrete Low/Medium/High or Speed 1..N presets), **Oscillate** (`arrow-oscillating-off`/`arrow-oscillating`), **Direction** (Forward/Reverse), and **Preset Mode** presets.
- **Light** presets: upgraded Toggle (`lightbulb-outline`/`lightbulb-on`) and Color (`palette` with dynamic contrast and color-temperature-to-RGB sync) to layered icon presets, and added **Brightness %** (with horizontal gauge), **Color Temp** (Warm/Neutral/Cool with matching active colors, including `rgbww` cold/warm white lights), and **Effect** presets.
- **Climate** presets: upgraded mode presets to layered icon presets, and added **Status** (live current/target temperature and humidity with `ClimateAction` heating/cooling/drying/fan colors), **Fan Mode**, **Preset**, and **Swing Mode** presets.

### Fixed

- Resolved canonical entity IDs in `EsphomeWrapper` telemetry events so live state updates populate instance variables and refresh per-entity prefixed feedbacks (`ClimateMode`, `ClimateFanMode`, `ClimatePreset`, `ClimateSwingMode`, `FanPreset`, `LightEffect`, `SelectState`).

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
