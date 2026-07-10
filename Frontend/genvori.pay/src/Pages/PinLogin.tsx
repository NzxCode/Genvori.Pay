import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../services/api';

interface PinLoginProps {
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export default function PinLogin({ onLoginSuccess, onBack }: PinLoginProps) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pin) {
      Alert.alert("Error", "Mohon masukkan email dan PIN.");
      return;
    }
    if (pin.length !== 6) {
      Alert.alert("Error", "PIN harus 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.loginPin({ email, pin });
      onLoginSuccess(response.access_token);
    } catch (error: any) {
      Alert.alert("Login PIN Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="lock-closed" size={48} color="#4F46E5" />
          <Text style={styles.title}>Login dengan PIN</Text>
          <Text style={styles.subtitle}>Masukkan email dan PIN Anda untuk akses cepat</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="******"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Masuk Sekarang</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backBtn: {
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
