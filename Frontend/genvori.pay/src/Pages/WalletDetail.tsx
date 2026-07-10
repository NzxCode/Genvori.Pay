import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../services/api';

interface WalletDetailProps {
  accessToken: string | null;
  walletId: string;
  onBack: () => void;
}

export default function WalletDetail({ accessToken, walletId, onBack }: WalletDetailProps) {
  // Fetch Wallet Detail
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['walletDetail', accessToken, walletId],
    queryFn: () => walletApi.getDetail(accessToken!, walletId),
    enabled: !!accessToken && !!walletId,
  });

  // Fetch Transactions
  const { data: transData, isLoading: transLoading } = useQuery({
    queryKey: ['walletTransactions', accessToken, walletId],
    queryFn: () => walletApi.getTransactions(accessToken!, walletId),
    enabled: !!accessToken && !!walletId,
  });

  const wallet = (Array.isArray(detailData) ? detailData[0] : (detailData as any)?.data) || detailData;
  
  // Ekstraksi transaksi yang lebih kuat
  const extractTransactions = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.transactions)) return data.transactions;
    if (data.data && Array.isArray(data.data.data)) return data.data.data;
    return [];
  };

  const transactions = extractTransactions(transData);

  useEffect(() => {
    console.log("[WalletDetail Debug] Wallet Data:", wallet);
    console.log("[WalletDetail Debug] Transactions Response:", transData);
    console.log("[WalletDetail Debug] Processed Transactions:", transactions);
  }, [wallet, transData, transactions]);

  if (detailLoading || transLoading) {
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
        <Text style={styles.headerTitle}>Detail Rekening</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet" size={32} color="#4F46E5" />
          <Text style={styles.cardTitle}>{wallet?.name || 'Wallet'}</Text>
        </View>
        <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
        <Text style={styles.balanceAmount}>Rp {Number(wallet?.balance || 0).toLocaleString('id-ID')}</Text>
        <Text style={styles.accountNumber}>{wallet?.account_number || '**** **** **** ****'}</Text>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada transaksi untuk rekening ini</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.transItem}>
            <View style={styles.transIcon}>
              <Ionicons 
                name={item.type === 'TOPUP' || item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                size={24} 
                color={item.type === 'TOPUP' || item.type === 'credit' ? '#10B981' : '#EF4444'} 
              />
            </View>
            <View style={styles.transDetails}>
              <Text style={styles.transTitle}>{item.description || 'Transaksi'}</Text>
              <Text style={styles.transDate}>{item.created_at || '-'}</Text>
            </View>
            <Text style={[styles.transAmount, { color: item.type === 'TOPUP' || item.type === 'credit' ? '#10B981' : '#EF444도' }]}>
              {item.type === 'TOPUP' || item.type === 'credit' ? '+' : '-'} Rp {Number(item.amount || 0).toLocaleString('id-ID')}
            </Text>

            </View>
          )}
        />
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  transItem: {
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
  transIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transDetails: {
    flex: 1,
  },
  transTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  transDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  transAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 14,
  },
});
