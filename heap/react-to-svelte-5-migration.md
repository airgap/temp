# IMPORTANT RULES for React to Svelte 5 Migration

## TSX components _.tsx -> _.svelte

2. Adopt idomatic Svelte 5 syntax
3. Do not use legacy $ prefixed variables
4. Do NOT use '$:'

- '$:' is BANNED. Use $derived instead.

5. Use runes
6. Use $props<{...}>() instead of `export let`
7. Use $effect instead of useEffect
8. Use $derived instead of useMemo
9. Preserve style imports from \*.module.sass
10. Do not stub styles when there are style imports

## TSX specs _.spec.tsx -> _.spec.ts

1. Use '@testing-library/svelte' instead of '@testing-library/react'
2. Use 'render(Foo)' instead of 'render(<Foo />)'

## Examples

### Banner.tsx -> Banner.svelte

```tsx
import classnames from 'classnames';
import { FC, ReactNode } from 'react';

import bannerStyles from './Banner.module.sass';

type BannerProps = { children?: ReactNode };

export const Banner: FC<BannerProps> = (props) => <div className={classnames(bannerStyles.Banner)}>{props.children}</div>;
```

```svelte
<script lang="ts">
	import classnames from 'classnames';
	import bannerStyles from './Banner.module.sass';

	// No need to explicitly declare children - it's a built-in prop
	let { children } = $props();
</script>

<div class={classnames(bannerStyles.Banner)}>
	{@render children?.()}
</div>
```
