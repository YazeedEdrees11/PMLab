import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Calendar, Activity, ChevronLeft, MapPin, Home, FileText } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const userName = user?.name || 'مستخدم';
  const userInitial = userName.charAt(0);

  const [results, setResults] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [resultsRes, appointmentsRes, notificationsRes] = await Promise.all([
        api.get('/results/my').catch(() => ({ data: [] })),
        api.get('/appointments/my').catch(() => ({ data: [] })),
        api.get('/notifications/my').catch(() => ({ data: [] })),
      ]);
      setResults(resultsRes.data?.slice(0, 3) || []);
      setNotifications(notificationsRes.data || []);
      const now = new Date();
      const upcomingAppts = appointmentsRes.data?.filter((a: any) => 
        new Date(a.date) >= now || a.status === 'PENDING' || a.status === 'CONFIRMED'
      ) || [];
      
      setAppointments(upcomingAppts.slice(0, 5)); // Show up to 5 upcoming appointments
    } catch {
      // Silent fail - show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const getStatusInfo = (status: string) => {
    const s = status?.toUpperCase().trim();
    switch (s) {
      case 'READY':
      case 'COMPLETED': return { label: 'جاهزة', color: '#10b981', bg: '#ecfdf5' };
      case 'PENDING': return { label: 'قيد الفحص', color: '#f59e0b', bg: '#fffbeb' };
      case 'IN_PROGRESS': return { label: 'قيد التحليل', color: '#3b82f6', bg: '#eff6ff' };
      default: return { label: status, color: '#64748b', bg: '#f8fafc' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getAppointmentStatus = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { label: 'مؤكد', color: '#10b981', bg: '#ecfdf5' };
      case 'PENDING': return { label: 'قيد الانتظار', color: '#f59e0b', bg: '#fffbeb' };
      case 'CANCELLED': return { label: 'ملغى', color: '#ef4444', bg: '#fef2f2' };
      case 'COMPLETED': return { label: 'مكتمل', color: '#3b82f6', bg: '#eff6ff' };
      default: return { label: status, color: '#64748b', bg: '#f8fafc' };
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Background Gradients */}
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff4d4d" />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerRight}>
              <View style={styles.avatarGlow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
              </View>
              <View style={styles.userText}>
                <Text style={styles.greeting}>أهلاً بك مجدداً،</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell color="#ffffff" size={22} />
              {notifications.some(n => !n.isRead) && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>

          {/* Health Summary / Vitals (Bento Card Large) */}
          <View style={styles.vitalsCard}>
            <View style={styles.vitalsLeft}>
              <Activity color="#ff4d4d" size={32} />
              <Text style={styles.vitalsTitle}>ملخص الحالة</Text>
              <Text style={styles.vitalsDesc}>فحوصاتك الأخيرة مستقرة</Text>
            </View>
            <View style={styles.vitalsRight}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>85%</Text>
                <Text style={styles.progressLabel}>صحة ممتازة</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid (Bento Style) */}
          <View style={styles.gridContainer}>
            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: '#1e293b' }]}
              onPress={() => navigation.navigate('NewBooking')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 77, 77, 0.15)' }]}>
                <Calendar color="#ff4d4d" size={24} />
              </View>
              <Text style={styles.gridCardTitle}>حجز جديد</Text>
              <Text style={styles.gridCardSub}>منزلي / مختبر</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: '#1e293b' }]}
              onPress={() => navigation.navigate('Results')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <FileText color="#38bdf8" size={24} />
              </View>
              <Text style={styles.gridCardTitle}>النتائج</Text>
              <Text style={styles.gridCardSub}>تقارير فورية</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: '#1e293b' }]}
              onPress={() => navigation.navigate('Branches')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <MapPin color="#10b981" size={24} />
              </View>
              <Text style={styles.gridCardTitle}>الفروع</Text>
              <Text style={styles.gridCardSub}>الأقرب إليك</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridCard, { backgroundColor: '#1e293b' }]}
              onPress={() => navigation.navigate('MedicalFile')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Home color="#a855f7" size={24} />
              </View>
              <Text style={styles.gridCardTitle}>ملفي الطبي</Text>
              <Text style={styles.gridCardSub}>السجل الشامل</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Lab Results List */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity onPress={() => navigation.navigate('Results')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>أحدث النتائج المخبرية</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#ff4d4d" style={{ marginVertical: 20 }} />
            ) : results.length === 0 ? (
              <View style={styles.glassCard}>
                <Text style={styles.emptyText}>لا توجد نتائج مسجلة</Text>
              </View>
            ) : (
              results.map((result) => {
                const statusInfo = getStatusInfo(result.status);
                return (
                  <TouchableOpacity 
                    key={result.id} 
                    style={styles.glassResultCard}
                    onPress={() => navigation.navigate('Results')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={styles.resName}>{result.test?.nameAr || result.test?.name || 'فحص'}</Text>
                      <Text style={styles.resDate}>{formatDate(result.createdAt)}</Text>
                    </View>
                    <View style={[styles.glassStatus, { borderColor: statusInfo.color + '40' }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#0c111d',
  },
  bgGlow1: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginRight: 16,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  avatarGlow: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 21,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff20',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  notificationDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4d4d',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  vitalsCard: {
    marginHorizontal: 24,
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffffff08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  vitalsLeft: {
    flex: 1,
    alignItems: 'flex-end',
  },
  vitalsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 4,
  },
  vitalsDesc: {
    color: '#94a3b8',
    fontSize: 13,
  },
  vitalsRight: {
    marginLeft: 20,
  },
  progressCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: '#ff4d4d20',
    borderTopColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  progressLabel: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  gridCard: {
    width: '44%',
    margin: '3%',
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ffffff08',
    alignItems: 'flex-end',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  gridCardSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  sectionContainer: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 14,
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  glassCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  glassResultCard: {
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff05',
  },
  resultInfo: {
    alignItems: 'flex-end',
    flex: 1,
    marginRight: 12,
  },
  resName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resDate: {
    color: '#64748b',
    fontSize: 12,
  },
  glassStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
