// Comprehensive list of iconic default template accent colors across all Polaris templates
export const TEMPLATE_SIGNATURE_HEXES = [
  // Washoski Cyan
  '#05DFD7',
  '#00F2FE',
  // Aniviox Emerald & Emerald Tech
  '#00F076',
  '#00DF82',
  '#10B981',
  // Arik Noir
  '#C5A880',
  '#E8DCC4',
  '#D4AF37',
  // Agetha Ruby
  '#E50914',
  '#B91C1C',
  // Creatix Lime
  '#84CC16',
  // Midnight Gold
  '#FFBD39',
  // Qurifolio
  '#FF6B00',
  '#FF8533',
  '#FF7B1A',
  // Folioblox
  '#FF4500',
  '#FF4E05',
  '#FF5B14',
  '#D82408',
  // Warm Portfolio
  '#F59E0B',
  '#FBBF24',
  '#B45309',
  // Polaris Insight
  '#96702C',
  // Clean Editorial
  '#6366F1',
  '#818CF8',
  // Golden Split
  '#FFA800',
  '#FFB82E',
  // Blush Editorial
  '#D47A6A',
  '#D98270',
  '#C96B5B',
  // Crimson Noir
  '#D62828',
  '#B71C1C',
  // Neon Glow & Orix Violet
  '#8B5CF6',
  '#7C3AED',
  '#4F12D6',
  '#3B0CB8',
  // Bold Typography
  '#DC2626',
  // Dark Modern & Default Polaris
  '#1877F2',
  '#1890FF',
  // Midnight Lime
  '#D4F63D',
  '#E2F952',
  // Amber Portfolio & Parichay Amber
  '#EA580C',
  '#D97706',
  '#E09200',
  // Laila Sakura
  '#FF4D8D',
  '#FF2E74',
  '#FF758F',
  '#E84A6F',
  '#FF6EA7',
  '#FF80AB',
  // Nexora Violet
  '#8262FE',
  '#7048E8',
  '#5F3DC4',
  '#7B61FF',
  // Xenon Mint
  '#00E599',
  '#00D084',
  '#00F5A0',
  '#00D9F5',
  '#00F0FF',
];

/**
 * Generates dynamic CSS rules that override hardcoded Tailwind arbitrary accent classes
 * with the user-selected primary brand color (--portal-primary).
 */
