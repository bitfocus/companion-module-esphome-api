import BinarySensor from './BinarySensorEntity'
import Button from './ButtonEntity'
import Climate from './ClimateEntity'
import Cover from './CoverEntity'
import Fan from './FanEntity'
import Light from './LightEntity'
import Lock from './LockEntity'
import NumberEntity from './NumberEntity'
import Select from './SelectEntity'
import Sensor from './SensorEntity'
import Switch from './SwitchEntity'
import TextSensor from './TextSensorEntity'

export type EntityType =
	| BinarySensor
	| Button
	| Climate
	| Cover
	| Fan
	| Light
	| Lock
	| NumberEntity
	| Select
	| Sensor
	| Switch
	| TextSensor

export const Entities = {
	BinarySensor: BinarySensor,
	Button: Button,
	Climate: Climate,
	Cover: Cover,
	Fan: Fan,
	Light: Light,
	Lock: Lock,
	Number: NumberEntity,
	Select: Select,
	Sensor: Sensor,
	Switch: Switch,
	TextSensor: TextSensor,
} as const
