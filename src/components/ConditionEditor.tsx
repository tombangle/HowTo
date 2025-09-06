import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Condition, TreeNode } from '../types/DecisionTree';

export interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  nodes: TreeNode[];
}

const ConditionEditor: React.FC<ConditionEditorProps> = ({ conditions, onChange, nodes }) => {
  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      type: 'variable',
      operator: 'equals',
      value: ''
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onChange(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const getChoicesForNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.choices || [];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conditions</Text>
      
      <ScrollView style={styles.conditionsList}>
        {conditions.map((condition) => (
          <View key={condition.id} style={styles.conditionItem}>
            <View style={styles.conditionRow}>
              <Text style={styles.label}>Type:</Text>
              <View style={styles.typeButtons}>
                {['variable', 'previous_choice', 'node_visited'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, condition.type === type && styles.activeButton]}
                    onPress={() => updateCondition(condition.id, { type: type as any })}
                  >
                    <Text style={[styles.typeText, condition.type === type && styles.activeText]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {condition.type === 'variable' && (
              <View style={styles.conditionRow}>
                <Text style={styles.label}>Variable:</Text>
                <TextInput
                  style={styles.input}
                  value={condition.variable || ''}
                  onChangeText={(text) => updateCondition(condition.id, { variable: text })}
                  placeholder="Variable name"
                />
              </View>
            )}

            {condition.type === 'node_visited' && (
              <View style={styles.conditionRow}>
                <Text style={styles.label}>Node:</Text>
                <ScrollView horizontal style={styles.nodeSelector}>
                  {nodes.map((node) => (
                    <TouchableOpacity
                      key={node.id}
                      style={[styles.nodeButton, condition.nodeId === node.id && styles.activeButton]}
                      onPress={() => updateCondition(condition.id, { nodeId: node.id })}
                    >
                      <Text style={[styles.nodeText, condition.nodeId === node.id && styles.activeText]}>
                        {node.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {condition.type === 'previous_choice' && condition.nodeId && (
              <View style={styles.conditionRow}>
                <Text style={styles.label}>Choice:</Text>
                <ScrollView horizontal style={styles.nodeSelector}>
                  {getChoicesForNode(condition.nodeId).map((choice) => (
                    <TouchableOpacity
                      key={choice.id}
                      style={[styles.nodeButton, condition.choiceId === choice.id && styles.activeButton]}
                      onPress={() => updateCondition(condition.id, { choiceId: choice.id })}
                    >
                      <Text style={[styles.nodeText, condition.choiceId === choice.id && styles.activeText]}>
                        {choice.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.conditionRow}>
              <Text style={styles.label}>Operator:</Text>
              <ScrollView horizontal style={styles.operatorSelector}>
                {['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'exists', 'not_exists'].map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.operatorButton, condition.operator === op && styles.activeButton]}
                    onPress={() => updateCondition(condition.id, { operator: op as any })}
                  >
                    <Text style={[styles.operatorText, condition.operator === op && styles.activeText]}>
                      {op.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {!['exists', 'not_exists'].includes(condition.operator) && (
              <View style={styles.conditionRow}>
                <Text style={styles.label}>Value:</Text>
                <TextInput
                  style={styles.input}
                  value={condition.value}
                  onChangeText={(text) => updateCondition(condition.id, { value: text })}
                  placeholder="Comparison value"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeCondition(condition.id)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={addCondition}>
        <Text style={styles.addText}>Add Condition</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 15 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  conditionsList: { maxHeight: 300 },
  conditionItem: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10 },
  conditionRow: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  typeButtons: { flexDirection: 'row', flexWrap: 'wrap' },
  typeButton: { backgroundColor: '#e9ecef', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, marginBottom: 4 },
  activeButton: { backgroundColor: '#007bff' },
  typeText: { fontSize: 12, color: '#495057' },
  activeText: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  nodeSelector: { flexDirection: 'row' },
  nodeButton: { backgroundColor: '#e9ecef', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 6 },
  nodeText: { fontSize: 12, color: '#495057' },
  operatorSelector: { flexDirection: 'row' },
  operatorButton: { backgroundColor: '#e9ecef', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 4 },
  operatorText: { fontSize: 11, color: '#495057' },
  removeButton: { backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start', marginTop: 8 },
  removeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'center', marginTop: 10 },
  addText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default ConditionEditor;