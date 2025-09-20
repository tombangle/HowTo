import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { DecisionTree, TreeNode, TreeState, Choice, Condition } from '../types/DecisionTree';
import { supabase } from '../lib/supabase';

interface TreePlayerProps {
  treeId: string;
  onBack: () => void;
}

export default function TreePlayer({ treeId, onBack }: TreePlayerProps) {
  const [tree, setTree] = useState<DecisionTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<TreeState>({
    currentNodeId: '',
    history: [],
    variables: {},
    visitedNodes: new Set<string>()
  });

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('decision_trees')
          .select('*')
          .eq('id', treeId)
          .single();

        if (error) throw error;

        const formattedTree: DecisionTree = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          icon: data.icon || '🌳',
          nodes: data.nodes || [],
          rootNodeId: data.root_node_id || '',
          createdAt: new Date(data.created_at)
        };

        setTree(formattedTree);
        setState({
          currentNodeId: formattedTree.rootNodeId,
          history: [],
          variables: {},
          visitedNodes: new Set<string>()
        });
      } catch (error) {
        console.error('Error fetching tree:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [treeId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
        </View>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.errorText}>Loading decision tree...</Text>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tree not found</Text>
        </View>
      </View>
    );
  }

  const currentNode = tree.nodes.find(node => node.id === state.currentNodeId);

  // Enhanced condition evaluation function
  const evaluateCondition = (condition: Condition): boolean => {
    if (condition.type === 'variable') {
      const variableValue = state.variables[condition.variable || ''];
      switch (condition.operator) {
        case 'equals':
          return variableValue === condition.value;
        case 'not_equals':
          return variableValue !== condition.value;
        case 'greater_than':
          return Number(variableValue) > Number(condition.value);
        case 'less_than':
          return Number(variableValue) < Number(condition.value);
        case 'contains':
          return variableValue?.includes(condition.value) || false;
        case 'exists':
          return variableValue !== undefined && variableValue !== '';
        case 'not_exists':
          return variableValue === undefined || variableValue === '';
        default:
          return false;
      }
    } else if (condition.type === 'node_visited') {
      const wasVisited = state.visitedNodes.has(condition.nodeId || '');
      switch (condition.operator) {
        case 'exists':
          return wasVisited;
        case 'not_exists':
          return !wasVisited;
        default:
          return wasVisited;
      }
    } else if (condition.type === 'previous_choice') {
      // Check if a specific choice was made in the previous step
      const lastNodeId = state.history[state.history.length - 1];
      if (lastNodeId === condition.nodeId) {
        // For simplicity, we'll track the last choice made
        // In a more complex implementation, you'd track choice history
        return true; // This would need more sophisticated tracking
      }
      return false;
    }
    return true;
  };

  const evaluateConditions = (conditions: Condition[]): boolean => {
    return conditions.length === 0 || conditions.every(evaluateCondition);
  };

  const getVisibleChoices = () => {
    if (!currentNode?.choices) return [];
    return currentNode.choices.filter(choice => 
      evaluateConditions(choice.conditions || [])
    );
  };

  const handleChoice = (choiceId: string) => {
    if (!currentNode) return;
    
    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    // Update variables if choice sets any
    const newVariables = { ...state.variables };
    if (choice.setVariable) {
      newVariables[choice.setVariable.name] = choice.setVariable.value;
    }

    // Update visited nodes
    const newVisitedNodes = new Set(state.visitedNodes);
    newVisitedNodes.add(state.currentNodeId);

    if (choice.nextNodeId) {
      setState({
        currentNodeId: choice.nextNodeId,
        history: [...state.history, state.currentNodeId],
        variables: newVariables,
        visitedNodes: newVisitedNodes
      });
    }
  };

  const handleBack = () => {
    if (state.history.length > 0) {
      const previousNodeId = state.history[state.history.length - 1];
      setState({
        ...state,
        currentNodeId: previousNodeId,
        history: state.history.slice(0, -1)
      });
    }
  };

  const handleRestart = () => {
    setState({
      currentNodeId: tree.rootNodeId,
      history: [],
      variables: {},
      visitedNodes: new Set<string>()
    });
  };

  if (!currentNode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{tree.title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Node not found</Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.progressText}>
            Step {state.history.length + 1}
          </Text>
        </View>

        <View style={styles.nodeCard}>
          {currentNode.imageUrl && (
            <Image source={{ uri: currentNode.imageUrl }} style={styles.nodeImage} />
          )}
          
          <Text style={styles.nodeTitle}>{currentNode.title}</Text>
          
          {currentNode.description && (
            <Text style={styles.nodeDescription}>{currentNode.description}</Text>
          )}
          {/* Debug info - HIDDEN
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Node Type: {currentNode.type}</Text>
            <Text style={styles.debugText}>Has Choices: {currentNode.choices ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Choices Count: {currentNode.choices?.length || 0}</Text>
            <Text style={styles.debugText}>Visible Choices: {getVisibleChoices().length}</Text>
          </View>
          */}

          {(currentNode.type === 'dropdown' && currentNode.choices) && (
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
          {currentNode.isEnd && (
            <View style={styles.endContainer}>
              <Text style={styles.endText}>🎉 Complete!</Text>
              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.restartText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {state.history.length > 0 && (
          <TouchableOpacity style={styles.backStepButton} onPress={handleBack}>
            <Text style={styles.backStepText}>← Previous Step</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  restartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  progressBar: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nodeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  nodeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  nodeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  nodeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  choicesContainer: {
    gap: 10,
  },
  choiceButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endContainer: {
    alignItems: 'center',
    padding: 20,
  },
  endText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
  },
  backStepButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backStepText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});