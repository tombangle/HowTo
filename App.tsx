import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Dashboard from "./src/screens/Dashboard";
import TreeBuilder from "./src/screens/TreeBuilder";
import TreePlayer from "./src/screens/TreePlayer";
import { supabase } from "./src/lib/supabase";

type Screen = "dashboard" | "builder" | "player";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [selectedTreeId, setSelectedTreeId] = useState<string>("");
  const [editingTreeId, setEditingTreeId] = useState<string>("");

  const handleCreateNew = () => setCurrentScreen("builder");
  const handleSelectTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setCurrentScreen("player");
  };
  const handleEditTree = (treeId: string) => {
    setEditingTreeId(treeId);
    setCurrentScreen("builder");
  };
  const handleBack = () => {
    setCurrentScreen("dashboard");
    setSelectedTreeId("");
    setEditingTreeId("");
  };

  // --- one-time env + Supabase ping ---
  useEffect(() => {
  (async () => {
    console.log("ENV check:", {
      url_set: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
      key_len: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    });

    console.log("Boot ping → decision_trees");
    try {
      const { data, error } = await supabase
        .from("decision_trees") // <-- exact table name
        .select("id")
        .limit(1);

      if (error) throw error;
      console.log("Supabase ping ok, rows:", data?.length ?? 0);
    } catch (err: unknown) {
      console.error("Supabase ping threw:", err);
    }
    })();
  }, []);
  // -------------------------------------

  return (
    <View style={styles.container}>
      {currentScreen === "dashboard" && (
        <Dashboard
          onCreateNew={handleCreateNew}
          onSelectTree={handleSelectTree}
          onEditTree={handleEditTree}
        />
      )}
      {currentScreen === "builder" && (
        <TreeBuilder onBack={handleBack} editingTreeId={editingTreeId} />
      )}
      {currentScreen === "player" && (
        <TreePlayer treeId={selectedTreeId} onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3e1fef" },
});