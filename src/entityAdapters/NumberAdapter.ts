import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { NumberEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'
import { EntityPicker, NumberComparitorPicker, NumberValuePicker, compareNumber } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const NumberAdapter: EntityAdapter<NumberEntity> = {
	entityType: 'number',

	is: (instance: unknown): instance is NumberEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'number'
	},

	getFeedbackIds: (): string[] => [FeedbackId.NumberState],

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const numbers = client.getEntities('number')
		for (const entity of numbers) {
			const numberEntity = entity as unknown as NumberEntity & { id: string }
			const step = numberEntity.step ?? 1
			const minValue = numberEntity.minValue ?? 0
			const maxValue = numberEntity.maxValue ?? 100

			actions[PrefixedActionIds.NumberState + numberEntity.id] = {
				name: `${numberEntity.name || numberEntity.id}: Set number state`,
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'value',
						default: minValue,
						min: minValue,
						max: maxValue,
						step,
						range: true,
					},
				],
				callback: (evt): void => {
					client.command(numberEntity.id, { state: Number(evt.options.value) })
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const numbers = client.getEntities('number')
		if (numbers.length) {
			feedbacks[FeedbackId.NumberState] = {
				type: 'boolean',
				name: 'Change from number state',
				description: 'True when the number state matches the rule',
				options: [EntityPicker(numbers), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.state === undefined) return false
					return compareNumber(feedback.options.value, feedback.options.comparitor, Number(event.state))
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper, connLabel: string): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('number')) {
			const varId = entityVariableId(entity.id)
			const id = `preset_${varId}_display`
			presets[id] = makeSimplePreset(entity.name || entity.id, `${entity.name || entity.id}\n$(${connLabel}:${varId})`)
			ids.push(id)
		}
		return { sections: makePresetSection('numbers', 'Numbers', ids), presets }
	},
}
