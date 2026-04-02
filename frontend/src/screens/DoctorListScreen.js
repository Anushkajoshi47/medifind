import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPEC_COLORS } from '../utils/constants';

const SORT_OPTIONS = ['Rating', 'Fee: Low', 'Experience'];

export default function DoctorListScreen({ route, navigation }) {
  const { doctors = [], specializations = [], symptoms = [] } = route.params;
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Rating');

  const filters = ['All', ...specializations];

  const filtered = doctors
    .filter((d) => activeFilter === 'All' || d.specialization === activeFilter)
    .sort((a, b) => {
      if (sortBy === 'Rating') return b.rating - a.rating;
      if (sortBy === 'Fee: Low') return a.consultation_fee - b.consultation_fee;
      return b.experience - a.experience;
    });

  const renderDoctor = ({ item }) => {
    const spec = SPEC_COLORS[item.specialization] || { bg: '#F1F5F9', text: '#374151', icon: '👤' };
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
        activeOpacity={0.88}
      >
        {/* Avatar + name */}
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: spec.bg }]}>
            <Text style={styles.avatarIcon}>{spec.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{item.name}</Text>
            <View style={[styles.specBadge, { backgroundColor: spec.bg }]}>
              <Text style={[styles.specBadgeText, { color: spec.text }]}>{item.specialization}</Text>
            </View>
            <Text style={styles.education} numberOfLines={1}>{item.education}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>⭐ {item.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{item.experience} yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>₹{item.consultation_fee}</Text>
            <Text style={styles.statLabel}>Fee</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>{item.hospitals?.length || 0}</Text>
            <Text style={styles.statLabel}>Hospitals</Text>
          </View>
        </View>

        {/* Hospital schedule preview */}
        {item.hospitals?.length > 0 && (
          <View style={styles.scheduleSection}>
            <Text style={styles.scheduleSectionTitle}>🏥 Visits these hospitals:</Text>
            {item.hospitals.slice(0, 2).map((h) => (
              <View key={h.id} style={styles.scheduleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleHospitalName}>{h.name}</Text>
                  {h.DoctorHospital && (
                    <View style={styles.scheduleMeta}>
                      <View style={styles.scheduleDayPill}>
                        <Text style={styles.scheduleDayText}>{h.DoctorHospital.visiting_days?.join(', ')}</Text>
                      </View>
                      <Text style={styles.scheduleTiming}>⏰ {h.DoctorHospital.timing}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            {item.hospitals.length > 2 && (
              <Text style={styles.scheduleMoreText}>+{item.hospitals.length - 2} more hospitals</Text>
            )}
          </View>
        )}

        {/* Languages */}
        {item.languages?.length > 0 && (
          <View style={styles.langRow}>
            <Text style={styles.langLabel}>Speaks: </Text>
            {item.languages.map((l) => (
              <View key={l} style={styles.langChip}>
                <Text style={styles.langChipText}>{l}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Recommended Doctors</Text>
          <Text style={styles.headerSub}>For: {symptoms.slice(0, 2).join(', ')}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Specialty filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort + count */}
      <View style={styles.controlRow}>
        <Text style={styles.resultCount}>{filtered.length} results</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
              onPress={() => setSortBy(s)}
            >
              <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        renderItem={renderDoctor}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptyText}>Try selecting a different filter or symptom</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: '#374151' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  countBadge: { backgroundColor: '#EFF6FF', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#2563EB', fontWeight: '800', fontSize: 14 },
  filterBar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  filterChipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  filterChipTextActive: { color: '#2563EB', fontWeight: '700' },
  controlRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  resultCount: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 8 },
  sortBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  sortBtnText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  sortBtnTextActive: { color: '#2563EB', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 26 },
  doctorName: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 6, letterSpacing: -0.2 },
  specBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 5 },
  specBadgeText: { fontSize: 11, fontWeight: '700' },
  education: { fontSize: 12, color: '#94A3B8' },
  chevron: { fontSize: 24, color: '#CBD5E1', paddingTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBadge: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '500' },
  scheduleSection: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  scheduleSectionTitle: { fontSize: 12, fontWeight: '700', color: '#059669', marginBottom: 10 },
  scheduleRow: { flexDirection: 'row', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#D1FAE5' },
  scheduleHospitalName: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 5 },
  scheduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  scheduleDayPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scheduleDayText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
  scheduleTiming: { fontSize: 11, color: '#059669', fontWeight: '500' },
  scheduleMoreText: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 4 },
  langRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  langLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  langChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  langChipText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});
