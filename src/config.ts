import { Regex, SomeCompanionConfigField } from '@companion-module/base'
import { DEFAULT_PORT } from './connection/esphomeSocket'

export interface DeviceConfig {
	host: string
	port?: number
	password?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Host',
			width: 8,
			regex: Regex.SOMETHING,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 4,
			min: 1,
			max: 65535,
			default: DEFAULT_PORT,
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 12,
		},
	]
}
