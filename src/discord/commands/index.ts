import { commandPrefix } from '@config/command';
import help from './help';
import ping from './ping';
import log from './log';
// import logReset from './logReset';
import argsInfo from './args';
import avatar from './avatar';
import kick from './kick';
import prune from './prune';
import server from './server';
import userInfo from './user-info';

// matchmaking commands
import match from './matchmaking/match';
import score from './matchmaking/score';
import rank from './matchmaking/rank';
import rankReset from './matchmaking/rankReset';
import top10 from './matchmaking/top10';
import machHistory from './matchmaking/machHistory';
import matchDelete from './matchmaking/matchDelete';
import matchCancel from './matchmaking/matchCancel';

const commands = [
  help,
  ping,
  log,
  // logReset,
  argsInfo,
  avatar,
  kick,
  prune,
  server,
  userInfo,

  match,
  matchDelete,
  matchCancel,
  machHistory,
  top10,
  score,
  rank,
  rankReset,
];

export { commandPrefix, commands };
