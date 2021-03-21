import { commandPrefix } from '@config/command';
import help from './help';
import argsInfo from './args-info';
import avatar from './avatar';
import kick from './kick';
import ping from './ping';
import prune from './prune';
import server from './server';
import userInfo from './user-info';

// matchmaking commands
import match from './matchmaking/match';
import score from './matchmaking/score';
import ranking from './matchmaking/ranking';
import top10 from './matchmaking/top10';
import history from './matchmaking/history';

// const commands = [
//   argsInfo,
//   avatar,
//   help,
//   kick,
//   ping,
//   prune,
//   server,
//   userInfo,
//   match,
// ];

const commands = [help, match, score, top10, ranking, history];

export { commandPrefix, commands };
