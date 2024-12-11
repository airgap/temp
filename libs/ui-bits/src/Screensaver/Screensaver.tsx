import gsap from 'gsap';
import { api } from 'monolith-ts-api';
import {
  ReactNode,
  createRef,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import { Logo } from '../Logo';
import { listen } from '../Sonic';
import { phrasebook } from '../phrasebook';
import styles from './Screensaver.module.sass';
import tickPath from './tick.wav';
import { Bounce, Channel } from '@lyku/json-models';

const tick = new Audio(tickPath);
tick.load();
const flashColors = {
  edge: 'green',
  corner: 'blue',
  neither: 'red',
};
const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback],
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]); // Make sure the effect runs only once
};
export const Screensaver = (props: {
  channel?: Channel;
  children?: ReactNode;
  ready: boolean;
}) => {
  const [showTut, setShowTut] = useState(true);
  const [width] = useState(640);
  const [height] = useState(480);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [edges, setEdges] = useState(0);
  const [corners, setCorners] = useState(0);
  const logo = createRef<HTMLImageElement>();
  const flash = createRef<HTMLDivElement>();

  const pointsAsText = (key: 'edge' | 'corner') => {
    const points = { edge: edges, corner: corners }[key];
    const plural = Number(points !== 1);
    const phrase = {
      edge: [phrasebook.bounceEdge, phrasebook.bounceEdges],
      corner: [phrasebook.bounceCorner, phrasebook.bounceCorners],
    }[key][plural];
    return `${points} ${phrase}`;
  };
  const calcX = (time: number) => pingPong(time, 7000);
  const calcY = (time: number) => pingPong(time, 5300);
  useAnimationFrame(() => {
    const w = width - 147,
      h = height - 100;
    const now = +new Date();
    setX(calcX(now) * w);
    setY(calcY(now) * h);
  });
  useEffect(() => {
    listen('pulledScores', (e) => {
      setEdges(e.edges);
      setCorners(e.corners);
      setShowTut(false);
    });
    // aniref.current = requestAnimationFrame(animate);
    // return () => void (aniref.current && cancelAnimationFrame(aniref.current));
  }, []);
  // 0.495 = HARD
  const calcPoints = (val: number) => Math.abs(val - 0.5) > 0.493;
  const score = (x: boolean, y: boolean) => {
    const corner = x && y;
    corner ? setCorners(corners + 1) : setEdges(edges + 1);
    return api.bounced({
      edge: !corner,
      corner,
      channelId: props.channel?.id,
    });
  };
  const flashBox = (type: keyof typeof flashColors) => {
    gsap.fromTo(
      flash.current,
      {
        backgroundColor: flashColors[type],
      },
      {
        backgroundColor: 'transparent',
        duration: 1,
      },
    );
  };
  const click = () => {
    const now = Number(new Date());
    const xPoints = calcPoints(calcX(now));
    const yPoints = calcPoints(calcY(now));
    const hit = xPoints || yPoints;
    const bounceTypes: Bounce[] = ['neither', 'edge', 'corner'];
    const type = bounceTypes[Number(xPoints) + Number(yPoints)];
    flashBox(type);
    if (hit) {
      if (showTut) setShowTut(false);
      void score(xPoints, yPoints);
      void tick.play();
    } else {
      setEdges(0);
      setCorners(0);
    }
    console.log(xPoints, yPoints);
  };
  return (
    <div className={styles.ScreenSaver} onMouseDown={click}>
      <div className={styles.SaverScorebox}>
        <div className={styles.SaverScoreText}>
          {showTut ? (
            phrasebook.bounceTutorial
          ) : (
            <>
              <div>{pointsAsText('corner')}</div>
              <div>{pointsAsText('edge')}</div>
            </>
          )}
        </div>
      </div>
      <Logo x={x} y={y} logoRef={logo} flashRef={flash}>
        {props.children}
      </Logo>
    </div>
  );
};

const pingPong = (time: number, int: number) => {
  const intervals = ~~(time / int);
  const up = intervals % 2;
  const rem = time / int - intervals;
  const y = up ? 1 - rem : rem;
  // console.log(intervals, rem, y)
  return y;
};
