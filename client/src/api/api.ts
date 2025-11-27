// api/api.ts
import { Match, MatchEvent } from "@/types/types";

const API_URL = "http://localhost:8000/api";

// Fetch all matches
export const getMatches = async (): Promise<Match[]> => {
  const res = await fetch(`${API_URL}/matches`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

// Create match
export const createMatch = async (match: {
  home: string;
  away: string;
}): Promise<Match> => {
  const res = await fetch(`${API_URL}/admin/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(match),
  });

  if (!res.ok) throw new Error("Failed to create match");
  return res.json();
};

// SSE subscription
export const subscribeToMatch = (
  matchId: number,
  onEvent: (event: MatchEvent) => void
) => {
  const es = new EventSource(`${API_URL}/matches/${matchId}/stream`);

  es.onmessage = (e) => {
    try {
      const data: MatchEvent = JSON.parse(e.data);
      onEvent(data);
    } catch (error) {
      console.error("Failed to parse SSE data:", error);
    }
  };

  es.onerror = (error) => {
    console.error("SSE connection error:", error);
  };

  return es;
};

// Push match event
export const pushEvent = async (
  matchId: number,
  eventData: Omit<MatchEvent, "_key">
) => {
  const res = await fetch(`${API_URL}/admin/matches/${matchId}/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) throw new Error("Failed to push event");
  return res.json();
};

// Start a match
export const startMatch = async (matchId: number) => {
  const res = await fetch(`${API_URL}/admin/matches/${matchId}/start`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to start match");
  return res.json();
};
