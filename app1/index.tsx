import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Dashboard from '../src/screens/Dashboard';
import TreeBuilder from '../src/screens/TreeBuilder';
import TreePlayer from '../src/screens/TreePlayer';

type Screen = 'dashboard' | 'builder' | 'player';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [editingTreeId, setEditingTreeId] = useState<string>('');

  const handleCreateNew = () => {
    setCurrentScreen('builder');
  };

  const handleSelectTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setCurrentScreen('player');
  };
  const handleEditTree = (treeId: string) => {
    setEditingTreeId(treeId);
    setCurrentScreen('builder');
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
    setSelectedTreeId('');
    setEditingTreeId('');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'dashboard' && (
        <Dashboard 
          onCreateNew={handleCreateNew}
          onSelectTree={handleSelectTree}
          onEditTree={handleEditTree}
        />
      )}
      {currentScreen === 'builder' && (
        <TreeBuilder onBack={handleBack} editingTreeId={editingTreeId} />
      )}
      
      {currentScreen === 'player' && (
        <TreePlayer 
          treeId={selectedTreeId}
          onBack={handleBack}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3e1fefff',
  },
});