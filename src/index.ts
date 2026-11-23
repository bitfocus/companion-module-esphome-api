import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import ESPHomeInstance from './main.js'

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = []

export default ESPHomeInstance
