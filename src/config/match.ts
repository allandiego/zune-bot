import { MatchType } from '@model/matchmaking/MatchModel';

export interface MatchSetting {
  type: MatchType;
  role: string;
  maxNumberOfPlayers: number;
}

export const matchesSettings: MatchSetting[] = [
  { type: 'game1', role: 'Game1', maxNumberOfPlayers: 2 },
  { type: 'game2', role: 'Game2', maxNumberOfPlayers: 4 },
  { type: 'game3', role: 'Game3', maxNumberOfPlayers: 2 },
  { type: 'game4', role: 'Game4', maxNumberOfPlayers: 8 },
];

export const rankedRoles = [
  { name: 'Master', color: 65507 },
  { name: 'Diamond', color: 8847348 },
  { name: 'Gold', color: 16775424 },
  { name: 'Silver', color: 5533306 },
  { name: 'Bronze', color: 10038562 },
];

// in ms
export const matchMaxAwaitingTime = 10 * 60 * 1000;

export const matchTypeList = matchesSettings.map(item => item.type);
export const matchTypeConcat = matchTypeList.join(', ');

export const moderatorRoleName = 'RankedMod';
