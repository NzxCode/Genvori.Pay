import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletApi, authApi } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { useQuery } from '@tanstack/react-query';

interface HomeProps {
  accessToken: string | null;
  onNavigate: (screen: string) => void;
}

export default function Home({ accessToken, onNavigate }: HomeProps) {
  const { updateLocation, updating } = useLocation(accessToken);

  // Fetch Profile for Greeting
  const { data: response } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => authApi.getProfile(accessToken!),
    enabled: !!accessToken,
  });

  const user = response?.data || response;

  // Optimized fetching using React Query
  const { 
    data: walletsData = [], 
    isLoading: walletsLoading, 
    refetch: refetchWallets 
  } = useQuery({
    queryKey: ['wallets', accessToken],
    queryFn: () => walletApi.getAll(accessToken!),
    enabled: !!accessToken,
  });

  const wallets = Array.isArray(walletsData) ? walletsData : (walletsData as any)?.data || [];
  
  const extractTransactions = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.transactions)) return data.transactions;
    if (data.data && Array.isArray(data.data.data)) return data.data.data;
    return [];
  };

  const { 
    data: historyRaw, 
    isLoading: historyLoading, 
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ['history', accessToken, wallets[0]?.id],
    queryFn: () => walletApi.getTransactions(accessToken!, wallets[0]?.id),
    enabled: !!accessToken && !!wallets[0]?.id,
  });

  const history = extractTransactions(historyRaw);
  
  const loading = walletsLoading || historyLoading;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchWallets(), refetchHistory()]);
    setRefreshing(false);
  };

  const totalBalance = wallets.reduce((sum: number, wallet: any) => sum + Number(wallet?.balance || 0), 0);
  const mainWallet = wallets[0] || { name: 'No Wallet', account_number: '**** **** **** ****' };

  if (loading && !wallets.length && !history.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  console.log("Isi history yang diterima:", history);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* --- HEADER SECTION --- */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#64748B" />
              </View>
              <View>
                <Text style={styles.greeting}>Hello, {user?.name || user?.full_name || 'User'}</Text>
                <Text style={styles.subtitle}>Welcome back!</Text>
              </View>
            </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => onNavigate('notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* --- CARD / REKENING SECTION --- */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{mainWallet.name || 'Wallet'}</Text>
            <Ionicons name="wallet" size={24} color="#FFFFFF" opacity={0.8} />
          </View>

          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>Rp {totalBalance.toLocaleString('id-ID')}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>{mainWallet.account_number || '**** **** **** ****'}</Text>
            <Text style={styles.cardBrand}>GEN-Pay</Text>
          </View>
        </View>

        {/* --- QUICK ACTIONS SECTION --- */}
        <View style={styles.actionRow}>
          <ActionBtn
            icon="add-circle"
            label="Top Up"
            color="#4F46E5"
            onPress={() => onNavigate('topup')}
          />
          <ActionBtn
            icon="paper-plane"
            label="Transfer"
            color="#10B981"
            onPress={() => onNavigate('transfer')}
          />
          <ActionBtn 
            icon="location" 
            label="Location" 
            color="#F59E0B" 
            onPress={async () => {
                try {
                    await updateLocation();
                    Alert.alert("Success", "Lokasi berhasil diperbarui");
                } catch (e: any) {
                    Alert.alert("Error", e.message || "Gagal memperbarui lokasi");
                }
            }}
          />
          <ActionBtn icon="grid" label="More" color="#6B7280" />
        </View>

        {/* --- RECENT ACTIVITY SECTION --- */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Gunakan variabel penampung untuk memastikan data adalah array */}
          {Array.isArray(history) && history.length > 0 ? (
            history.map((item: any, index: number) => (
              <TransactionItem
                key={index}
                icon="cash"
                title={item?.description || 'Transaction'}
                category={item?.type || 'Payment'}
                amount={`Rp ${item?.amount?.toLocaleString('id-ID') || '0'}`}
                isIncome={item?.type === 'TOPUP' || item?.type === 'INCOME'}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity found.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}


const ActionBtn = ({ icon, label, color, onPress }: { icon: any, label: string, color: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const TransactionItem = ({ icon, title, category, amount, isIncome }: any) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons name={icon} size={24} color="#4B5563" />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionTitle}>{title}</Text>
      <Text style={styles.transactionCategory}>{category}</Text>
    </View>
    <Text style={[styles.transactionAmount, { color: isIncome ? '#10B981' : '#EF4444' }]}>
      {amount}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNumber: {
    color: '#94A3B8',
    fontSize: 16,
    letterSpacing: 2,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionBtn: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activitySection: {
    flex: 1,
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
  seeAll: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  transactionItem: {
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
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 13,
    color: '#64748B',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});