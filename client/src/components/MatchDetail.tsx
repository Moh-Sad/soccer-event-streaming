// components/MatchDetail.tsx
import { subscribeToMatch } from "@/api/api";
import { Match, MatchEvent } from "@/types/types";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Volleyball, User, Users } from "lucide-react";

interface Props {
  match: Match;
  reload?: () => void;
}

const MatchDetail: React.FC<Props> = ({ match, reload }) => {
  const [events, setEvents] = useState<MatchEvent[]>(match.events || []);
  const [currentMatch, setCurrentMatch] = useState<Match>(match);

  useEffect(() => {
    setCurrentMatch(match);
    setEvents(match.events || []);
  }, [match]);

  useEffect(() => {
    const connection = subscribeToMatch(match.id, (event) => {
      setEvents((prev) => {
        // Create unique key for each event to avoid duplicates
        const eventKey = `${event.minute}-${event.type}-${
          event.player
        }-${Date.now()}`;
        const newEvent = { ...event, _key: eventKey };
        return [newEvent, ...prev];
      });

      // Reload parent data to stay in sync
      if (reload) {
        setTimeout(() => reload(), 100);
      }
    });

    return () => connection.close();
  }, [match.id, reload]);

  // Calculate score from events
  const calculateScore = (): string => {
    const goalsA = events.filter(
      (event) => event.type === "goal" && event.team === "A"
    ).length;
    const goalsB = events.filter(
      (event) => event.type === "goal" && event.team === "B"
    ).length;
    return `${goalsA}-${goalsB}`;
  };

  // Get current match time (latest event minute or 0)
  const getCurrentTime = (): string => {
    if (events.length === 0) return "0'";
    const latestMinute = Math.max(...events.map((event) => event.minute));
    return `${Math.min(latestMinute + 1, 90)}'`;
  };

  // Generate event message based on event type
  const generateEventMessage = (event: MatchEvent): string => {
    const teamName =
      event.team === "A" ? currentMatch.teamA : currentMatch.teamB;

    switch (event.type) {
      case "goal":
        return `⚽ GOAL! ${
          event.player || "Unknown player"
        } scores for ${teamName}`;

      case "foul":
        return `🦶 Foul by ${event.player || "Unknown player"} (${teamName})`;

      case "card":
        { const cardType = event.cardType === "red" ? "RED CARD" : "YELLOW CARD";
        const cardEmoji = event.cardType === "red" ? "🟥" : "🟨";
        return `${cardEmoji} ${cardType}! ${
          event.player || "Unknown player"
        } (${teamName})`; }

      case "substitution":
        return `🔄 Substitution: ${event.playerOut || "Player out"} → ${
          event.playerIn || "Player in"
        } (${teamName})`;

      default:
        return `Event: ${event.type} for ${teamName}`;
    }
  };

  // Format timestamp
  const formatTimestamp = (minute: number): string => {
    return `${minute}'`;
  };

  const getEventColor = (event: MatchEvent) => {
    if (event.type === "goal") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (event.type === "foul") {
      return "bg-orange-100 text-orange-800 border-orange-200";
    } else if (event.type === "card") {
      return event.cardType === "red"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if (event.type === "substitution") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const getEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case "goal":
        return <Volleyball className="h-4 w-4" />;
      case "card":
        return <User className="h-4 w-4" />;
      case "substitution":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Use teamA and teamB as home and away
  const homeTeam = currentMatch.teamA;
  const awayTeam = currentMatch.teamB;
  const currentScore = calculateScore();
  const currentTime = getCurrentTime();

  return (
    <div className="space-y-6">
      <Card className="bg-linear-to-r from-slate-800 to-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Activity className="h-6 w-6 text-red-400" />
            {currentMatch.started ? "Live Match" : "Match Preview"}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {currentMatch.started
              ? "Real-time updates"
              : "Match not started yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold">{homeTeam}</div>
              <div className="text-sm text-slate-300">Home</div>
            </div>
            <div className="text-3xl font-bold text-green-400 mx-4">
              {currentScore}
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{awayTeam}</div>
              <div className="text-sm text-slate-300">Away</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
            {!currentMatch.started && (
              <Badge
                variant="secondary"
                className="ml-2 bg-yellow-500 text-white"
              >
                Not Started
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Match Events
          </CardTitle>
          <CardDescription>
            {currentMatch.started ? "Real-time events stream" : "Match events"}{" "}
            ({events.length} events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>
                {currentMatch.started
                  ? "Waiting for match events..."
                  : "No events yet. Match has not started."}
              </p>
              <p className="text-sm">
                {currentMatch.started
                  ? "Events will appear here in real-time"
                  : "Events will appear once the match starts"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={
                    event._key ||
                    `${event.minute}-${event.type}-${event.player}-${index}`
                  }
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-20">
                    <Badge variant="secondary" className={getEventColor(event)}>
                      <div className="flex items-center gap-1">
                        {getEventIcon(event)}
                        {event.type.toUpperCase()}
                      </div>
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {generateEventMessage(event)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500">
                        {formatTimestamp(event.minute)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Team {event.team}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchDetail;
