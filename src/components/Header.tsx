import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image 
        source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68163cb84ec074a1d731179e_1757045591290_6a17167e.png' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.description}>
        Use the following Decision Trees for Step-by-Step Instructions on the Topic
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 60,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});