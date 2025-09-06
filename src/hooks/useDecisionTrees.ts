import { useState, useEffect } from 'react';
import { DecisionTree } from '../types/DecisionTree';
import { supabase } from '@/app/lib/supabase';

export const useDecisionTrees = () => {
  const [trees, setTrees] = useState<DecisionTree[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('decision_trees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTrees: DecisionTree[] = data.map(tree => ({
        id: tree.id,
        title: tree.title,
        description: tree.description || '',
        icon: tree.icon || '🌳',
        nodes: tree.nodes || [],
        rootNodeId: tree.root_node_id || '',
        createdAt: new Date(tree.created_at)
      }));

      setTrees(formattedTrees);
    } catch (error) {
      console.error('Error fetching trees:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTree = async (tree: Omit<DecisionTree, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('decision_trees')
        .insert([{
          title: tree.title,
          description: tree.description,
          icon: tree.icon,
          nodes: tree.nodes,
          root_node_id: tree.rootNodeId,
          tree_data: tree.nodes || []
        }])
        .select()
        .single();

      if (error) throw error;

      const newTree: DecisionTree = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        icon: data.icon || '🌳',
        nodes: data.nodes || [],
        rootNodeId: data.root_node_id || '',
        createdAt: new Date(data.created_at)
      };

      setTrees(prev => [newTree, ...prev]);
      return newTree;
    } catch (error) {
      console.error('Error creating tree:', error);
      throw error;
    }
  };

  const updateTree = async (id: string, updates: Partial<DecisionTree>) => {
    try {
      const { error } = await supabase
        .from('decision_trees')
        .update({
          title: updates.title,
          description: updates.description,
          icon: updates.icon,
          nodes: updates.nodes,
          root_node_id: updates.rootNodeId
        })

        .eq('id', id);

      if (error) throw error;

      setTrees(prev => prev.map(tree => 
        tree.id === id ? { ...tree, ...updates } : tree
      ));
    } catch (error) {
      console.error('Error updating tree:', error);
      throw error;
    }
  };

  const deleteTree = async (id: string) => {
    try {
      console.log('Attempting to delete tree with id:', id);
      
      // First, optimistically update the UI
      const originalTrees = trees;
      setTrees(prev => prev.filter(tree => tree.id !== id));
      
      const { error } = await supabase
        .from('decision_trees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        // Revert the optimistic update
        setTrees(originalTrees);
        throw error;
      }

      console.log('Tree deleted successfully from database');
      // Refetch to ensure consistency
      await fetchTrees();
    } catch (error) {
      console.error('Error deleting tree:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  return {
    trees,
    loading,
    createTree,
    updateTree,
    deleteTree,
    refetch: fetchTrees
  };
};