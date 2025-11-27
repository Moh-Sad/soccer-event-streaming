// components/Admin.tsx
import { createMatch, pushEvent, startMatch, getMatches } from "@/api/api";
import { Match, MatchEvent } from "@/types/types";
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
import { Play, Settings } from "lucide-react";

const AdminPage = ({ reload }: { reload: () => void }) => {
  const [form, setForm] = useState({ teamA: "", teamB: "" });
  const [eventForm, setEventForm] = useState({
    id: 1,
    minute: 0,
    type: "goal" as "goal" | "foul" | "card" | "substitution",
    player: "",
    team: "A" as "A" | "B",
    cardType: "yellow" as "yellow" | "red",
    playerIn: "",
    playerOut: "",
  });
  const [matches, setMatches] = useState<Match[]>([]);

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        if (mounted) setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      }
    };
    fetchMatches();
    return () => {
      mounted = false;
    };
  }, []);

  const create = async () => {
    if (!form.teamA.trim() || !form.teamB.trim()) return;
    try {
      await createMatch({ home: form.teamA, away: form.teamB });
      setForm({ teamA: "", teamB: "" }); // Reset form
      await loadMatches();
      reload();
    } catch (error) {
      console.error("Failed to create match:", error);
      alert("Failed to create match. Please try again.");
    }
  };

  const sendEvent = async () => {
    // Validation for substitution events
    if (
      eventForm.type === "substitution" &&
      (!eventForm.playerIn || !eventForm.playerOut)
    ) {
      alert(
        "Please fill in both Player In and Player Out for substitution events"
      );
      return;
    }

    // Build the event object based on type
    const eventData: Omit<MatchEvent, "_key"> = {
      type: eventForm.type,
      minute: eventForm.minute,
      team: eventForm.team,
    };

    // Add player for relevant events
    if (eventForm.type !== "substitution" && eventForm.player) {
      eventData.player = eventForm.player;
    }

    // Add cardType for card events
    if (eventForm.type === "card") {
      eventData.cardType = eventForm.cardType;
    }

    // Add substitution-specific fields
    if (eventForm.type === "substitution") {
      eventData.playerIn = eventForm.playerIn;
      eventData.playerOut = eventForm.playerOut;
      // For substitution, use playerOut as the main player if player field is empty
      if (!eventData.player) {
        eventData.player = eventForm.playerOut;
      }
    }

    try {
      await pushEvent(eventForm.id, eventData);
      setEventForm({
        ...eventForm,
        minute: 0,
        player: "",
        playerIn: "",
        playerOut: "",
      });
      await loadMatches();
      reload();
    } catch (error) {
      console.error("Failed to send event:", error);
      alert(
        "Failed to send event. Please check if the match exists and is started."
      );
    }
  };

  const handleStartMatch = async (matchId: number) => {
    try {
      await startMatch(matchId);
      await loadMatches();
      reload();
    } catch (error) {
      console.error("Failed to start match:", error);
      alert("Failed to start match. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-slate-700" />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Match */}
        <Card>
          <CardHeader>
            <CardTitle>Create Match</CardTitle>
            <CardDescription>Create a new soccer match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Team A"
              value={form.teamA}
              onChange={(e) => setForm({ ...form, teamA: e.target.value })}
            />
            <Input
              placeholder="Team B"
              value={form.teamB}
              onChange={(e) => setForm({ ...form, teamB: e.target.value })}
            />
            <Button
              onClick={create}
              disabled={!form.teamA.trim() || !form.teamB.trim()}
            >
              Create Match
            </Button>
          </CardContent>
        </Card>

        {/* Send Event */}
        <Card>
          <CardHeader>
            <CardTitle>Send Match Event</CardTitle>
            <CardDescription>Push real-time events to a match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Match ID"
              value={eventForm.id}
              onChange={(e) =>
                setEventForm({ ...eventForm, id: Number(e.target.value) })
              }
              min="1"
            />

            <Input
              type="number"
              placeholder="Minute"
              value={eventForm.minute}
              onChange={(e) =>
                setEventForm({ ...eventForm, minute: Number(e.target.value) })
              }
              min="0"
              max="120"
            />

            <Input
              placeholder="Player (optional)"
              value={eventForm.player}
              onChange={(e) =>
                setEventForm({ ...eventForm, player: e.target.value })
              }
            />

            {/* Show substitution-specific fields */}
            {eventForm.type === "substitution" && (
              <>
                <Input
                  placeholder="Player Out"
                  value={eventForm.playerOut}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, playerOut: e.target.value })
                  }
                />
                <Input
                  placeholder="Player In"
                  value={eventForm.playerIn}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, playerIn: e.target.value })
                  }
                />
              </>
            )}

            <Select
              value={eventForm.team}
              onValueChange={(t: "A" | "B") =>
                setEventForm({ ...eventForm, team: t })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Team A</SelectItem>
                <SelectItem value="B">Team B</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={eventForm.type}
              onValueChange={(t: "goal" | "foul" | "card" | "substitution") =>
                setEventForm({ ...eventForm, type: t })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="foul">Foul</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="substitution">Substitution</SelectItem>
              </SelectContent>
            </Select>

            {eventForm.type === "card" && (
              <Select
                value={eventForm.cardType}
                onValueChange={(value: "yellow" | "red") =>
                  setEventForm({ ...eventForm, cardType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yellow">Yellow Card</SelectItem>
                  <SelectItem value="red">Red Card</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={sendEvent}
              disabled={
                eventForm.type === "substitution" &&
                (!eventForm.playerIn || !eventForm.playerOut)
              }
            >
              Push Event
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Match List */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Matches</CardTitle>
          <CardDescription>Start matches and view status</CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-center text-slate-500 py-4">
              No matches created yet
            </p>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <strong>
                    {m.teamA} vs {m.teamB}
                  </strong>
                  <div className="text-sm text-slate-600">
                    ID: {m.id} • Events: {m.events?.length || 0}
                  </div>
                </div>

                {!m.started ? (
                  <Button onClick={() => handleStartMatch(m.id)}>
                    <Play className="h-4 w-4 mr-2" /> Start
                  </Button>
                ) : (
                  <span className="text-green-600 font-bold">LIVE 🔴</span>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
