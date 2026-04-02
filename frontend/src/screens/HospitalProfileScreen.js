import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPEC_COLORS } from '../utils/constants';
import { hospitalAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function HospitalProfileScreen({ route, navigation }) {
  const { hospitalId } = route.params;
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toggleBookmark, isBookmarked } = useAuth();

  useEffect(() => { fetchHospital(); }, []);

  const fetchHospital = async () => {
    try {
      const res = await hospitalAPI.getById(hospitalId);
      setHospital(res.data.data);
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally { setLoading(false); }
  };

  if (loading) return (
    <View style={styles.loading}><ActivityIndicator size="large" color="#2563EB" /></View>
  );
  if (!hospital) return null;

  const bookmarked = isBookmarked('hospital', hospital.id);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#0D1B2A', '#1E3A5F', '#1C4587']} style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleBookmark('hospital', hospital.id)} style={styles.bookmarkBtn}>
            <Text style={{ fontSize: 20 }}>{bookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>

          <View style={styles.heroBody}>
            <View style={styles.hospitalIconLg}>
              <Text style={{ fontSize: 40 }}>🏥</Text>
            </View>
            <Text style={styles.heroName}>{hospital.name}</Text>
            <Text style={styles.heroAddr}>📍 {hospital.address}</Text>
            <View style={styles.badgesRow}>
              {hospital.emergency && (
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyBadgeText}>🚨 24/7 Emergency</Text>
                </View>
              )}
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{hospital.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statBar}>
            {[
              { val: `⭐ ${hospital.rating}`, label: 'Rating' },
              { val: `${hospital.beds}+`, label: 'Beds' },
              { val: `${hospital.doctors?.length || 0}`, label: 'Doctors' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Facilities */}
          {hospital.facilities?.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏗️ Facilities</Text>
              <View style={styles.facilityGrid}>
                {hospital.facilities.map((f) => (
                  <View key={f} style={styles.facilityChip}>
                    <Text style={styles.facilityChipText}>✓ {f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📞 Contact</Text>
            <TouchableOpacity onPress={() => hospital.phone ? Linking.openURL(`tel:${hospital.phone}`) : Alert.alert('Not available')} activeOpacity={0.8}>
              <Text style={styles.phoneText}>{hospital.phone || 'Not available'}</Text>
            </TouchableOpacity>
          </View>

          {/* Medical Team */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👨‍⚕️ Medical Team</Text>
            <Text style={styles.teamSubtitle}>Tap a doctor to view their full profile and schedule</Text>
            {(hospital.doctors || []).map((doc) => {
              const spec = SPEC_COLORS[doc.specialization] || { bg: '#F1F5F9', text: '#374151', icon: '👤' };
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.doctorRow}
                  onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
                  activeOpacity={0.85}
                >
                  <View style={[styles.docAvatar, { backgroundColor: spec.bg }]}>
                    <Text style={{ fontSize: 20 }}>{spec.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{doc.name}</Text>
                    <View style={[styles.specPill, { backgroundColor: spec.bg }]}>
                      <Text style={[styles.specPillText, { color: spec.text }]}>{doc.specialization}</Text>
                    </View>
                    {doc.DoctorHospital && (
                      <View style={styles.schedule}>
                        <View style={styles.scheduleDayPill}>
                          <Text style={styles.scheduleDayText}>{doc.DoctorHospital.visiting_days?.join(', ')}</Text>
                        </View>
                        <Text style={styles.scheduleTiming}>⏰ {doc.DoctorHospital.timing}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
            {(!hospital.doctors || !hospital.doctors.length) && (
              <Text style={styles.noData}>No doctor information available</Text>
            )}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Call CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => hospital.phone ? Linking.openURL(`tel:${hospital.phone}`) : Alert.alert('Not available')}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaBtnText}>📞  Call Hospital</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 56, paddingBottom: 0 },
  backBtn: { position: 'absolute', top: 56, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  backIcon: { fontSize: 18, color: '#FFF' },
  bookmarkBtn: { position: 'absolute', top: 56, right: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  heroBody: { alignItems: 'center', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20 },
  hospitalIconLg: { width: 84, height: 84, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 6, letterSpacing: -0.3 },
  heroAddr: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  emergencyBadge: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  emergencyBadgeText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  typeBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  statBar: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, padding: 16, marginTop: 16, marginBottom: -1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#2563EB', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  facilityChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F0FDF4', borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0' },
  facilityChipText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  phoneText: { fontSize: 16, color: '#2563EB', fontWeight: '600', textDecorationLine: 'underline' },
  teamSubtitle: { fontSize: 12, color: '#94A3B8', marginBottom: 14 },
  doctorRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 12 },
  docAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 5 },
  specPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  specPillText: { fontSize: 11, fontWeight: '700' },
  schedule: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  scheduleDayPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scheduleDayText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
  scheduleTiming: { fontSize: 11, color: '#059669', fontWeight: '500' },
  chevron: { fontSize: 22, color: '#CBD5E1', paddingTop: 4 },
  noData: { textAlign: 'center', color: '#94A3B8', paddingVertical: 20, fontSize: 14 },
  ctaBar: { padding: 16, paddingBottom: 32, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  ctaBtn: { backgroundColor: '#2563EB', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  ctaBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
