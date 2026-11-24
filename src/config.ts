import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
const DEFAULT_PORT = 6053

export type ModuleConfig = {
	host: string
	port?: number
}

export type ModuleSecrets = {
	psk?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
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
			type: 'secret-text',
			id: 'psk',
			label: 'Encryption Key',
			width: 12,
		},
	]
}
