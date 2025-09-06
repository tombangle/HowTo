import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Header from '../components/Header';
import TreeCard from '../components/TreeCard';
import { useDecisionTrees } from '../hooks/useDecisionTrees';

type Tree = {
  id: string;
  title: string;
  icon?: string | null;
};

interface DashboardProps {
  onCreateNew: () => void;
  onSelectTree: (treeId: string) => void;
  onEditTree: (treeId: string) => void;
}

export default function Dashboard({
  onCreateNew,
  onSelectTree,
  onEditTree,
}: DashboardProps) {
  const { trees: rawTrees, loading, deleteTree } = useDecisionTrees();

  // Ensure we always have an array to map over
  const trees: Tree[] = useMemo(() => Array.isArray(rawTrees) ? rawTrees : [], [rawTrees]);

  const handleDelete = useCallback(
    async (treeId: string) => {
      try {
        await deleteTree(treeId);
      } catch (error) {
        console.error('Dashboard: Failed to delete tree:', error);
        Alert.alert('Error', 'Failed to delete the decision tree. Please try again.');
      }
    },
    [deleteTree]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading decision trees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Logic Steps</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Create new decision tree"
            style={styles.createButton}
            onPress={onCreateNew}
          >
            <Text style={styles.createButtonText}>+ Create New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {trees.map((tree) => (
            <View style={styles.gridItem} key={tree.id}>
              <TreeCard
                title={tree.title}
                icon={tree.icon || '🌳'}
                onPress={() => onSelectTree(tree.id)}
                onEdit={() => onEditTree(tree.id)}
                onDelete={() => handleDelete(tree.id)}
              />
            </View>
          ))}
        </View>

        {trees.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌳</Text>
            <Text style={styles.emptyTitle}>No Decision Trees Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first decision tree to get started.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Create your first decision tree"
              style={styles.emptyButton}
              onPress={onCreateNew}
            >
              <Text style={styles.emptyButtonText}>Create Your First Tree</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const GRID_GAP = 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GRID_GAP / 2, // compensate item horizontal padding
  },
  gridItem: {
    width: '50%', // two columns; adjust if TreeCard has fixed width
    paddingHorizontal: GRID_GAP / 2,
    marginBottom: GRID_GAP,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});