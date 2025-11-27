// types/types.ts
export interface MatchEvent {
  _key?: string;
  type: "goal" | "foul" | "card" | "substitution";
  minute: number;
  team: "A" | "B";
  player?: string;
  cardType?: "yellow" | "red";
  playerIn?: string;
  playerOut?: string;
  timestamp?: string;
  message?: string;
}

export interface Match {
  id: number;
  teamA: string;
  teamB: string;
  started: boolean;
  events: MatchEvent[];
  isLive?: boolean;
  home?: string;
  away?: string;
  time?: string;
  score?: string;
}
