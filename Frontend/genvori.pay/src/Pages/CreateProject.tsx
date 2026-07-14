import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authApi, projectApi } from '../services/api';

interface CreateProjectProps {
  accessToken: string | null;
  onBack: () => void;
}

// Helper for currency formatting
const formatCurrency = (value: string) => {
  if (!value) return '';
  const numberValue = value.replace(/\D/g, '');
  return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function CreateProject({ accessToken, onBack }: CreateProjectProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('active');

  // Fetch user profile to check role
  const { data: response, isLoading: userLoading } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => authApi.getProfile(accessToken!),
    enabled: !!accessToken,
  });

  const user = response?.data || response;

  // Mutation for creating project
  const mutation = useMutation({
    mutationFn: (token: string) => {
      const rawBudget = budget.replace(/\./g, '');
      return projectApi.create(token, { name, budget: Number(rawBudget), status });
    },
    onSuccess: () => {
      Alert.alert("Success", "Project berhasil dibuat!");
      onBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Gagal membuat project");
    },
  });

  if (userLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // RBAC Check: Only merchants can create projects
  if (user?.role !== 'merchant') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>Hanya merchant yang dapat mengelola project</Text>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCreateProject = () => {
    if (!accessToken) {
      Alert.alert("Error", "Sesi Anda telah berakhir. Silakan login kembali.");
      return;
    }
    if (!name || !budget) {
      Alert.alert("Error", "Mohon isi nama project dan budget.");
      return;
    }
    mutation.mutate(accessToken);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buat Project Baru</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Project</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Pembangunan Mall Genvori"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget (Rp)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={formatCurrency(budget)}
            onChangeText={(text) => setBudget(text.replace(/\D/g, ''))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {['active', 'pending', 'completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>
                  {s.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCreateProject}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Project</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  formContainer: {
    padding: 20,
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
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
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
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
