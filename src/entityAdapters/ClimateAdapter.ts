import { CompanionActionDefinitions, CompanionFeedbackDefinitions, CompanionInputFieldDropdown, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId, PrefixedActionIds } from '../util'
import Climate from '../entities/ClimateEntity'
import { EntityPicker } from '../choices'
import { ClimateMode } from '../proto/api'

export const ClimateAdapter: EntityAdapter<Climate> = {
	is: (instance: unknown): instance is Climate => {
		return instance instanceof Climate
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		client.getAll(ClimateAdapter).forEach((climate) => {
			actions[PrefixedActionIds.ClimateMode + climate.id] = {
				name: `${climate.name}: Set climate mode`,
				options: [ClimateModePicker(climate.supportedModes)],
				callback: (evt): void => {
					if (typeof evt.options.mode === 'number') {
						climate.setMode(evt.options.mode)
					}
				},
			}
		})
		return actions
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(ClimateAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.ClimateMode] = {
				type: 'boolean',
				name: 'Change from climate mode',
				description: 'If the climate mode matches the rule, change style of the bank',
				options: [EntityPicker(entities), ClimateModePicker(AllClimateModes)],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), ClimateAdapter)
					if (entity) {
						return entity.mode === feedback.options.mode
					}
					return false
				},
			}
		}
		return feedbacks
	},
}

const ClimateModeLabels: { [key in ClimateMode]: string } = {
	[ClimateMode.OFF]: 'Off',
	[ClimateMode.HEAT_COOL]: 'Heat/Cool',
	[ClimateMode.COOL]: 'Cool',
	[ClimateMode.HEAT]: 'Heat',
	[ClimateMode.FAN_ONLY]: 'Fan Only',
	[ClimateMode.DRY]: 'Dry',
	[ClimateMode.AUTO]: 'Auto',
} as const

const AllClimateModes: ClimateMode[] = Object.values(ClimateMode).filter((v): v is ClimateMode => typeof v !== 'string')

function ClimateModePicker(supportedModes: ClimateMode[]): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Mode',
		id: 'mode',
		default: supportedModes[0],
		choices: supportedModes.map((mode) => {
			return {
				id: mode,
				label: ClimateModeLabels[mode],
			}
		}),
	}
}
