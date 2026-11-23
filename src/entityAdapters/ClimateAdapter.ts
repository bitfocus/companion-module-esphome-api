import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { ClimateEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId, PrefixedActionIds } from '../util.js'
import { AllClimateModes, ClimateMode, ClimateModeLabels, ClimateModePicker, EntityPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const ClimateAdapter: EntityAdapter<ClimateEntity> = {
	is: (instance: unknown): instance is ClimateEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'climate'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const climates = client.getEntities('climate')
		for (const entity of climates) {
			const climateEntity = entity as unknown as ClimateEntity & { id: string }
			const supportedModes =
				climateEntity.supportedModes && climateEntity.supportedModes.length
					? [...climateEntity.supportedModes]
					: AllClimateModes

			actions[PrefixedActionIds.ClimateMode + climateEntity.id] = {
				name: `${climateEntity.name || climateEntity.id}: Set climate mode`,
				options: [ClimateModePicker(supportedModes)],
				callback: (evt): void => {
					client.command(climateEntity.id, { mode: Number(evt.options.mode) })
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const climates = client.getEntities('climate')
		if (climates.length) {
			feedbacks[FeedbackId.ClimateMode] = {
				type: 'boolean',
				name: 'Change from climate mode',
				description: 'True when the climate mode matches the rule',
				options: [EntityPicker(climates), ClimateModePicker(AllClimateModes)],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const currentMode = event.mode ?? ClimateMode.Off
					return currentMode === feedback.options.mode
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('climate')) {
			const climateEntity = entity as unknown as ClimateEntity & { id: string }
			const modes =
				climateEntity.supportedModes && climateEntity.supportedModes.length
					? [...climateEntity.supportedModes]
					: [ClimateMode.Off]
			for (const mode of modes) {
				const label = ClimateModeLabels[mode] ?? String(mode)
				const id = `preset_${entityVariableId(climateEntity.id)}_mode_${mode}`
				presets[id] = makeSimplePreset(
					`${climateEntity.name || climateEntity.id}: ${label}`,
					`${climateEntity.name || climateEntity.id}\n${label}`,
					[{ down: [{ actionId: PrefixedActionIds.ClimateMode + climateEntity.id, options: { mode } }], up: [] }],
					[
						{
							feedbackId: FeedbackId.ClimateMode,
							options: { entity_id: climateEntity.id, mode },
							style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
						},
					],
				)
				ids.push(id)
			}
		}
		return { sections: makePresetSection('climate', 'Climate', ids), presets }
	},
}
