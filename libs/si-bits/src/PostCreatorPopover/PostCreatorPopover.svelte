<script lang="ts">
	import { Close } from '../Close';
	import { PostCreator } from '../PostCreator';
	import type { Post } from '@lyku/json-models';
	import { listen, shout } from '../Sonic';
	import styles from './PostCreatorPopover.module.sass';
	import { userStore } from '../CacheProvider';

	let echoing = $state<Post>();
	const user = userStore.get(-1n);

	listen('echo', (post) => {
		echoing = post;
	});
</script>

{#if user && echoing}
	<div class={styles.PostCreatorPopover}>
		<div>
			<Close
				onclick={() => {
					shout('echo', undefined);
				}}
			/>
			<PostCreator showInset={true} {user} echo={echoing?.id} />
		</div>
	</div>
{/if}
