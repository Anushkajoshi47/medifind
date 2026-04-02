import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS, SPEC_COLORS } from '../utils/constants';
import { hospitalAPI } from '../utils/api';

export default function HospitalsScreen({ navigation }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmergency, setFilterEmergency] = useState(false);

  useEffect(() => { fetchHospitals(); }, []);

  const fetchHospitals = async () => {
    try {
      const res = await hospitalAPI.getAll();
      setHospitals(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  const filtered = filterEmergency ? hospitals.filter(h => h.emergency) : hospitals;

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading hospitals...</Text>
    </View>
  );

  const renderDoctor = (doc) => {
    const spec = SPEC_COLORS[doc.specialization] || { bg: '#F1F5F9', text: '#374151', icon: '👤' };
    return (
      <View key={doc.id} style={[styles.doctorChip, { backgroundColor: spec.bg }]}>
        <Text style={{ fontSize: 13 }}>{spec.icon}</Text>
        <View style={{ marginLeft: 6 }}>
          <Text style={[styles.doctorChipName, { color: spec.text }]}>{doc.name}</Text>
          <Text style={[styles.doctorChipSpec, { color: spec.text, opacity: 0.7 }]}>{doc.specialization}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hospitals</Text>
          <Text style={styles.headerSub}>{filtered.length} facilities found</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, filterEmergency && styles.filterBtnActive]}
          onPress={() => setFilterEmergency(!filterEmergency)}
        >
          <Text style={[styles.filterBtnText, filterEmergency && styles.filterBtnTextActive]}>
            {filterEmergency ? '🚨 Emergency' : 'All Hospitals'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('HospitalProfile', { hospitalId: item.id })}
            activeOpacity={0.88}
          >
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 28 }}>🏥</Text>
              </View>
              <View style={{ flex: 1 }}>
                {/* Badges */}
                <View style={styles.badgesRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                  {item.emergency && (
                    <View style={styles.emergencyBadge}>
                      <Text style={styles.emergencyBadgeText}>🚨 24/7 Emergency</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.addr} numberOfLines={1}>📍 {item.address}</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.rating}>⭐ {item.rating}</Text>
                  <Text style={styles.separator}>·</Text>
                  <Text style={styles.beds}>🛏 {item.beds} beds</Text>
                </View>
              </View>
            </View>

            {/* Facilities */}
            {item.facilities?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilitiesScroll}>
                {item.facilities.map((f) => (
                  <View key={f} style={styles.facilityChip}>
                    <Text style={styles.facilityChipText}>{f}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Doctors on staff */}
            {item.doctors?.length > 0 && (
              <View style={styles.doctorsSection}>
                <Text style={styles.doctorsSectionTitle}>
                  👨‍⚕️ Medical Team ({item.doctors.length} doctors)
                </Text>
                <View style={styles.doctorChips}>
                  {item.doctors.slice(0, 3).map(renderDoctor)}
                  {item.doctors.length > 3 && (
                    <View style={[styles.doctorChip, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>
                        +{item.doctors.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.viewRow}>
              <Text style={styles.viewText}>View Full Profile</Text>
              <Text style={styles.viewArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  filterBtnActive: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  filterBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterBtnTextActive: { color: '#DC2626' },
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTop: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  iconBox: { width: 60, height: 60, backgroundColor: '#EFF6FF', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgesRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { color: '#2563EB', fontSize: 10, fontWeight: '700' },
  emergencyBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emergencyBadgeText: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4, letterSpacing: -0.2 },
  addr: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { fontSize: 13, fontWeight: '600', color: '#374151' },
  separator: { color: '#CBD5E1' },
  beds: { fontSize: 13, color: '#64748B' },
  facilitiesScroll: { marginBottom: 12 },
  facilityChip: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#F0FDF4', borderRadius: 100, borderWidth: 1, borderColor: '#BBF7D0', marginRight: 8 },
  facilityChipText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  doctorsSection: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  doctorsSectionTitle: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginBottom: 10 },
  doctorChips: { gap: 8 },
  doctorChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  doctorChipName: { fontSize: 13, fontWeight: '600' },
  doctorChipSpec: { fontSize: 11 },
  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  viewText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  viewArrow: { fontSize: 16, color: '#2563EB' },
});
