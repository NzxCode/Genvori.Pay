import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../services/api';

interface MoreProps {
  accessToken: string | null;
  onNavigate: (screen: string) => void;
}

export default function More({ accessToken, onNavigate }: MoreProps) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => authApi.getProfile(accessToken!),
    enabled: !!accessToken,
  });

  const user = response?.data || response;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // RBAC: Only merchants can access this page
  if (user?.role !== 'merchant') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#CBD5E1" />
          <Text style={styles.lockedTitle}>Akses Terbatas</Text>
          <Text style={styles.lockedText}>
            Halaman ini hanya dapat diakses oleh pengguna dengan role Merchant.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Merchant Tools</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.categorySection}>
          <View style={styles.gridContainer}>
            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => onNavigate('createproject')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#4F46E515' }]}>
                <Ionicons name="add-circle" size={26} color="#4F46E5" />
              </View>
              <Text style={styles.itemLabel}>Create Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="analytics" size={26} color="#10B981" />
              </View>
              <Text style={styles.itemLabel}>Project Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    padding: 30,
    textAlign: 'center',
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
  },
  lockedText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, 
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  }
});
