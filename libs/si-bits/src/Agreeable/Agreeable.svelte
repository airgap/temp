<script lang="ts">
	import styles from './Agreeable.module.sass';
	import { phrasebook } from '../phrasebook';
	import { ShowTos } from '../ShowTos';
	import { tempId } from '../tempId';

	let { children, oninput, onshowtos } = $props<{
		children: ComponentType[];
		oninput: (checked: boolean) => void;
	}>();

	let id = tempId();
</script>

<div class={styles.Agreeable}>
	<input type="checkbox" {id} {oninput} />
	<label for={id}>
		{phrasebook.termsLabel}
	</label>
	<ShowTos onclick={onshowtos}>{phrasebook.termsLink}</ShowTos>
</div>
