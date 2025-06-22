import { FileDraft } from '@lyku/json-models';
import { CompactedPhrasebook } from '@lyku/phrasebooks';

export type AttachmentInitializerProps = FileDraft;
export type AttachmentInitializer<Return> = (
	props: AttachmentInitializerProps,
) => Promise<Return>;
