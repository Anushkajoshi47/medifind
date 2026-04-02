import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, bookmarks } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors');

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); navigation.replace('Auth'); } },
  ]);

  const menuItems = [
    { icon: '📋', label: 'My Appointments', action: () => navigation.navigate('Placeholder', { title: 'Appointments', icon: '📋' }) },
    { icon: '🔔', label: 'Notifications', action: () => navigation.navigate('Placeholder', { title: 'Notifications', icon: '🔔' }) },
    { icon: '🔒', label: 'Privacy & Security', action: () => navigation.navigate('Placeholder', { title: 'Privacy & Security', icon: '🔒' }) },
    { icon: '❓', label: 'Help & Support', action: () => navigation.navigate('Placeholder', { title: 'Help & Support', icon: '❓' }) },
    { icon: '⭐', label: 'Rate MediFind', action: () => Alert.alert('Thanks!', 'We appreciate your feedback!') },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#2563EB']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{bookmarks.doctors.length}</Text>
          <Text style={styles.statLabel}>Saved Doctors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{bookmarks.hospitals.length}</Text>
          <Text style={styles.statLabel}>Saved Hospitals</Text>
        </View>
      </View>

      {/* Bookmarks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookmarks</Text>
        <View style={styles.tabBar}>
          {['doctors', 'hospitals'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'doctors' ? '👨‍⚕️ Doctors' : '🏥 Hospitals'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bookmarkBox}>
          {activeTab === 'doctors' && (
            bookmarks.doctors.length === 0
              ? <Text style={styles.emptyText}>No bookmarked doctors yet</Text>
              : <Text style={styles.bookmarkCount}>{bookmarks.doctors.length} doctor(s) saved</Text>
          )}
          {activeTab === 'hospitals' && (
            bookmarks.hospitals.length === 0
              ? <Text style={styles.emptyText}>No bookmarked hospitals yet</Text>
              : <Text style={styles.bookmarkCount}>{bookmarks.hospitals.length} hospital(s) saved</Text>
          )}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪  Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 64, paddingBottom: 36, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#FFF' },
  userName: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4, letterSpacing: -0.3 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: -20, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, elevation: 5, borderWidth: 1, borderColor: '#F1F5F9' },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '800', color: '#2563EB', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 14, letterSpacing: -0.2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: '#2563EB', fontWeight: '700' },
  bookmarkBox: { backgroundColor: '#FFF', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', minHeight: 80, justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  bookmarkCount: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  menuCard: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  menuChevron: { fontSize: 20, color: '#CBD5E1' },
  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#FECACA' },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
});
