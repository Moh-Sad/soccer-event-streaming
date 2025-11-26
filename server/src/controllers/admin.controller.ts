import { Request, Response } from "express";
import { matchService } from "@/services/match.service";

export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB } = req.body;
  const match = matchService.createMatch(teamA, teamB);
  res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Match id is required" });
    }

    const match = matchService.startMatch(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin pushes manual events
export const pushEvent = (req: Request, res: Response) => {
  try {
    const { type, team, message } = req.body;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Match id is required" });
    }

    const event = matchService.addEvent(id, {
      type,
      team,
      message,
      timestamp: Date.now(),
    });

    if (!event) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
