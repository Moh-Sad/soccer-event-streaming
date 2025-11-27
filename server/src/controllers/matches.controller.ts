import { Request, Response } from "express";
import matchService from "@/services/match.service";

export const listMatches = (_req: Request, res: Response) => {
  res.json(matchService.getMatches());
};

export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB } = req.body;
  const match = matchService.createMatch(teamA, teamB);
  res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
  const match = matchService.startMatch(req.params.id);
  match ? res.json(match) : res.status(404).json({ error: "Match not found" });
};

export const addMatchEvent = (req: Request, res: Response) => {
  const match = matchService.addEvent(req.params.id, req.body);
  match ? res.json(match) : res.status(404).json({ error: "Match not found" });
};

export const streamMatch = (req: Request, res: Response) => {
  const { id } = req.params;
  const match = matchService.getMatch(id);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Initial data
  res.write(`data: ${JSON.stringify(match)}\n\n`);

  // Poll every 1s (simple SSE)
  const interval = setInterval(() => {
    const updated = matchService.getMatch(id);
    res.write(`data: ${JSON.stringify(updated)}\n\n`);
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
};
