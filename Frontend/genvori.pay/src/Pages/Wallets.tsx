import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../services/api';

interface WalletsProps {
  accessToken: string | null;
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export default function Wallets({ accessToken, onBack, onNavigate }: WalletsProps) {
  const queryClient = useQueryClient();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');

  const { data: walletsData, isLoading, refetch } = useQuery({
    queryKey: ['wallets', accessToken],
    queryFn: () => walletApi.getAll(accessToken!),
    enabled: !!accessToken,
  });

  const wallets = Array.isArray(walletsData) ? walletsData : (walletsData as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: () => walletApi.create(accessToken!, { name: newWalletName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setModalVisible(false);
      setNewWalletName('');
      Alert.alert("Success", "Rekening baru berhasil dibuat!");
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Gagal membuat rekening");
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
        <Text style={styles.headerTitle}>Rekening Tersimpan</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada rekening tersimpan</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.walletCard} 
            onPress={() => onNavigate('walletdetail', { walletId: item.id })}
          >
            <View style={styles.walletInfo}>
              <View style={styles.iconBox}>
                <Ionicons name="wallet" size={24} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.walletName}>{item.name}</Text>
                <Text style={styles.walletNumber}>{item.account_number}</Text>
              </View>
            </View>
                <View style={styles.balanceBox}>
                  <Text style={styles.balanceAmount}>Rp {Number(item.balance || 0).toLocaleString('id-ID')}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>

          </TouchableOpacity>
        )}
      />

      {/* Create Wallet Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rekening Baru</Text>
            <Text style={styles.modalSubtitle}>Beri nama untuk rekening Anda (misal: Tabungan, Operasional)</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nama Rekening..."
              value={newWalletName}
              onChangeText={setNewWalletName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending || !newWalletName}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F46E515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  walletNumber: {
    fontSize: 13,
    color: '#64748B',
  },
  balanceBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
