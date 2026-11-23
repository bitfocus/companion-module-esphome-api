import type ESPHomeInstance from './main.js'

export type VariablesSchema = {
	variable1: string
	variable2: string
	variable3: string
}

export function UpdateVariableDefinitions(self: ESPHomeInstance): void {
	self.setVariableDefinitions({
		variable1: { name: 'My first variable' },
		variable2: { name: 'My second variable' },
		variable3: { name: 'Another variable' },
	})
}
