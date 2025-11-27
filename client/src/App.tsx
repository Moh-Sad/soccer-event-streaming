// App.tsx
import { useState, useEffect, startTransition } from "react";
import { Match } from "@/types/types";
import { getMatches } from "@/api/api";
import MatchesList from "./components/MatchesList";
import MatchDetail from "./components/MatchDetail";
import AdminPage from "./components/Admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const App = () => {
  const [activeTab, setActiveTab] = useState<"user" | "admin" | "detail">(
    "user"
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const load = async () => {
    try {
      const data = await getMatches();
      startTransition(() => {
        setMatches(data);
        // Update selected match if it exists to keep data in sync
        if (selectedMatch) {
          const updatedMatch = data.find((m) => m.id === selectedMatch.id);
          if (updatedMatch) {
            setSelectedMatch(updatedMatch);
          }
        }
      });
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  useEffect(() => {
    load();
  });

  const openMatch = (match: Match) => {
    setSelectedMatch(match);
    setActiveTab("detail");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">⚽</span>
            Soccer Event Streaming
          </h1>
          <p className="text-slate-600">
            Live match updates and administration
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) =>
            setActiveTab(v as "user" | "admin" | "detail")
          }
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="user">User View</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedMatch}>
              Live Match
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <MatchesList matches={matches} reload={load} onOpen={openMatch} />
          </TabsContent>

          <TabsContent value="detail">
            {selectedMatch && (
              <MatchDetail match={selectedMatch} reload={load} />
            )}
          </TabsContent>

          <TabsContent value="admin">
            <AdminPage reload={load} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
