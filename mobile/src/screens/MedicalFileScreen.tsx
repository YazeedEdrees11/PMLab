import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, FileText, Activity, Calendar, Download, FlaskConical, TrendingUp, Search } from 'lucide-react-native';
import api from '../api/client';

interface TestResult {
  id: string;
  status: string;
  value: string | null;
  unit: string | null;
  fileUrl: string | null;
  createdAt: string;
  test: { name: string; nameAr: string };
  reports?: { fileUrl: string }[];
}

export default function MedicalFileScreen({ navigation }: any) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results/my');
      setResults(res.data || []);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResults();
    }, [])
  );

  const readyResults = results.filter(r => {
    const s = r.status?.toUpperCase().trim();
    return s === 'READY' || s === 'COMPLETED';
  });
  
  const pendingResults = results.filter(r => {
    const s = r.status?.toUpperCase().trim();
    return s !== 'READY' && s !== 'COMPLETED';
  });

  const uniqueTestsCount = new Set(results.map(r => r.test?.nameAr || r.test?.name)).size;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleOpenReport = async (result: TestResult) => {
    const fileUrl = result.fileUrl || (result.reports && result.reports.length > 0 ? result.reports[0].fileUrl : null);
    if (fileUrl) {
      try {
        await Linking.openURL(fileUrl);
      } catch {
        Alert.alert('خطأ', 'تعذر فتح الملف.');
      }
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowBlue} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ChevronRight color="#ffffff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الملف الطبي</Text>
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
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResults(); }} tintColor="#ff4d4d" />
            }
          >
            {/* Stats Bento Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardLarge]}>
                <View style={styles.statIconBox}>
                  <FlaskConical color="#ff4d4d" size={28} />
                </View>
                <Text style={styles.statNumber}>{results.length}</Text>
                <Text style={styles.statLabel}>إجمالي الفحوصات</Text>
              </View>
              <View style={styles.statColumn}>
                <View style={styles.statCardSmall}>
                  <Text style={[styles.statNumberSmall, { color: '#10b981' }]}>{readyResults.length}</Text>
                  <Text style={styles.statLabelSmall}>جاهزة</Text>
                </View>
                <View style={styles.statCardSmall}>
                  <Text style={[styles.statNumberSmall, { color: '#38bdf8' }]}>{uniqueTestsCount}</Text>
                  <Text style={styles.statLabelSmall}>أنواع</Text>
                </View>
              </View>
            </View>

            {results.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FileText color="rgba(255,255,255,0.1)" size={80} />
                <Text style={styles.emptyTitle}>السجل الطبي فارغ</Text>
                <Text style={styles.emptySubtitle}>ستظهر سجلاتك الصحية هنا بعد الفحص</Text>
              </View>
            ) : (
              <View style={styles.contentSection}>
                {/* Ready Results Section */}
                {readyResults.length > 0 && (
                  <View style={styles.resultsGroup}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>النتائج الجاهزة</Text>
                      <View style={styles.sectionBadge}>
                        <Text style={styles.badgeText}>{readyResults.length}</Text>
                      </View>
                    </View>
                    
                    {readyResults.map(result => (
                      <TouchableOpacity
                        key={result.id}
                        style={styles.resultCard}
                        onPress={() => handleOpenReport(result)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.resultIconBox}>
                          <Download color="#10b981" size={20} />
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultName}>{result.test.nameAr || result.test.name}</Text>
                          <View style={styles.resultMeta}>
                            <Calendar color="#64748b" size={12} style={{ marginLeft: 4 }} />
                            <Text style={styles.resultDate}>{formatDate(result.createdAt)}</Text>
                          </View>
                        </View>
                        {result.value && (
                          <View style={styles.resultValueBox}>
                            <Text style={styles.resultValue}>{result.value}</Text>
                            <Text style={styles.resultUnit}>{result.unit || ''}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Pending Results Section */}
                {pendingResults.length > 0 && (
                  <View style={styles.resultsGroup}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>قيد المعالجة</Text>
                      <View style={[styles.sectionBadge, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                        <Text style={[styles.badgeText, { color: '#fbbf24' }]}>{pendingResults.length}</Text>
                      </View>
                    </View>
                    
                    {pendingResults.map(result => (
                      <View key={result.id} style={[styles.resultCard, { opacity: 0.7 }]}>
                        <View style={[styles.resultIconBox, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                          <Activity color="#fbbf24" size={20} />
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultName}>{result.test.nameAr || result.test.name}</Text>
                          <Text style={styles.resultDate}>{formatDate(result.createdAt)}</Text>
                        </View>
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>قيد التحليل</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
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
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    marginTop: 10,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statCardLarge: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statColumn: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  statNumberSmall: {
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: 'bold',
  },
  statLabelSmall: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  contentSection: {
    marginTop: 10,
  },
  resultsGroup: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginRight: 12,
  },
  sectionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultDate: {
    fontSize: 12,
    color: '#64748b',
  },
  resultValueBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  resultUnit: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  pendingText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
