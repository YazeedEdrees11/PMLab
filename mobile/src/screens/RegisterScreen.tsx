import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Phone, FileText, ArrowLeft, AlertCircle, Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { register, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !nationalId || !phone || !email || !password) {
      setLocalError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setLocalError(null);
    clearError();
    await register({
      name: name.trim(),
      nationalId: nationalId.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password
    });
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowRed} />
      <View style={styles.glowBlue} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#ffffff" size={28} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            

            {/* Title Section */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>إنشاء حساب جديد</Text>
              <Text style={styles.subtitle}>كن جزءاً من منظومتنا الصحية المتطورة</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="الاسم الرباعي"
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                  />
                  <User color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="رقم الهوية / الإقامة"
                    placeholderTextColor="#64748b"
                    value={nationalId}
                    onChangeText={setNationalId}
                    keyboardType="number-pad"
                  />
                  <FileText color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="رقم الجوال"
                    placeholderTextColor="#64748b"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                  <Phone color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="البريد الإلكتروني"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Mail color="#94a3b8" size={20} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="كلمة المرور"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <Lock color="#94a3b8" size={20} />
                </View>
              </View>

              {/* Error Message */}
              {(localError || error) && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#ff4d4d" size={16} />
                  <Text style={styles.errorText}>{localError || error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
                onPress={handleRegister} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={styles.btnContent}>
                    <ArrowLeft color="#ffffff" size={20} />
                    <Text style={styles.btnText}>تأكيد الحساب</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>لديك حساب بالفعل؟ </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>سجل دخولك</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  brandRed: {
    color: '#ff4d4d',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 64,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'right',
    marginRight: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  submitBtn: {
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
    marginTop: 20,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  footerLink: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
