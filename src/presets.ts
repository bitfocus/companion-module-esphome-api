import {
	combineRgb,
	type CompanionPresetDefinitions,
	type CompanionPresetSection,
	type CompanionPresetDefinition,
} from '@companion-module/base'
import { LockCommand, LockState } from 'esphome-client'
import type ESPHomeInstance from './main.js'
import type { ModuleSchema } from './main.js'
import type { EsphomeWrapper } from './esphomeWrapper.js'
import { ActionId, FeedbackId, OnOffToggle, PrefixedActionIds, PrefixedFeedbackIds } from './util.js'
import { entityVariableId } from './variables.js'

const ClimateModeLabels: Record<number, string> = {
	0: 'Off',
	1: 'Heat/Cool',
	2: 'Cool',
	3: 'Heat',
	4: 'Fan Only',
	5: 'Dry',
	6: 'Auto',
}

type SimplePreset = Extract<CompanionPresetDefinition<ModuleSchema>, { type: 'simple' }>

function makeSimplePreset(
	name: string,
	text: string,
	steps: SimplePreset['steps'] = [],
	feedbacks: SimplePreset['feedbacks'] = [],
): SimplePreset {
	return {
		type: 'simple',
		name,
		style: {
			text,
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps,
		feedbacks,
	}
}

export function UpdatePresets(self: ESPHomeInstance, wrapper?: EsphomeWrapper): void {
	if (!wrapper) {
		self.setPresetDefinitions([], {})
		return
	}

	const structure: CompanionPresetSection<ModuleSchema>[] = []
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	const connLabel = self.label || 'esphome'

	const addGroup = (sectionId: string, sectionName: string, presetIds: string[]): void => {
		if (presetIds.length === 0) return
		structure.push({
			id: sectionId,
			name: sectionName,
			definitions: [
				{
					id: `${sectionId}_group`,
					name: sectionName,
					type: 'simple',
					presets: presetIds,
				},
			],
		})
	}

	// Lights
	const lightIds: string[] = []
	for (const entity of wrapper.getEntities('light')) {
		const id = `preset_${entityVariableId(entity.id)}_toggle`
		presets[id] = makeSimplePreset(
			`${entity.name || entity.id} Toggle`,
			entity.name || entity.id,
			[
				{
					down: [{ actionId: ActionId.LightState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
					up: [],
				},
			],
			[
				{
					feedbackId: FeedbackId.LightState,
					options: { entity_id: entity.id, state: true },
					style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				},
			],
		)
		lightIds.push(id)
	}
	addGroup('lights', 'Lights', lightIds)

	// Switches
	const switchIds: string[] = []
	for (const entity of wrapper.getEntities('switch')) {
		const id = `preset_${entityVariableId(entity.id)}_toggle`
		presets[id] = makeSimplePreset(
			`${entity.name || entity.id} Toggle`,
			entity.name || entity.id,
			[
				{
					down: [{ actionId: ActionId.SwitchState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
					up: [],
				},
			],
			[
				{
					feedbackId: FeedbackId.SwitchState,
					options: { entity_id: entity.id, state: true },
					style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				},
			],
		)
		switchIds.push(id)
	}
	addGroup('switches', 'Switches', switchIds)

	// Buttons
	const buttonIds: string[] = []
	for (const entity of wrapper.getEntities('button')) {
		const id = `preset_${entityVariableId(entity.id)}_push`
		presets[id] = makeSimplePreset(`${entity.name || entity.id} Push`, entity.name || entity.id, [
			{ down: [{ actionId: ActionId.ButtonPush, options: { entity_id: entity.id } }], up: [] },
		])
		buttonIds.push(id)
	}
	addGroup('buttons', 'Buttons', buttonIds)

	// Fans
	const fanIds: string[] = []
	for (const entity of wrapper.getEntities('fan')) {
		const id = `preset_${entityVariableId(entity.id)}_toggle`
		presets[id] = makeSimplePreset(
			`${entity.name || entity.id} Toggle`,
			entity.name || entity.id,
			[
				{
					down: [{ actionId: ActionId.FanState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
					up: [],
				},
			],
			[
				{
					feedbackId: FeedbackId.FanState,
					options: { entity_id: entity.id, state: true },
					style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				},
			],
		)
		fanIds.push(id)
	}
	addGroup('fans', 'Fans', fanIds)

	// Covers
	const coverIds: string[] = []
	for (const entity of wrapper.getEntities('cover')) {
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
		coverIds.push(openId, closeId)
	}
	addGroup('covers', 'Covers', coverIds)

	// Locks
	const lockIds: string[] = []
	for (const entity of wrapper.getEntities('lock')) {
		const lockId = `preset_${entityVariableId(entity.id)}_lock`
		presets[lockId] = makeSimplePreset(
			`${entity.name || entity.id} Lock`,
			`${entity.name || entity.id}\nLock`,
			[
				{
					down: [{ actionId: PrefixedActionIds.LockCommand + entity.id, options: { state: LockCommand.LOCK } }],
					up: [],
				},
			],
			[
				{
					feedbackId: FeedbackId.LockState,
					options: { entity_id: entity.id, state: LockState.LOCKED },
					style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				},
			],
		)
		const unlockId = `preset_${entityVariableId(entity.id)}_unlock`
		presets[unlockId] = makeSimplePreset(
			`${entity.name || entity.id} Unlock`,
			`${entity.name || entity.id}\nUnlock`,
			[
				{
					down: [{ actionId: PrefixedActionIds.LockCommand + entity.id, options: { state: LockCommand.UNLOCK } }],
					up: [],
				},
			],
			[
				{
					feedbackId: FeedbackId.LockState,
					options: { entity_id: entity.id, state: LockState.UNLOCKED },
					style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				},
			],
		)
		lockIds.push(lockId, unlockId)
	}
	addGroup('locks', 'Locks', lockIds)

	// Selects
	const selectIds: string[] = []
	for (const entity of wrapper.getEntities('select')) {
		const options = (entity as any).options as string[] | undefined
		for (const option of options ?? []) {
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
			selectIds.push(id)
		}
	}
	addGroup('selects', 'Selects', selectIds)

	// Climate
	const climateIds: string[] = []
	for (const entity of wrapper.getEntities('climate')) {
		const modes = ((entity as any).supportedModes as number[] | undefined) ?? [0]
		for (const mode of modes) {
			const label = ClimateModeLabels[mode] ?? String(mode)
			const id = `preset_${entityVariableId(entity.id)}_mode_${mode}`
			presets[id] = makeSimplePreset(
				`${entity.name || entity.id}: ${label}`,
				`${entity.name || entity.id}\n${label}`,
				[{ down: [{ actionId: PrefixedActionIds.ClimateMode + entity.id, options: { mode } }], up: [] }],
				[
					{
						feedbackId: FeedbackId.ClimateMode,
						options: { entity_id: entity.id, mode },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			climateIds.push(id)
		}
	}
	addGroup('climate', 'Climate', climateIds)

	// Sensors, Binary Sensors, Text Sensors, Numbers (display presets)
	const displayIds: string[] = []
	for (const type of ['sensor', 'binary_sensor', 'text_sensor', 'number'] as const) {
		for (const entity of wrapper.getEntities(type)) {
			const varId = entityVariableId(entity.id)
			const id = `preset_${varId}_display`
			const feedbacks: SimplePreset['feedbacks'] =
				type === 'binary_sensor'
					? [
							{
								feedbackId: FeedbackId.BinarySensorState,
								options: { entity_id: entity.id, state: true },
								style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
							},
						]
					: []
			presets[id] = makeSimplePreset(
				entity.name || entity.id,
				`${entity.name || entity.id}\n$(${connLabel}:${varId})`,
				[],
				feedbacks,
			)
			displayIds.push(id)
		}
	}
	addGroup('sensors', 'Sensors & Values', displayIds)

	self.setPresetDefinitions(structure, presets)
}
