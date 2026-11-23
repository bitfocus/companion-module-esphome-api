import {
	combineRgb,
	type CompanionActionDefinitions,
	type CompanionFeedbackDefinitions,
	type CompanionPresetDefinition,
	type CompanionPresetDefinitions,
	type CompanionPresetSection,
} from '@companion-module/base'
import type { EsphomeWrapper } from '../esphomeWrapper.js'
import type { ModuleSchema } from '../main.js'

export type SimplePreset = Extract<CompanionPresetDefinition<ModuleSchema>, { type: 'simple' }>

export interface AdapterPresets {
	sections: CompanionPresetSection<ModuleSchema>[]
	presets: CompanionPresetDefinitions<ModuleSchema>
}

export function makeSimplePreset(
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

export function makePresetSection(
	id: string,
	name: string,
	presetIds: string[],
): CompanionPresetSection<ModuleSchema>[] {
	if (presetIds.length === 0) return []
	return [
		{
			id,
			name,
			definitions: [
				{
					id: `${id}_group`,
					name,
					type: 'simple',
					presets: presetIds,
				},
			],
		},
	]
}

export interface EntityAdapter<T> {
	is(instance: unknown): instance is T
	createActions(client: EsphomeWrapper): CompanionActionDefinitions
	createFeedbacks(client: EsphomeWrapper): CompanionFeedbackDefinitions
	createPresets?(client: EsphomeWrapper, connLabel: string): AdapterPresets
}
