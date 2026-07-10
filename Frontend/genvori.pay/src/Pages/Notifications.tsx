import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  is_read: boolean;
}

interface NotificationsProps {
  accessToken: string | null;
}

export default function Notifications({ accessToken }: NotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!accessToken) {
      setError("Token tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      const data = await notificationApi.getNotifications(accessToken, 1, 20, false);
      setNotifications(Array.isArray(data) ? data : (data?.data || []));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Gagal memuat notifikasi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [accessToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    if (!accessToken) return;
    try {
      await notificationApi.markAsRead(accessToken, id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err: any) {
      console.error("Failed to mark as read:", err.message);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchNotifications}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Tandai dibaca</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        }
          renderItem={({ item }) => {
            const iconName = item.icon || 'notifications';
            const iconColor = item.color || '#4F46E5';
            const displayTime = item.time || 'Baru saja';
            
            const getFallbackDescription = () => {
              const title = (item.title || '').toLowerCase();
              if (title.includes('top up')) return 'Top Up anda berhasil';
              if (title.includes('transfer')) return 'Transfer dana berhasil';
              return '';
            };

            const description = item.description || getFallbackDescription();
            
            return (
              <TouchableOpacity 
                style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
                onPress={() => handleMarkAsRead(item.id)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: (iconColor || '#4F46E5') + '15' }]}>
                    <Ionicons name={iconName as any} size={22} color={iconColor} />
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                
                <View style={styles.notifContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{item.title || 'Notifikasi'}</Text>
                    <Text style={styles.notifTime}>{displayTime}</Text>
                  </View>
                  {description ? (
                    <Text style={styles.notifDesc} numberOfLines={2}>{description}</Text>
                  ) : null}
                </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  markAllRead: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFF',
    borderColor: '#E0E7FF',
  },
  cardLeft: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  notifDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    position: 'absolute',
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 2,
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
});
