import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, AlertCircle, Fingerprint } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    clearError();
    await login(email.trim(), password, rememberMe);
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      
      {/* Abstract Background Elements */}
      <View style={styles.glowRed} />
      <View style={styles.glowIndigo} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          <View style={styles.content}>
            

            {/* Title Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.title}>تسجيل الدخول</Text>
              <Text style={styles.subtitle}>أهلاً بك في الجيل القادم من الخدمات المخبرية</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
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
                  <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
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
                  <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                </View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotBtn}
                >
                  <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
                </TouchableOpacity>
              </View>

              {/* Remember Me Toggle */}
              <View style={styles.rememberRow}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rememberText}>تذكرني</Text>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <View style={styles.checkboxInner} />}
                  </View>
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <AlertCircle color="#ff4d4d" size={16} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
                onPress={handleLogin} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={styles.btnContent}>
                    <ArrowLeft color="#ffffff" size={20} />
                    <Text style={styles.btnText}>دخول النظام</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>إنشاء حساب جديد</Text>
              </TouchableOpacity>
            </View>

          </View>
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
    top: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
  },
  glowIndigo: {
    position: 'absolute',
    bottom: 50,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
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
  inputIcon: {
    opacity: 0.7,
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  forgotText: {
    color: '#ff4d4d',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#94a3b8',
    fontSize: 14,
    marginRight: 10,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#ff4d4d',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#ff4d4d',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: '#ff4d4d',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 10,
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
    marginTop: 40,
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
