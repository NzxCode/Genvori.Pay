// src/Components/ForgotPassword.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import { getFriendlyErrorMessage } from '../utils/errorHelper';


interface ForgotPasswordProps {
  onNavigateBack: () => void;
  onSubmitSuccess: (email: string) => void;
}

export default function ForgotPassword({ onNavigateBack, onSubmitSuccess }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!isValidEmail) {
      Alert.alert("Email tidak valid", "Masukkan alamat email yang benar.");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      Alert.alert("Berhasil", "Kode verifikasi telah dikirim ke email Anda.");
      onSubmitSuccess(email);
    } catch (error: any) {
      Alert.alert("Gagal", getFriendlyErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* --- HERO SECTION --- */}
          <View style={styles.heroSection}>
            <TouchableOpacity style={styles.backBtn} onPress={onNavigateBack} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Ionicons name="key" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Lupa <Text style={styles.brandAccent}>Password?</Text></Text>
            <Text style={styles.brandTagline}>Tenang, kami bantu kamu mengaturnya kembali.</Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Masukkan email akunmu. Kami akan mengirimkan kode verifikasi untuk mengatur ulang password.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email terdaftar..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  autoFocus
                />
                {email.length > 0 && (
                  <Ionicons
                    name={isValidEmail ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isValidEmail ? "#10B981" : "#EF4444"}
                  />
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !isValidEmail && styles.primaryBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValidEmail || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
              </Text>
              {!loading && (
                <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color="#4F46E5" />
              <Text style={styles.infoText}>
                Pastikan kamu memiliki akses ke email tersebut untuk menerima kode OTP.
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ingat password? </Text>
              <TouchableOpacity onPress={onNavigateBack}>
                <Text style={styles.footerLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E293B' },
  scrollContent: { flexGrow: 1, backgroundColor: '#F8FAFC', paddingBottom: 24 },

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
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  brandAccent: { color: '#818CF8' },
  brandTagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -28,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 28 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1E293B' },

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
  primaryBtnDisabled: { backgroundColor: '#C7D2FE', shadowOpacity: 0, elevation: 0 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, color: '#4338CA', lineHeight: 18 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#4F46E5', fontSize: 14, fontWeight: 'bold' },
});