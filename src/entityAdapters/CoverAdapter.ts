import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { CoverEntity, CoverOperation } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makeLayeredFeedback, makeLayeredIconPreset, makePresetSection } from './base.js'
import { ActionId, PrefixedActionIds, FeedbackId } from '../util.js'
import { EntityPicker, NumberComparitorPicker, NumberValuePicker, compareNumber } from '../choices.js'
import { entityVariableId } from '../variables.js'

const COVER_DEVICE_CLASS_ICONS: Record<string, { open: string; close: string }> = {
	awning: { open: 'awning', close: 'awning-outline' },
	curtain: { open: 'curtains', close: 'curtains-closed' },
	door: { open: 'door-open', close: 'door-closed' },
	garage: { open: 'garage-open', close: 'garage' },
	gate: { open: 'gate-open', close: 'gate' },
	shade: { open: 'roller-shade', close: 'roller-shade-closed' },
	shutter: { open: 'window-shutter-open', close: 'window-shutter' },
	window: { open: 'window-open', close: 'window-closed' },
}

export const CoverAdapter: EntityAdapter<CoverEntity> = {
	entityType: 'cover',

	is: (instance: unknown): instance is CoverEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'cover'
	},

	getFeedbackIds: (): string[] => [
		FeedbackId.CoverOpen,
		FeedbackId.CoverPosition,
		FeedbackId.CoverPositionCompare,
		FeedbackId.CoverTilt,
		FeedbackId.CoverOperation,
	],

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

			feedbacks[FeedbackId.CoverPositionCompare] = {
				type: 'boolean',
				name: 'Change from cover position (%)',
				description: 'True when the cover position percentage (0-100) matches the rule',
				options: [EntityPicker(covers), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.position === undefined) return false
					const pct = Math.round(Math.min(1, Math.max(0, Number(event.position))) * 100)
					return compareNumber(feedback.options.value, feedback.options.comparitor, pct)
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
		const tiltCovers = covers.filter((c) => Boolean((c as unknown as CoverEntity).supportsTilt))
		if (tiltCovers.length) {
			feedbacks[FeedbackId.CoverTilt] = {
				type: 'value',
				name: 'Cover tilt (%)',
				description: 'Outputs the current cover tilt percentage (0-100)',
				options: [EntityPicker(tiltCovers)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.tilt === undefined) return 0
					return Math.round(Math.min(1, Math.max(0, Number(event.tilt))) * 100)
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('cover')) {
			const coverEntity = entity as unknown as CoverEntity & { id: string }
			const label = coverEntity.name || coverEntity.id
			const varId = entityVariableId(coverEntity.id)

			const { open: openIcon, close: closeIcon } = (coverEntity.deviceClass &&
				COVER_DEVICE_CLASS_ICONS[coverEntity.deviceClass]) || {
				open: 'blinds-open',
				close: 'blinds',
			}

			const openId = `preset_${varId}_open`
			presets[openId] = makeLayeredIconPreset({
				name: `${label} Open`,
				text: `${label}\nOpen`,
				icon: openIcon,
				steps: [
					{ down: [{ actionId: PrefixedActionIds.CoverPosition + coverEntity.id, options: { value: 1 } }], up: [] },
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOpen,
						options: { entity_id: coverEntity.id, open: true },
						bgcolor: combineRgb(0, 255, 0),
						icon: openIcon,
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOperation,
						options: { entity_id: coverEntity.id, operation: CoverOperation.IS_OPENING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'arrow-up',
					}),
				],
			})

			const closeId = `preset_${varId}_close`
			presets[closeId] = makeLayeredIconPreset({
				name: `${label} Close`,
				text: `${label}\nClose`,
				icon: closeIcon,
				steps: [
					{ down: [{ actionId: PrefixedActionIds.CoverPosition + coverEntity.id, options: { value: 0 } }], up: [] },
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOpen,
						options: { entity_id: coverEntity.id, open: false },
						bgcolor: combineRgb(0, 255, 0),
						icon: closeIcon,
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOperation,
						options: { entity_id: coverEntity.id, operation: CoverOperation.IS_CLOSING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'arrow-down',
					}),
				],
			})
			ids.push(openId, closeId)

			if (coverEntity.supportsStop) {
				const stopId = `preset_${varId}_stop`
				presets[stopId] = makeLayeredIconPreset({
					name: `${label} Stop`,
					text: `${label}\nStop`,
					icon: 'stop',
					steps: [{ down: [{ actionId: ActionId.CoverStop, options: { entity_id: coverEntity.id } }], up: [] }],
					feedbacks: [
						makeLayeredFeedback({
							feedbackId: FeedbackId.CoverOperation,
							options: { entity_id: coverEntity.id, operation: CoverOperation.IS_OPENING },
							bgcolor: combineRgb(255, 191, 0),
							icon: 'stop',
						}),
						makeLayeredFeedback({
							feedbackId: FeedbackId.CoverOperation,
							options: { entity_id: coverEntity.id, operation: CoverOperation.IS_CLOSING },
							bgcolor: combineRgb(255, 191, 0),
							icon: 'stop',
						}),
					],
				})
				ids.push(stopId)
			}

			const posId = `preset_${varId}_position`
			presets[posId] = makeLayeredIconPreset({
				name: `${label} Position`,
				text: `${label}\n$(local:cover_position)%`,
				icon: openIcon,
				gauge: {
					value: { isExpression: true, value: '$(local:cover_position)' },
					min: 0,
					max: 100,
				},
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOperation,
						options: { entity_id: coverEntity.id, operation: CoverOperation.IS_OPENING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'arrow-up',
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.CoverOperation,
						options: { entity_id: coverEntity.id, operation: CoverOperation.IS_CLOSING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'arrow-down',
					}),
				],
				localVariables: [
					{
						variableType: 'feedback',
						variableName: 'cover_position',
						feedbackId: FeedbackId.CoverPosition,
						options: { entity_id: coverEntity.id },
					},
				],
			})
			ids.push(posId)
		}
		return { sections: makePresetSection('covers', 'Covers', ids), presets }
	},
}
