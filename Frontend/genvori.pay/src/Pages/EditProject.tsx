// src/Pages/EditProject.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, projectApi } from '../services/api';

interface EditProjectProps {
  accessToken: string | null;
  projectId: string;
  onBack: () => void;
}

const formatCurrency = (value: string) => {
  if (!value) return '';
  const numberValue = value.replace(/\D/g, '');
  return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default function EditProject({ accessToken, projectId, onBack }: EditProjectProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const queryClient = useQueryClient();

  const { data: projectResponse, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getById(accessToken!, projectId),
    enabled: !!accessToken && !!projectId,
  });

  useEffect(() => {
    if (projectResponse) {
      const project = projectResponse.data || projectResponse;
      setName(project.name || '');
      setBudget((project.budget || 0).toString());
    }
  }, [projectResponse]);

  const mutation = useMutation({
    mutationFn: () => {
      const rawBudget = budget.replace(/\./g, '');
      return projectApi.update(accessToken!, projectId, { 
        name, 
        budget: Number(rawBudget) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectBudget', projectId] });
      Alert.alert("Success", "Project berhasil diperbarui!");
      onBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Gagal memperbarui project");
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Project</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Project</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formatCurrency(budget)}
            onChangeText={(text) => setBudget(text.replace(/\D/g, ''))}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Perubahan</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
