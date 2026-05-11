import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, FileText, HelpCircle, LogOut, ChevronLeft, MapPin, Bell, ShieldCheck } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { GlassModal } from '../components/GlassModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const userName = user?.name || 'مستخدم';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      await api.post('/users/push-token', { pushToken });
    } catch (error) {
      console.log('Push notification registration failed:', error);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟')) await logout();
    } else {
      setShowLogoutModal(true);
    }
  };

  const menuItems = [
    { id: 1, title: 'المعلومات الشخصية', icon: <User color="#ff4d4d" size={20} />, route: 'EditProfile' },
    { id: 2, title: 'الملف الطبي', icon: <FileText color="#38bdf8" size={20} />, route: 'MedicalFile' },
    { id: 3, title: 'فروعنا', icon: <MapPin color="#fbbf24" size={20} />, route: 'Branches' },
    { id: 4, title: 'الإشعارات', icon: <Bell color="#10b981" size={20} />, route: 'Notifications' },
  ];

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowIndigo} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Futuristic Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{userInitial}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            
            <View style={styles.statusBadge}>
              <ShieldCheck color="#10b981" size={14} />
              <Text style={styles.statusText}>حساب موثق</Text>
            </View>
          </View>

          {/* Menu Items - Grid/Bento Style */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>الإعدادات والخدمات</Text>
            {menuItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.menuItem}
                onPress={() => item.route ? navigation.navigate(item.route) : null}
                activeOpacity={0.8}
              >
                <ChevronLeft color="rgba(255,255,255,0.2)" size={20} />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <View style={styles.menuIconBox}>
                    {item.icon}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut color="#ff4d4d" size={20} style={{ marginRight: 12 }} />
              <Text style={styles.logoutText}>تسجيل الخروج من النظام</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>PMLab Futuristic v2.0.4</Text>
          <View style={{ height: 100 }} />

        </ScrollView>

        <GlassModal
          visible={showLogoutModal}
          type="danger"
          title="تسجيل الخروج"
          message="هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟"
          confirmText="تسجيل الخروج"
          cancelText="إلغاء"
          onConfirm={async () => {
            setShowLogoutModal(false);
            await logout();
          }}
          onCancel={() => setShowLogoutModal(false)}
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
  glowIndigo: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarGlow: {
    width: 110,
    height: 110,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 16,
    textAlign: 'right',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 16,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerZone: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
  },
  logoutText: {
    color: '#ff4d4d',
    fontSize: 15,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#334155',
    marginTop: 30,
    letterSpacing: 2,
  },
});
