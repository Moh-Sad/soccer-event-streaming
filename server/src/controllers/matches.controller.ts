import { Request, Response } from "express";
import { matchService } from "@/services/match.service";

export const listMatches = (_req: Request, res: Response) => {
  res.json(matchService.listLiveMatches());
};

export const streamMatch = (req: Request, res: Response) => {
  const id = req.params.id;

  // Check if id is provided
  if (!id) {
    res.status(400).json({ error: "Match ID is required" });
    return;
  }

  // Check if match exists
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

  // Send initial match data
  res.write(
    `data: ${JSON.stringify({
      type: "initial",
      match,
    })}\n\n`
  );

  // Subscribe to match updates
  matchService.subscribeToMatch(id, res);

  // Handle client disconnect
  req.on("close", () => {
    // Cleanup is handled in the service
  });
};

// Additional controller methods you might want:
export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB } = req.body;
  const match = matchService.createMatch(teamA, teamB);
  res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Match ID is required" });
    return;
  }

  const match = matchService.startMatch(id);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json(match);
};

export const addMatchEvent = (req: Request, res: Response) => {
  const { id } = req.params;
  const event = req.body;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Match ID is required" });
    return;
  }

  const match = matchService.addEvent(id, event);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json(match);
};
