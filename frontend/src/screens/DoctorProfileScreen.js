import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPEC_COLORS } from '../utils/constants';
import { doctorAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfileScreen({ route, navigation }) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const { toggleBookmark, isBookmarked } = useAuth();

  useEffect(() => { fetchDoctor(); }, []);

  const fetchDoctor = async () => {
    try {
      const res = await doctorAPI.getById(doctorId);
      setDoctor(res.data.data);
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally { setLoading(false); }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
  if (!doctor) return null;

  const spec = SPEC_COLORS[doctor.specialization] || { bg: '#F1F5F9', text: '#374151', icon: '👤' };
  const bookmarked = isBookmarked('doctor', doctor.id);
  const stars = '★'.repeat(Math.floor(doctor.rating)) + '☆'.repeat(5 - Math.floor(doctor.rating));

  const TABS = ['about', 'hospitals', 'contact'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#1E40AF', '#2563EB', '#3B82F6']} style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleBookmark('doctor', doctor.id)} style={styles.bookmarkBtn}>
            <Text style={{ fontSize: 20 }}>{bookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>

          <View style={styles.heroBody}>
            <View style={[styles.avatarLg, { backgroundColor: spec.bg }]}>
              <Text style={styles.avatarIcon}>{spec.icon}</Text>
            </View>
            <Text style={styles.heroName}>{doctor.name}</Text>
            <View style={[styles.specPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.specPillText}>{doctor.specialization}</Text>
            </View>
            <Text style={styles.starsText}>{stars} <Text style={styles.ratingNum}>{doctor.rating} ({doctor.reviews_count} reviews)</Text></Text>
          </View>

          <View style={styles.statBar}>
            {[
              { val: `${doctor.experience}+`, label: 'Yrs Exp.' },
              { val: `₹${doctor.consultation_fee}`, label: 'Consult Fee' },
              { val: `${doctor.hospitals?.length || 0}`, label: 'Hospitals' },
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

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {/* About Tab */}
          {activeTab === 'about' && (
            <View>
              <InfoCard title="About" icon="ℹ️">
                <Text style={styles.bioText}>{doctor.bio || 'Experienced specialist dedicated to patient care.'}</Text>
              </InfoCard>
              <InfoCard title="Education" icon="🎓">
                <Text style={styles.infoText}>{doctor.education}</Text>
              </InfoCard>
              <InfoCard title="Languages" icon="🌐">
                <View style={styles.langRow}>
                  {(doctor.languages || []).map((l) => (
                    <View key={l} style={styles.langChip}><Text style={styles.langText}>{l}</Text></View>
                  ))}
                </View>
              </InfoCard>
            </View>
          )}

          {/* Hospitals Tab */}
          {activeTab === 'hospitals' && (
            <View>
              <View style={styles.sectionHeaderNote}>
                <Text style={styles.sectionHeaderNoteText}>🏥 Hospitals this doctor visits with schedule</Text>
              </View>
              {(doctor.hospitals || []).map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.hospitalCard}
                  onPress={() => navigation.navigate('HospitalProfile', { hospitalId: h.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.hospitalCardRow}>
                    <View style={styles.hospitalIconBox}>
                      <Text style={{ fontSize: 22 }}>🏥</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hospitalName}>{h.name}</Text>
                      <Text style={styles.hospitalAddr} numberOfLines={1}>{h.address}</Text>
                      {h.DoctorHospital && (
                        <View style={styles.schedule}>
                          <View style={styles.scheduleDayPill}>
                            <Text style={styles.scheduleDayText}>{h.DoctorHospital.visiting_days?.join(', ')}</Text>
                          </View>
                          <Text style={styles.scheduleTiming}>⏰ {h.DoctorHospital.timing}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {(!doctor.hospitals || !doctor.hospitals.length) && (
                <Text style={styles.noData}>No hospital information available</Text>
              )}
            </View>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <View>
              <InfoCard title="Phone" icon="📞">
                <TouchableOpacity onPress={() => doctor.phone ? Linking.openURL(`tel:${doctor.phone}`) : Alert.alert('Not available')}>
                  <Text style={[styles.infoText, styles.linkText]}>{doctor.phone || 'Not available'}</Text>
                </TouchableOpacity>
              </InfoCard>
              <InfoCard title="Consultation Fee" icon="💰">
                <Text style={styles.infoText}>₹{doctor.consultation_fee} per visit</Text>
              </InfoCard>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const InfoCard = ({ title, icon, children }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoCardHeader}>
      <Text style={styles.infoCardIcon}>{icon}</Text>
      <Text style={styles.infoCardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 56, paddingBottom: 0 },
  backBtn: { position: 'absolute', top: 56, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  backIcon: { fontSize: 18, color: '#FFF' },
  bookmarkBtn: { position: 'absolute', top: 56, right: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  heroBody: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  avatarLg: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarIcon: { fontSize: 40 },
  heroName: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  specPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100, marginBottom: 8 },
  specPillText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  starsText: { fontSize: 15, color: '#FCD34D' },
  ratingNum: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  statBar: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, padding: 16, marginTop: 16, marginBottom: -1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#2563EB', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: '#2563EB', fontWeight: '700' },
  tabContent: { paddingHorizontal: 16, paddingTop: 16 },
  infoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  infoCardIcon: { fontSize: 18 },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  bioText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  infoText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  linkText: { color: '#2563EB', textDecorationLine: 'underline', fontWeight: '600' },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#EFF6FF', borderRadius: 8 },
  langText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  sectionHeaderNote: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  sectionHeaderNoteText: { fontSize: 13, color: '#1D4ED8', fontWeight: '600' },
  hospitalCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  hospitalCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hospitalIconBox: { width: 44, height: 44, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hospitalName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  hospitalAddr: { fontSize: 12, color: '#94A3B8', marginBottom: 6 },
  schedule: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  scheduleDayPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  scheduleDayText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
  scheduleTiming: { fontSize: 11, color: '#059669', fontWeight: '500' },
  chevron: { fontSize: 22, color: '#CBD5E1', paddingTop: 2 },
  noData: { textAlign: 'center', color: '#94A3B8', paddingVertical: 30, fontSize: 14 },
});
