<script lang="ts">
  import { pipe, components, revisions, cloc } from '@lyku/stats';
  import { Center } from '../Center';
  import { Divisio } from '../Divisio';
  import * as monolith from '@lyku/mapi-models';
  import { dbConfig } from '@lyku/db-config';
  import { phrasebook } from '../phrasebook';

  type H = 1 | 2 | 3 | 4 | 5 | 6;

  type Stat = {
    name: string;
    value: number | string;
    h?: H;
  };

  const statList: Stat[] = [
    { name: 'alpha releases', value: pipe },
    { name: 'code commits', value: revisions },
    {
      name: phrasebook.uxComponentCount,
      value: components,
    },
    {
      name: phrasebook.routeCount,
      value: [monolith]
        .map((loc) => Object.keys(loc).length)
        .reduce((a, b) => a + b),
    },
    {
      name: phrasebook.tableCount,
      value: Object.keys(dbConfig.tables).length,
    },
    {
      name: phrasebook.locCount,
      value: cloc.header.n_lines.toLocaleString(),
    },
    ...Object.entries(cloc)
      .filter(([k, v]) => !['header', 'SUM'].includes(k))
      .map(([k, v]) => ({
        value: 'code' in v ? v.code.toLocaleString() : 'N/A',
        name: `${phrasebook.linesOf} ${k}`,
        h: 3 as H,
      })),
  ];
</script>

<Center>
  <Divisio size="l" layout="v" alignItems="center">
    <h1>Lyku 0.{pipe}</h1>
    <table>
      {#each statList as { name, value, h = 2 }}
        <tr>
          <th>
            {#if h === 1}<h1>{value}</h1>
            {:else if h === 2}<h2>{value}</h2>
            {:else if h === 3}<h3>{value}</h3>
            {:else if h === 4}<h4>{value}</h4>
            {:else if h === 5}<h5>{value}</h5>
            {:else}<h6>{value}</h6>{/if}
          </th>
          <td>{name}</td>
        </tr>
      {/each}
    </table>
  </Divisio>
</Center> 