// src/Components/Login.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword?: () => void; 
  onNavigateToPinLogin?: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister, onNavigateToForgotPassword, onNavigateToPinLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Mohon masukkan email dan password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      onLoginSuccess(response.access_token);
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* --- HERO / BRAND SECTION --- */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="wallet" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Genvori<Text style={styles.brandAccent}>.Pay</Text></Text>
            <Text style={styles.brandTagline}>Kelola keuanganmu, di mana saja.</Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>
            <Text style={styles.title}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>Masuk untuk melanjutkan.</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email..."
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password..."
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={onNavigateToForgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

             <TouchableOpacity 
               style={styles.primaryBtn} 
               onPress={handleLogin} 
               disabled={loading}
               activeOpacity={0.85}
             >
               {loading ? (
                 <ActivityIndicator color="#FFFFFF" />
               ) : (
                 <Text style={styles.primaryBtnText}>Masuk</Text>
               )}
             </TouchableOpacity>


             <View style={styles.footer}>
               <Text style={styles.footerText}>Belum punya akun? </Text>
               <TouchableOpacity onPress={onNavigateToRegister}>
                 <Text style={styles.footerLink}>Daftar di sini</Text>
               </TouchableOpacity>
             </View>
             <TouchableOpacity 
               style={[styles.primaryBtn, { backgroundColor: '#64748B', marginTop: 12 }]} 
               onPress={onNavigateToPinLogin}
             >
               <Text style={styles.primaryBtnText}>Masuk dengan PIN</Text>
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
    paddingBottom: 24,
  },

  // --- HERO SECTION ---
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
  },

  // --- FORM CARD ---
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
  },
  formGroup: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  primaryBtn: {
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
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- DIVIDER ---
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 12,
    fontWeight: '500',
  },

  // --- SOCIAL LOGIN ---
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  socialBtnText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  footerLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
});