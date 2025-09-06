import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { DecisionTree, TreeNode } from '../types/DecisionTree';
import { NodeEditor } from '../components/NodeEditor';
import { useDecisionTrees } from '../hooks/useDecisionTrees';

interface TreeBuilderProps {
  editingTreeId?: string;
  onBack: () => void;
}
export default function TreeBuilder({ editingTreeId, onBack }: TreeBuilderProps) {
  const { trees, createTree, updateTree } = useDecisionTrees();
  const editingTree = editingTreeId ? trees.find(t => t.id === editingTreeId) : undefined;
  
  const [title, setTitle] = useState(editingTree?.title || '');
  const [icon, setIcon] = useState(editingTree?.icon || '🌳');
  const [nodes, setNodes] = useState<TreeNode[]>(editingTree?.nodes || []);
  const [rootNodeId, setRootNodeId] = useState(editingTree?.rootNodeId || '');
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  useEffect(() => {
    if (editingTree) {
      setTitle(editingTree.title);
      setIcon(editingTree.icon || '🌳');
      setNodes(editingTree.nodes || []);
      setRootNodeId(editingTree.rootNodeId || '');
    }
  }, [editingTree]);

  const handleSaveNode = (node: TreeNode) => {
    const existingIndex = nodes.findIndex(n => n.id === node.id);
    if (existingIndex >= 0) {
      const updated = [...nodes];
      updated[existingIndex] = node;
      setNodes(updated);
    } else {
      setNodes([...nodes, node]);
      if (!rootNodeId) {
        setRootNodeId(node.id);
      }
    }
    setShowNodeEditor(false);
    setEditingNode(null);
  };

  const handleEditNode = (node: TreeNode) => {
    setEditingNode(node);
    setShowNodeEditor(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    Alert.alert(
      'Delete Node',
      'Are you sure you want to delete this node?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNodes(nodes.filter(n => n.id !== nodeId));
            if (rootNodeId === nodeId && nodes.length > 1) {
              const remaining = nodes.filter(n => n.id !== nodeId);
              setRootNodeId(remaining[0]?.id || '');
            }
          }
        }
      ]
    );
  };

  const handleSaveTree = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a tree title');
      return;
    }
    if (nodes.length === 0) {
      Alert.alert('Error', 'Please add at least one node');
      return;
    }

    try {
      if (editingTreeId) {
        await updateTree(editingTreeId, {
          title: title.trim(),
          icon,
          nodes,
          rootNodeId: rootNodeId || nodes[0].id,
        });
      } else {
        await createTree({
          title: title.trim(),
          icon,
          nodes,
          rootNodeId: rootNodeId || nodes[0].id,
        });
      }
      onBack(); // Navigate back to dashboard after saving
    } catch (error) {
      Alert.alert('Error', 'Failed to save tree. Please try again.');
    }
  };

  if (showNodeEditor) {
    return (
      <NodeEditor
        node={editingNode || undefined}
        allNodes={nodes}
        onSave={handleSaveNode}

        onCancel={() => {
          setShowNodeEditor(false);
          setEditingNode(null);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {editingTreeId ? 'Edit Tree' : 'Create Tree'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tree Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter tree title"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconRow}>
          {['🌳', '🎯', '💡', '🔍', '📊', '⚡'].map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[styles.iconButton, icon === emoji && styles.selectedIcon]}
              onPress={() => setIcon(emoji)}
            >
              <Text style={styles.iconText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Nodes ({nodes.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNodeEditor(true)}
          >
            <Text style={styles.addText}>+ Add Node</Text>
          </TouchableOpacity>
        </View>

        {nodes.map(node => (
          <View key={node.id} style={styles.nodeCard}>
            <View style={styles.nodeHeader}>
              <Text style={styles.nodeTitle}>{node.title}</Text>
              <Text style={styles.nodeType}>{node.type}</Text>
            </View>
            {node.description && (
              <Text style={styles.nodeDescription}>{node.description}</Text>
            )}
            <View style={styles.nodeActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditNode(node)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNode(node.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTree}>
        <Text style={styles.saveText}>Save Tree</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 20,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f3ff',
  },
  iconText: {
    fontSize: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  nodeCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  nodeType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nodeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  nodeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});