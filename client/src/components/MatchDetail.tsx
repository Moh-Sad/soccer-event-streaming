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
import { Clock, Activity } from "lucide-react";

interface Props {
  match: Match;
}

const MatchDetail: React.FC<Props> = ({ match }) => {
  const [events, setEvents] = useState<MatchEvent[]>([]);

  useEffect(() => {
    const connection = subscribeToMatch(match.id, (event) => {
      setEvents((prev) => [event, ...prev]);
    });

    return () => connection.close();
  }, [match.id]);

  const getEventColor = (type: string) => {
    const colors = {
      goal: "bg-green-100 text-green-800 border-green-200",
      foul: "bg-orange-100 text-orange-800 border-orange-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[type as keyof typeof colors] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-linear-to-r from-slate-800 to-slate-700 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Activity className="h-6 w-6 text-red-400" />
            Live Match
          </CardTitle>
          <CardDescription className="text-slate-300">
            Real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold">{match.home}</div>
              <div className="text-sm text-slate-300">Home</div>
            </div>
            <div className="text-3xl font-bold text-green-400 mx-4">
              {match.score}
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{match.away}</div>
              <div className="text-sm text-slate-300">Away</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{match.time}</span>
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
            Real-time events stream ({events.length} events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Waiting for match events...</p>
              <p className="text-sm">Events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Badge
                    variant="secondary"
                    className={getEventColor(event.type)}
                  >
                    {event.type.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {event.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {event.timestamp}
                    </p>
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
