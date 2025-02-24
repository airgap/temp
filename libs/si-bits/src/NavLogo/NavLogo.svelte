<script lang="ts">
  import { Link } from '../Link';
  import { getHomepage } from '../getHomepage';
  import styles from './NavLogo.module.sass';
  import logo from './gifmaker_me.gif';

  const { className } = $props<{ className: string }>();

  // Generate unique ID for mask
  const maskId = crypto.randomUUID().replace(/-/g, '');
</script>

<Link
  href={getHomepage()}
  className={`${className} ${styles.NavLogo}`}
>
  <svg width="30px" height="30px">
    <defs>
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        maskContentUnits="userSpaceOnUse"
      >
        <image xlink:href={logo} width="100%" />
      </mask>
    </defs>
    <g mask="url(#{maskId})">
      <rect
        width="100%"
        height="100%"
        x="0"
        y="0"
        fill="white"
        class={styles.rainbow}
      />
    </g>
  </svg>
</Link> 