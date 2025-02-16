import { cfAccountHash, placeholderLogo } from '@lyku/defaults';

export type ImageVariant = 'btvprofile';
export const formImageUrl = (
	id?: bigint | string,
	variant: ImageVariant = 'btvprofile',
) =>
	`https://imagedelivery.net/${cfAccountHash}/${
		id || placeholderLogo
	}/${variant}`;
