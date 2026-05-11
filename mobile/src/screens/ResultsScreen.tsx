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
  Share,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Download, Activity, FileText, AlertCircle, Eye, ChevronRight } from 'lucide-react-native';
import api from '../api/client';
import { GlassModal } from '../components/GlassModal';

interface TestResult {
  id: string;
  status: string;
  fileUrl: string | null;
  value: string | null;
  unit: string | null;
  notes: string | null;
  createdAt: string;
  test: {
    id: string;
    name: string;
    nameAr: string;
    category: string | null;
  };
  reports?: { id: string; fileUrl: string }[];
}

export default function ResultsScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchResults = async () => {
    try {
      setError(null);
      const response = await api.get('/results/my');
      setResults(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.');
      } else {
        setError('تعذر تحميل النتائج. تحقق من اتصالك بالإنترنت.');
      }
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResults();
  }, []);

  const getStatusInfo = (status: string) => {
    const s = status?.toUpperCase().trim();
    switch (s) {
      case 'READY':
      case 'COMPLETED':
        return { label: 'جاهزة', color: '#10b981' };
      case 'PENDING':
        return { label: 'قيد الفحص', color: '#f59e0b' };
      case 'IN_PROGRESS':
        return { label: 'قيد التحليل', color: '#38bdf8' };
      default:
        return { label: status, color: '#94a3b8' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleOpenReport = async (result: TestResult) => {
    const s = result.status?.toUpperCase().trim();
    if (s !== 'COMPLETED' && s !== 'READY') {
      showAlert('تنبيه', 'النتيجة لم تجهز بعد. يرجى الانتظار.', 'warning');
      return;
    }
    const fileUrl = result.fileUrl || (result.reports && result.reports.length > 0 ? result.reports[0].fileUrl : null);
    if (fileUrl) {
      try {
        const supported = await Linking.canOpenURL(fileUrl);
        if (supported) {
          await Linking.openURL(fileUrl);
        } else {
          showAlert('خطأ', 'جهازك لا يدعم فتح هذا الرابط.', 'danger');
        }
      } catch (err) {
        showAlert('خطأ', 'حدث مشكلة أثناء فتح الملف.', 'danger');
      }
    } else {
      showAlert('عذراً', 'لم يتم إرفاق ملف PDF لهذه النتيجة بعد.', 'info');
    }
  };

  const handleDownloadReport = async (result: TestResult) => {
    const s = result.status?.toUpperCase().trim();
    if (s !== 'COMPLETED' && s !== 'READY') return;
    const fileUrl = result.fileUrl || (result.reports && result.reports.length > 0 ? result.reports[0].fileUrl : null);
    if (fileUrl) {
      try {
        const downloadUrl = fileUrl.includes('?') ? `${fileUrl}&download=` : `${fileUrl}?download=`;
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
          await Linking.openURL(downloadUrl);
        } else {
          await Share.share({
            url: fileUrl,
            message: `تحميل نتيجة فحص: ${result.test.nameAr || result.test.name}`,
          });
        }
      } catch (err) {
        showAlert('خطأ', 'تعذر تنفيذ عملية التحميل.', 'danger');
      }
    }
  };

  const groupedResults = results.reduce((groups: Record<string, TestResult[]>, result) => {
    const date = new Date(result.createdAt);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(result);
    return groups;
  }, {});

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowRed} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>نتائج الفحوصات</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4d4d" />
            <Text style={styles.loadingText}>جارِ جلب النتائج...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff4d4d" />
            }
          >
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle color="#ff4d4d" size={18} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!error && results.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <FileText color="rgba(255, 255, 255, 0.2)" size={60} />
                </View>
                <Text style={styles.emptyTitle}>لا توجد نتائج بعد</Text>
                <Text style={styles.emptySubtitle}>ستظهر نتائج فحوصاتك هنا فور جاهزيتها</Text>
              </View>
            )}

            {Object.entries(groupedResults).map(([month, monthResults]) => (
              <View key={month} style={styles.monthSection}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthLabel}>{month}</Text>
                  <View style={styles.monthLine} />
                </View>
                
                {monthResults.map((result) => {
                  const statusInfo = getStatusInfo(result.status);
                  const isReady = result.status?.toUpperCase().trim() === 'COMPLETED' || result.status?.toUpperCase().trim() === 'READY';
                  
                  return (
                    <TouchableOpacity 
                      key={result.id} 
                      style={styles.resultCard}
                      onPress={() => isReady && handleOpenReport(result)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
                        <View style={styles.testMainInfo}>
                          <Text style={styles.testName}>{result.test.nameAr || result.test.name}</Text>
                          <Text style={styles.testDate}>{formatDate(result.createdAt)}</Text>
                        </View>
                        <View style={styles.categoryIcon}>
                          <Activity color="#94a3b8" size={20} />
                        </View>
                      </View>

                      {result.value && (
                        <View style={styles.valueRow}>
                          <Text style={styles.valueText}>
                            {result.value} <Text style={styles.unitText}>{result.unit || ''}</Text>
                          </Text>
                          <Text style={styles.valueLabel}>القيمة المقاسة:</Text>
                        </View>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.statusGroup}>
                          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                        </View>
                        
                        {isReady && (
                          <View style={styles.actionLinks}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDownloadReport(result)}>
                              <Download color="#ffffff" size={18} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleOpenReport(result)}>
                              <Eye color="#ffffff" size={18} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

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
  glowRed: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    marginTop: 40,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  monthSection: {
    marginBottom: 32,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginLeft: 12,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  testMainInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  testName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    color: '#64748b',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  unitText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#94a3b8',
  },
  valueLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
  actionLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
