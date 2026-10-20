import { api, keys } from '../revamp/lib/api';
import { useQuery } from '../revamp/lib/query';

/**
 * Data hooks for the TrueSights screens. They read through the shared
 * stale-while-revalidate cache in src/revamp/lib/query.js, so a screen
 * renders cached data at once and refreshes in the background.
 */
export { api, keys };
export { invalidate, setQueryData, useQuery } from '../revamp/lib/query';

/** Everything the dashboard widgets show, in one request. */
export const useDashboard = () => useQuery(keys.dashboard(), api.dashboard);
