<script lang="ts">
  import Select from 'svelte-select';
  import type { GroupFilter } from '@lyku/json-models';
  import styles from './GroupFilterSelect.module.sass';

  export let value: GroupFilter | undefined = undefined;

  const groupFilterOptionMap: Record<GroupFilter, string> = {
    iCreated: 'I created',
    iOwn: 'I own',
    imIn: "I'm in",
  } as const;

  const options = Object.entries(groupFilterOptionMap).map(
    ([value, label]) => ({
      value: value as GroupFilter,
      label,
    })
  );

  const customStyles = {
    menu: (base: any) => ({
      ...base,
      borderRadius: '5px',
      overflow: 'hidden',
      border: '1px solid #ffffff55',
      borderTop: 'none',
    }),
    control: (base: any) => ({
      ...base,
      backgroundColor: '#ffffff22',
      border: '1px solid #ffffff55',
      borderRadius: '5px',
      padding: '10px',
    }),
    option: (base: any, { focused, selected }: { focused: boolean; selected: boolean }) => ({
      ...base,
      backgroundColor: focused || selected ? '#ffffff55' : '#ffffff22',
      padding: '10px',
    }),
  };
</script>

<Select
  {value}
  {options}
  {customStyles}
  unstyled={true}
  class={styles.GroupFilterSelect}
  on:change={(e) => value = e.detail?.value}
/> 