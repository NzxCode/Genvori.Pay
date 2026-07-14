// src/Pages/ProjectList.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../services/api';

interface ProjectListProps {
  accessToken: string | null;
  onNavigate: (screen: string, params?: any) => void;
  onBack: () => void;
}

export default function ProjectList({ accessToken, onNavigate, onBack }: ProjectListProps) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', accessToken],
    queryFn: () => projectApi.getAll(accessToken!),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const projectData = projects?.data || projects || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Project</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={projectData}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada project yang dibuat</Text>
          </View>
        }
          renderItem={({ item }: any) => {
            const isDeleted = item.status === 'deleted';
            return (
              <TouchableOpacity 
                style={[styles.projectCard, isDeleted && { opacity: 0.7 }]} 
                onPress={() => onNavigate('projectdetail', { projectId: item.id })}
                disabled={isDeleted}
              >
                <View style={styles.cardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {isDeleted && <Ionicons name="lock-closed" size={14} color="#94A3B8" />}
                    <Text style={[styles.projectName, isDeleted && { color: '#94A3B8' }]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.projectBudget}>
                    {isDeleted ? 'Project telah dihapus' : `Rp ${item.budget.toLocaleString('id-ID')}`}
                  </Text>
                </View>
                <View style={[styles.statusBadge, isDeleted ? styles.deleted : styles[item.status]]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <Ionicons name={isDeleted ? "lock-closed" : "chevron-forward"} size={20} color="#CBD5E1" />
              </TouchableOpacity>
            );
          }}
      />
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  projectBudget: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  active: { backgroundColor: '#10B981' },
  pending: { backgroundColor: '#F59E0B' },
  completed: { backgroundColor: '#4F46E5' },
  deleted: { backgroundColor: '#94A3B8' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
});
