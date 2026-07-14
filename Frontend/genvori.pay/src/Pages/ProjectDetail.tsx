// src/Pages/ProjectDetail.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../services/api';

interface ProjectDetailProps {
  accessToken: string | null;
  projectId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function ProjectDetail({ accessToken, projectId, onBack, onEdit, onDelete }: ProjectDetailProps) {
  const queryClient = useQueryClient();
  const { data: projectResponse, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getById(accessToken!, projectId),
    enabled: !!accessToken && !!projectId && projectId !== '',
    staleTime: 0,
    gcTime: 0,
  });

  const { data: budgetResponse, isLoading: budgetLoading } = useQuery({
    queryKey: ['projectBudget', projectId],
    queryFn: () => projectApi.getBudget(accessToken!, projectId),
    enabled: !!accessToken && !!projectId && projectId !== '',
    staleTime: 0,
    gcTime: 0,
  });

  const project = projectResponse?.data || projectResponse;
  const budgetData = budgetResponse?.data || budgetResponse;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text>Project tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Project</Text>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Project</Text>
            <Text style={styles.infoValue}>{project.name}</Text>
          </View>
           <View style={styles.infoRow}>
             <Text style={styles.infoLabel}>Total Budget</Text>
             <Text style={styles.infoValue}>
               Rp {(project.budget || 0).toLocaleString('id-ID')}
             </Text>
           </View>
           <View style={styles.infoRow}>
             <Text style={styles.infoLabel}>Status</Text>
             <Text style={styles.infoValue}>
               {(project.status || 'unknown').toUpperCase()}
             </Text>
           </View>
        </View>

        <View style={styles.budgetSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={20} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Alokasi Budget</Text>
          </View>
          
          {budgetLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : budgetData && budgetData.length > 0 ? (
            <View style={styles.budgetList}>
              {budgetData.map((item: any, index: number) => (
                <View key={index} style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>{item.category || 'Lain-lain'}</Text>
                  <Text style={styles.budgetValue}>
                    Rp {(item.amount || 0).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noBudgetText}>Tidak ada data alokasi budget</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => {
            Alert.alert(
              "Hapus Project",
              "Apakah Anda yakin ingin menghapus project ini?",
              [
                { text: "Batal", style: "cancel" },
                { 
                  text: "Hapus", 
                  style: "destructive", 
                  onPress: async () => {
                    try {
                      await onDelete(projectId);
                      queryClient.invalidateQueries({ queryKey: ['projects'] });
                    } catch (e: any) {
                      Alert.alert("Error", e.message || "Gagal menghapus project");
                    }
                  } 
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.deleteText}>Hapus Project</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  budgetSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  noBudgetText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    marginTop: 20,
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
