import { group } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';
export const joinGroup = {
  request: group.properties.id,
  authenticated: true,
} as const satisfies TsonHandlerModel;
