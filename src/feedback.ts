import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from './esphomeClient'

export function GetFeedbacksList(client: EsphomeClient): CompanionFeedbackDefinitions {
	const feedbacks: CompanionFeedbackDefinitions = {}

	// Switch state feedback
	const switches = client.getAll('switch')
	if (switches.length > 0) {
		feedbacks['switch.state'] = {
			type: 'boolean',
			name: 'Switch state',
			description: 'Change background color based on switch state',
			options: [
				{
					type: 'dropdown',
					id: 'entity_id',
					label: 'Switch',
					default: switches[0]?.id,
					choices: switches.map((s) => ({ id: s.id, label: s.name })),
				},
				{
					type: 'checkbox',
					id: 'state',
					label: 'State',
					default: true,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				const entity = client.getEntity(feedback.options.entity_id as string, 'switch')
				if (!entity) return false
				return (entity.state?.state || false) === !!feedback.options.state
			},
		}
	}

	// Binary sensor state feedback
	const binarySensors = client.getAll('binary_sensor')
	if (binarySensors.length > 0) {
		feedbacks['binary_sensor.state'] = {
			type: 'boolean',
			name: 'Binary sensor state',
			description: 'Change background color based on sensor state',
			options: [
				{
					type: 'dropdown',
					id: 'entity_id',
					label: 'Sensor',
					default: binarySensors[0]?.id,
					choices: binarySensors.map((s) => ({ id: s.id, label: s.name })),
				},
				{
					type: 'checkbox',
					id: 'state',
					label: 'State',
					default: true,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				const entity = client.getEntity(feedback.options.entity_id as string, 'binary_sensor')
				if (!entity) return false
				return (entity.state?.state || false) === !!feedback.options.state
			},
		}
	}

	return feedbacks
}
