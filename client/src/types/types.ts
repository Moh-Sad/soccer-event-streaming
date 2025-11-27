export interface Match {
  id: number;
  home: string;
  away: string;
  score: string;
  time: string;
  isLive: boolean;
}

export interface MatchEvent {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}
