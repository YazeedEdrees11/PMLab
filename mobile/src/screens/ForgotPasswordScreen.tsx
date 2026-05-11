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
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Fingerprint } from 'lucide-react-native';
import api from '../api/client';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setIsLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذر إرسال رابط استعادة كلمة المرور');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glowBlue} />
      
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>استعادة الوصول</Text>
              <Text style={styles.subtitle}>أدخل بريدك الإلكتروني للحصول على رابط استعادة كلمة المرور</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              {!success ? (
                <>
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

                  {error && (
                    <View style={styles.errorContainer}>
                      <AlertCircle color="#ff4d4d" size={16} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
                    onPress={handleResetPassword} 
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <View style={styles.btnContent}>
                        <ArrowLeft color="#ffffff" size={20} />
                        <Text style={styles.btnText}>إرسال الرابط</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successCard}>
                  <CheckCircle2 color="#10b981" size={60} style={{ marginBottom: 16 }} />
                  <Text style={styles.successTitle}>تم الإرسال!</Text>
                  <Text style={styles.successSubtitle}>
                    تحقق من بريدك الإلكتروني للحصول على تعليمات إعادة التعيين.
                  </Text>
                </View>
              )}

              {/* Back to Login Link */}
              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>العودة لتسجيل الدخول</Text>
                </TouchableOpacity>
              </View>
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
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandContainer: {
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
  formContainer: {
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 30,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10b981',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerLink: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
