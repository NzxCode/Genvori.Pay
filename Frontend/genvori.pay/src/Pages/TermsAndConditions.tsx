import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export default function TermsAndConditions({ onBack }: TermsAndConditionsProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Syarat dan Ketentuan Penggunaan Genvori.Pay</Text>
        <Text style={styles.lastUpdated}>Terakhir diperbarui: 10 Juli 2026</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Penerimaan Ketentuan</Text>
          <Text style={styles.text}>
            Dengan menggunakan aplikasi Genvori.Pay, Anda setuju untuk terikat oleh syarat dan ketentuan ini serta semua hukum dan peraturan yang berlaku. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, mohon untuk tidak menggunakan layanan kami.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Akun Pengguna</Text>
          <Text style={styles.text}>
            Pengguna bertanggung jawab untuk menjaga kerahasiaan akun dan password mereka. Genvori.Pay tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian pengguna dalam menjaga keamanan kredensial akun.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Layanan Wallet & Pembayaran</Text>
          <Text style={styles.text}>
            Layanan Wallet disediakan untuk memudahkan transaksi keuangan digital. Genvori.Pay berhak menangguhkan atau membatalkan transaksi yang dicurigai sebagai tindakan pencucian uang atau aktivitas ilegal lainnya.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Keamanan PIN</Text>
          <Text style={styles.text}>
            PIN (Personal Identification Number) adalah kunci keamanan utama Anda. Pengguna sangat disarankan untuk tidak membagikan PIN kepada siapa pun, termasuk pihak yang mengaku sebagai staf Genvori.Pay.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Batasan Tanggung Jawab</Text>
          <Text style={styles.text}>
            Genvori.Pay berupaya memberikan layanan terbaik, namun tidak menjamin bahwa layanan akan selalu bebas dari gangguan teknis atau kesalahan. Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan aplikasi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Perubahan Ketentuan</Text>
          <Text style={styles.text}>
            Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diberitahukan melalui notifikasi aplikasi atau email. Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui ketentuan baru tersebut.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Tambahan: Import TouchableOpacity yang tertinggal
import { TouchableOpacity } from 'react-native';

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
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'justify',
  },
});
