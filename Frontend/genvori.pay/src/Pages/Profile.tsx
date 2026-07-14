// src/Pages/Profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../services/api';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

interface ProfileProps {
  accessToken: string | null;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export default function Profile({ accessToken, onLogout, onNavigate }: ProfileProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => authApi.getProfile(accessToken!),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (user) {
      setPinEnabled(user.pin_enabled === true || user.pin_enabled === 'true');
    }
  }, [user]);

  // Handle wrapped data: jika API mengembalikan { data: { ... } }, ambil bagian datanya
  const user = response?.data || response;

  useEffect(() => {
    if (user) {
      console.log("[Profile Debug] User Data:", user);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert("Success", "Profil berhasil diperbarui");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Gagal memperbarui profil");
    },
  });

  const handleLogout = async () => {
    if (!accessToken) {
      Alert.alert("Error", "Token tidak ditemukan.");
      return;
    }

    setLoggingOut(true);
    try {
      await authApi.logout(accessToken);
      onLogout();
    } catch (error: any) {
      Alert.alert("Logout Gagal", error.message);
    } finally {
      setLoggingOut(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Izin akses galeri diperlukan untuk mengubah foto.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      updateMutation.mutate({ avatar: imageUri });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Memuat Profil...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{(error as any).message || "Gagal memuat profil."}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- PROFILE HEADER --- */}
          <View style={styles.profileHeader}>
            <View style={styles.imageContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#64748B" />
              </View>
            </View>
            <Text style={styles.profileName}>{user?.name || user?.full_name || 'User'}</Text>
            <Text style={styles.profilePhone}>{user?.email || 'Tidak ada email'}</Text>
            <View style={styles.badgeTier}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.badgeText}>{user?.role || 'Member'}</Text>
            </View>
          </View>
  
          {/* --- MENU OPTIONS --- */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Akun</Text>
            <MenuOption 
              icon="wallet-outline" 
              title="Rekening Tersimpan" 
              color="#10B981" 
              onPress={() => onNavigate('wallets')} 
            />
            <MenuOption 
              icon={pinEnabled ? "lock-closed" : "shield-checkmark-outline"} 
              title="Set New PIN" 
              color={pinEnabled ? "#64748B" : "#F59E0B"} 
              onPress={() => !pinEnabled && onNavigate('setpin')} 
              disabled={pinEnabled}
            />
          </View>
  
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Lainnya</Text>
            <MenuOption 
              icon="document-text-outline" 
              title="Syarat & Ketentuan" 
              color="#64748B" 
              onPress={() => onNavigate('terms')} 
            />
          </View>
  
          {/* --- LOGOUT BUTTON --- */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout} 
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text style={styles.logoutText}>Keluar</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const MenuOption = ({ icon, title, color, onPress, disabled }: { icon: any, title: string, color: string, onPress?: () => void, disabled?: boolean }) => (
  <TouchableOpacity 
    style={[styles.menuItem, disabled && { opacity: 0.6 }]} 
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.menuTitle, disabled && { color: '#94A3B8' }]}>{title}</Text>
    {disabled ? (
      <Ionicons name="lock-closed" size={18} color="#CBD5E1" />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F8FAFC',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  badgeTier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
