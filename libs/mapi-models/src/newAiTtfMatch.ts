import { ttfFlowMode } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';

export const newAiTtfMatch = {
  request: ttfFlowMode,
  response: ttfMatch,
  authenticated: false,
} as const satisfies TsonHandlerModel;
