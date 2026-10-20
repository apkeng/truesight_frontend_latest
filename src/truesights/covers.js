/** Book artwork for a topic that has no generated cover of its own. */
export function pickCoverForTopic(topic) {
  const lower = (topic || '').toLowerCase();
  if (lower.includes('blockchain') || lower.includes('crypto') || lower.includes('identity')) return '/assets/book-ux-ai.jpg';
  if (lower.includes('marine') || lower.includes('engine') || lower.includes('auxiliary') || lower.includes('propulsion')) return '/assets/book-marine.jpg';
  if (lower.includes('circuit') || lower.includes('hardware') || lower.includes('mosfet') || lower.includes('semiconductor')) return '/assets/book-circuits.jpg';
  if (lower.includes('web') || lower.includes('html') || lower.includes('code') || lower.includes('frontend')) return '/assets/book-html.jpg';
  if (lower.includes('security') || lower.includes('ctf') || lower.includes('hack') || lower.includes('cyber')) return '/assets/book-ctf.jpg';
  if (lower.includes('nuclear') || lower.includes('physics') || lower.includes('energy') || lower.includes('fission')) return '/assets/book-nuclear-fission.jpg';
  if (lower.includes('dental') || lower.includes('medicine') || lower.includes('anatomy') || lower.includes('biology')) return '/assets/book-dental.jpg';
  if (lower.includes('trade') || lower.includes('economics') || lower.includes('market') || lower.includes('finance')) return '/assets/book-trade.jpg';
  if (lower.includes('inflation') || lower.includes('macro')) return '/assets/book-inflation.jpg';
  if (lower.includes('building') || lower.includes('architecture') || lower.includes('civil')) return '/assets/book-building.jpg';
  return '/assets/book-ux-ai.jpg';
}
