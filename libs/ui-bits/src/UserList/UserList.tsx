import React, { ReactNode } from 'react';
import { Image } from '../Image';
import { formImageUrl } from '../formImageUrl';
import { phrasebook } from '../phrasebook';
import styles from './UserList.module.sass';
import { User } from '@lyku/json-models';

type Props = {
  users?: User[];
  children?: ReactNode;
  mine?: boolean;
};

export const UserList = ({ users, children, mine }: Props) => (
  <ul className={styles.UserList}>
    {users?.map((user) => (
      <li className={styles.userItem} key={user.id}>
        <a href={`/${user.username}${mine ? '/edit' : ''}`}>
          <table>
            <tbody>
              <tr>
                <td>
                  {/*<img*/}
                  {/*	src={}*/}
                  {/*	alt={'User profile'}*/}
                  {/*	className={styles.channelLogo}*/}
                  {/*/>*/}
                  <Image
                    url={formImageUrl(user.profilePicture, 'btvprofile')}
                    size="m"
                    bot={user.bot}
                  />
                </td>
                <td>
                  <div className={styles.deets}>
                    <h3>{user.username}</h3>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </a>
      </li>
    )) ?? phrasebook.botlessLuddite}
    {<li>{children}</li>}
  </ul>
);
