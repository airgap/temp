import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

type AndBody<Body> = {
	body: Body;
};
export type ParsedInput<Base, Body> = Base & AndBody<Body>;

export type ParsedMessage<Body> = ParsedInput<IncomingMessage, Body>;

export type ParsedSocket<Body> = IncomingMessage & {
	webSocket: WebSocket;
	body: Body;
};
