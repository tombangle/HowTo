import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CreateButtonProps {
  onPress: () => void;
  title: string;
}

const CreateButton = ({ onPress, title }: CreateButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateButton;