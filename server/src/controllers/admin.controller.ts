import { Request, Response } from "express";
import matchService from "@/services/match.service";

export const createMatch = (req: Request, res: Response) => {
  const { teamA, teamB } = req.body;
  const match = matchService.createMatch(teamA, teamB);
  res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
  const { id } = req.params;
  const match = matchService.startMatch(id);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json(match);
};

export const pushEvent = (req: Request, res: Response) => {
  const { id } = req.params;
  const event = req.body;

  const match = matchService.addEvent(id, event);

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  res.json(match);
};
