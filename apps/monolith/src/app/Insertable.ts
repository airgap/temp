import { Ex } from 'rethinkdb';

export type DeeplyExpressible<T> = T extends object
	? { [K in keyof T]: K extends 'id' ? T[K] : DeeplyExpressible<Ex<T[K]>> }
	: Ex<T>;
export type Insertable<T> = DeeplyExpressible<Omit<T, 'id'>>;
