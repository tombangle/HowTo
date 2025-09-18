import { useState, useEffect, useCallback } from 'react';
// ⬇️ Make sure this path matches your project!
//   If the file is at app/lib/supabase.ts, keep '@/app/lib/supabase'.
//   If it's at lib/supabase.ts (root-level), use '@/lib/supabase'.
import { supabase } from '@/app/lib/supabase';
import { DecisionTree } from '../types/DecisionTree';

// This should mirror your actual table columns in Supabase.
type DBDecisionTree = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  nodes: any[] | null;          // jsonb
  root_node_id: string | null;  // uuid/text
  created_at: string;           // timestamp string
  // ⚠️ Remove "tree_data" unless you actually created that column.
};

export const useDecisionTrees = () => {
  const [trees, setTrees] = useState<DecisionTree[]>([]);
  const [loading, setLoading] = useState(true);

  const mapRow = (row: DBDecisionTree): DecisionTree => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    icon: row.icon ?? '🌳',
    nodes: row.nodes ?? [],
    rootNodeId: row.root_node_id ?? '',
    createdAt: new Date(row.created_at),
  });

  const fetchTrees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('decision_trees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trees:', error);
      setTrees([]); // avoid stale UI
    } else {
      setTrees((data ?? []).map(mapRow));
    }
    setLoading(false);
  }, []);

  const createTree = useCallback(
    async (tree: Omit<DecisionTree, 'id' | 'createdAt'>) => {
      // Build an insert object WITHOUT undefined keys
      const insert: Partial<DBDecisionTree> = {
        title: tree.title,
        description: tree.description ?? '',
        icon: tree.icon ?? '🌳',
        nodes: tree.nodes ?? [],
        root_node_id: tree.rootNodeId ?? null,
        // Do NOT send created_at; let DB default (now()) handle it
      };

      const { data, error } = await supabase
        .from('decision_trees')
        .insert(insert)
        .select('*')
        .single<DBDecisionTree>();

      if (error) {
        console.error('Error creating tree:', error);
        throw error;
      }

      const newTree = mapRow(data!);
      setTrees(prev => [newTree, ...prev]);
      return newTree;
    },
    []
  );

  const updateTree = useCallback(
    async (id: string, updates: Partial<DecisionTree>) => {
      // Only include fields that were actually provided
      const patch: Partial<DBDecisionTree> = {};
      if (updates.title !== undefined) patch.title = updates.title;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.icon !== undefined) patch.icon = updates.icon;
      if (updates.nodes !== undefined) patch.nodes = updates.nodes;
      if (updates.rootNodeId !== undefined) patch.root_node_id = updates.rootNodeId;

      const { error } = await supabase
        .from('decision_trees')
        .update(patch)
        .eq('id', id);

      if (error) {
        console.error('Error updating tree:', error);
        throw error;
      }

      setTrees(prev => prev.map(t => (t.id === id ? { ...t, ...updates } as DecisionTree : t)));
    },
    []
  );

  const deleteTree = useCallback(
    async (id: string) => {
      const before = trees;
      setTrees(prev => prev.filter(t => t.id !== id)); // optimistic

      const { error } = await supabase.from('decision_trees').delete().eq('id', id);

      if (error) {
        console.error('Error deleting tree:', error);
        setTrees(before); // rollback
        throw error;
      }

      // optional: trust optimistic delete or refetch for consistency
      // await fetchTrees();
    },
    [trees]
  );

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  return { trees, loading, createTree, updateTree, deleteTree, refetch: fetchTrees };
};