import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SelectEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'
import { entityVariableId } from '../variables.js'

export const SelectAdapter: EntityAdapter<SelectEntity> = {
	is: (instance: unknown): instance is SelectEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'select'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const selects = client.getEntities('select')
		for (const entity of selects) {
			const selectEntity = entity as unknown as SelectEntity & { id: string }
			const options = selectEntity.options ?? []
			const optionChoices = options.map((o) => ({ id: o, label: o }))

			actions[PrefixedActionIds.SelectState + selectEntity.id] = {
				name: `${selectEntity.name || selectEntity.id}: Set select state`,
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: options[0] ?? '',
						choices: optionChoices,
					},
				],
				callback: (evt): void => {
					client.command(selectEntity.id, { state: evt.options.state })
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const selects = client.getEntities('select')
		for (const entity of selects) {
			const selectEntity = entity as unknown as SelectEntity & { id: string }
			const options = selectEntity.options ?? []
			const optionChoices = options.map((o) => ({ id: o, label: o }))

			feedbacks[PrefixedFeedbackIds.SelectState + selectEntity.id] = {
				type: 'boolean',
				name: `${selectEntity.name || selectEntity.id}: Change from select state`,
				description: 'True when the select state matches the rule',
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: options[0] ?? '',
						choices: optionChoices,
					},
				],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(selectEntity.id)
					if (!event) return false
					return event.state === feedback.options.state
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('select')) {
			const options = (entity as unknown as SelectEntity).options ?? []
			for (const option of options) {
				const safeOpt = option.replace(/[^a-zA-Z0-9_]/g, '_')
				const id = `preset_${entityVariableId(entity.id)}_${safeOpt}`
				presets[id] = makeSimplePreset(
					`${entity.name || entity.id}: ${option}`,
					`${entity.name || entity.id}\n${option}`,
					[{ down: [{ actionId: PrefixedActionIds.SelectState + entity.id, options: { state: option } }], up: [] }],
					[
						{
							feedbackId: PrefixedFeedbackIds.SelectState + entity.id,
							options: { state: option },
							style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
						},
					],
				)
				ids.push(id)
			}
		}
		return { sections: makePresetSection('selects', 'Selects', ids), presets }
	},
}
