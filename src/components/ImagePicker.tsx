import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerComponentProps {
  imageUrl?: string;
  onImageSelected: (url: string) => void;
  placeholder?: string;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  imageUrl,
  onImageSelected,
  placeholder = 'Add Image',
}) => {
  const [uploading, setUploading] = useState(false);

  const displayPlaceholder = useMemo(() => String(placeholder), [placeholder]);

  const pickImage = async () => {
    try {
      console.log('🎯 ImagePicker: requesting permission…');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to upload images.'
        );
        return;
      }

      setUploading(true);
      console.log('📷 ImagePicker: opening library…');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('✅ ImagePicker result:', result);

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        console.log('🖼️ Selected image URI:', uri);
        onImageSelected(uri); // store URI (later you can upload to Supabase Storage)
      } else {
        console.log('ℹ️ Selection canceled');
      }
    } catch (err) {
      console.error('💥 pickImage error:', err);
      Alert.alert('Error', 'Failed to pick image.');
    } finally {
      setUploading(false);
    }
  };

  const handlePress = () => {
    console.log('🔥 ImagePicker pressed');
    void pickImage();
  };

  console.log('🎨 Rendering ImagePicker with imageUrl:', imageUrl);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.container, pressed ? styles.pressed : null]}
        onPress={handlePress}
        disabled={uploading}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            {uploading ? (
              <>
                <ActivityIndicator size="small" />
                <Text style={styles.placeholderText}>Loading…</Text>
              </>
            ) : (
              <>
                <Text style={styles.icon}>📷</Text>
                <Text style={styles.placeholderText}>{displayPlaceholder}</Text>
                <Text style={styles.tapText}>Tap to select image</Text>
              </>
            )}
          </View>
        )}
      </Pressable>

      <TouchableOpacity style={styles.fallbackButton} onPress={handlePress} disabled={uploading}>
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
    alignItems: 'stretch',
    justifyContent: 'center',
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
    minHeight: 180,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  placeholderText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tapText: {
    color: '#666',
    fontSize: 14,
  },
  fallbackButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});