import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DecisionTree } from '../types/DecisionTree';

// ---- DB row type (what the table actually has) ----
// Supports both the new shape (tree_data) and old shape (nodes/root_node_id).
type DBDecisionTree = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;

  // NEW schema (preferred)
  tree_data: { nodes: any[]; rootNodeId: string } | null;

  // OLD schema (fallback if you haven't migrated yet)
  nodes?: any[] | null;
  root_node_id?: string | null;

  created_at: string;
};

type TreeData = { nodes: any[]; rootNodeId: string };

export const useDecisionTrees = () => {
  const [trees, setTrees] = useState<DecisionTree[]>([]);
  const [loading, setLoading] = useState(true);

  const rowToDecisionTree = (row: DBDecisionTree): DecisionTree => {
    // Prefer new jsonb "tree_data", fall back to legacy columns if present.
    const td: TreeData | null =
      (row.tree_data as TreeData | null) ??
      (row.nodes
        ? { nodes: row.nodes ?? [], rootNodeId: row.root_node_id ?? '' }
        : null);

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      icon: row.icon ?? '🌳',
      nodes: td?.nodes ?? [],
      rootNodeId: td?.rootNodeId ?? '',
      createdAt: new Date(row.created_at),
    };
  };

  const fetchTrees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('decision_trees')
      .select(
        // include both new and old so we can map either
        'id, title, description, icon, tree_data, nodes, root_node_id, created_at'
      )
      .order('created_at', { ascending: false })
      .returns<DBDecisionTree[]>();

    if (error) {
      console.error('Error fetching trees:', error.message, error.details, error.hint);
      setTrees([]);
    } else {
      setTrees((data ?? []).map(rowToDecisionTree));
    }
    setLoading(false);
  }, []);

  const createTree = useCallback(
    async (tree: Omit<DecisionTree, 'id' | 'createdAt'>) => {
      // Always write to tree_data (jsonb) to satisfy NOT NULL
      const tree_data: TreeData = {
        nodes: tree.nodes ?? [],
        rootNodeId: tree.rootNodeId || (tree.nodes?.[0]?.id ?? ''),
      };

      const insert = {
        title: tree.title,
        description: tree.description ?? '',
        icon: tree.icon ?? '🌳',
        tree_data, // <<< key piece
      };

      const { data, error } = await supabase
        .from('decision_trees')
        .insert(insert as any) // keep it simple for TS here
        .select(
          'id, title, description, icon, tree_data, nodes, root_node_id, created_at'
        )
        .single();

      if (error) {
        console.error('Error creating tree:', error.message, error.details, error.hint);
        throw error;
      }

      const newTree = rowToDecisionTree(data as DBDecisionTree);
      setTrees((prev) => [newTree, ...prev]);
      return newTree;
    },
    []
  );

  const updateTree = useCallback(
    async (id: string, updates: Partial<DecisionTree>) => {
      // Build the new tree_data by merging with what's in memory (or fetch if missing)
      const existing = trees.find((t) => t.id === id);
      let nextTreeData: TreeData | undefined;

      if (updates.nodes !== undefined || updates.rootNodeId !== undefined) {
        const baseNodes = updates.nodes ?? existing?.nodes ?? [];
        const baseRoot = updates.rootNodeId ?? existing?.rootNodeId ?? (baseNodes[0]?.id ?? '');
        nextTreeData = { nodes: baseNodes, rootNodeId: baseRoot };
      }

      const patch: Record<string, any> = {};
      if (updates.title !== undefined) patch.title = updates.title;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.icon !== undefined) patch.icon = updates.icon;
      if (nextTreeData) patch.tree_data = nextTreeData; // <<< write jsonb

      if (Object.keys(patch).length === 0) return;

      const { error } = await supabase
        .from('decision_trees')
        .update(patch)
        .eq('id', id);

      if (error) {
        console.error('Error updating tree:', error.message, error.details, error.hint);
        throw error;
      }

      // Update local state
      setTrees((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                ...(nextTreeData
                  ? { nodes: nextTreeData.nodes, rootNodeId: nextTreeData.rootNodeId }
                  : {}),
              }
            : t
        )
      );
    },
    [trees]
  );

  const deleteTree = useCallback(
    async (id: string) => {
      const before = trees;
      setTrees(prev => prev.filter(t => t.id !== id)); // optimistic

      try {
        const { data, error } = await supabase
          .from('decision_trees')
          .delete()
          .eq('id', id)
          .select('id')   // force return of deleted row
          .single();      // error if 0 rows

        if (error || !data?.id) {
          console.error('Delete failed:', error?.message, error?.details, error?.hint);
          setTrees(before); // rollback
          throw error ?? new Error('Delete did not return a row.');
        }
      } catch (err: any) {
        alert(`Could not delete tree: ${err?.message ?? err}`);
        throw err;
      }
    },
    [trees]
  );

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  return { trees, loading, createTree, updateTree, deleteTree, refetch: fetchTrees };
};