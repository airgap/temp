import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import * as routes from './routes';
import { parse } from 'url';
import { getDictionary } from './getDictionary';
import { state } from './state';
import { getUserId } from './getUserId';
import { HandlerModel } from 'from-schema';
import { GuestSocketContext } from '@lyku/handles';

export const webSocketServer = new WebSocketServer({ noServer: true });

const isStream = (
	model: HandlerModel,
): model is HandlerModel & { stream: true } =>
	Boolean('stream' in model && model.stream);
const isAuthenticated = (
	model: HandlerModel,
): model is HandlerModel & { authenticated: true } =>
	Boolean('authenticated' in model && model.authenticated);

export const handleConnection = async (
	ws: WebSocket,
	request: IncomingMessage,
) => {
	ws.on('error', (e) => console.log('ERROR', e));
	const path = request.url?.substring(1).split(/[/?]/)[0];
	if (!path) return;
	if (!(path in routes)) return;
	const route = routes[path as keyof typeof routes];
	if (!('respond' in route)) return;
	const parameters = parse(request.url ?? '', true).query;

	if ('validate' in route && !route.validate(parameters)) {
		console.log('invalid', parameters);
		ws.send('HTTP/1.1 400 Invalid parameters\r\n\r\n');
		ws.close();
		return;
	}

	const strings = getDictionary(request);
	const onMessage = async (data: string) => {
		console.log('GOT FIRST MESSAGE');
		ws.removeListener('message', onMessage);

		try {
			const ctx: GuestSocketContext = {
				...state,
				strings,
				message: request,
				socket: ws,
			};
			ctx.requester = await getUserId(request, state.db);

			if (!isStream(route.model)) {
				ws.send('HTTP/1.1 400 Not a stream endpoint\r\n\r\n');
				ws.close();
				return;
			}
			if (!isAuthenticated(route.model)) {
				ws.send('HTTP/1.1 401 Unauthorized\r\n\r\n');
				ws.close();
				return;
			}

			await route.respond(parameters, ctx);
		} catch (err) {
			console.log('err', err);
		}
	};

	if (isAuthenticated(route.model)) {
		ws.on('message', onMessage);
	} else {
		if (!isStream(route.model)) return;
		try {
			const responder = route.respond;
			await responder(
				parameters,
				state,
				{
					request,
					body: parameters,
					socket: ws,
				},
				strings,
			);
		} catch (err) {
			console.log('err', err);
		}
	}
};

webSocketServer.on('connection', handleConnection);

webSocketServer.on('error', (e) => console.log('WSS ERROR', e));
