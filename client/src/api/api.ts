// api.ts

import { Match, MatchEvent } from "@/types/types";

const API_URL = "http://localhost:8000";

// Fetch all matches
export const getMatches = async (): Promise<Match[]> => {
  const res = await fetch(`${API_URL}/matches`);
  return res.json();
};

// Create a match
export const createMatch = async (match: {
  home: string;
  away: string;
  score: string;
  time: string;
}): Promise<Match> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newMatch: Match = {
    id: Math.random(),
    home: match.home,
    away: match.away,
    score: "0-0", 
    time: "00:00",
    isLive: false, 
  };

  return newMatch;
};

// Subscribe to live events (SSE)
export const subscribeToMatch = (
  matchId: number,
  onEvent: (data: MatchEvent) => void
) => {
  const eventSource = new EventSource(`${API_URL}/matches/${matchId}/stream`);

  eventSource.onmessage = (e) => {
    const data: MatchEvent = JSON.parse(e.data);
    onEvent(data);
  };

  return eventSource;
};

// Admin: push event
export const pushEvent = async (
  matchId: number,
  message: string,
  type: string
) => {
  await fetch(`${API_URL}/admin/matches/${matchId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, type }),
  });
};

// Add this function to your api.ts
export const startMatch = async (matchId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Starting match ${matchId}`);
};
