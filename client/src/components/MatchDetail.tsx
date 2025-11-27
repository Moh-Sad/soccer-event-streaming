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
import {
  Clock,
  Activity,
  Volleyball,
  User,
  Users,
  AlertCircle,
} from "lucide-react";

interface Props {
  match: Match;
  reload?: () => void;
}

const MatchDetail: React.FC<Props> = ({ match, reload }) => {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Safe match data with defaults
  const safeMatch = {
    id: match?.id || 0,
    teamA: match?.teamA || "Team A",
    teamB: match?.teamB || "Team B",
    started: match?.started || false,
    events: match?.events || [],
  };

  // Derive initial events from match prop using useMemo
  React.useEffect(() => {
    setEvents(
      (safeMatch.events || []).filter(
        (event) =>
          event &&
          typeof event.type === "string" &&
          typeof event.minute === "number"
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  useEffect(() => {
    console.log(
      "MatchDetail: Setting up SSE connection for match",
      safeMatch.id
    );

    if (!safeMatch.id) {
      console.error("No valid match ID provided");
      return;
    }

    let connection: EventSource | null = null;

    try {
      connection = subscribeToMatch(safeMatch.id, (event) => {
        console.log("MatchDetail: Received event", event);

        // Validate the incoming event before adding it
        if (
          !event ||
          typeof event.type !== "string" ||
          typeof event.minute !== "number"
        ) {
          console.error("Invalid event received:", event);
          return;
        }

        setEvents((prev) => {
          // Create unique key for each event to avoid duplicates
          const eventKey = `${event.minute}-${event.type}-${
            event.player || "unknown"
          }-${Date.now()}`;
          const newEvent = { ...event, _key: eventKey };
          return [newEvent, ...prev];
        });

        // Reload parent data to stay in sync
        if (reload) {
          setTimeout(() => reload(), 100);
        }
      });

      // Handle connection errors
      if (connection) {
        connection.onerror = (error) => {
          console.error("SSE connection error:", error);
          setConnectionError("Failed to connect to live updates");
        };

        connection.onopen = () => {
          console.log("SSE connection established");
          setConnectionError(null);
        };
      }
    } catch (error) {
      console.error("Failed to set up SSE connection:", error);
      setTimeout(() => {
        setConnectionError("Failed to set up live updates connection");
      }, 0);
    }

    return () => {
      console.log("MatchDetail: Cleaning up SSE connection");
      if (connection) {
        connection.close();
      }
    };
  }, [safeMatch.id, reload]); // Remove match from dependencies

  // Calculate score from events
  const calculateScore = (): string => {
    try {
      const validEvents = events.filter(
        (event) => event && event.type && event.team
      );

      const goalsA = validEvents.filter(
        (event) => event.type === "goal" && event.team === "A"
      ).length;
      const goalsB = validEvents.filter(
        (event) => event.type === "goal" && event.team === "B"
      ).length;
      return `${goalsA}-${goalsB}`;
    } catch (error) {
      console.error("Error calculating score:", error);
      return "0-0";
    }
  };

  // Get current match time (latest event minute or 0)
  const getCurrentTime = (): string => {
    try {
      const validEvents = events.filter(
        (event) => event && typeof event.minute === "number"
      );

      if (validEvents.length === 0) return "0'";
      const latestMinute = Math.max(
        ...validEvents.map((event) => event.minute || 0)
      );
      return `${Math.min(latestMinute + 1, 90)}'`;
    } catch (error) {
      console.error("Error calculating current time:", error);
      return "0'";
    }
  };

  // Generate event message based on event type
  const generateEventMessage = (event: MatchEvent): string => {
    try {
      // Validate event properties
      if (!event || !event.type) {
        return "Invalid event";
      }

      const teamName = event.team === "A" ? safeMatch.teamA : safeMatch.teamB;

      switch (event.type) {
        case "goal":
          return `⚽ GOAL! ${
            event.player || "Unknown player"
          } scores for ${teamName}`;

        case "foul":
          return `🦶 Foul by ${event.player || "Unknown player"} (${teamName})`;

        case "card":
          { const cardType =
            event.cardType === "red" ? "RED CARD" : "YELLOW CARD";
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
    } catch (error) {
      console.error("Error generating event message:", error);
      return "Event processing error";
    }
  };

  const getEventColor = (event: MatchEvent) => {
    if (!event || !event.type) {
      return "bg-slate-100 text-slate-800 border-slate-200";
    }

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
    if (!event || !event.type) {
      return <Activity className="h-4 w-4" />;
    }

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

  // Filter valid events for rendering
  const validEvents = events.filter(
    (event) => event && event.type && typeof event.type === "string"
  );

  const currentScore = calculateScore();
  const currentTime = getCurrentTime();

  // If no valid match, show error
  if (!match || !safeMatch.id) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No Match Selected
          </h3>
          <p className="text-slate-600">
            Please select a valid match to view details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {connectionError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span>{connectionError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-linear-to-r from-slate-800 to-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Activity className="h-6 w-6 text-red-400" />
            {safeMatch.started ? "Live Match" : "Match Preview"}
          </CardTitle>
          <CardDescription className="text-slate-300">
            {safeMatch.started ? "Real-time updates" : "Match not started yet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold">{safeMatch.teamA}</div>
              <div className="text-sm text-slate-300">Home</div>
            </div>
            <div className="text-3xl font-bold text-green-400 mx-4">
              {currentScore}
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{safeMatch.teamB}</div>
              <div className="text-sm text-slate-300">Away</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
            {!safeMatch.started && (
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
            {safeMatch.started ? "Real-time events stream" : "Match events"} (
            {validEvents.length} events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>
                {safeMatch.started
                  ? "Waiting for match events..."
                  : "No events yet. Match has not started."}
              </p>
              <p className="text-sm">
                {safeMatch.started
                  ? "Events will appear here in real-time"
                  : "Events will appear once the match starts"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {validEvents.map((event, index) => (
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
                        {/* Safe type access with fallback */}
                        {(event.type || "unknown").toUpperCase()}
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
                        {event.minute || 0}'
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Team {event.team || "Unknown"}
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
