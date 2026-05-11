import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  StatusBar,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, UserPlus, ShieldCheck, Zap, Activity } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View style={styles.glowRed} />
      <View style={styles.glowBlue} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Logo Section */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/LogoWhite.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Hero Content */}
          <View style={styles.heroSection}>
            <View style={styles.badgeContainer}>
              <Activity color="#ff4d4d" size={16} />
              <Text style={styles.badgeText}>مختبرك الذكي في جيبك</Text>
            </View>
            
            <Text style={styles.title}>
              الجيل الجديد من{'\n'}
              <Text style={styles.titleGradient}>الرعاية الصحية</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              استمتع بتجربة مخبرية متكاملة، نتائج فورية، وخدمات منزلية متميزة بكل سهولة وأمان.
            </Text>
          </View>

          {/* Features Grid - Quick View */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                <Zap color="#38bdf8" size={20} />
              </View>
              <Text style={styles.featureText}>نتائج فورية</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <ShieldCheck color="#10b981" size={20} />
              </View>
              <Text style={styles.featureText}>خصوصية تامة</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.9}
            >
              <View style={styles.btnContent}>
                <ArrowLeft color="#ffffff" size={22} />
                <Text style={styles.primaryBtnText}>ابدأ الآن</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <View style={styles.btnContent}>
                <UserPlus color="#ffffff" size={20} />
                <Text style={styles.secondaryBtnText}>إنشاء حساب جديد</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>PMLab Futuristic v2.0.4</Text>

        </ScrollView>
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
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
  },
  glowBlue: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: height - 100,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 20,
  },
  titleGradient: {
    color: '#ff4d4d',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContainer: {
    width: '100%',
    gap: 16,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#ff4d4d',
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  footerNote: {
    textAlign: 'center',
    color: '#334155',
    fontSize: 11,
    marginTop: 40,
    letterSpacing: 2,
  },
});
