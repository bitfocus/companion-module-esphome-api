import {
	combineRgb,
	type ButtonGraphicsGaugeStop,
	type CompanionActionDefinitions,
	type CompanionFeedbackDefinitions,
	type CompanionPresetDefinition,
	type CompanionPresetDefinitions,
	type CompanionPresetFeedbackStyleOverride,
	type CompanionPresetSection,
	type ExpressionOrValue,
} from '@companion-module/base'
import { getMdiIconPng64, type IconVariant } from '../icons.js'
import { isBrightRgbNumber } from '../util.js'
import type { EsphomeWrapper } from '../esphomeWrapper.js'
import type { ModuleSchema } from '../main.js'

// ============================================================================
// Preset Types
// ============================================================================

export type SimplePreset = Extract<CompanionPresetDefinition<ModuleSchema>, { type: 'simple' }>
export type LayeredPreset = Extract<CompanionPresetDefinition<ModuleSchema>, { type: 'layered' }>
export type LayeredFeedback = LayeredPreset['feedbacks'][number]

export interface AdapterPresets {
	sections: CompanionPresetSection<ModuleSchema>[]
	presets: CompanionPresetDefinitions<ModuleSchema>
}

// ============================================================================
// Simple Presets
// ============================================================================

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

// ============================================================================
// Layered Icon Presets
// ============================================================================

export interface LayeredIconGaugeOptions {
	value: number | ExpressionOrValue<number>
	min?: number
	max?: number
	stops?: ButtonGraphicsGaugeStop[]
}

export interface LayeredIconPresetOptions {
	name: string
	text: string | ExpressionOrValue<string>
	icon?: string
	iconVariant?: IconVariant
	iconSize?: number
	bgcolor?: number | ExpressionOrValue<number>
	textColor?: number | ExpressionOrValue<number>
	gauge?: LayeredIconGaugeOptions
	steps?: LayeredPreset['steps']
	feedbacks?: LayeredPreset['feedbacks']
	localVariables?: LayeredPreset['localVariables']
}

export function makeLayeredIconPreset({
	name,
	text,
	icon,
	iconVariant = 'light',
	iconSize = 32,
	bgcolor = combineRgb(0, 0, 0),
	textColor = combineRgb(255, 255, 255),
	gauge,
	steps = [],
	feedbacks = [],
	localVariables,
}: LayeredIconPresetOptions): LayeredPreset {
	const png64 = getMdiIconPng64(icon, iconVariant)
	const elements: LayeredPreset['elements'] = [
		{
			type: 'box',
			id: 'bg',
			name: 'Background',
			color: bgcolor,
		},
	]

	if (png64) {
		const iconWidth = Math.min(80, Math.max(20, Math.round((iconSize / 72) * 100)))
		const iconHeight = gauge ? 38 : 42
		elements.push(
			{
				type: 'image',
				id: 'icon',
				name: 'Icon',
				base64Image: png64,
				x: Math.round((100 - iconWidth) / 2),
				y: 6,
				width: iconWidth,
				height: iconHeight,
				halign: 'center',
				valign: 'center',
				fillMode: 'fit',
			},
			{
				type: 'text',
				id: 'label',
				name: 'Label',
				text,
				color: textColor,
				x: 4,
				y: gauge ? 44 : 48,
				width: 92,
				height: gauge ? 38 : 48,
				halign: 'center',
				valign: 'center',
				fontsizeAllowShrink: true,
			},
		)
	} else {
		elements.push({
			type: 'text',
			id: 'label',
			name: 'Label',
			text,
			color: textColor,
			x: 4,
			y: 4,
			width: 92,
			height: gauge ? 78 : 92,
			halign: 'center',
			valign: 'center',
			fontsizeAllowShrink: true,
		})
	}

	if (gauge) {
		elements.push(
			{
				type: 'box',
				id: 'gauge_track',
				name: 'Gauge Track',
				x: 9,
				y: 83,
				width: 82,
				height: 10,
				color: combineRgb(20, 20, 20),
				borderWidth: 1,
				borderColor: combineRgb(100, 100, 100),
				borderPosition: 'inside',
				cornerRadius: 4,
			},
			{
				type: 'gauge',
				id: 'gauge',
				name: 'Gauge',
				orientation: 'horizontal',
				x: 10,
				y: 84,
				width: 80,
				height: 8,
				min: gauge.min ?? 0,
				max: gauge.max ?? 100,
				value: gauge.value,
				roundedEnds: true,
				trackStyle: 'transparent',
				trackAmount: 0,
				fillEnabled: true,
				fillWidth: 100,
				multiColour: true,
				stops: gauge.stops ?? [{ value: 0, color: combineRgb(0, 180, 255), gradient: false }],
			},
		)
	}

	return {
		type: 'layered',
		name,
		elements,
		feedbacks,
		steps,
		...(localVariables ? { localVariables } : {}),
	}
}

// ============================================================================
// Layered Feedback Helpers
// ============================================================================

export interface LayeredFeedbackOptions {
	feedbackId: string
	options: Record<string, any>
	bgcolor?: number
	textColor?: number
	icon?: string
	isInverted?: boolean
}

export function makeLayeredFeedback({
	feedbackId,
	options,
	bgcolor,
	textColor,
	icon,
	isInverted,
}: LayeredFeedbackOptions): LayeredFeedback {
	const styleOverrides: CompanionPresetFeedbackStyleOverride[] = []
	let useDarkContent = false

	if (bgcolor !== undefined) {
		styleOverrides.push({ elementId: 'bg', elementProperty: 'color', override: bgcolor })
		useDarkContent = textColor !== undefined ? !isBrightRgbNumber(textColor) : isBrightRgbNumber(bgcolor)
		const resolvedTextColor = textColor ?? (useDarkContent ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255))
		styleOverrides.push({ elementId: 'label', elementProperty: 'color', override: resolvedTextColor })
	} else if (textColor !== undefined) {
		useDarkContent = !isBrightRgbNumber(textColor)
		styleOverrides.push({ elementId: 'label', elementProperty: 'color', override: textColor })
	}

	if (icon) {
		const png64 = getMdiIconPng64(icon, useDarkContent ? 'dark' : 'light')
		if (png64) {
			styleOverrides.push({ elementId: 'icon', elementProperty: 'base64Image', override: png64 })
		}
	}

	return {
		feedbackId,
		options,
		styleOverrides,
		...(isInverted !== undefined ? { isInverted } : {}),
	}
}

// ============================================================================
// Preset Sections
// ============================================================================

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

// ============================================================================
// Entity Adapter Interface
// ============================================================================

export interface EntityAdapter<T> {
	entityType: string
	is(instance: unknown): instance is T
	createActions(client: EsphomeWrapper): CompanionActionDefinitions
	createFeedbacks(client: EsphomeWrapper): CompanionFeedbackDefinitions
	getFeedbackIds?(entityId: string): string[]
	createPresets?(client: EsphomeWrapper, connLabel: string): AdapterPresets
}
