import line from '../assets/line.png';
import linev from '../assets/linev.png';
import { api } from 'monolith-ts-api';
import { ImgHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { BoardButtons } from '../BoardButtons';
import { Pieces } from '../Pieces';
import { Wave } from '../Wave';
import { Center } from '../Center';
import { Divisio } from '../Divisio';
import { TtfMatch, User } from '@lyku/json-models';
import styles from './TtfBoard.module.sass';

const lines = {
  h: {
    path: line,
    fit: 'width',
    axis: 'Y',
  },
  v: {
    path: linev,
    fit: 'height',
    axis: 'X',
  },
} as const;
export const Line = (
  props: {
    orientation: keyof typeof lines;
  } & ImgHTMLAttributes<HTMLImageElement>,
) => {
  const l = lines[props.orientation];
  return (
    <img
      alt={'octothorp line'}
      src={l.path}
      {...props}
      style={Object.assign(
        {
          display: 'block',
          position: 'absolute',
          [l.fit]: '100%',
          transform: `translate${l.axis}(-50%)`,
        },
        props.style,
      )}
    />
  );
};
export const TtfBoard = ({
  match,
  overlay,
  user,
}: {
  match?: TtfMatch;
  overlay?: ReactNode;
  user?: User;
}) => {
  const [pending, setPending] = useState(false);
  console.log('user', user);
  const amX = match?.X === user?.id;
  const xTurn = Boolean(match && match.turn % 2);
  const myTurn = amX === xTurn;
  console.log('myTurn', myTurn);
  useEffect(() => {
    setPending(false);
    console.log(match);
  }, [match]);
  return (
    <div className={styles.TtfBoard}>
      <div style={{ transition: '.5s', opacity: overlay ? 0.25 : 1 }}>
        <Line orientation="h" style={{ top: '33.33%' }} />
        <Line orientation="h" style={{ top: '66.66%' }} />
        <Line
          orientation="v"
          style={{
            left: '33.33%',
            transformOrigin: 'top left', //height: '100%'
          }}
        />
        <Line
          orientation="v"
          style={{
            left: '66.66%',
            transformOrigin: 'top left',
          }}
        />
        {match && !pending && myTurn && !overlay && (
          <BoardButtons
            match={match}
            onClick={(i) => {
              if (!match) return;
              setPending(true);
              api.placePiece({
                match: match.id,
                square: i,
              });
            }}
          />
        )}
        {match && (
          <>
            <Pieces match={match} />
            <Wave turn={match.turn} />
          </>
        )}
      </div>
      {overlay && (
        <div
          style={{
            alignItems: 'center',
            // flexDirection: 'column',
            height: '100%',
            padding: '0',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <Center>
            <div
              style={{
                // position: 'absolute',
                width: '95%',
                height: '95%',
                verticalAlign: 'middle',
                padding: '2.5%',
                borderRadius: '2.5%',
                overflow: 'hidden',
                overflowY: 'auto',
                // display: 'flex',
                // flexBasis: 'fit-content',
                // flexShrink: 1,
                // display: showMenu ? 'block' : 'none',
                backdropFilter: 'blur(20px)',
                background: '#000000cc',
                boxShadow: '0 0 20px 0 black',
                flexDirection: 'column',
                gap: '5%',
              }}
            >
              <Divisio layout={'v'} size={'l'}>
                {overlay}
              </Divisio>
            </div>
          </Center>
        </div>
      )}
    </div>
  );
};
