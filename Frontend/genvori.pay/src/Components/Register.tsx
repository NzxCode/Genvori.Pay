// src/Components/Register.tsx
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

interface RegisterProps {
  onNavigateToLogin: () => void;
  onNavigateToVerify: () => void;
}

export default function Register({ onNavigateToLogin, onNavigateToVerify }: RegisterProps) {
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !fullName || !email || !password) {
      Alert.alert("Error", "Mohon lengkapi semua data.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        name,
        full_name: fullName,
        email,
        gender,
        date_of_birth: dob,
        password,
        role,
      });
      Alert.alert("Berhasil", "Akun berhasil dibuat. Silakan verifikasi email Anda.");
      onNavigateToVerify();
    } catch (error: any) {
      Alert.alert("Registrasi Gagal", error.message);
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
            <TouchableOpacity style={styles.backBtn} onPress={onNavigateToLogin} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Ionicons name="person-add" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Buat Akun <Text style={styles.brandAccent}>Baru</Text></Text>
            <Text style={styles.brandTagline}>Gabung dengan Genvori.Pay dalam hitungan menit.</Text>
          </View>

          {/* --- FORM CARD --- */}
          <View style={styles.formCard}>

            {/* Section: Data Diri */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>DATA DIRI</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nama Panggilan</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="happy-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Cth: Karen"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Cth: Karen Steward"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Jenis Kelamin</Text>
              <View style={styles.pillRow}>
                <PillOption
                  icon="male"
                  label="Laki-laki"
                  active={gender === 'male'}
                  onPress={() => setGender('male')}
                />
                <PillOption
                  icon="female"
                  label="Perempuan"
                  active={gender === 'female'}
                  onPress={() => setGender('female')}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tanggal Lahir</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Section: Keamanan */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>KEAMANAN</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Buat password..."
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

            <View style={styles.divider} />

            {/* Section: Tipe Akun */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>TIPE AKUN</Text>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.roleCardRow}>
                <RoleCard
                  icon="person"
                  title="Pengguna"
                  desc="Belanja & transfer"
                  active={role === 'user'}
                  onPress={() => setRole('user')}
                />
                <RoleCard
                  icon="storefront"
                  title="Pedagang"
                  desc="Terima pembayaran"
                  active={role === 'merchant'}
                  onPress={() => setRole('merchant')}
                />
              </View>
            </View>

             <TouchableOpacity 
               style={styles.primaryBtn} 
               onPress={handleRegister} 
               disabled={loading}
               activeOpacity={0.85}
             >
               {loading ? (
                 <ActivityIndicator color="#FFFFFF" />
               ) : (
                 <>
                   <Text style={styles.primaryBtnText}>Daftar Sekarang</Text>
                   <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                 </>
               )}
             </TouchableOpacity>


            <View style={styles.footer}>
              <Text style={styles.footerText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.footerLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Sub-components ---

const PillOption = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.pillBtn, active && styles.pillBtnActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Ionicons name={icon} size={18} color={active ? '#FFFFFF' : '#64748B'} />
    <Text style={[styles.pillBtnText, active && styles.pillBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const RoleCard = ({ icon, title, desc, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.roleCard, active && styles.roleCardActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
      <Ionicons name={icon} size={22} color={active ? '#FFFFFF' : '#4F46E5'} />
    </View>
    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>{title}</Text>
    <Text style={[styles.roleDesc, active && styles.roleDescActive]}>{desc}</Text>
    {active && (
      <View style={styles.roleCheck}>
        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },

  // --- HERO ---
  heroSection: {
    backgroundColor: '#1E293B',
    paddingTop: 16,
    paddingBottom: 44,
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
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandAccent: {
    color: '#818CF8',
  },
  brandTagline: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },

  // --- FORM CARD ---
  formCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -28,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  formGroup: { marginBottom: 16 },
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

  // Gender pills
  pillRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 4,
  },
  pillBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  pillBtnText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
  },

  // Role cards
  roleCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginRight: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  roleCardActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  roleDescActive: {
    color: '#E0E7FF',
  },
  roleCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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