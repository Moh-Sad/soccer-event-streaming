export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  started: boolean;
  scoreA: number;
  scoreB: number;
  events: MatchEvent[];
}

export interface MatchEvent {
  type: "goal" | "card" | "foul";
  team?: "A" | "B";
  message: string;
  timestamp: number;
}
