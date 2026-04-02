import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { COLORS, SYMPTOM_CATEGORIES, SPEC_COLORS } from '../utils/constants';
import { doctorAPI, hospitalAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { getLocation(); fetchHospitals(); }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        setLocation({ latitude: 19.076, longitude: 72.8777 });
      }
    } catch {
      setLocation({ latitude: 19.076, longitude: 72.8777 });
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await hospitalAPI.getAll();
      setHospitals(res.data.data.slice(0, 4));
    } catch {}
  };

  const toggleSymptom = (s) =>
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSearch = async () => {
    const symptoms = searchText.trim()
      ? [searchText.trim(), ...selectedSymptoms]
      : selectedSymptoms;
    if (!symptoms.length) { Alert.alert('Select Symptoms', 'Please enter or select a symptom.'); return; }
    if (!location) { Alert.alert('Location Required', 'Enable location access to find nearby doctors.'); return; }
    setLoading(true);
    try {
      const res = await doctorAPI.recommend({ symptoms, latitude: location.latitude, longitude: location.longitude, radius: 100 });
      navigation.navigate('DoctorList', { doctors: res.data.data.doctors, specializations: res.data.data.specializations, symptoms });
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHospitals} tintColor={COLORS.primary} />}
    >
      <StatusBar barStyle="light-content" />

      {/* Hero Header */}
      <LinearGradient colors={['#1E40AF', '#2563EB', '#3B82F6']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}, 👋</Text>
            <Text style={styles.heroName}>{user?.name || 'Welcome'}</Text>
            <Text style={styles.heroSub}>Find the best doctors near you</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search symptoms, e.g. headache..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.searchBtnText}>Search</Text>
            }
          </TouchableOpacity>
        </View>

        {location && (
          <View style={styles.locationPill}>
            <Text style={styles.locationText}>📍 Location detected</Text>
          </View>
        )}
      </LinearGradient>

      {/* Selected symptoms */}
      {selectedSymptoms.length > 0 && (
        <View style={styles.selectedRow}>
          <Text style={styles.selectedLabel}>Selected:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedSymptoms.map((s) => (
              <TouchableOpacity key={s} style={styles.selectedChip} onPress={() => toggleSymptom(s)}>
                <Text style={styles.selectedChipText}>{s} ✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Browse by Symptom */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Condition</Text>
        <View style={styles.catGrid}>
          {SYMPTOM_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[styles.catCard, { borderTopColor: cat.color, borderTopWidth: 3 }]}
              onPress={() => { if (!selectedSymptoms.includes(cat.symptoms[0])) toggleSymptom(cat.symptoms[0]); }}
              activeOpacity={0.75}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Common Symptoms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Symptoms</Text>
        <View style={styles.chipGrid}>
          {['Headache', 'Fever', 'Cough', 'Chest Pain', 'Back Pain', 'Skin Rash', 'Stomach Pain', 'Anxiety', 'Joint Pain'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedSymptoms.includes(s) && styles.chipActive]}
              onPress={() => toggleSymptom(s)}
            >
              <Text style={[styles.chipText, selectedSymptoms.includes(s) && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nearby Hospitals */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Hospitals')}>
            <Text style={styles.seeAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        {hospitals.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={styles.hospitalCard}
            onPress={() => navigation.navigate('HospitalProfile', { hospitalId: h.id })}
            activeOpacity={0.88}
          >
            <View style={styles.hospitalCardTop}>
              <View style={styles.hospitalIconBox}>
                <Text style={{ fontSize: 26 }}>🏥</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.hospitalMeta}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{h.type}</Text>
                  </View>
                  {h.emergency && (
                    <View style={styles.emergencyBadge}>
                      <Text style={styles.emergencyText}>24/7</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hospitalName}>{h.name}</Text>
                <Text style={styles.hospitalAddr} numberOfLines={1}>📍 {h.address}</Text>
                <View style={styles.hospitalStats}>
                  <Text style={styles.hospitalRating}>⭐ {h.rating}</Text>
                  <Text style={styles.hospitalBeds}>🛏 {h.beds} beds</Text>
                </View>
              </View>
            </View>

            {/* Doctor preview */}
            {h.doctors?.length > 0 && (
              <View style={styles.doctorPreview}>
                <Text style={styles.doctorPreviewLabel}>👨‍⚕️ Medical Staff</Text>
                <Text style={styles.doctorPreviewNames} numberOfLines={2}>
                  {h.doctors.map(d => d.name).join('  •  ')}
                </Text>
              </View>
            )}

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '400', marginBottom: 4 },
  heroName: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 4, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  avatarBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  searchCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  searchInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#0F172A' },
  searchBtn: { backgroundColor: '#2563EB', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  locationPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  locationText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  selectedLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  selectedChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginRight: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  selectedChipText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 16, letterSpacing: -0.3 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '22%', backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  catIcon: { fontSize: 24, marginBottom: 6 },
  catLabel: { fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#FFF', borderRadius: 100, borderWidth: 1.5, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  chipTextActive: { color: '#2563EB', fontWeight: '600' },
  hospitalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  hospitalCardTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  hospitalIconBox: { width: 56, height: 56, backgroundColor: '#EFF6FF', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hospitalMeta: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { color: '#2563EB', fontSize: 10, fontWeight: '600' },
  emergencyBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emergencyText: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  hospitalName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4, letterSpacing: -0.2 },
  hospitalAddr: { fontSize: 12, color: '#64748B', marginBottom: 8 },
  hospitalStats: { flexDirection: 'row', gap: 12 },
  hospitalRating: { fontSize: 13, color: '#374151', fontWeight: '600' },
  hospitalBeds: { fontSize: 13, color: '#64748B' },
  doctorPreview: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  doctorPreviewLabel: { fontSize: 11, fontWeight: '700', color: '#2563EB', marginBottom: 4 },
  doctorPreviewNames: { fontSize: 12, color: '#475569', lineHeight: 18 },
  chevron: { position: 'absolute', right: 16, top: '50%', fontSize: 24, color: '#94A3B8' },
});
