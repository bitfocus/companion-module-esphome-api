import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type ESPHomeInstance from './main.js'
import type { ModuleSchema } from './main.js'
import type { EsphomeWrapper } from './esphomeWrapper.js'
import { EntityAdapters } from './entityAdapters/index.js'

export function UpdatePresets(self: ESPHomeInstance, wrapper?: EsphomeWrapper): void {
	if (!wrapper) {
		self.setPresetDefinitions([], {})
		return
	}

	const structure: CompanionPresetSection<ModuleSchema>[] = []
	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	const connLabel = self.label || 'esphome'

	for (const adapter of Object.values(EntityAdapters)) {
		if (!adapter.createPresets) continue
		const result = adapter.createPresets(wrapper, connLabel)
		structure.push(...result.sections)
		Object.assign(presets, result.presets)
	}

	self.setPresetDefinitions(structure, presets)
}
