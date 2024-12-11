import React, { ReactNode } from 'react';

import { formImageUrl } from '../formImageUrl';
import { phrasebook } from '../phrasebook';
import styles from './ChannelList.module.sass';
import { Channel } from '@lyku/json-models';

type Props = {
  channels?: Channel[];
  children?: ReactNode;
  mine?: boolean;
};

export const ChannelList = ({ channels, children, mine }: Props) => (
  <ul className={styles.ChannelList}>
    {channels?.map((channel) => (
      <li className={styles.channelItem} key={channel.id}>
        <a href={`/${channel.name}${mine ? '/edit' : ''}`}>
          <table>
            <tbody>
              <tr>
                <td>
                  <img
                    src={formImageUrl(channel.logo, 'btvprofile')}
                    alt={'Channel logo'}
                    className={styles.channelLogo}
                  />
                </td>
                <td>
                  <div className={styles.deets}>
                    <h3>{channel.name}</h3>
                    <p>{channel.tagline || phrasebook.taglineMissing}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </a>
      </li>
    ))}
    {<li>{children}</li>}
  </ul>
);
