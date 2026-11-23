# ESPHome

Control and monitor ESPHome devices over the Native API with Noise encryption.

## Minimum ESPHome Version

`2026.1` is the minimum required ESPHome version, as that version fully deprecated plaintext password auth in favor of Noise Encryption. Due to this, password auth is no longer enabled in any way, and an encryption key is required for all communications.

## Configuration

- **Host**: Hostname or IP address of the ESPHome device.
- **Port**: Native API port (default `6053`).
- **Encryption Key**: Base64 Noise pre-shared key (PSK) configured under `api: encryption: key:` in your ESPHome YAML.

## Available Actions

Actions for entities with device-specific ranges, options, or capabilities are generated per entity based on what the device advertises.

- **Button**: Push button
- **Climate**: Set climate mode, Set target temperature, Set target temperature range (low/high), Set fan mode, Set preset, Set swing mode, Set target humidity
- **Cover**: Set cover position, Stop cover, Set cover tilt
- **Fan**: Set fan state, Set fan speed, Set fan preset, Set fan oscillation, Set fan direction
- **Light**: Set light state, Set light brightness (%), Set light color, Set light color (RGB), Set light color temperature (mireds), Set light white level (%), Set light cold/warm white (%), Set light effect
- **Lock**: Set lock state (with optional PIN code when required)
- **Number**: Set number state
- **Select**: Set select state
- **Switch**: Set switch state

## Available Feedbacks

- **Binary Sensor**: Change from binary sensor state
- **Climate**: Change from climate mode, Change from climate action, Climate current temperature (value), Climate target temperature (value)
- **Cover**: Change from cover open, Change from cover operation, Cover position (%) (value)
- **Fan**: Change from fan state, Fan speed level (value), Change from fan oscillation, Change from fan direction
- **Light**: Change from light state, Light brightness value (%) (value), Change from light color, Light color value (value), Light contrast text color (value), Change from light effect
- **Lock**: Change from lock state
- **Number**: Change from number state
- **Select**: Change from select state
- **Sensor**: Change from sensor state
- **Switch**: Change from switch state
- **Text Sensor**: Change from text sensor value

## Variables & Presets

- **Variables**: Each entity exposes a dynamic variable for its current state or value.
- **Presets**: Button presets with live state/value feedbacks are automatically generated for discovered entities.
