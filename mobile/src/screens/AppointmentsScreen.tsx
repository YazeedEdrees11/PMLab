import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock, MapPin, Plus, Inbox, Home, Trash2, RefreshCw } from 'lucide-react-native';
import api from '../api/client';

interface Appointment {
  id: string;
  date: string;
  time: string | null;
  type: string;
  homeVisit?: boolean;
  status: string;
  notes: string | null;
  branch?: { name: string } | null;
  testItems?: { test: { name: string; nameAr: string } }[];
}

export default function AppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, []);

  const handleCancelAppointment = (appt: Appointment) => {
    Alert.alert(
      'تأكيد الإلغاء',
      'هل أنت متأكد من إلغاء هذا الموعد؟',
      [
        { text: 'تراجع', style: 'cancel' },
        {
          text: 'إلغاء الموعد',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(appt.id);
            try {
              await api.patch(`/appointments/${appt.id}`, { status: 'CANCELLED' });
              fetchAppointments();
            } catch {
              Alert.alert('خطأ', 'تعذر إلغاء الموعد.');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.date) >= now || a.status === 'PENDING' || a.status === 'CONFIRMED');
  const past = appointments.filter(a => new Date(a.date) < now && a.status !== 'PENDING' && a.status !== 'CONFIRMED');
  const displayedAppointments = activeTab === 'upcoming' ? upcoming : past;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { label: 'مؤكد', color: '#10b981' };
      case 'PENDING': return { label: 'قيد الانتظار', color: '#f59e0b' };
      case 'CANCELLED': return { label: 'ملغى', color: '#ff4d4d' };
      case 'COMPLETED': return { label: 'مكتمل', color: '#38bdf8' };
      default: return { label: status, color: '#94a3b8' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return {
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear()
    };
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowBlue} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NewBooking')} activeOpacity={0.8}>
            <Plus color="#ffffff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>مواعيدي</Text>
        </View>

        {/* Custom Tab Selector */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'past' && styles.tabActive]}
              onPress={() => setActiveTab('past')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>السابقة</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
              onPress={() => setActiveTab('upcoming')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>القادمة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d4d" />
          </View>
        ) : (
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff4d4d" />
            }
          >
            {displayedAppointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Inbox color="rgba(255, 255, 255, 0.1)" size={80} />
                <Text style={styles.emptyTitle}>لا توجد مواعيد</Text>
                <Text style={styles.emptySubtitle}>جدول مواعيدك القادمة هنا بكل سهولة</Text>
              </View>
            ) : (
              displayedAppointments.map((appt) => {
                const statusInfo = getStatusInfo(appt.status);
                const isHome = appt.homeVisit === true;
                const dateParts = formatDate(appt.date);
                
                return (
                  <View key={appt.id} style={styles.appointmentCard}>
                    <View style={styles.cardTop}>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateDay}>{dateParts.day}</Text>
                        <Text style={styles.dateMonth}>{dateParts.month}</Text>
                      </View>
                      <View style={styles.mainInfo}>
                        <View style={styles.typeRow}>
                          <Text style={styles.typeLabel}>{isHome ? 'زيارة منزلية' : 'زيارة للمختبر'}</Text>
                          {isHome ? <Home color="#10b981" size={16} /> : <MapPin color="#38bdf8" size={16} />}
                        </View>
                        <View style={styles.statusGroup}>
                          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailText}>{appt.time || '--:--'}</Text>
                        <Clock color="#64748b" size={16} style={styles.detailIcon} />
                      </View>
                      {appt.branch && !isHome && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailText}>{appt.branch.name}</Text>
                          <MapPin color="#64748b" size={16} style={styles.detailIcon} />
                        </View>
                      )}
                      {appt.testItems && appt.testItems.length > 0 && (
                        <View style={styles.testTags}>
                          {appt.testItems.map((item, idx) => (
                            <View key={idx} style={styles.tag}>
                              <Text style={styles.tagText}>{item.test.nameAr || item.test.name}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          style={styles.actionBtnOutline} 
                          onPress={() => handleCancelAppointment(appt)}
                          disabled={cancellingId === appt.id}
                        >
                          {cancellingId === appt.id ? (
                            <ActivityIndicator color="#ff4d4d" size="small" />
                          ) : (
                            <Trash2 color="#ff4d4d" size={20} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionBtnPrimary}
                          onPress={() => navigation.navigate('NewBooking')}
                        >
                          <RefreshCw color="#ffffff" size={18} style={{ marginRight: 8 }} />
                          <Text style={styles.btnText}>إعادة جدولة</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
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
    top: -50,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  tabWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBadge: {
    width: 64,
    height: 74,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#ff4d4d',
    fontWeight: 'bold',
    marginTop: 2,
  },
  mainInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 20,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 20,
  },
  cardDetails: {
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
  },
  detailIcon: {
    opacity: 0.6,
  },
  testTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 56,
    backgroundColor: '#ff4d4d',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutline: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
