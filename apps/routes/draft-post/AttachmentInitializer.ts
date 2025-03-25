import { CompactedPhrasebook } from '@lyku/phrasebooks';

export type AttachmentInitializerProps = {
	id: bigint;
	author: bigint;
	post: bigint;
	strings: CompactedPhrasebook;
	size?: number;
	orderNum: number;
	filename: string;
};
export type AttachmentInitializer<Return> = (
	props: AttachmentInitializerProps,
) => Promise<Return>;
