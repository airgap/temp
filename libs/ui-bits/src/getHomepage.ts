import { sessionId } from 'monolith-ts-api';

export const getHomepage = () => (sessionId ? '/tail' : '/hot');
