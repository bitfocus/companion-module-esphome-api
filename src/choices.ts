import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	JsonValue,
} from '@companion-module/base'
import { OnOffToggle } from './util.js'

export enum ClimateMode {
	Off = 0,
	HeatCool = 1,
	Cool = 2,
	Heat = 3,
	FanOnly = 4,
	Dry = 5,
	Auto = 6,
}

export const AllClimateModes: number[] = [0, 1, 2, 3, 4, 5, 6]

export const ClimateModeLabels: Record<number, string> = {
	0: 'Off',
	1: 'Heat/Cool',
	2: 'Cool',
	3: 'Heat',
	4: 'Fan Only',
	5: 'Dry',
	6: 'Auto',
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

export function OnOffTogglePicker(): CompanionInputFieldDropdown {
	const options = [
		{ id: OnOffToggle.On, label: 'On' },
		{ id: OnOffToggle.Off, label: 'Off' },
		{ id: OnOffToggle.Toggle, label: 'Toggle' },
	]
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: OnOffToggle.On,
		choices: options,
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

export function NumberValuePicker(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Value',
		id: 'value',
		default: 0,
	} as CompanionInputFieldNumber
}
export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}
export function NumberComparitorPicker(): CompanionInputFieldDropdown {
	const options = [
		{ id: NumberComparitor.Equal, label: 'Equal' },
		{ id: NumberComparitor.NotEqual, label: 'Not Equal' },
		{ id: NumberComparitor.GreaterThan, label: 'Greater than' },
		{ id: NumberComparitor.GreaterThanEqual, label: 'Greater than or equal' },
		{ id: NumberComparitor.LessThan, label: 'Less than' },
		{ id: NumberComparitor.LessThanEqual, label: 'Less than or equal' },
	]
	return {
		type: 'dropdown',
		label: 'Comparitor',
		id: 'comparitor',
		default: NumberComparitor.Equal,
		choices: options,
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
