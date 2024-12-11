import { Button } from '../Button';
import { GroupList } from '../GroupList';
import { useState } from 'react';
import { GroupFilter } from '@lyku/json-models';

export const ViewGroups = () => {
  const [substring] = useState<string>('');
  const [filter] = useState<GroupFilter>();
  return (
    <div style={{ margin: 'auto', width: '800px', maxWidth: '100%' }}>
      <h2 style={{ display: 'flex' }}>
        Groups <Button onClick={() => alert('Coming soon!')}>+</Button>
      </h2>
      <br />
      {/*<Texticle*/}
      {/*	onInput={setSubstring}*/}
      {/*	value={substring}*/}
      {/*	pattern={group.properties.name.pattern}*/}
      {/*/>*/}
      {/*<GroupFilterSelect*/}
      {/*	value={options.find(o => o.value === filter)}*/}
      {/*	onChange={o => setFilter(o?.value)}*/}
      {/*></GroupFilterSelect>*/}
      <GroupList filter={filter} substring={substring} />
    </div>
  );
};
