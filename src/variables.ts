import type { CompanionVariableDefinitions, CompanionVariableValue } from '@companion-module/base'
import { ClimateMode, LockState } from 'esphome-client'
import type ESPHomeInstance from './main.js'
import type { EsphomeWrapper } from './esphomeWrapper.js'
import { ClimateModeLabels, LockStateLabels } from './choices.js'

export type VariablesSchema = Record<string, CompanionVariableValue | undefined>

export function entityVariableId(entityId: string): string {
	return entityId.replace(/[^a-zA-Z0-9_]/g, '_')
}

function formatEntityVariableValue(entity: any, event: any): CompanionVariableValue | undefined {
	if (!event) return undefined

	switch (entity.type) {
		case 'sensor': {
			if (event.state === undefined) return undefined
			const num = Number(event.state)
			if (Number.isNaN(num)) return String(event.state)
			const decimals = typeof entity.accuracyDecimals === 'number' ? entity.accuracyDecimals : 0
			return decimals >= 0 ? Number(num.toFixed(decimals)) : num
		}
		case 'binary_sensor':
		case 'switch':
		case 'light':
		case 'fan':
			return Boolean(event.state)
		case 'number':
			return event.state !== undefined ? Number(event.state) : undefined
		case 'select':
		case 'text_sensor':
			return event.state !== undefined ? String(event.state) : undefined
		case 'cover':
			return event.position !== undefined ? Number(event.position) : undefined
		case 'lock': {
			const state = event.state !== undefined ? Number(event.state) : LockState.NONE
			return LockStateLabels[state] ?? String(state)
		}
		case 'climate': {
			const mode = event.mode !== undefined ? Number(event.mode) : ClimateMode.OFF
			return ClimateModeLabels[mode] ?? String(mode)
		}
		default:
			return event.state !== undefined ? String(event.state) : undefined
	}
}

export function UpdateVariableDefinitions(self: ESPHomeInstance, wrapper?: EsphomeWrapper): void {
	if (!wrapper) {
		self.setVariableDefinitions({})
		return
	}

	const definitions: CompanionVariableDefinitions<VariablesSchema> = {}
	for (const entity of wrapper.getEntities()) {
		if (entity.type === 'button') continue
		definitions[entityVariableId(entity.id)] = {
			name: entity.name || entity.id,
		}
	}

	self.setVariableDefinitions(definitions)
}

export function UpdateVariableValues(self: ESPHomeInstance, wrapper: EsphomeWrapper): void {
	const values: Partial<VariablesSchema> = {}
	for (const entity of wrapper.getEntities()) {
		if (entity.type === 'button') continue
		const val = formatEntityVariableValue(entity, wrapper.latest(entity.id))
		if (val !== undefined) {
			values[entityVariableId(entity.id)] = val
		}
	}

	if (Object.keys(values).length > 0) {
		self.setVariableValues(values)
	}
}
