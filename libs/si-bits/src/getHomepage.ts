import { getSessionId } from 'monolith-ts-api';

export const getHomepage = () => (getSessionId() ? '/tail' : '/hot');
