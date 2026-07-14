import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorHelper';
import * as SecureStore from 'expo-secure-store';


interface SetPinProps {
  accessToken: string | null;
  onBack: () => void;
}

export default function SetPin({ accessToken, onBack }: SetPinProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      await authApi.setPin(accessToken!, { pin });
      
      // Ambil email dari profile untuk disimpan di local storage
      const profile = await authApi.getProfile(accessToken!);
      const user = profile.data || profile;
      const email = user.email;
      
      if (email) {
        await SecureStore.setItemAsync('saved_login_email', email);
      }
      
      // Save PIN activation status using SecureStore
      await SecureStore.setItemAsync('pin_enabled', 'true');
    },
    onSuccess: () => {
      Alert.alert("Success", "PIN berhasil diaktifkan!");
      onBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", getFriendlyErrorMessage(error.message) || "Gagal mengatur PIN");
    },
  });



  const handleSetPin = () => {
    if (pin.length !== 6) {
      Alert.alert("Error", "PIN harus tepat 6 digit.");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("Error", "Konfirmasi PIN tidak cocok.");
      return;
    }
    mutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atur PIN Keamanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={48} color="#4F46E5" />
          <Text style={styles.infoTitle}>Aktifkan PIN Anda</Text>
          <Text style={styles.infoText}>
            Buat 6 digit PIN untuk mengamankan akun dan mempercepat login Anda di masa mendatang.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Buat PIN (6 Digit)</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            keyboardType="numeric"
            maxLength={6}
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Konfirmasi PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            keyboardType="numeric"
            maxLength={6}
            secureTextEntry
            value={confirmPin}
            onChangeText={setConfirmPin}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSetPin}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Aktifkan PIN</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  container: {
    padding: 20,
    gap: 24,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
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
