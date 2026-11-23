export enum ActionId {
	ButtonPush = 'button_push',
	FanState = 'fan_state',
	LightState = 'light_state',
	LightBrightness = 'light_brightness',
	SwitchState = 'switch_state',
	LightColorRGB = 'light_color_rgb',
	LightColor = 'light_color',
	LightColorTemp = 'light_color_temp',
	LightWhite = 'light_white',
	LightColdWarmWhite = 'light_cold_warm_white',
}

export enum PrefixedActionIds {
	ClimateMode = 'climate_mode_id_',
	CoverPosition = 'cover_position_id_',
	LightEffect = 'light_effect_id_',
	LockCommand = 'lock_command_id_',
	NumberState = 'number_state_id_',
	SelectState = 'select_state_id_',
}

export enum FeedbackId {
	BinarySensorState = 'binary_sensor_state',
	ClimateMode = 'climate_mode',
	CoverOpen = 'cover_open',
	FanState = 'fan_state',
	LightState = 'light_on_state',
	LightBrightness = 'light_brightness',
	LightColor = 'light_color',
	LightColorSync = 'light_color_sync',
	LightContrastColor = 'light_contrast_color',
	LockState = 'lock_state',
	NumberState = 'number_state',
	SensorState = 'sensor_state',
	SwitchState = 'switch_state',
	TextSensorValue = 'text_sensor_value',
}

export enum PrefixedFeedbackIds {
	LightEffect = 'light_effect_id_',
	SelectState = 'select_state_id_',
}

export enum OnOffToggle {
	On = 'on',
	Off = 'off',
	Toggle = 'toggle',
}
