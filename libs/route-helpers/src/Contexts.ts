import { Database } from '@lyku/db-config/kysely';
import { CompactedPhrasebook } from '@lyku/phrasebooks';
import { ServerWebSocket, Server } from 'bun';
import { Kysely } from 'kysely';
import * as nats from 'nats';

type BaseContextFragment = {
	db: Kysely<Database>;
	server: Server;
	strings: CompactedPhrasebook;
	nats: nats.NatsConnection;
	requester?: bigint;
	session?: string;
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
export type AnyMaybeSecureContext = MaybeSecureHttpContext | MaybeSecureSocketContext;
export type AnySecureContext = SecureHttpContext | SecureSocketContext;
export type AnyContext = AnyMaybeSecureContext | AnySecureContext;
