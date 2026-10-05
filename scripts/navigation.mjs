// Shared records have one source, with a reading route inside their parent section.
export const sections = [
  ['/explore/', 'The board', 'See the current hull and earlier concept.'],
  ['/systems/', 'Systems', 'Which part of the board?'],
  ['/journal/', 'Journal', 'What did we investigate?'],
  ['/history/', 'History', 'How did we get here?'],
  ['/roadmap/', 'Roadmap', 'What comes next?'],
  ['/back/', 'Back Wahoo', 'Start a conversation with the team.'],
];
export const readingGroups = [
  ['Geometry & reference', ['reference-system', 'surface-investigation', 'reading-the-hull-surface', 'arc-length-analysis', 'geometry-conversion-validation', 'tail-section-investigation', 'hull-feature-review']],
  ['Balance & construction', ['mass-and-centre-of-gravity', 'level-attitude-displacement', 'dry-board-flotation-and-trim', 'fuel-tank-balance', 'hull-materials-and-construction']],
  ['Flow simulation', ['first-corrected-cfd-run', '20kmh-completed-analysis']],
  ['Engine & integration', ['engine-as-a-system', 'engine-component-baseline', 'engine-motion-and-ports', 'engine-integrated-systems', 'nozzle-area-study', 'battery-and-starting']],
  ['Electronics & control', ['electronics-control-architecture', 'electronics-engine-management', 'electronics-vehicle-control', 'electronics-electrical-integration', 'electronics-validation']],
  ['Origins & development brief', ['early-design-archive', 'rider-interface-archive', 'from-brief-to-test']],
];
export const descriptiveTitles = {
  'surface-investigation': 'Hull cross-sections: the initial surface study',
  'reading-the-hull-surface': 'Hull curvature: the expanded surface analysis',
};
export const groupId = i => `reading-${i + 1}`;
export function sectionFor(url) { return sections.find(([root]) => url.startsWith(root)); }
export function readingSequence(updates) {
  return readingGroups.flatMap(([, slugs]) => slugs.map(slug => updates.find(u => u.slug === slug)).filter(Boolean));
}
export function withoutSectionLinks(html) {
  return html.replace(/<a\b[^>]*href="\/(?:journal|systems|history|explore|roadmap|back)\/[^\"]*"[^>]*>[\s\S]*?<\/a>/g, '');
}
