import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { DecisionTree, TreeNode, TreeState, Choice, Condition } from '../types/DecisionTree';
import { supabase } from '../lib/supabase';

interface TreePlayerProps {
  treeId: string;
  onBack: () => void;
}

// DB row supports new (tree_data) and old (nodes/root_node_id) schema
type DBRow = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  tree_data?: { nodes?: any[]; rootNodeId?: string } | null;
  nodes?: any[] | null;
  root_node_id?: string | null;
  created_at: string;
};

// ---- helpers for terminal/end handling ----
const END_NODE_ID = '__END__';

function isTerminal(n?: TreeNode | null): boolean {
  if (!n) return false;
  if (n.isEnd) return true;                 // explicit end
  if (n.type === 'image') return true;      // editor's "End Node"
  const hasEdge = n.choices?.some(c => !!c.nextNodeId?.trim()) ?? false;
  return !hasEdge;                          // no edges => end
}

export default function TreePlayer({ treeId, onBack }: TreePlayerProps) {
  const [tree, setTree] = useState<DecisionTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<TreeState>({
    currentNodeId: '',
    history: [],
    variables: {},
    visitedNodes: new Set<string>(),
  });

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('decision_trees')
          .select('id, title, description, icon, tree_data, nodes, root_node_id, created_at')
          .eq('id', treeId)
          .single<DBRow>();

        if (error) throw error;

        // prefer tree_data, fall back to legacy columns
        const td = data.tree_data
          ? {
              nodes: Array.isArray(data.tree_data.nodes) ? data.tree_data.nodes : [],
              rootNodeId: data.tree_data.rootNodeId ?? '',
            }
          : {
              nodes: Array.isArray(data.nodes) ? data.nodes : [],
              rootNodeId: data.root_node_id ?? '',
            };

        const formattedTree: DecisionTree = {
          id: data.id,
          title: data.title,
          description: data.description ?? '',
          icon: data.icon ?? '🌳',
          nodes: td.nodes || [],
          rootNodeId: td.rootNodeId || '',
          createdAt: new Date(data.created_at),
        };

        const hasRoot =
          !!formattedTree.rootNodeId &&
          formattedTree.nodes.some(n => n.id === formattedTree.rootNodeId);
        const startId = hasRoot ? formattedTree.rootNodeId : (formattedTree.nodes[0]?.id ?? '');

        setTree(formattedTree);
        setState({
          currentNodeId: startId,
          history: [],
          variables: {},
          visitedNodes: new Set<string>(),
        });
      } catch (err) {
        console.error('Error fetching tree:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [treeId]);

  // ---------- Early UI states ----------
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.empty}>Loading decision tree…</Text>
        </View>
      </View>
    );
  }

  if (!tree) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Error</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.empty}>Tree not found</Text>
        </View>
      </View>
    );
  }

  if (!tree.nodes.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{tree.title}</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.empty}>This tree has no nodes yet.</Text>
        </View>
      </View>
    );
  }

  // derive current node
  const currentNode: TreeNode | undefined =
    tree.nodes.find(n => n.id === state.currentNodeId);

  const atSyntheticEnd = state.currentNodeId === END_NODE_ID;
  const finished = atSyntheticEnd || isTerminal(currentNode);

  // ---------- Logic helpers ----------
  const evaluateCondition = (condition: Condition): boolean => {
    if (condition.type === 'variable') {
      const key = condition.variable || '';
      const variableValue = state.variables[key];

      switch (condition.operator) {
        case 'equals': return variableValue === condition.value;
        case 'not_equals': return variableValue !== condition.value;
        case 'greater_than': return Number(variableValue) > Number(condition.value);
        case 'less_than': return Number(variableValue) < Number(condition.value);
        case 'contains':
          return typeof variableValue === 'string'
            ? variableValue.includes(String(condition.value ?? ''))
            : false;
        case 'exists': return variableValue !== undefined && variableValue !== '';
        case 'not_exists': return variableValue === undefined || variableValue === '';
        default: return false;
      }
    }

    if (condition.type === 'node_visited') {
      const wasVisited = state.visitedNodes.has(condition.nodeId || '');
      return condition.operator === 'not_exists' ? !wasVisited : wasVisited;
    }

    if (condition.type === 'previous_choice') {
      const lastNodeId = state.history[state.history.length - 1];
      return lastNodeId === condition.nodeId;
    }

    return true;
  };

  const evaluateConditions = (conditions: Condition[] = []): boolean =>
    conditions.length === 0 || conditions.every(evaluateCondition);

  const getVisibleChoices = (): Choice[] => {
    if (!currentNode || finished) return [];
    if (!currentNode.choices) return [];
    return currentNode.choices.filter(c => evaluateConditions(c.conditions || []));
  };

  // ---------- Handlers ----------
  const handleChoice = (choiceId: string) => {
    if (!currentNode || finished) return;

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    const newVariables = { ...state.variables };
    if (choice.setVariable) newVariables[choice.setVariable.name] = choice.setVariable.value;

    const newVisited = new Set(state.visitedNodes);
    if (state.currentNodeId) newVisited.add(state.currentNodeId);

    const nextId =
      choice.nextNodeId && choice.nextNodeId.trim()
        ? choice.nextNodeId.trim()
        : END_NODE_ID; // end here

    setState({
      currentNodeId: nextId,
      history: [...state.history, state.currentNodeId],
      variables: newVariables,
      visitedNodes: newVisited,
    });
  };

  const handleBack = () => {
    if (state.history.length > 0) {
      const previousNodeId = state.history[state.history.length - 1];
      setState({
        ...state,
        currentNodeId: previousNodeId,
        history: state.history.slice(0, -1),
      });
    }
  };

  const handleRestart = () => {
    const hasRoot = tree.rootNodeId && tree.nodes.some(n => n.id === tree.rootNodeId);
    const startId = hasRoot ? tree.rootNodeId! : (tree.nodes[0]?.id ?? '');
    setState({
      currentNodeId: startId,
      history: [],
      variables: {},
      visitedNodes: new Set<string>(),
    });
  };

  if (!currentNode && !finished) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{tree.title}</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.empty}>Node not found</Text>
        </View>
      </View>
    );
  }

  // ---------- Render ----------
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{tree.title}</Text>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartText}>Restart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>Step {state.history.length + 1}</Text>
        </View>

        <View style={styles.nodeCard}>
          {!!currentNode?.imageUrl && !finished && (
            <Image source={{ uri: currentNode.imageUrl }} style={styles.nodeImage} />
          )}

          {!finished && (
            <>
              <Text style={styles.nodeTitle}>{currentNode?.title}</Text>

              {!!currentNode?.description && (
                <Text style={styles.nodeDescription}>{currentNode.description}</Text>
              )}

              {currentNode?.type === 'dropdown' && currentNode?.choices && (
                <View style={styles.choicesContainer}>
                  {getVisibleChoices().map(choice => (
                    <TouchableOpacity
                      key={choice.id}
                      style={styles.choiceButton}
                      onPress={() => handleChoice(choice.id)}
                    >
                      <Text style={styles.choiceText}>{choice.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {finished && (
            <View style={styles.endContainer}>
              <Text style={styles.endText}>🎉 Complete!</Text>
              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.restartText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {state.history.length > 0 ? (
          <TouchableOpacity style={styles.backStepButton} onPress={handleBack}>
            <Text style={styles.backStepText}>← Previous Step</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  restartButton: { backgroundColor: '#FF9500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  restartText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: { padding: 20 },
  progressBar: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  progressText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  nodeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  nodeImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  nodeTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  nodeDescription: { fontSize: 16, color: '#666', lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  choicesContainer: { gap: 10 },
  choiceButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  choiceText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  endContainer: { alignItems: 'center', padding: 20 },
  endText: { fontSize: 24, fontWeight: 'bold', color: '#28a745', marginBottom: 15 },
  backStepButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8, alignItems: 'center' },
  backStepText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 12 },
});