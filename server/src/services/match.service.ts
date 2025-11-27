import fs from "fs";
import path from "path";
import { Match, MatchEvent } from "@/types/match.types";

const FILE_PATH = path.join(__dirname, "../data/matches.json");

class MatchService {
  public matches: Match[] = [];
  public nextId = 1;

  constructor() {
    this.loadData();
  }

  private loadData() {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, "[]");
    }

    const file = fs.readFileSync(FILE_PATH, "utf-8");
    this.matches = JSON.parse(file);

    if (this.matches.length > 0) {
      this.nextId = Math.max(...this.matches.map((m) => Number(m.id))) + 1;
    }
  }

  private saveData() {
    fs.writeFileSync(FILE_PATH, JSON.stringify(this.matches, null, 2));
  }

  createMatch(teamA: string, teamB: string) {
    const match: Match = {
      id: String(this.nextId++),
      teamA,
      teamB,
      started: false,
      scoreA: 0,
      scoreB: 0,
      events: [],
    };

    this.matches.push(match);
    this.saveData();

    return match;
  }

  getMatches() {
    return this.matches;
  }

  getMatch(id: string) {
    return this.matches.find((m) => m.id === id);
  }

  startMatch(id: string) {
    const match = this.getMatch(id);
    if (!match) return null;

    match.started = true;
    this.saveData();

    return match;
  }

  addEvent(id: string, event: MatchEvent) {
    const match = this.getMatch(id);
    if (!match) return null;

    match.events.push(event);

    if (event.type === "goal") {
      if (event.team === "A") match.scoreA++;
      if (event.team === "B") match.scoreB++;
    }

    this.saveData();
    return match;
  }
}

const matchService = new MatchService();
export default matchService;
