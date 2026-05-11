import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

export const MapView = ({ children, style }: any) => (
  <View style={[style, styles.webMapPlaceholder]}>
    <MapPin color="#e33935" size={48} />
    <Text style={styles.webMapText}>الخريطة متوفرة على تطبيق الجوال</Text>
    <Text style={styles.webMapSubtext}>يمكنك تحديد الموقع بدقة من خلال هافتك</Text>
    {children}
  </View>
);

export const Marker = ({ coordinate }: any) => (
  <View style={styles.markerContainer}>
    <MapPin color="#e33935" size={24} />
  </View>
);

const styles = StyleSheet.create({
  webMapPlaceholder: {
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
  },
  webMapText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  webMapSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
