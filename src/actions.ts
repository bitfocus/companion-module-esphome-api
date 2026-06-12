import { CompanionActionDefinitions } from '@companion-module/base'
import { EsphomeClient } from './esphomeClient'
import { ActionId } from './util'

export function GetActionsList(client: EsphomeClient): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {}

	// Get all switch entities
	const switches = client.getAll('switch')
	if (switches.length > 0) {
		actions[ActionId.SwitchState] = {
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
				console.log(`[ESPHome] Switch action triggered: entity_id=${evt.options.entity_id}, state=${evt.options.state}`)
				const entity = client.getEntity(evt.options.entity_id as string, 'switch')
				console.log(`[ESPHome] Found entity: ${entity ? `key=${entity.key}, name=${entity.name}` : 'NOT FOUND'}`)
				if (!entity) {
					console.log(`[ESPHome] Available switches:`, client.getAll('switch').map(s => ({id: s.id, name: s.name, key: s.key})))
					return
				}

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

				console.log(`[ESPHome] Setting switch ${entity.name} (id=${entity.id}, key=${entity.key}) to ${newState}`)
				await client.switchSetState(entity.id, newState)
			},
		}
	}

	return actions
}
