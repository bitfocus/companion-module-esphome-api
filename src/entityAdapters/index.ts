import { BinarySensorAdapter } from './BinarySensorAdapter'
import { ButtonAdapter } from './ButtonAdapter'
import { ClimateAdapter } from './ClimateAdapter'
import { CoverAdapter } from './CoverAdapter'
import { FanAdapter } from './FanAdapter'
import { LightAdapter } from './LightAdapter'
import { LockAdapter } from './LockAdapter'
import { NumberAdapter } from './NumberAdapter'
import { SelectAdapter } from './SelectAdapter'
import { SensorAdapter } from './SensorAdapter'
import { SwitchAdapter } from './SwitchAdapter'
import { TextSensorAdapter } from './TextSensorAdapter'

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
