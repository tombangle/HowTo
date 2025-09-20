import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DecisionTree } from '../types/DecisionTree';

// Mirrors your DB columns
type DBDecisionTree = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  nodes: any[] | null;          // jsonb
  root_node_id: string | null;  // uuid/text
  created_at: string;           // timestamptz
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
      .order('created_at', { ascending: false })
      .returns<DBDecisionTree[]>();        // 👈 type the result here

    if (error) {
      console.error('Error fetching trees:', error);
      setTrees([]);
    } else {
      setTrees((data ?? []).map(mapRow));
    }
    setLoading(false);
  }, []);

  const createTree = useCallback(
    async (tree: Omit<DecisionTree, 'id' | 'createdAt'>) => {
      // Insert shape: no id/created_at
      const insert: Omit<DBDecisionTree, 'id' | 'created_at'> = {
        title: tree.title,
        description: tree.description ?? '',
        icon: tree.icon ?? '🌳',
        nodes: tree.nodes ?? [],
        root_node_id: tree.rootNodeId ?? null,
      };

      const { data, error } = await supabase
        .from('decision_trees')
        .insert(insert)
        .select('*')
        .single()                           // single row
        .then((res: any) => {
          // Give TS the row type
          if ('data' in res) (res as any).data as DBDecisionTree;
          return res as { data: DBDecisionTree | null; error: any };
        });

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
      const patch: Partial<DBDecisionTree> = {};
      if (updates.title !== undefined) patch.title = updates.title;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.icon !== undefined) patch.icon = updates.icon;
      if (updates.nodes !== undefined) patch.nodes = updates.nodes;
      if (updates.rootNodeId !== undefined) patch.root_node_id = updates.rootNodeId;

      if (Object.keys(patch).length === 0) return;

      const { error } = await supabase
        .from('decision_trees')
        .update(patch)
        .eq('id', id);

      if (error) {
        console.error('Error updating tree:', error);
        throw error;
      }

      setTrees(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates } as DecisionTree : t))
      );
    },
    []
  );

  const deleteTree = useCallback(
    async (id: string) => {
      const before = trees;
      setTrees(prev => prev.filter(t => t.id !== id)); // optimistic

      const { error } = await supabase
        .from('decision_trees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tree:', error);
        setTrees(before); // rollback
        throw error;
      }
    },
    [trees]
  );

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  return { trees, loading, createTree, updateTree, deleteTree, refetch: fetchTrees };
};