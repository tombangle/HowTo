import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Header from '../components/Header';
import TreeCard from '../components/TreeCard';
import { useDecisionTrees } from '../hooks/useDecisionTrees';

interface DashboardProps {
  onCreateNew: () => void;
  onSelectTree: (treeId: string) => void;
  onEditTree: (treeId: string) => void;
}

export default function Dashboard({ onCreateNew, onSelectTree, onEditTree }: DashboardProps) {
  const { trees, loading, deleteTree } = useDecisionTrees();

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading decision trees...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Logic Steps</Text>
          <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
            <Text style={styles.createButtonText}>+ Create New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {trees.map((tree) => (
            <TreeCard
              key={tree.id}
              title={tree.title}
              icon={tree.icon || '🌳'}
              onPress={() => onSelectTree(tree.id)}
              onEdit={() => onEditTree(tree.id)}
              onDelete={async () => {
                try {
                  console.log('Dashboard: Deleting tree with id:', tree.id);
                  await deleteTree(tree.id);
                  console.log('Dashboard: Tree deleted successfully');
                } catch (error) {
                  console.error('Dashboard: Failed to delete tree:', error);
                  // You could add a toast notification here
                  Alert.alert('Error', 'Failed to delete the decision tree. Please try again.');
                }
              }}
            />
          ))}
        </View>

        {trees.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌳</Text>
            <Text style={styles.emptyTitle}>No Decision Trees Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first decision tree to get started
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onCreateNew}>
              <Text style={styles.emptyButtonText}>Create Your First Tree</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
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
    justifyContent: 'center',
    gap: 8,
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