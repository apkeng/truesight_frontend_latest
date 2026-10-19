/**
 * Where a student registers for an event. Registration happens on the
 * organiser's site, not in Truesight: prefer the stored officialUrl and fall
 * back to the first link in the description (older events only have it there).
 */
export const eventRegistrationUrl = (event) => {
  if (!event) return null;
  if (event.officialUrl) return event.officialUrl;
  const match = (event.description || "").match(/https?:\/\/[^\s)]+/);
  return match ? match[0].replace(/[.,;]+$/, "") : null;
};
