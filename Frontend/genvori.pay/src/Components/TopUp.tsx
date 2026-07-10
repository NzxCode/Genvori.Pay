// src/Components/TopUp.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

interface TopUpProps {
    accessToken: string | null;
    onBack: () => void;
}

export default function TopUp({ accessToken, onBack }: TopUpProps) {
    const [walletName, setWalletName] = useState('cash');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<{title: string, message: string} | null>(null);

    const quickAmounts = ['50.000', '100.000', '200.000', '500.000', '1.000.000'];

    const formatCurrency = (value: string) => {
        // Hapus semua karakter kecuali angka
        const cleanValue = value.replace(/\D/g, '');
        // Format dengan titik sebagai pemisah ribuan
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (text: string) => {
        const formatted = formatCurrency(text);
        setAmount(formatted);
    };

    const handleTopUp = async () => {
        if (!accessToken) {
            setError({ title: "Error", message: "Sesi berakhir, silakan login kembali." });
            return;
        }
        if (!amount) {
            setError({ title: "Error", message: "Mohon masukkan jumlah top up." });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const rawAmount = amount.replace(/\./g, '');
            await walletApi.topUp(accessToken, {
                walletName: walletName,
                amount: parseFloat(rawAmount),
                description: description,
            });
            setSuccess(true);
        } catch (error: any) {
            setError({ title: "Top Up Gagal", message: error.message });
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
                <Text style={styles.headerTitle}>Top Up Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            {success ? (
                <View style={styles.successContainer}>
                    <View style={styles.successIconBg}>
                        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                    </View>
                    <Text style={styles.successTitle}>Top Up Berhasil!</Text>
                    <Text style={styles.successDesc}>
                        Top up anda telah berhasil, silahkan klik tombol di bawah untuk kembali.
                    </Text>
                    <TouchableOpacity style={styles.submitBtn} onPress={onBack}>
                        <Text style={styles.submitBtnText}>Kembali ke Beranda</Text>
                    </TouchableOpacity>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconBg}>
                        <Ionicons name="alert-circle" size={80} color="#EF4444" />
                    </View>
                    <Text style={styles.errorTitle}>{error.title}</Text>
                    <Text style={styles.errorDesc}>{error.message}</Text>
                    <TouchableOpacity style={styles.submitBtn} onPress={() => setError(null)}>
                        <Text style={styles.submitBtnText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Pilih Wallet</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="wallet-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="cash, savings, etc."
                                value={walletName}
                                onChangeText={setWalletName}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Jumlah Top Up</Text>
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
                        <View style={styles.quickAmountContainer}>
                            {quickAmounts.map((val) => (
                                <TouchableOpacity 
                                    key={val} 
                                    style={[styles.quickAmountBtn, amount === val && styles.quickAmountBtnActive]} 
                                    onPress={() => setAmount(val)}
                                >
                                    <Text style={[styles.quickAmountText, amount === val && styles.quickAmountTextActive]}>{val}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Keterangan (Opsional)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Keterangan top up..."
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleTopUp} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Top Up Sekarang</Text>
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
        marginTop: 10,
        padding: 12,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    errorIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorDesc: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    quickAmountContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
    },
    quickAmountBtn: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    quickAmountBtnActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    quickAmountText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    quickAmountTextActive: {
        color: '#FFF',
    },
});
