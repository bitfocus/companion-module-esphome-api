import { CompanionActionDefinitions } from '@companion-module/base'
import { EsphomeClient } from './esphomeClient'

export function GetActionsList(client: EsphomeClient): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {}

	// Get all switch entities
	const switches = client.getAll('switch')
	if (switches.length > 0) {
		actions['switch.set_state'] = {
			name: 'Set switch state',
			options: [
				{
					type: 'dropdown',
					id: 'entity_id',
					label: 'Switch',
					default: switches[0]?.id,
					choices: switches.map((s) => ({ id: s.id, label: s.name })),
				},
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (evt) => {
				const entity = client.getEntity(evt.options.entity_id as string, 'switch')
				if (!entity) return

				let newState: boolean
				switch (evt.options.state) {
					case 'off':
						newState = false
						break
					case 'toggle':
						newState = !(entity.state?.state || false)
						break
					default:
						newState = true
						break
				}

				await client.switchSetState(entity.key, newState)
			},
		}
	}

	return actions
}
