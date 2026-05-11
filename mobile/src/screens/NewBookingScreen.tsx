import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, MapPin, Home, Calendar, Clock, FlaskConical, CheckCircle2, ChevronRight, Save, Navigation } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MapView, Marker } from './MapComponent';
import * as Location from 'expo-location';
import api from '../api/client';
import { GlassModal } from '../components/GlassModal';

interface Branch {
  id: string;
  name: string;
  address?: string;
}

interface Test {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  category?: string;
}

export default function NewBookingScreen({ navigation }: any) {
  // Form State
  const [visitType, setVisitType] = useState<'lab' | 'home'>('lab');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Location State
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [addressDetails, setAddressDetails] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Data State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Current step
  const [step, setStep] = useState(1);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: any = 'info') => {
    setModalConfig({ visible: true, title, message, type });
  };

  // Format helpers
  const formatDateAr = (d: Date) => {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (d: Date) => {
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${period}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, testsRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: [] })),
          api.get('/tests').catch(() => ({ data: [] })),
        ]);
        setBranches(branchesRes.data);
        setTests(testsRes.data);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTest = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const totalPrice = tests
    .filter(t => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const getQuickDates = () => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const afterTomorrow = new Date(today); afterTomorrow.setDate(today.getDate() + 2);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    return [
      { label: 'غداً', sublabel: formatDateAr(tomorrow).split('،')[1]?.trim() || '', date: tomorrow },
      { label: 'بعد غد', sublabel: formatDateAr(afterTomorrow).split('،')[1]?.trim() || '', date: afterTomorrow },
      { label: 'بعد أسبوع', sublabel: formatDateAr(nextWeek).split('،')[1]?.trim() || '', date: nextWeek },
    ];
  };

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      showAlert('تنبيه', 'يرجى اختيار فحص واحد على الأقل', 'warning');
      return;
    }
    if (!selectedDate) {
      showAlert('تنبيه', 'يرجى اختيار تاريخ الموعد', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const timeStr = selectedTime
        ? `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`
        : undefined;

      await api.post('/appointments', {
        branchId: visitType === 'lab' ? selectedBranch : undefined,
        date: selectedDate.toISOString(),
        time: timeStr,
        homeVisit: visitType === 'home',
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: addressDetails || undefined,
        testIds: selectedTests,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'تعذر إرسال الحجز. حاول مجدداً.';
      showAlert('خطأ', msg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.mainWrapper}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff4d4d" />
        </SafeAreaView>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.mainWrapper}>
        <View style={styles.glowBlue} />
        <SafeAreaView style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <CheckCircle2 color="#10b981" size={60} />
          </View>
          <Text style={styles.successTitle}>تم إرسال طلب الحجز!</Text>
          <Text style={styles.successSubtitle}>
            سيقوم فريقنا بالتواصل معك لتأكيد الموعد في أقرب وقت.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.successBtnText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowBlue} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <ChevronRight color="#ffffff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>حجز موعد جديد</Text>
        </View>

        {/* Custom Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, step >= 1 && styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, step >= 2 && styles.progressSegmentActive]} />
          <View style={[styles.progressSegment, step >= 3 && styles.progressSegmentActive]} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* STEP 1: Visit Type & Location */}
          {step === 1 && (
            <View>
              <Text style={styles.sectionTitle}>نوع الزيارة</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeCard, visitType === 'home' && styles.typeCardActive]}
                  onPress={() => { setVisitType('home'); setSelectedBranch(null); }}
                >
                  <Home color={visitType === 'home' ? '#ffffff' : '#64748b'} size={28} />
                  <Text style={[styles.typeText, visitType === 'home' && styles.typeTextActive]}>زيارة منزلية</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeCard, visitType === 'lab' && styles.typeCardActive]}
                  onPress={() => setVisitType('lab')}
                >
                  <Navigation color={visitType === 'lab' ? '#ffffff' : '#64748b'} size={28} />
                  <Text style={[styles.typeText, visitType === 'lab' && styles.typeTextActive]}>زيارة للمختبر</Text>
                </TouchableOpacity>
              </View>

              {visitType === 'lab' ? (
                <View>
                  <Text style={styles.sectionTitle}>اختر الفرع</Text>
                  {branches.map(branch => (
                    <TouchableOpacity
                      key={branch.id}
                      style={[styles.glassCard, selectedBranch === branch.id && styles.glassCardActive]}
                      onPress={() => setSelectedBranch(branch.id)}
                    >
                      <View style={styles.branchInfo}>
                        <Text style={[styles.branchName, selectedBranch === branch.id && { color: '#ff4d4d' }]}>
                          {branch.name}
                        </Text>
                        <Text style={styles.branchAddress}>{branch.address || 'عنوان الفرع'}</Text>
                      </View>
                      <View style={[styles.radio, selectedBranch === branch.id && styles.radioActive]}>
                        {selectedBranch === branch.id && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.homeVisitSection}>
                  <Text style={styles.sectionTitle}>موقع الزيارة</Text>
                  <View style={styles.mapFrame}>
                    {location ? (
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                        customMapStyle={darkMapStyle}
                      >
                        <Marker 
                          coordinate={location} 
                          pinColor="#ff4d4d"
                        />
                      </MapView>
                    ) : (
                      <View style={styles.mapOverlay}>
                        {fetchingLocation ? (
                          <ActivityIndicator color="#ff4d4d" size="large" />
                        ) : (
                          <TouchableOpacity
                            style={styles.locationBtn}
                            onPress={async () => {
                              setFetchingLocation(true);
                              let { status } = await Location.requestForegroundPermissionsAsync();
                              if (status !== 'granted') {
                                setFetchingLocation(false);
                                return;
                              }
                              let loc = await Location.getCurrentPositionAsync({});
                              setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                              setFetchingLocation(false);
                            }}
                          >
                            <MapPin color="#ffffff" size={24} />
                            <Text style={styles.locationBtnText}>تحديد موقعي التلقائي</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>تفاصيل العنوان الإضافية</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="رقم الشقة، الطابق، علامة مميزة..."
                        placeholderTextColor="#64748b"
                        value={addressDetails}
                        onChangeText={setAddressDetails}
                        textAlign="right"
                      />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.mainBtn, (visitType === 'lab' ? !selectedBranch : (!location || !addressDetails)) && styles.btnDisabled]}
                disabled={visitType === 'lab' ? !selectedBranch : (!location || !addressDetails)}
                onPress={() => setStep(2)}
              >
                <Text style={styles.mainBtnText}>متابعة اختيار الفحوصات</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Tests */}
          {step === 2 && (
            <View>
              <Text style={styles.sectionTitle}>الفحوصات المتاحة</Text>
              {tests.map(test => {
                const isSelected = selectedTests.includes(test.id);
                return (
                  <TouchableOpacity
                    key={test.id}
                    style={[styles.glassCard, isSelected && styles.glassCardActive]}
                    onPress={() => toggleTest(test.id)}
                  >
                    <View style={styles.testRow}>
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.testInfo}>
                        <Text style={[styles.testName, isSelected && { color: '#ffffff' }]}>
                          {test.nameAr || test.name}
                        </Text>
                        <Text style={styles.testPrice}>{test.price} ر.س</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.totalBox}>
                <Text style={styles.totalPriceText}>{totalPrice} ر.س</Text>
                <Text style={styles.totalLabelText}>إجمالي التكلفة</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
                  <Text style={styles.secondaryBtnText}>السابق</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainBtn, { flex: 2 }, selectedTests.length === 0 && styles.btnDisabled]}
                  disabled={selectedTests.length === 0}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.mainBtnText}>تحديد الموعد</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Finalize */}
          {step === 3 && (
            <View>
              <Text style={styles.sectionTitle}>موعد الزيارة</Text>
              <View style={styles.quickDatesRow}>
                {getQuickDates().map((qd) => {
                  const isActive = selectedDate && selectedDate.toDateString() === qd.date.toDateString();
                  return (
                    <TouchableOpacity
                      key={qd.label}
                      style={[styles.quickDateCard, isActive && styles.quickDateCardActive]}
                      onPress={() => setSelectedDate(qd.date)}
                    >
                      <Text style={[styles.qdLabel, isActive && styles.qdLabelActive]}>{qd.label}</Text>
                      <Text style={[styles.qdSub, isActive && styles.qdSubActive]}>{qd.sublabel}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowDatePicker(true)}>
                <Calendar color="#ff4d4d" size={20} />
                <Text style={styles.pickerTriggerText}>
                  {selectedDate ? formatDateAr(selectedDate) : 'اختر تاريخاً آخر'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowTimePicker(true)}>
                <Clock color="#ff4d4d" size={20} />
                <Text style={styles.pickerTriggerText}>
                  {selectedTime ? formatTime(selectedTime) : 'اختر الوقت المناسب'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(e, d) => { setShowDatePicker(false); if(d) setSelectedDate(d); }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={(e, d) => { setShowTimePicker(false); if(d) setSelectedTime(d); }}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ملاحظات إضافية</Text>
                <View style={[styles.inputWrapper, styles.textArea]}>
                  <TextInput
                    style={styles.input}
                    placeholder="أي تعليمات خاصة للفني..."
                    placeholderTextColor="#64748b"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    textAlign="right"
                  />
                </View>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitleText}>ملخص الحجز</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalPrice} ر.س</Text>
                  <Text style={styles.summaryLabel}>التكلفة الإجمالية</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{selectedTests.length}</Text>
                  <Text style={styles.summaryLabel}>عدد الفحوصات</Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(2)}>
                  <Text style={styles.secondaryBtnText}>السابق</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainBtn, { flex: 2 }, (!selectedDate || submitting) && styles.btnDisabled]}
                  disabled={!selectedDate || submitting}
                  onPress={handleSubmit}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>تأكيد الحجز النهائي</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        <GlassModal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          confirmText="حسناً"
          onConfirm={() => setModalConfig({ ...modalConfig, visible: false })}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#0c111d',
  },
  glowBlue: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#ffffff' },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressSegmentActive: { backgroundColor: '#ff4d4d' },
  container: { flex: 1, paddingHorizontal: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'right',
  },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  typeCardActive: {
    backgroundColor: '#ff4d4d',
    borderColor: '#ff4d4d',
  },
  typeText: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginTop: 12 },
  typeTextActive: { color: '#ffffff' },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassCardActive: {
    borderColor: 'rgba(255, 77, 77, 0.3)',
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
  },
  branchInfo: { flex: 1, alignItems: 'flex-end', marginRight: 16 },
  branchName: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  branchAddress: { fontSize: 12, color: '#64748b', marginTop: 4 },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#64748b',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#ff4d4d' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff4d4d' },
  mapFrame: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
  },
  map: { flex: 1 },
  mapOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  locationBtn: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  locationBtnText: { color: '#ffffff', fontWeight: 'bold', marginLeft: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#94a3b8', marginBottom: 10, textAlign: 'right' },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: { color: '#ffffff', fontSize: 15 },
  textArea: { height: 100, paddingTop: 15 },
  mainBtn: {
    backgroundColor: '#ff4d4d',
    height: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.5 },
  mainBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  testRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: '#64748b',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  checkboxActive: { backgroundColor: '#ff4d4d', borderColor: '#ff4d4d' },
  checkmark: { color: '#ffffff', fontWeight: '900' },
  testInfo: { flex: 1, alignItems: 'flex-end' },
  testName: { fontSize: 16, fontWeight: 'bold', color: '#94a3b8' },
  testPrice: { fontSize: 14, color: '#64748b', fontWeight: 'bold', marginTop: 4 },
  totalBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    marginVertical: 24,
  },
  totalPriceText: { fontSize: 32, fontWeight: '900', color: '#ffffff' },
  totalLabelText: { fontSize: 14, color: '#64748b', fontWeight: 'bold', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#94a3b8', fontWeight: 'bold' },
  quickDatesRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickDateCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickDateCardActive: { backgroundColor: '#ff4d4d', borderColor: '#ff4d4d' },
  qdLabel: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  qdLabelActive: { color: '#ffffff' },
  qdSub: { fontSize: 11, color: '#64748b', marginTop: 4 },
  qdSubActive: { color: 'rgba(255, 255, 255, 0.8)' },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    height: 60,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerTriggerText: { color: '#ffffff', flex: 1, textAlign: 'right', marginRight: 15, fontWeight: 'bold' },
  summaryBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    padding: 24,
    borderRadius: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.1)',
  },
  summaryTitleText: { fontSize: 18, fontWeight: '900', color: '#ffffff', marginBottom: 20, textAlign: 'right' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#64748b', fontSize: 14 },
  summaryValue: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  successIconBox: {
    width: 100, height: 100, borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', marginBottom: 16, textAlign: 'center' },
  successSubtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  successBtn: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
  },
  successBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
});

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];
