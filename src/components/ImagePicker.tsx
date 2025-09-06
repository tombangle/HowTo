import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerComponentProps {
  imageUrl?: string;
  onImageSelected: (url: string) => void;
  placeholder?: string;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  imageUrl,
  onImageSelected,
  placeholder = "Add Image"
}) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      console.log('🎯 Starting image picker...');
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📱 Permission result:', permissionResult);
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "We need access to your photos to upload images.");
        return;
      }

      setUploading(true);
      console.log('📷 Launching image picker...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('✅ Image picker result:', result);

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        console.log('🖼️ Selected image URI:', imageUri);
        onImageSelected(imageUri);
        Alert.alert('Success', 'Image selected successfully!');
      } else {
        console.log('❌ Image selection canceled or failed');
      }
    } catch (error) {
      console.error('💥 Error in pickImage:', error);
      Alert.alert('Error', `Failed to pick image: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePress = () => {
    console.log('🔥 ImagePicker PRESSED! This should show in console');
    Alert.alert('Debug', 'Touch detected! Opening image picker...');
    pickImage();
  };

  console.log('🎨 Rendering ImagePicker with imageUrl:', imageUrl);

  return (
    <View style={styles.wrapper}>
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed
        ]}
        onPress={handlePress}
        disabled={uploading}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.placeholderText}>
              {uploading ? 'Loading...' : placeholder}
            </Text>
            <Text style={styles.tapText}>Tap to select image</Text>
            <Text style={styles.debugText}>DEBUG: Touch me!</Text>
          </View>
        )}
      </Pressable>
      
      {/* Fallback button */}
      <TouchableOpacity style={styles.fallbackButton} onPress={handlePress}>
        <Text style={styles.fallbackText}>
          {imageUrl ? 'Change Image' : 'Select Image'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  container: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 180,
    backgroundColor: '#f8f9fa',
  },
  pressed: {
    backgroundColor: '#e6f3ff',
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  placeholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tapText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  debugText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fallbackButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  fallbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});