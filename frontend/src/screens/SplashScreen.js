import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => navigation.replace('Auth'), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#1E40AF', '#1D4ED8', '#2563EB']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.crossIcon}>✚</Text>
        </View>

        {/* App name */}
        <Text style={styles.appName}>MediFind</Text>
        <Text style={styles.tagline}>Your trusted healthcare companion</Text>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {['🏥 Hospitals', '👨‍⚕️ Doctors', '📍 Nearby'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footerText, { opacity: fadeAnim }]}>
        Find the right care, right now
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  logoMark: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  crossIcon: { fontSize: 44, color: '#FFFFFF' },
  appName: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -1 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: '400', marginBottom: 32 },
  pillsRow: { flexDirection: 'row', gap: 10 },
  pill: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  pillText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  footerText: { position: 'absolute', bottom: 48, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});
