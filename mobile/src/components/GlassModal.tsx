import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { AlertTriangle, Info, CheckCircle2, HelpCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface GlassModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

export const GlassModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'info'
}: GlassModalProps) => {
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 color="#10b981" size={32} />;
      case 'warning': return <AlertTriangle color="#fbbf24" size={32} />;
      case 'danger': return <AlertTriangle color="#ff4d4d" size={32} />;
      default: return <HelpCircle color="#38bdf8" size={32} />;
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(251, 191, 36, 0.1)';
      case 'danger': return 'rgba(255, 77, 77, 0.1)';
      default: return 'rgba(56, 189, 248, 0.1)';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.glassCard}>
          {/* Subtle Glow Background */}
          <View style={[styles.glow, { backgroundColor: getGlowColor() }]} />
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonContainer}>
              {onCancel && (
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.confirmBtn, 
                  type === 'danger' && styles.dangerBtn,
                  !onCancel && { flex: 1 }
                ]} 
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  glassCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  dangerBtn: {
    backgroundColor: '#ff4d4d',
    shadowColor: '#ff4d4d',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
