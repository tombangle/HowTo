import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import { DecisionTree } from '../types/DecisionTree';

interface TreeCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

const TreeCard: React.FC<TreeCardProps> = ({ title, icon, onPress, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Tree',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete }
      ]
    );
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {icon && (icon.includes('http') || icon.includes('/')) ? (
        <Image source={{ uri: icon }} style={styles.iconImage} />
      ) : (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
      >
        <Text style={styles.menuDots}>⋯</Text>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
    width: 160,
    minHeight: 160,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  iconImage: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  menuDots: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    padding: 12,
    borderRadius: 4,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF3B30',
  },
});

export default TreeCard;