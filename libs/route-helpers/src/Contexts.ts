import { Database } from '@lyku/db-config/kysely';
import { CompactedPhrasebook } from '@lyku/phrasebooks';
import { ServerWebSocket, Server } from 'bun';
import { Kysely } from 'kysely';

type BaseContextFragment = {
	db: Kysely<Database>;
	isSecure?: boolean;
	server?: Server;
	strings: CompactedPhrasebook;
};
type HttpContextFragment = {
	request: Request;
	responseHeaders: Headers;
};
export type SecurityContextFragment = {
	requester: bigint;
	session: string;
};
export type SecureContext = BaseContextFragment & SecurityContextFragment;
export type MaybeSecureContext = BaseContextFragment | SecureContext;
export type MaybeSecureHttpContext = MaybeSecureContext & HttpContextFragment;
export type SecureHttpContext = SecureContext & HttpContextFragment;
type SocketBase = {
	socket: ServerWebSocket<unknown>;
	emit: (data: unknown) => void;
};
export type MaybeSecureSocketContext = MaybeSecureContext & SocketBase;
export type SecureSocketContext = SecureContext & SocketBase;
