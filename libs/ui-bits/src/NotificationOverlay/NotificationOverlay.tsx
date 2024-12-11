import { Notification } from '@lyku/json-models';
import styles from './NotificationOverlay.module.sass';
import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Divisio } from '../Divisio';
import { Image } from '../Image';
import { shout } from '../Sonic';
import { ThiccSocket, api, sessionId } from 'monolith-ts-api';

export const Noti = ({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) => {
  const [hidden, setHidden] = useState(true);
  const [mist, setMist] = useState(false);
  useEffect(() => {
    setTimeout(() => setHidden(false), 0);
    setTimeout(() => setMist(true), 10000);
    setTimeout(() => onClose(), 11000);
  }, [onClose]);
  const clicked = useCallback(() => {
    if (!notification.href) return;
    alert('Coming soon!');
    if (notification.href.startsWith('/achievements/'))
      shout('showAchievement', notification.href.split('/achievements/')[1]);
    else window.location.href = notification.href;
  }, [notification.href]);
  return (
    <div
      key={notification.id}
      className={classNames(styles.Notification, {
        [styles.hidden]: hidden,
        [styles.mist]: mist,
        [styles.clickable]: notification.href,
      })}
      onClick={clicked}
    >
      <div className={styles.NotificationContent}>
        <Divisio layout="h" size="m">
          <Image url={notification.icon} className={styles.NotificationIcon} />
          <Divisio
            layout="v"
            size="m"
            hang={`+20pts`}
            style={{ width: 'calc(100% - 60px)' }}
          >
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
          </Divisio>
        </Divisio>
      </div>
    </div>
  );
};

export const NotificationOverlay = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // {
    // 	title: 'Achievement',
    // 	subtitle: '+20 pts',
    // 	body: 'You did a thing!',
    // 	user: 'f',
    // 	icon: '/bots/smile.png',
    // 	href: '/achievements/did',
    // 	posted: new Date().toISOString(),
    // 	id: 'a',
    // },
    // {
    // 	title: 'Achievement',
    // 	subtitle: '+40 pts',
    // 	body: 'You did a thing!',
    // 	user: 'f',
    // 	icon: '/bots/grin.png',
    // 	href: '/achievements/did',
    // 	posted: new Date().toISOString(),
    // 	id: 'a',
    // },
  ]);
  const [listener, setListener] =
    useState<ThiccSocket<'listenForNotifications'>>();
  useEffect(() => {
    if (sessionId && !listener) {
      const list = api.listenForNotifications();
      setListener(list);
      list.listen((noti) => setNotifications([...notifications, noti]));
    }
  }, [notifications, listener]);
  return (
    <div className={styles.NotificationOverlay}>
      {notifications.map((n) => (
        <Noti
          notification={n}
          onClose={() => {
            const i = notifications.indexOf(n);
            setNotifications(
              notifications.slice(0, i).concat(notifications.slice(i + 1)),
            );
          }}
        />
      ))}
    </div>
  );
};
