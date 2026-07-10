import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletApi, projectApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';

interface SearchProps {
  accessToken: string | null;
}

export default function Search({ accessToken }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch History
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['searchHistory', accessToken],
    queryFn: () => walletApi.getHistory(accessToken!),
    enabled: !!accessToken,
  });

  const extractTransactions = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.transactions)) return data.transactions;
    if (data.data && Array.isArray(data.data.data)) return data.data.data;
    return [];
  };

  // Fetch Projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['allProjects', accessToken],
    queryFn: () => projectApi.getAll(accessToken!),
    enabled: !!accessToken,
  });

  const history = extractTransactions(historyData);



  const projects = Array.isArray(projectsData) 
    ? projectsData 
    : (Array.isArray((projectsData as any)?.data) ? (projectsData as any).data : []);

  const filteredHistory = history.filter((item: any) =>
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((proj: any) =>
    proj.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loading = historyLoading || projectsLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- SEARCH HEADER --- */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari riwayat atau project..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {(loading && history.length === 0 && projects.length === 0) ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <>
            {/* --- PROJECT SECTION --- */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Project Tersedia</Text>
              </View>

              {filteredProjects.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>untuk saat ini tidak ada project yang dijual</Text>
                </View>
              ) : (
                <View style={styles.projectContainer}>
                  {filteredProjects.map((proj: any, index: number) => (
                    <TouchableOpacity key={index} style={styles.projectItem}>
                      <View style={styles.projectIcon}>
                        <Ionicons name="business-outline" size={24} color="#4F46E5" />
                      </View>
                      <View style={styles.projectDetails}>
                        <Text style={styles.projectTitle}>{proj.name}</Text>
                        <Text style={styles.projectBudget}>Budget: Rp {proj.budget?.toLocaleString('id-ID') || '0'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* --- RIWAYAT TRANSAKSI --- */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
              </View>

              {filteredHistory.length === 0 ? (
                <Text style={styles.emptyText}>Tidak ada transaksi ditemukan.</Text>
              ) : (
                <View style={styles.historyContainer}>
                  {filteredHistory.map((item: any, index: number) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <Ionicons
                          name={item.type === 'TOPUP' ? 'arrow-down-circle' : 'arrow-forward-circle'}
                          size={24}
                          color={item.type === 'TOPUP' ? '#10B981' : '#4F46E5'}
                        />
                      </View>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historyTitle}>{item.description || 'Transaksi'}</Text>
                        <Text style={styles.historyType}>{item.type || 'Payment'}</Text>
                      </View>
                      <Text style={[styles.historyAmount, { color: item.type === 'TOPUP' ? '#10B981' : '#EF4444' }]}>
                        Rp {item.amount?.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  projectContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4F46E515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectDetails: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  projectBudget: {
    fontSize: 13,
    color: '#64748B',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  historyType: {
    fontSize: 12,
    color: '#64748B',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
