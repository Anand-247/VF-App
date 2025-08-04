import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity: 0
  const translateY = useRef(new Animated.Value(40)).current; // Start below

  useEffect(() => {
    // Start animation: fade in and move up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait, then finish
      setTimeout(() => {
        if (onFinish) onFinish(); // Callback to hide splash and open main app
      }, 1000);
    });
  }, [fadeAnim, translateY, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/logo.png')} 
          style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 20 }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>VF Works</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Or your brand color
    justifyContent: 'center',
    alignItems: 'center',
  },
});
