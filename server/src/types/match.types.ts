export type MatchEvent = {
  type: "goal" | "card" | "foul";
  team: "A" | "B";
  minute: number;
  player: string;
  cardType?: "yellow" | "red";
  description?: string;
};

export type Match = {
  id: string;
  teamA: string;
  teamB: string;
  started: boolean;
  scoreA: number;
  scoreB: number;
  events: MatchEvent[];
};
