import { Match, MatchEvent } from "@/types/match.types";
import { Response } from "express";

class MatchService {
  public matches: Match[] = [];
  private streams: Map<string, Response[]> = new Map(); // SSE subscribers

  createMatch(teamA: string, teamB: string) {
    const match: Match = {
      id: String(Date.now()),
      teamA,
      teamB,
      started: false,
      scoreA: 0,
      scoreB: 0,
      events: [],
    };

    this.matches.push(match);
    return match;
  }

  startMatch(id: string) {
    const match = this.matches.find((m) => m.id === id);
    if (!match) return null;

    match.started = true;
    return match;
  }

  addEvent(id: string, event: MatchEvent) {
    const match = this.matches.find((m) => m.id === id);
    if (!match) return null;

    match.events.push(event);

    // Update score on goal
    if (event.type === "goal") {
      if (event.team === "A") match.scoreA++;
      else if (event.team === "B") match.scoreB++;
    }

    // Push to subscribers
    const subs = this.streams.get(id) || [];
    for (const res of subs) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    return match;
  }

  // ---- NEW: Return only live matches ----
  listLiveMatches() {
    return this.matches.filter((m) => m.started);
  }

  // ---- NEW: Subscribe to server-sent events ----
  subscribeToMatch(id: string, res: Response) {
    if (!this.streams.has(id)) {
      this.streams.set(id, []);
    }

    this.streams.get(id)!.push(res);

    // Remove client when they disconnect
    res.on("close", () => {
      this.streams.set(
        id,
        this.streams.get(id)!.filter((r) => r !== res)
      );
      res.end();
    });
  }

  getMatches() {
    return this.matches;
  }

  getMatch(id: string) {
    return this.matches.find((m) => m.id === id);
  }
}

export const matchService = new MatchService();
