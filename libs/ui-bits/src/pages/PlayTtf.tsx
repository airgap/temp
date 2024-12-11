import { AchievementList } from '../AchievementList';
import { TtfBoard } from '../TtfBoard';
import { Button } from '../Button';
import { Divisio } from '../Divisio';
import { MatchInfo } from '../MatchInfo';
import { MatchList } from '../MatchList';
import { MatchProposalList } from '../MatchProposalList';
import { useCurrentUser } from '../currentUserStore';
import styles from './PlayTtf.module.sass';
import { api, ThiccSocket } from 'monolith-ts-api';
import { useCallback, useEffect, useState } from 'react';
import { TtfMatch } from '@lyku/json-models';
import { games } from '@lyku/stock-docs';
import { FriendInviter } from '../FriendInviter';
import { TtfBotList } from '../TtfBotList';
import { WinPanel } from '../WinPanel';
const { id } = games.ticTacFlow;
const getMatchId = () => window.location.hash.substring(1);
export const PlayTtf = () => {
  const user = useCurrentUser();
  const [matchId, setMatchId] = useState<string>(getMatchId());
  const [match, setMatch] = useState<TtfMatch>();
  const [showInvites, setShowInvites] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showBots, setShowBots] = useState(false);
  const [streamer, setStreamer] = useState<ThiccSocket<'listenForTtfPlays'>>();
  useEffect(() => {
    if (matchId && !streamer) {
      const s = api.listenForTtfPlays(matchId);
      console.log('settings streamer', s);
      setStreamer(s);
      s.listen(setMatch);
    }
    if (!matchId && match) {
      setMatch(undefined);
      if (streamer) {
        streamer.close();
        setStreamer(undefined);
      }
    }
  }, [matchId, streamer, match]);
  const hashchange = useCallback(() => setMatchId(getMatchId()), []);
  useEffect(() => {
    document.body.className = styles.ttf;
  }, []);
  useEffect(() => {
    window.addEventListener('hashchange', hashchange);
  }, [hashchange]);
  return (
    <Divisio layout="v" size="m">
      <div
        style={{
          width: 'min(min(600px, 60vh), 60vw)',
          flexFlow: 'column',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {match && <MatchInfo match={match} />}
        <TtfBoard
          user={user}
          match={match}
          overlay={
            matchId ? (
              match?.winner && <WinPanel user={user} match={match} />
            ) : user ? (
              showMatches ? (
                <MatchList user={user} onClose={() => setShowMatches(false)} />
              ) : showInvites ? (
                <MatchProposalList
                  onClose={() => setShowInvites(false)}
                  user={user}
                />
              ) : showFriends ? (
                <FriendInviter
                  game={id}
                  user={user}
                  onClose={() => setShowFriends(false)}
                />
              ) : showBots ? (
                <TtfBotList onClose={() => setShowBots(false)} />
              ) : (
                <>
                  <h1>Tic Tac Flow</h1>
                  <Button onClick={() => setShowMatches(true)}>Continue</Button>
                  <Button onClick={() => setShowInvites(true)}>
                    Match invites
                  </Button>
                  <Button onClick={() => setShowFriends(true)}>
                    Challenge friend
                  </Button>
                  <Button onClick={() => setShowBots(true)}>
                    Challenge bot
                  </Button>
                </>
              )
            ) : (
              <>
                <h1>Tic Tac Flow</h1>
                Create an account to play with friends!
                {showBots ? (
                  <TtfBotList onClose={() => setShowBots(false)} />
                ) : (
                  <Button onClick={() => setShowBots(true)}>
                    Challenge bot
                  </Button>
                )}
              </>
            )
          }
        />
      </div>
      <AchievementList game={id} />
    </Divisio>
  );
};
