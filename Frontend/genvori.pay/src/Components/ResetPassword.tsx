// src/Components/ResetPassword.tsx
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
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

interface ResetPasswordProps {
  accessToken: string;
  onResetSuccess: () => void;
}

export default function ResetPassword({ accessToken, onResetSuccess }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
  }, [password]);

  const strengthLabel = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'][strength];

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isValid = password.length >= 8 && passwordsMatch;

  const handleReset = async () => {
    if (password.length < 8) {
      Alert.alert("Password Terlalu Pendek", "Password minimal 8 karakter.");
      return;
    }
    if (!passwordsMatch) {
      Alert.alert("Password Tidak Cocok", "Konfirmasi password harus sama dengan password baru.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token: accessToken,
        newPassword: password,
      });
      Alert.alert("Berhasil", "Password Anda telah diperbarui.");
      onResetSuccess();
    } catch (error: any) {
      Alert.alert("Reset Gagal", error.message);
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
            <View style={styles.logoBadge}>
              <Ionicons name="lock-open" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Password <Text style={styles.brandAccent}>Baru</Text></Text>
            <Text style={styles.brandTagline}>Buat password baru yang kuat dan mudah kamu ingat.</Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password Baru</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* --- STRENGTH METER --- */}
              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBarRow}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i < strength ? strengthColor : '#E2E8F0' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi password baru"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <View style={styles.matchRow}>
                  <Ionicons
                    name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={passwordsMatch ? "#10B981" : "#EF4444"}
                  />
                  <Text style={[styles.matchText, { color: passwordsMatch ? "#10B981" : "#EF4444" }]}>
                    {passwordsMatch ? "Password cocok" : "Password tidak cocok"}
                  </Text>
                </View>
              )}
            </View>

            {/* --- CHECKLIST SYARAT --- */}
            <View style={styles.checklistBox}>
              <ChecklistItem label="Minimal 8 karakter" met={password.length >= 8} />
              <ChecklistItem label="Mengandung huruf besar" met={/[A-Z]/.test(password)} />
              <ChecklistItem label="Mengandung angka" met={/[0-9]/.test(password)} />
            </View>

             <TouchableOpacity
               style={[styles.primaryBtn, !isValid && styles.primaryBtnDisabled]}
               onPress={handleReset}
               disabled={!isValid || loading}
               activeOpacity={0.85}
             >
               {loading ? (
                 <ActivityIndicator color="#FFFFFF" />
               ) : (
                 <>
                   <Text style={styles.primaryBtnText}>
                     {loading ? "Menyimpan..." : "Simpan Password Baru"}
                   </Text>
                   {!loading && (
                     <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                   )}
                 </>
               )}
             </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ChecklistItem = ({ label, met }: { label: string; met: boolean }) => (
  <View style={styles.checklistItem}>
    <Ionicons
      name={met ? "checkmark-circle" : "ellipse-outline"}
      size={16}
      color={met ? "#10B981" : "#CBD5E1"}
    />
    <Text style={[styles.checklistText, met && styles.checklistTextMet]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E293B' },
  scrollContent: { flexGrow: 1, backgroundColor: '#F8FAFC', paddingBottom: 24 },

  heroSection: {
    backgroundColor: '#1E293B',
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  formGroup: { marginBottom: 20 },
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

  // Strength meter
  strengthWrap: { marginTop: 10 },
  strengthBarRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600' },

  // Match indicator
  matchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  matchText: { fontSize: 12, fontWeight: '500' },

  // Checklist
  checklistBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checklistText: { fontSize: 13, color: '#94A3B8' },
  checklistTextMet: { color: '#334155', fontWeight: '500' },

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
});