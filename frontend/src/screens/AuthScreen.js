import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail]  = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero header */}
        <LinearGradient colors={['#1E40AF', '#2563EB']} style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={{ fontSize: 32 }}>✚</Text>
          </View>
          <Text style={styles.heroTitle}>MediFind</Text>
          <Text style={styles.heroSub}>
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}
          </Text>
        </LinearGradient>

        {/* Form card */}
        <View style={styles.card}>
          {/* Tab toggle */}
          <View style={styles.tabRow}>
            {['Sign In', 'Register'].map((t, i) => (
              <TouchableOpacity
                key={t} style={[styles.tabBtn, (i === 0) === isLogin && styles.tabBtnActive]}
                onPress={() => setIsLogin(i === 0)}
              >
                <Text style={[(i === 0) === isLogin ? styles.tabTextActive : styles.tabText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input} placeholder="Dr. John Doe"
                placeholderTextColor="#94A3B8" value={name} onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input} placeholder="you@example.com"
              placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input} placeholder="••••••••"
              placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.submitText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{isLogin ? 'Register' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoText}>🔑 Demo: test@example.com / password123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flexGrow: 1 },
  hero: { paddingTop: 72, paddingBottom: 48, alignItems: 'center' },
  logoMark: { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', paddingHorizontal: 32 },
  card: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, flex: 1, padding: 28, paddingTop: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabTextActive: { fontSize: 14, color: '#2563EB', fontWeight: '700' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#0F172A' },
  submitBtn: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchRow: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#64748B' },
  switchLink: { color: '#2563EB', fontWeight: '600' },
  demoHint: { marginTop: 20, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  demoText: { fontSize: 12, color: '#1E40AF', textAlign: 'center', fontWeight: '500' },
});
