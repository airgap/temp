import { getSessionId } from '@lyku/monolith-ts-api';

export const getHomepage = () => (getSessionId() ? '/tail' : '/hot');
