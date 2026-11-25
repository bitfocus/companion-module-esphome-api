import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from '../config.js'
import { upgrade0001_backfillLightTransition } from './0001_backfill_light_transition.js'
import { upgrade0002_migrateV2EntityIds } from './0002_migrate_v2_entity_ids.js'
import { upgrade0003_backfillTextSensorMatchType } from './0003_backfill_text_sensor_match_type.js'

// Append-only: Companion tracks executed migrations by array index.
export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	upgrade0001_backfillLightTransition,
	upgrade0002_migrateV2EntityIds,
	upgrade0003_backfillTextSensorMatchType,
]
