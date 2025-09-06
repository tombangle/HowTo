import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TreeNode, Choice, Condition } from '../types/DecisionTree';
import { ImagePickerComponent } from './ImagePicker';
import ConditionEditor from './ConditionEditor';
interface NodeEditorProps {
  node?: TreeNode;
  allNodes?: TreeNode[];
  onSave: (node: TreeNode) => void;
  onCancel: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, allNodes = [], onSave, onCancel }) => {
  const [title, setTitle] = useState(node?.title || '');
  const [description, setDescription] = useState(node?.description || '');
  const [imageUrl, setImageUrl] = useState(node?.imageUrl || '');
  const [type, setType] = useState<'image' | 'dropdown'>(node?.type || 'dropdown');
  const [choices, setChoices] = useState<Choice[]>(node?.choices || []);
  const [isEnd, setIsEnd] = useState(node?.isEnd || false);

  const addChoice = () => {
    setChoices([...choices, { 
      id: Date.now().toString(), 
      label: '', 
      nextNodeId: '',
      conditions: [],
      setVariable: undefined
    }]);
  };

  const updateChoice = (index: number, updates: Partial<Choice>) => {
    const updated = [...choices];
    updated[index] = { ...updated[index], ...updates };
    setChoices(updated);
  };

  const updateChoiceConditions = (index: number, conditions: Condition[]) => {
    updateChoice(index, { conditions });
  };

  const updateChoiceVariable = (index: number, variable: { name: string; value: string } | undefined) => {
    updateChoice(index, { setVariable: variable });
  };

  const removeChoice = (index: number) => {
    setChoices(choices.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newNode: TreeNode = {
      id: node?.id || Date.now().toString(),
      type,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl || undefined,
      choices: type === 'dropdown' ? choices.filter(c => c.label.trim()) : undefined,
      isEnd: isEnd || (type === 'dropdown' && choices.length === 0),
    };

    onSave(newNode);
  };

  const availableNodes = allNodes.filter(n => n.id !== node?.id);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {node ? 'Edit Node' : 'Create Node'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Node Image</Text>
        <ImagePickerComponent
          imageUrl={imageUrl}
          onImageSelected={setImageUrl}
          placeholder="Add node image"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter node title"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description (optional)"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'dropdown' && styles.activeType]}
            onPress={() => setType('dropdown')}
          >
            <Text style={[styles.typeText, type === 'dropdown' && styles.activeTypeText]}>
              Question
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'image' && styles.activeType]}
            onPress={() => setType('image')}
          >
            <Text style={[styles.typeText, type === 'image' && styles.activeTypeText]}>
              End Node
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {type === 'image' && (
        <View style={styles.section}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, isEnd && styles.checkedBox]}
              onPress={() => setIsEnd(!isEnd)}
            >
              {isEnd && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>This is an end node</Text>
          </View>
        </View>
      )}

      {type === 'dropdown' && (
        <View style={styles.section}>
          <Text style={styles.label}>Choices</Text>
          {choices.map((choice, index) => (
            <View key={choice.id} style={styles.choiceCard}>
              <TextInput
                style={styles.input}
                value={choice.label}
                onChangeText={(text) => updateChoice(index, { label: text })}
                placeholder={`Choice ${index + 1}`}
              />
              
              <ConditionEditor
                conditions={choice.conditions || []}
                onChange={(conditions) => updateChoiceConditions(index, conditions)}
                nodes={allNodes}
              />
              
              <View style={styles.variableSection}>
                <Text style={styles.sublabel}>Set Variable (optional):</Text>
                <View style={styles.variableRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    placeholder="Variable name"
                    value={choice.setVariable?.name || ''}
                    onChangeText={(text) => 
                      updateChoiceVariable(index, text ? { name: text, value: choice.setVariable?.value || '' } : undefined)
                    }
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Value"
                    value={choice.setVariable?.value || ''}
                    onChangeText={(text) => 
                      updateChoiceVariable(index, choice.setVariable?.name ? { name: choice.setVariable.name, value: text } : undefined)
                    }
                  />
                </View>
              </View>
              
              <Text style={styles.sublabel}>Next Node:</Text>
              <View style={styles.nodeSelector}>
                <TouchableOpacity
                  style={[styles.nodeSelectorButton, !choice.nextNodeId && styles.activeNodeSelector]}
                  onPress={() => updateChoice(index, { nextNodeId: '' })}
                >
                  <Text style={[styles.nodeSelectorText, !choice.nextNodeId && styles.activeNodeSelectorText]}>
                    End Here
                  </Text>
                </TouchableOpacity>
                {availableNodes.map(availableNode => (
                  <TouchableOpacity
                    key={availableNode.id}
                    style={[styles.nodeSelectorButton, choice.nextNodeId === availableNode.id && styles.activeNodeSelector]}
                    onPress={() => updateChoice(index, { nextNodeId: availableNode.id })}
                  >
                    <Text style={[styles.nodeSelectorText, choice.nextNodeId === availableNode.id && styles.activeNodeSelectorText]}>
                      {availableNode.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.removeChoiceButton}
                onPress={() => removeChoice(index)}
              >
                <Text style={styles.removeText}>Remove Choice</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addChoice}>
            <Text style={styles.addText}>+ Add Choice</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Node</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
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
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    color: '#333',
  },
  activeTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  choiceCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
    marginBottom: 8,
  },
  nodeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  nodeSelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  activeNodeSelector: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nodeSelectorText: {
    fontSize: 14,
    color: '#333',
  },
  activeNodeSelectorText: {
    color: '#fff',
    fontWeight: '600',
  },
  removeChoiceButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  variableSection: {
    marginTop: 10,
  },
  variableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});