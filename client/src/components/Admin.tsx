import { createMatch, pushEvent, startMatch, getMatches } from "@/api/api";
import { Match } from "@/types/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Send, Play, Settings } from "lucide-react";

const AdminPage = ({ reload }: { reload: () => void }) => {
  const [form, setForm] = useState({
    home: "",
    away: "",
    score: "0-0",
    time: "00:00",
    isLive: false,
  });

  const [eventForm, setEventForm] = useState({
    id: 1,
    message: "",
    type: "goal",
  });

  const [matches, setMatches] = useState<Match[]>([]);

  const loadMatches = async () => {
    const data = await getMatches();
    setMatches(data);
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const data = await getMatches();
      if (!cancelled) setMatches(data);
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    await createMatch(form);
    reload();
    loadMatches();
  };

  const sendEvent = async () => {
    await pushEvent(eventForm.id, eventForm.message, eventForm.type);
    alert("Event pushed!");
  };

  const handleStartMatch = async (matchId: number) => {
    await startMatch(matchId);
    reload();
    loadMatches();
    alert("Match started successfully!");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-slate-700" />
        <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Match
            </CardTitle>
            <CardDescription>
              Create a new soccer match for streaming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Home Team"
                value={form.home}
                onChange={(e) => setForm({ ...form, home: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="Away Team"
                value={form.away}
                onChange={(e) => setForm({ ...form, away: e.target.value })}
                className="w-full"
              />
            </div>
            <Button
              onClick={create}
              className="w-full"
              disabled={!form.home || !form.away}
            >
              Create Match
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Match Event
            </CardTitle>
            <CardDescription>
              Push real-time events to live matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Match ID"
                type="number"
                value={eventForm.id}
                onChange={(e) =>
                  setEventForm({ ...eventForm, id: Number(e.target.value) })
                }
                className="w-full"
              />
              <Input
                placeholder="Event Message"
                value={eventForm.message}
                onChange={(e) =>
                  setEventForm({ ...eventForm, message: e.target.value })
                }
                className="w-full"
              />
              <Select
                value={eventForm.type}
                onValueChange={(value) =>
                  setEventForm({ ...eventForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal">Goal 🥅</SelectItem>
                  <SelectItem value="foul">Foul ⚠️</SelectItem>
                  <SelectItem value="yellow">Yellow Card 🟨</SelectItem>
                  <SelectItem value="red">Red Card 🟥</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={sendEvent}
              className="w-full"
              disabled={!eventForm.message}
            >
              Push Event
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Manage Matches
          </CardTitle>
          <CardDescription>
            Start matches and manage live events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {matches.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No matches created yet.</p>
            </div>
          )}

          {/* Live Matches */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-700">
              Live Matches
            </h4>
            {matches.filter((m) => m.isLive).length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <p>No live matches</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches
                  .filter((m) => m.isLive)
                  .map((match) => (
                    <Card
                      key={match.id}
                      className="border-2 border-green-500 bg-green-50"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-center">
                          {match.home} vs {match.away}
                        </CardTitle>
                        <CardDescription className="text-center flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {match.score}
                        </div>
                        <p className="text-sm text-slate-600">
                          Time: {match.time}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Upcoming Matches */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-700">
              Upcoming Matches
            </h4>
            {matches.filter((m) => !m.isLive).length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <p>No upcoming matches</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches
                  .filter((m) => !m.isLive)
                  .map((match) => (
                    <Card key={match.id} className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-center">
                          {match.home} vs {match.away}
                        </CardTitle>
                        <CardDescription className="text-center flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          UPCOMING
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center space-y-3">
                        <div className="text-2xl font-bold text-blue-600">
                          0-0
                        </div>
                        <Button
                          onClick={() => handleStartMatch(match.id)}
                          className="w-full flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Start Match
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
