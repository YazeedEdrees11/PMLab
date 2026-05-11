import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, User, Phone, MapPin, Lock, Save, ShieldCheck } from 'lucide-react-native';
import api from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { GlassModal } from '../components/GlassModal';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuthStore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: any = 'info', onConfirm?: () => void) => {
    setModalConfig({ visible: true, title, message, type, onConfirm });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const patient = res.data?.patient;
      if (patient) {
        setName(patient.name || '');
        setPhone(patient.phone || '');
        setAddress(patient.address || '');
      }
    } catch (error) {
      showAlert('خطأ', 'تعذر جلب بيانات الملف الشخصي', 'danger');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert('تنبيه', 'يرجى إدخال الاسم', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, phone, address };
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await api.patch('/patients/my', payload);
      await updateUser({ name });
      showAlert('نجاح', 'تم تحديث البيانات بنجاح', 'success', () => navigation.goBack());
    } catch (error: any) {
      const msg = error.response?.data?.message || 'تعذر حفظ البيانات';
      showAlert('خطأ', msg, 'danger');
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>تعديل البيانات</Text>
        </View>

        {fetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#ff4d4d" />
          </View>
        ) : (
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            
            {/* Profile Avatar Glow */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarOrb}>
                <User color="#ffffff" size={40} />
              </View>
              <Text style={styles.avatarName}>{name}</Text>
              <View style={styles.badgeRow}>
                <ShieldCheck color="#10b981" size={14} />
                <Text style={styles.badgeText}>حساب موثق</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المعلومات العامة</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={name}
                    onChangeText={setName}
                    placeholder="الاسم بالكامل"
                    placeholderTextColor="#64748b"
                    textAlign="right"
                  />
                  <User color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="رقم الهاتف"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                  <Phone color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={address}
                    onChangeText={setAddress}
                    placeholder="العنوان (المدينة، الحي)"
                    placeholderTextColor="#64748b"
                    textAlign="right"
                  />
                  <MapPin color="#94a3b8" size={20} />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الأمان والخصوصية</Text>
              <Text style={styles.helperText}>املأ الحقول التالية فقط إذا كنت تود تغيير كلمة المرور</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="كلمة المرور الحالية"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    textAlign="right"
                  />
                  <Lock color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="كلمة المرور الجديدة"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    textAlign="right"
                  />
                  <Lock color="#94a3b8" size={20} />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Save color="#fff" size={20} />
                  <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        <GlassModal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          confirmText="حسناً"
          onConfirm={() => {
            setModalConfig({ ...modalConfig, visible: false });
            if (modalConfig.onConfirm) modalConfig.onConfirm();
          }}
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
    top: -100,
    right: -100,
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarOrb: {
    width: 90,
    height: 90,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    height: 64,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginRight: 12,
  },
  saveBtn: {
    backgroundColor: '#ff4d4d',
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 12,
  },
});
