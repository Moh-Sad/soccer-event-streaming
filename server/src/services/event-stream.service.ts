import fs from "fs";
import { matchService } from "./match.service";

class MockEventService {
  startMock(id: string) {
    const data = JSON.parse(
      fs.readFileSync("src/data/mockEvents.json", "utf-8")
    );

    let totalDelay = 0;

    for (const event of data) {
      totalDelay += event.delay;

      setTimeout(() => {
        matchService.addEvent(id, {
          type: event.type,
          team: event.team,
          message: event.message,
          timestamp: Date.now(),
        });
      }, totalDelay);
    }
  }
}

export default new MockEventService();
