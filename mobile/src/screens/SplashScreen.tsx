import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: width * 0.6,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Glows */}
      <View style={styles.glowRed} />
      <View style={styles.glowBlue} />

      <View style={styles.content}>
        <Animated.View style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <Image 
            source={require('../../assets/LogoWhite.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarActive, { width: progressAnim }]} />
          </View>
          <Text style={styles.loadingText}>جاري تحميل المستقبل...</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PMLab Futuristic Experience</Text>
        <Text style={styles.versionText}>v2.0.5 Build 104</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c111d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRed: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  glowBlue: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 240,
    height: 80,
  },
  loadingContainer: {
    alignItems: 'center',
    width: width,
  },
  progressBarBg: {
    width: width * 0.6,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#ff4d4d',
    borderRadius: 2,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  versionText: {
    color: '#334155',
    fontSize: 10,
    marginTop: 8,
    fontWeight: 'bold',
  }
});
