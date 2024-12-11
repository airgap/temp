import { channelName, hex, channel, tagline, bio } from '@lyku/json-models';
import {
  TsonHandlerModel,
  ObjectJsonSchema,
  jsonPrimitives,
} from 'from-schema';
const { uid } = jsonPrimitives;
const properties = {
  fgColor: hex,
  bgColor: hex,
  tvColor: hex,
  id: uid,
  owner: uid,
  name: channelName,
  tagline,
  bio,
} as const;
const request = {
  type: 'object',
  properties,
  required: ['id'],
} as const satisfies ObjectJsonSchema;
export const updateChannel = {
  request,
  response: channel,
  authenticated: true,
} as const satisfies TsonHandlerModel;
