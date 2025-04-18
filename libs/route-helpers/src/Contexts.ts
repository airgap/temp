import { Client } from '@elastic/elasticsearch';
import type { Database } from '@lyku/db-config/kysely';
import type { CompactedPhrasebook } from '@lyku/phrasebooks';
import type { ServerWebSocket, Server } from 'bun';
import type {
	TsonHttpHandlerModel,
	TsonStreamHandlerModel,
	TsonHandlerModel,
} from 'from-schema';
import { Kysely } from 'kysely';
import * as nats from 'nats';

type BaseContextFragment<Model extends TsonHandlerModel> = {
	db: Kysely<Database>;
	server: Server;
	strings: CompactedPhrasebook;
	nats: nats.NatsConnection;
	requester?: bigint;
	session?: string;
	model: Model;
	elastic: Client;
};
type HttpContextFragment = {
	request: Request;
	responseHeaders: Headers;
};
export type SecurityContextFragment = {
	requester: bigint;
	session: string;
};
export type SecureContext<Model extends TsonHandlerModel> =
	BaseContextFragment<Model> & SecurityContextFragment;
export type MaybeSecureContext<Model extends TsonHandlerModel> =
	| BaseContextFragment<Model>
	| SecureContext<Model>;
export type MaybeSecureHttpContext<Model extends TsonHandlerModel> =
	MaybeSecureContext<Model> & HttpContextFragment;
export type SecureHttpContext<Model extends TsonHandlerModel> =
	SecureContext<Model> & HttpContextFragment;
export type TweakHandler<TweakRequest, TweakResponse> = (
	data: TweakRequest,
) => TweakResponse;
export type StreamTypes = {
	request?: any;
	response?: any;
	stream:
		| true
		| {
				tweakRequest?: any;
				tweakResponse?: any;
		  };
};
export type HttpTypes = {
	request: any;
	response: any;
};
type SocketBase<
	Model extends TsonStreamHandlerModel,
	Types extends StreamTypes,
> = {
	socket: ServerWebSocket<Model>;
	emit: (data: Types['response'] | Uint8Array) => void;
	onClose: () => void;
	onTweak: TweakHandler<
		Types['stream'] extends true
			? Types['stream'] extends { tweakRequest: any }
				? Types['stream']['tweakRequest']
				: never
			: never,
		Types['stream'] extends true
			? never
			: Types['stream'] extends { tweakResponse: any }
				? Types['stream']['tweakResponse']
				: never
	>;
};
export type Cock = {
	tweakRequest: any;
	tweakResponse: any;
};
export type MaybeSecureSocketContext<
	Model extends TsonStreamHandlerModel,
	Types extends StreamTypes,
> = MaybeSecureContext<Model> & SocketBase<Model, Types>;
export type SecureSocketContext<
	Model extends TsonStreamHandlerModel,
	Types extends StreamTypes,
> = SecureContext<Model> & SocketBase<Model, Types>;
export type AnyMaybeSecureContext<
	Model extends TsonHandlerModel,
	Types extends StreamTypes = never,
> = Model extends TsonHttpHandlerModel
	? MaybeSecureHttpContext<Model>
	: Model extends TsonStreamHandlerModel
		? MaybeSecureSocketContext<Model, Types>
		: never;
export type AnySecureContext<
	Model extends TsonHandlerModel,
	Types extends StreamTypes = never,
> = Model extends TsonHttpHandlerModel
	? SecureHttpContext<Model>
	: Model extends TsonStreamHandlerModel
		? SecureSocketContext<Model, Types>
		: never;
export type AnyContext<
	Model extends TsonHandlerModel,
	Types extends StreamTypes = never,
> = AnyMaybeSecureContext<Model, Types> | AnySecureContext<Model, Types>;
