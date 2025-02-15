<script lang="ts">
    import type { Achievement } from '@lyku/json-models';
    import classNames from 'classnames';
    import styles from './AchievementTile.module.sass';
    import { Image } from '../Image';

    const { achievement, granted = false } = $props<{
        achievement: Achievement;
        granted?: boolean;
    }>();
</script>

<button
    type="button"
    onclick={() => alert('Coming soon!')}
    class={classNames(styles.AchievementTile, {
        [styles.granted]: granted,
    })}
    aria-label={achievement.name}
>
    <Image url={achievement.icon} />
    <div class={styles.content}>
        <h3>{achievement.name}</h3>
        <p>{achievement.description}</p>
    </div>
</button> 