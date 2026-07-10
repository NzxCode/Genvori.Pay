// src/Components/Transfer.tsx
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletApi } from '../services/api';

interface TransferProps {
    accessToken: string | null;
    onBack: () => void;
}

export default function Transfer({ accessToken, onBack }: TransferProps) {
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<{title: string, message: string} | null>(null);
    const [fetchingWallet, setFetchingWallet] = useState(true);

    const formatCurrency = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (text: string) => {
        setAmount(formatCurrency(text));
    };

    useEffect(() => {
        const fetchDefaultWallet = async () => {
            if (!accessToken) return;
            try {
                const wallets = await walletApi.getAll(accessToken);
                console.log('[Transfer] All wallets response:', wallets);
                const walletList = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];
                
                if (walletList.length > 0) {
                    const primaryWallet = walletList[0];
                    const primaryWalletId = primaryWallet.id;
                    
                    // Use the requested endpoint GET /wallets/:walletId
                    const detail = await walletApi.getDetail(accessToken, primaryWalletId);
                    console.log('[Transfer] Wallet detail response:', detail);
                    
                    const walletData = Array.isArray(detail) 
                        ? detail[0] 
                        : (detail as any)?.data || detail;

                    const accountNum = walletData?.account_number || primaryWallet?.account_number;
                    setFromAccount(accountNum || '');
                }
            } catch (error: any) {
                console.error("[Transfer] Failed to fetch wallet:", error);
            } finally {
                setFetchingWallet(false);
            }
        };

        fetchDefaultWallet();
    }, [accessToken]);

    const handleTransfer = async () => {
        if (!accessToken) {
            Alert.alert("Error", "Sesi berakhir, silakan login kembali.");
            return;
        }
        if (!fromAccount || !toAccount || !amount) {
            Alert.alert("Error", "Mohon isi semua bidang yang wajib.");
            return;
        }

        setLoading(true);
        try {
            const rawAmount = amount.replace(/\./g, '');
            await walletApi.transfer(accessToken, {
                fromAccountNumber: fromAccount,
                toAccountNumber: toAccount,
                amount: parseFloat(rawAmount),
                description: description,
            });
            setSuccess(true);
        } catch (error: any) {
            Alert.alert("Transfer Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Dana</Text>
                <View style={{ width: 24 }} />
            </View>

            {success ? (
                <View style={styles.successContainer}>
                    <View style={styles.successIconBg}>
                        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                    </View>
                    <Text style={styles.successTitle}>Transfer Berhasil!</Text>
                    <Text style={styles.successDesc}>
                        Dana telah berhasil dikirim ke rekening tujuan. Silahkan klik tombol di bawah untuk kembali.
                    </Text>
                    <TouchableOpacity style={styles.submitBtn} onPress={onBack}>
                        <Text style={styles.submitBtnText}>Kembali ke Beranda</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nomor Rekening Pengirim</Text>
                        <View style={[styles.inputContainer, fetchingWallet && { opacity: 0.6 }]}>
                            <Ionicons name="wallet-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Memuat rekening..."
                                keyboardType="numeric"
                                value={fromAccount}
                                onChangeText={setFromAccount}
                                editable={false}
                            />
                            {fetchingWallet && <ActivityIndicator size="small" color="#94A3B8" style={{ marginRight: 10 }} />}
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nomor Rekening Penerima</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contoh: 987654321098"
                                keyboardType="numeric"
                                value={toAccount}
                                onChangeText={setToAccount}
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Jumlah Transfer</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencyLabel}>Rp</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={handleAmountChange}
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Keterangan (Opsional)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Keterangan transfer..."
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleTransfer} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Kirim Sekarang</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            )}
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
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    backBtn: {
        padding: 4,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    currencyLabel: {
        fontSize: 16,
        color: '#64748B',
        marginRight: 8,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    submitBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        marginTop: 10,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    successIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    successDesc: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
});
