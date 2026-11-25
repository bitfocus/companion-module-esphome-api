import { BinarySensorAdapter } from './BinarySensorAdapter.js'
import { ButtonAdapter } from './ButtonAdapter.js'
import { ClimateAdapter } from './ClimateAdapter.js'
import { CoverAdapter } from './CoverAdapter.js'
import { FanAdapter } from './FanAdapter.js'
import { LightAdapter } from './LightAdapter.js'
import { LockAdapter } from './LockAdapter.js'
import { NumberAdapter } from './NumberAdapter.js'
import { SelectAdapter } from './SelectAdapter.js'
import { SensorAdapter } from './SensorAdapter.js'
import { SwitchAdapter } from './SwitchAdapter.js'
import { TextSensorAdapter } from './TextSensorAdapter.js'

export const EntityAdapters = {
	BinarySensor: BinarySensorAdapter,
	Button: ButtonAdapter,
	Climate: ClimateAdapter,
	Cover: CoverAdapter,
	Fan: FanAdapter,
	Light: LightAdapter,
	Lock: LockAdapter,
	Number: NumberAdapter,
	Select: SelectAdapter,
	Sensor: SensorAdapter,
	Switch: SwitchAdapter,
	TextSensor: TextSensorAdapter,
} as const
