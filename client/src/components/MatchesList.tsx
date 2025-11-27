import React from "react";
import { Match } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, Eye, Clock } from "lucide-react";

interface Props {
  matches: Match[];
  reload: () => void;
  onOpen: (m: Match) => void;
}

const MatchesList: React.FC<Props> = ({ matches, onOpen, reload }) => {
  // Separate live and upcoming matches
  const liveMatches = matches.filter((match) => match.isLive);
  const upcomingMatches = matches.filter((match) => !match.isLive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Available Matches</h2>
        <Button
          onClick={reload}
          variant="none"
          className="flex items-center gap-2 border bg-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Live Matches Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-700">Live Matches</h3>
        {liveMatches.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-slate-500">No live matches at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <Card
                key={match.id}
                className="hover:shadow-lg transition-shadow duration-300 border-2 border-green-500"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-center">
                    {match.home} vs {match.away}
                  </CardTitle>
                  <CardDescription className="text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE • {match.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-green-600">
                      {match.score}
                    </span>
                  </div>
                  <Button
                    onClick={() => onOpen(match)}
                    className="w-full flex items-center gap-2"
                    variant="default"
                  >
                    <Eye className="h-4 w-4" />
                    View Live Match
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Matches Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-700">
          Upcoming Matches
        </h3>
        {upcomingMatches.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-slate-500">No upcoming matches.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <Card
                key={match.id}
                className="hover:shadow-lg transition-shadow duration-300 bg-slate-50"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-center">
                    {match.home} vs {match.away}
                  </CardTitle>
                  <CardDescription className="text-center flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    UPCOMING
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-600">
                      0-0
                    </span>
                  </div>
                  <div className="text-center py-2">
                    <span className="text-sm text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                      Not Started
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fallback for no matches at all */}
      {matches.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-slate-500 text-lg">No matches available yet.</p>
            <p className="text-slate-400 mt-2">Check back later for matches!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchesList;
