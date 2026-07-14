import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorHelper';

interface PinLoginProps {
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 3;

export default function PinLogin({ onLoginSuccess, onBack }: PinLoginProps) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const loadUserData = async () => {
      const savedEmail = await SecureStore.getItemAsync('saved_login_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      
      const attempts = await SecureStore.getItemAsync('pin_fail_attempts');
      if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
        setIsBlocked(true);
      }
    };
    loadUserData();
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    const newPin = [...pin];
    newPin[index] = digit.slice(-1);
    setPin(newPin);

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
    const pinCode = pin.join('');
    if (!email) {
      Alert.alert("Error", "Email tidak ditemukan. Silakan login melalui menu utama.");
      return;
    }
    if (pinCode.length < PIN_LENGTH) {
      Alert.alert("Error", "PIN harus 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.loginPin({ email, pin: pinCode });
      
      // Reset attempts on success
      await SecureStore.setItemAsync('pin_fail_attempts', '0');
      
      onLoginSuccess(response.access_token);
    } catch (error: any) {
      // Increment failed attempts
      const currentAttempts = await SecureStore.getItemAsync('pin_fail_attempts');
      const newAttempts = (parseInt(currentAttempts || '0') + 1);
      await SecureStore.setItemAsync('pin_fail_attempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        Alert.alert("Akun Terblokir", "Anda telah gagal memasukkan PIN sebanyak 3 kali. Akses PIN diblokir sementara.");
      } else {
        Alert.alert("Verifikasi Gagal", getFriendlyErrorMessage(error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const isComplete = pin.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- HERO SECTION --- */}
          <View style={styles.heroSection}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoBadge}>
              <Ionicons name={isBlocked ? "lock-closed" : "lock-open"} size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>{isBlocked ? 'Akses Terblokir' : 'Akses Cepat'}</Text>
            <Text style={styles.brandTagline}>
              {isBlocked 
                ? 'Terlalu banyak percobaan salah. Silakan hubungi dukungan atau gunakan email login.' 
                : 'Masukkan PIN Anda untuk masuk ke akun'}
            </Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>
            <View style={styles.emailRow}>
              <Ionicons name="person-outline" size={16} color="#4F46E5" />
              <Text style={styles.emailText}>
                Login sebagai <Text style={styles.emailBold}>{email || 'User'}</Text>
              </Text>
            </View>

            <View style={styles.pinRow}>
              {pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.pinBox,
                    digit !== '' && styles.pinBoxFilled,
                    isBlocked && styles.pinBoxDisabled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0 && !isBlocked}
                  selectTextOnFocus
                  editable={!isBlocked}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (!isComplete || isBlocked) && styles.primaryBtnDisabled]}
              onPress={handleLogin}
              disabled={!isComplete || loading || isBlocked}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>{isBlocked ? 'Terkunci' : 'Masuk Sekarang'}</Text>
                  {!isBlocked && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    backgroundColor: '#1E293B',
    paddingTop: 16,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandAccent: {
    color: '#818CF8',
  },
  brandTagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -28,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  emailText: {
    fontSize: 13,
    color: '#4338CA',
    marginLeft: 8,
    textAlign: 'center',
  },
  emailBold: {
    fontWeight: 'bold',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  pinBox: {
    width: 48,
    height: 58,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pinBoxFilled: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  pinBoxDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    color: '#94A3B8',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#C7D2FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
