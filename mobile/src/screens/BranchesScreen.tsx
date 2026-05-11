import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, MapPin, Phone, Navigation, Building2, Globe } from 'lucide-react-native';
import api from '../api/client';

interface Branch {
  id: string;
  name: string;
  nameAr?: string;
  phone?: string;
  mapUrl?: string;
  address?: string;
}

export default function BranchesScreen({ navigation }: any) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الفروع');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('خطأ', 'تعذر فتح تطبيق الاتصال')
    );
  };

  const handleOpenMap = (mapUrl: string) => {
    Linking.openURL(mapUrl).catch(() =>
      Alert.alert('خطأ', 'تعذر فتح الخريطة')
    );
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowRed} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ChevronRight color="#ffffff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>فروعنا</Text>
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
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBranches(); }} tintColor="#ff4d4d" />
            }
          >
            {/* Glassmorphic Hero */}
            <View style={styles.heroCard}>
              <View style={styles.heroIconBox}>
                <Building2 color="#ff4d4d" size={40} />
              </View>
              <Text style={styles.heroTitle}>شبكة مختبراتنا</Text>
              <Text style={styles.heroSubtitle}>
                نحن متواجدون في عدة مواقع لخدمتكم بشكل أسرع وأكثر دقة
              </Text>
            </View>

            {branches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MapPin color="rgba(255,255,255,0.1)" size={60} />
                <Text style={styles.emptyTitle}>لا توجد فروع حالياً</Text>
              </View>
            ) : (
              branches.map((branch, index) => (
                <View key={branch.id} style={styles.branchCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.branchIconBox}>
                      <Globe color="#38bdf8" size={24} />
                    </View>
                    <View style={styles.branchInfo}>
                      <Text style={styles.branchName}>{branch.nameAr || branch.name}</Text>
                      {branch.address && (
                        <View style={styles.addressRow}>
                          <Text style={styles.branchAddress}>{branch.address}</Text>
                          <MapPin color="#64748b" size={12} style={{ marginLeft: 4 }} />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.actionRow}>
                    {branch.phone && (
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCall(branch.phone!)}
                        activeOpacity={0.8}
                      >
                        <Phone color="#10b981" size={18} style={{ marginRight: 10 }} />
                        <Text style={styles.callBtnText}>تواصل</Text>
                      </TouchableOpacity>
                    )}
                    {branch.mapUrl && (
                      <TouchableOpacity
                        style={styles.mapBtn}
                        onPress={() => handleOpenMap(branch.mapUrl!)}
                        activeOpacity={0.8}
                      >
                        <Navigation color="#ffffff" size={18} style={{ marginRight: 10 }} />
                        <Text style={styles.mapBtnText}>الخريطة</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
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
  glowRed: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
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
  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 30,
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  branchCard: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  branchIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  branchInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  branchName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  branchAddress: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10b981',
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 54,
    borderRadius: 18,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  mapBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
