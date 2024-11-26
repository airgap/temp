import { cfAccountHash, placeholderLogo } from '@lyku/defaults';

export type ImageVariant = 'btvprofile';
export const formImageUrl = (
	id?: string,
	variant: ImageVariant = 'btvprofile',
) =>
	`https://imagedelivery.net/${cfAccountHash}/${
		id || placeholderLogo
	}/${variant}`;