export function generateDynamicThemeCss(primaryHex?: string): string {
  if (!primaryHex) return '';

  const hexes = Array.from(new Set(TEMPLATE_SIGNATURE_HEXES.flatMap((h) => [h, h.toLowerCase()])));

  const textSelectors = hexes.map((h) => `[data-polaris-theme] [class*="text-[${h}]" i]`).join(',\n');
  const bgSelectors = hexes.map((h) => `[data-polaris-theme] [class*="bg-[${h}]" i]`).join(',\n');
  const borderSelectors = hexes.map((h) => `[data-polaris-theme] [class*="border-[${h}]" i]`).join(',\n');
  const fillSelectors = hexes.map((h) => `[data-polaris-theme] [class*="fill-[${h}]" i]`).join(',\n');
  const strokeSelectors = hexes.map((h) => `[data-polaris-theme] [class*="stroke-[${h}]" i]`).join(',\n');
  const ringSelectors = hexes.map((h) => `[data-polaris-theme] [class*="ring-[${h}]" i]`).join(',\n');

  // Gradient stops
  const fromSelectors = hexes.map((h) => `[data-polaris-theme] [class*="from-[${h}]" i]`).join(',\n');
  const toSelectors = hexes.map((h) => `[data-polaris-theme] [class*="to-[${h}]" i]`).join(',\n');
  const viaSelectors = hexes.map((h) => `[data-polaris-theme] [class*="via-[${h}]" i]`).join(',\n');

  // Hover states
  const hoverTextSelectors = hexes.map((h) => `[data-polaris-theme] [class*="hover:text-[${h}]" i]:hover`).join(',\n');
  const hoverBgSelectors = hexes.map((h) => `[data-polaris-theme] [class*="hover:bg-[${h}]" i]:hover`).join(',\n');
  const hoverBorderSelectors = hexes.map((h) => `[data-polaris-theme] [class*="hover:border-[${h}]" i]:hover`).join(',\n');

  // Group hover states
  const groupHoverTextSelectors = hexes.map((h) => `[data-polaris-theme] .group:hover [class*="group-hover:text-[${h}]" i]`).join(',\n');
  const groupHoverBgSelectors = hexes.map((h) => `[data-polaris-theme] .group:hover [class*="group-hover:bg-[${h}]" i]`).join(',\n');
  const groupHoverBorderSelectors = hexes.map((h) => `[data-polaris-theme] .group:hover [class*="group-hover:border-[${h}]" i]`).join(',\n');

  // Opacity variants for subtle glows and translucent badges
  const opacities = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];
  const bgOpacityRules = opacities.map((op) => {
    const selectors = hexes.map((h) => `[data-polaris-theme] [class*="bg-[${h}]/${op}" i]`).join(',\n');
    return `
${selectors} {
  background-color: color-mix(in srgb, var(--portal-primary) ${op}%, transparent) !important;
}`;
  }).join('\n');

  const borderOpacityRules = [10, 20, 30, 40, 50].map((op) => {
    const selectors = hexes.map((h) => `[data-polaris-theme] [class*="border-[${h}]/${op}" i]`).join(',\n');
    return `
${selectors} {
  border-color: color-mix(in srgb, var(--portal-primary) ${op}%, transparent) !important;
}`;
  }).join('\n');

  const textOpacityRules = [60, 70, 80, 90].map((op) => {
    const selectors = hexes.map((h) => `[data-polaris-theme] [class*="text-[${h}]/${op}" i]`).join(',\n');
    return `
${selectors} {
  color: color-mix(in srgb, var(--portal-primary) ${op}%, transparent) !important;
}`;
  }).join('\n');

  return `
/* ─── POLARIS DYNAMIC BRAND COLOR BINDING ─── */
:root {
  --portal-primary: ${primaryHex};
}

${textSelectors} {
  color: var(--portal-primary) !important;
}

${bgSelectors} {
  background-color: var(--portal-primary) !important;
}

${borderSelectors} {
  border-color: var(--portal-primary) !important;
}

${fillSelectors} {
  fill: var(--portal-primary) !important;
}

${strokeSelectors} {
  stroke: var(--portal-primary) !important;
}

${ringSelectors} {
  --tw-ring-color: var(--portal-primary) !important;
}

${fromSelectors} {
  --tw-gradient-from: var(--portal-primary) var(--tw-gradient-from-position) !important;
  --tw-gradient-to: color-mix(in srgb, var(--portal-primary) 0%, transparent) var(--tw-gradient-to-position) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
}

${toSelectors} {
  --tw-gradient-to: var(--portal-primary) var(--tw-gradient-to-position) !important;
}

${viaSelectors} {
  --tw-gradient-to: color-mix(in srgb, var(--portal-primary) 0%, transparent) var(--tw-gradient-to-position) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--portal-primary) var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
}

${hoverTextSelectors} {
  color: var(--portal-primary) !important;
}

${hoverBgSelectors} {
  background-color: var(--portal-primary) !important;
}

${hoverBorderSelectors} {
  border-color: var(--portal-primary) !important;
}

${groupHoverTextSelectors} {
  color: var(--portal-primary) !important;
}

${groupHoverBgSelectors} {
  background-color: var(--portal-primary) !important;
}

${groupHoverBorderSelectors} {
  border-color: var(--portal-primary) !important;
}

${bgOpacityRules}

${borderOpacityRules}

${textOpacityRules}
`;
}
