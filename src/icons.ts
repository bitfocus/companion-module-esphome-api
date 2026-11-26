import { GENERATED_ICONS, type IconVariant } from './generated/icons.js'

export type { IconVariant }

/**
 * Look up a pre-rendered MDI icon (e.g. "mdi:thermometer" or "thermometer") as a base64 PNG string.
 * Returns undefined if the icon is not in the generated bundle.
 */
export function getMdiIconPng64(iconName: string | undefined, variant: IconVariant = 'light'): string | undefined {
	if (!iconName) return undefined
	const cleanName = iconName.startsWith('mdi:') ? iconName.slice(4) : iconName
	return GENERATED_ICONS[cleanName]?.[variant]
}
