import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Bell, CheckCircle2, Clock, Inbox } from 'lucide-react-native';
import api from '../api/client';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/my');
      setNotifications(response.data);
      if (response.data.some((n: Notification) => !n.isRead)) {
        await api.patch('/notifications/mark-all-read');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-JO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Text style={styles.headerTitle}>الإشعارات</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#ff4d4d" />
          </View>
        ) : (
          <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff4d4d" />}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Inbox color="rgba(255, 255, 255, 0.1)" size={100} />
                <Text style={styles.emptyTitle}>صندوق الوارد فارغ</Text>
                <Text style={styles.emptySubtitle}>لم تستلم أي تحديثات حتى هذه اللحظة</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View 
                  key={notification.id} 
                  style={[styles.card, !notification.isRead && styles.unreadCard]}
                >
                  <View style={[styles.iconContainer, !notification.isRead && styles.unreadIcon]}>
                    <Bell color={!notification.isRead ? "#ff4d4d" : "#38bdf8"} size={22} />
                  </View>
                  <View style={styles.content}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>تحديث النظام</Text>
                      <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
                    </View>
                    <Text style={styles.message}>{notification.message}</Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 22,
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
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 20,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  unreadIcon: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
  },
  content: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  time: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'right',
    lineHeight: 22,
  },
});
