import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { CoverEntity, CoverOperation } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { ActionId, PrefixedActionIds, FeedbackId } from '../util.js'
import { EntityPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const CoverAdapter: EntityAdapter<CoverEntity> = {
	is: (instance: unknown): instance is CoverEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'cover'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const covers = client.getEntities('cover')
		const stopCovers = covers.filter((c) => Boolean((c as unknown as CoverEntity).supportsStop))
		const tiltCovers = covers.filter((c) => Boolean((c as unknown as CoverEntity).supportsTilt))

		for (const coverEntity of covers) {
			actions[PrefixedActionIds.CoverPosition + coverEntity.id] = {
				name: `${coverEntity.name || coverEntity.id}: Set cover position`,
				options: [
					{
						type: 'number',
						label: 'Position (0=Closed, 1=Open)',
						id: 'value',
						default: 0,
						min: 0,
						max: 1,
						step: 0.01,
						range: true,
					},
				],
				callback: (evt): void => {
					client.command(coverEntity.id, { position: Number(evt.options.value) })
				},
			}
		}

		if (stopCovers.length) {
			actions[ActionId.CoverStop] = {
				name: 'Stop cover',
				options: [EntityPicker(stopCovers)],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, { stop: true })
				},
			}
		}

		if (tiltCovers.length) {
			actions[ActionId.CoverTilt] = {
				name: 'Set cover tilt',
				options: [
					EntityPicker(tiltCovers),
					{
						type: 'number',
						label: 'Tilt (0=Closed, 1=Open)',
						id: 'tilt',
						default: 0,
						min: 0,
						max: 1,
						step: 0.01,
						range: true,
					},
				],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, { tilt: Number(evt.options.tilt) })
				},
			}
		}

		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const covers = client.getEntities('cover')
		if (covers.length) {
			feedbacks[FeedbackId.CoverOpen] = {
				type: 'boolean',
				name: 'Change from cover open',
				description: 'True when the cover open state matches the rule',
				options: [
					EntityPicker(covers),
					{
						type: 'checkbox',
						label: 'Open',
						id: 'open',
						default: true,
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const isOpen = event.position !== undefined ? event.position > 0 : Boolean(event.isOpen)
					return isOpen === Boolean(feedback.options.open)
				},
			}

			feedbacks[FeedbackId.CoverPosition] = {
				type: 'value',
				name: 'Cover position (%)',
				description: 'Outputs the current cover position percentage (0-100)',
				options: [EntityPicker(covers)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return 0
					return Math.round(Math.min(1, Math.max(0, Number(event.position ?? 0))) * 100)
				},
			}

			feedbacks[FeedbackId.CoverOperation] = {
				type: 'boolean',
				name: 'Change from cover operation',
				description: 'True when the cover current operation matches the selected state',
				options: [
					EntityPicker(covers),
					{
						type: 'dropdown',
						label: 'Operation',
						id: 'operation',
						default: CoverOperation.IDLE,
						choices: [
							{ id: CoverOperation.IDLE, label: 'Idle' },
							{ id: CoverOperation.IS_OPENING, label: 'Opening' },
							{ id: CoverOperation.IS_CLOSING, label: 'Closing' },
						],
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return (event.currentOperation ?? CoverOperation.IDLE) === feedback.options.operation
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('cover')) {
			const openId = `preset_${entityVariableId(entity.id)}_open`
			presets[openId] = makeSimplePreset(
				`${entity.name || entity.id} Open`,
				`${entity.name || entity.id}\nOpen`,
				[{ down: [{ actionId: PrefixedActionIds.CoverPosition + entity.id, options: { value: 1 } }], up: [] }],
				[
					{
						feedbackId: FeedbackId.CoverOpen,
						options: { entity_id: entity.id, open: true },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			const closeId = `preset_${entityVariableId(entity.id)}_close`
			presets[closeId] = makeSimplePreset(
				`${entity.name || entity.id} Close`,
				`${entity.name || entity.id}\nClose`,
				[{ down: [{ actionId: PrefixedActionIds.CoverPosition + entity.id, options: { value: 0 } }], up: [] }],
				[
					{
						feedbackId: FeedbackId.CoverOpen,
						options: { entity_id: entity.id, open: false },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			ids.push(openId, closeId)
		}
		return { sections: makePresetSection('covers', 'Covers', ids), presets }
	},
}
