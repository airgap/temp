import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
export const getUsers = (db: Kysely<Database>, users: bigint[]) =>
	users.length
		? db.selectFrom('users').where('id', 'in', users).selectAll().execute()
		: [];
