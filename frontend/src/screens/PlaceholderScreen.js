import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

export default function PlaceholderScreen({ route, navigation }) {
  const { title, icon } = route.params;
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </LinearGradient>
      <View style={styles.content}>
        <Text style={styles.iconLarge}>{icon}</Text>
        <Text style={styles.heading}>{title} is Empty</Text>
        <Text style={styles.subtext}>You currently have no data for this section. Check back later!</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(14, 165, 233,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, marginRight: 16 },
  backIcon: { fontSize: 20, color: COLORS.primary },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: -50 },
  iconLarge: { fontSize: 80, marginBottom: 20, opacity: 0.9 },
  heading: { fontSize: 22, fontWeight: '600', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  subtext: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  actionBtn: { backgroundColor: 'rgba(14, 165, 233,0.1)', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
  btnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
});
