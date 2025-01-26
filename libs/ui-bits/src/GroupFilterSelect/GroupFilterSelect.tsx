import Select, { Props } from 'react-select';
import { GroupFilter } from '@lyku/json-models';
import styles from './GroupFilterSelect.module.sass';
export const groupFilterOptionMap: Record<GroupFilter, string> = {
	iCreated: 'I created',
	iOwn: 'I own',
	imIn: "I'm in",
} as const;
export type GroupFilterOption = {
	label: string;
	value: GroupFilter;
};
export const options = Object.entries(groupFilterOptionMap).map(
	([value, label]) => ({
		value: value as GroupFilter,
		label,
	})
);
export const GroupFilterSelect = (props: Props<GroupFilterOption, false>) => (
	<Select
		unstyled={true}
		styles={{
			menu: (styles) => ({
				...styles,
				borderRadius: '5px',
				overflow: 'hidden',
				border: '1px solid #ffffff55',
				borderTop: 'none',
			}),
			control: (styles) => ({
				...styles,
				backgroundColor: '#ffffff22',
				border: '1px solid #ffffff55',
				borderRadius: '5px',
				padding: '10px',
			}),
			option: (styles, { isFocused, isSelected }) => ({
				...styles,
				backgroundColor: isFocused || isSelected ? '#ffffff55' : '#ffffff22',
				padding: '10px',
			}),
		}}
		className={styles.GroupFilterSelect}
		options={options}
		{...props}
	/>
);
