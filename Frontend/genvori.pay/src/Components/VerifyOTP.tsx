// src/Components/VerifyOTP.tsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';

interface VerifyOTPProps {
  onVerifySuccess: (token: string) => void;
  onNavigateBack?: () => void;
  email?: string;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOTP({ onVerifySuccess, onNavigateBack, email: propEmail }: VerifyOTPProps) {
  const [email] = useState(propEmail || 'reginarna67@gmail.com');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);


  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c: number) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    // Hanya izinkan angka
    const digit = text.replace(/[^0-9]/g, '');

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);
    setOtp(newOtp);

    // Auto-advance ke box berikutnya
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace kosong -> mundur ke box sebelumnya
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      Alert.alert("Error", "Kode OTP harus 6 digit");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp({ email, otp_code: otpCode });
      onVerifySuccess(response.access_token);
    } catch (error: any) {
      Alert.alert("Verifikasi Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    console.log("Resend OTP ke:", email);
    setCountdown(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* --- HERO SECTION --- */}
          <View style={styles.heroSection}>
            {onNavigateBack && (
              <TouchableOpacity style={styles.backBtn} onPress={onNavigateBack} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Verifikasi <Text style={styles.brandAccent}>Akun</Text></Text>
            <Text style={styles.brandTagline}>Satu langkah lagi menuju Genvori.Pay</Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>
            <View style={styles.emailRow}>
              <Ionicons name="mail" size={16} color="#4F46E5" />
              <Text style={styles.emailText}>
                Kode dikirim ke <Text style={styles.emailBold}>{email}</Text>
              </Text>
            </View>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    digit !== '' && styles.otpBoxFilled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>

             <TouchableOpacity
               style={[styles.primaryBtn, !isComplete && styles.primaryBtnDisabled]}
               onPress={handleVerify}
               disabled={!isComplete || loading}
               activeOpacity={0.85}
             >
               {loading ? (
                 <ActivityIndicator color="#FFFFFF" />
               ) : (
                 <>
                   <Text style={styles.primaryBtnText}>Verifikasi</Text>
                   <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                 </>
               )}
             </TouchableOpacity>


            <View style={styles.footer}>
              {countdown > 0 ? (
                <Text style={styles.footerText}>
                  Kirim ulang kode dalam <Text style={styles.countdownText}>{countdown}s</Text>
                </Text>
              ) : (
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Belum menerima kode? </Text>
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.footerLink}>Kirim Ulang</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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

  // --- HERO ---
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

  // --- FORM CARD ---
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

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
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
  otpBoxFilled: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  countdownText: {
    color: '#1E293B',
    fontWeight: 'bold',
  },
  footerLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
});