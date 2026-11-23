import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	JsonValue,
} from '@companion-module/base'
import { ClimateMode, LockState } from 'esphome-client'
import { OnOffToggle } from './util.js'

// ============================================================================
// Entity Pickers
// ============================================================================

export function EntityPicker(entities: { id: string; name: string }[]): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Entity',
		id: 'entity_id',
		default: entities[0] ? entities[0].id : '',
		choices: entities
			.map((ent) => ({
				id: ent.id,
				label: ent.name || `${ent.id}`,
			}))
			.sort((a, b) => {
				const a2 = a.label.toLowerCase()
				const b2 = b.label.toLowerCase()
				return a2 === b2 ? 0 : a2 < b2 ? -1 : 1
			}),
	}
}

export function OnOffPicker(): CompanionInputFieldCheckbox {
	return {
		type: 'checkbox',
		label: 'State',
		id: 'state',
		default: true,
	}
}

export function OnOffTogglePicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: OnOffToggle.On,
		choices: [
			{ id: OnOffToggle.On, label: 'On' },
			{ id: OnOffToggle.Off, label: 'Off' },
			{ id: OnOffToggle.Toggle, label: 'Toggle' },
		],
	}
}

// ============================================================================
// Number Pickers & Comparison
// ============================================================================

export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function NumberValuePicker(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Value',
		id: 'value',
		default: 0,
	} as CompanionInputFieldNumber
}

export function NumberComparitorPicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Comparitor',
		id: 'comparitor',
		default: NumberComparitor.Equal,
		choices: [
			{ id: NumberComparitor.Equal, label: 'Equal' },
			{ id: NumberComparitor.NotEqual, label: 'Not Equal' },
			{ id: NumberComparitor.GreaterThan, label: 'Greater than' },
			{ id: NumberComparitor.GreaterThanEqual, label: 'Greater than or equal' },
			{ id: NumberComparitor.LessThan, label: 'Less than' },
			{ id: NumberComparitor.LessThanEqual, label: 'Less than or equal' },
		],
	}
}

export function compareNumber(
	target: JsonValue | undefined,
	comparitor: JsonValue | undefined,
	currentValue: number,
): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) {
		return false
	}

	switch (comparitor) {
		case NumberComparitor.GreaterThan:
			return currentValue > targetValue
		case NumberComparitor.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparitor.LessThan:
			return currentValue < targetValue
		case NumberComparitor.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparitor.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

// ============================================================================
// Climate
// ============================================================================

export { ClimateMode }

export const AllClimateModes: number[] = [
	ClimateMode.OFF,
	ClimateMode.HEAT_COOL,
	ClimateMode.COOL,
	ClimateMode.HEAT,
	ClimateMode.FAN_ONLY,
	ClimateMode.DRY,
	ClimateMode.AUTO,
]

export const ClimateModeLabels: Record<number, string> = {
	[ClimateMode.OFF]: 'Off',
	[ClimateMode.HEAT_COOL]: 'Heat/Cool',
	[ClimateMode.COOL]: 'Cool',
	[ClimateMode.HEAT]: 'Heat',
	[ClimateMode.FAN_ONLY]: 'Fan Only',
	[ClimateMode.DRY]: 'Dry',
	[ClimateMode.AUTO]: 'Auto',
}

export function ClimateModePicker(supportedModes: number[]): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Mode',
		id: 'mode',
		default: supportedModes[0],
		choices: supportedModes.map((mode) => ({
			id: mode,
			label: ClimateModeLabels[mode] || String(mode),
		})),
	}
}

// ============================================================================
// Lock
// ============================================================================

export const LockStateLabels: Record<number, string> = {
	[LockState.NONE]: 'None',
	[LockState.LOCKED]: 'Locked',
	[LockState.UNLOCKED]: 'Unlocked',
	[LockState.JAMMED]: 'Jammed',
	[LockState.LOCKING]: 'Locking',
	[LockState.UNLOCKING]: 'Unlocking',
	[LockState.OPENING]: 'Opening',
	[LockState.OPEN]: 'Open',
}
