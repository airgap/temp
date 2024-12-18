export const bondIds = (...ids: (string | bigint)[]) => bindIds(...ids.sort());
export const bindIds = (...ids: (string | bigint)[]) => ids.join('~');
