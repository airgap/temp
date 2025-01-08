const { serve } = Bun;
import { Database } from '@lyku/db-config/kysely'; // this is the Database interface we defined earlier
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';
import { WebSocket } from 'ws';
import { decode, encode } from '@msgpack/msgpack'; // Import the MessagePack decoder
import { en_US } from '@lyku/strings';
import { isObject } from 'from-schema';
import {
	SecureHttpContext,
	SecureSocketContext,
	MaybeSecureContext,
	MaybeSecureHttpContext,
	MaybeSecureSocketContext,
} from '@lyku/route-helpers';
