export const bondIds = (...ids: string[]) => bindIds(...ids.sort());
export const bindIds = (...ids: string[]) => ids.join('~');
