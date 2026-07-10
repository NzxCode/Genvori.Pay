// BottomTab.tsx
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  id: string;
  icon: IconName;
  activeIcon: IconName;
}

const TABS: TabItem[] = [
  { id: 'home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'search', icon: 'search-outline', activeIcon: 'search' },
  { id: 'add', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { id: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications' },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person' },
];

const TAB_WIDTH = (width - 32) / TABS.length;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface BottomTabProps {
  activeTab: string;
  onTabPress: (id: string) => void;
}

const BottomTab = ({ activeTab, onTabPress }: BottomTabProps) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const activeIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (activeIndex !== -1) {
      translateX.value = withSpring(activeIndex * TAB_WIDTH, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [activeTab, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  interface TabButtonProps {
    tab: TabItem;
    index: number;
  }

  const TabButton = ({ tab, index }: TabButtonProps) => {
    const isActive = tab.id === activeTab;
  
    const tabStyle = useAnimatedStyle(() => {
      const xPosition = index * TAB_WIDTH;
      const distance = Math.abs(translateX.value - xPosition);
  
      const scaleValue = interpolate(
        distance,
        [0, TAB_WIDTH],
        [1.2, 0.8],
        Extrapolation.CLAMP
      );
  
      const opacity = interpolate(
        distance,
        [0, TAB_WIDTH],
        [1, 0.5],
        Extrapolation.CLAMP
      );
  
      return {
        transform: [{ scale: scaleValue }],
        opacity,
      };
    });
  
    const handlePress = () => {
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      onTabPress(tab.id);
    };

    return (
      <AnimatedTouchable
        onPress={handlePress}
        style={[styles.tab, tabStyle]}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={24}
          // Ikon aktif berwarna biru tua, ikon tidak aktif berwarna abu-abu terang
          color={isActive ? '#1E293B' : '#94A3B8'}
          style={styles.icon as any} 
        />
      </AnimatedTouchable>
    );
  };

  return (
    <View style={styles.wrapper}>
      <BlurView
        style={styles.absolute}
        tint="light" // <-- Ubah menjadi light
        intensity={90} // <-- Tingkatkan intensitas blur agar tulisan di bawahnya tidak terlalu mengganggu
      />
      <View style={styles.container}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {TABS.map((tab, index) => (
          <TabButton
            key={tab.id}
            tab={tab}
            index={index}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 16,
    right: 16,
    height: 70, 
    borderRadius: 35, 
    overflow: 'hidden',
    // Penyesuaian shadow agar cocok dengan tema terang
    shadowColor: '#94A3B8', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fallback background putih semi-transparan
  },
  absolute: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  container: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)', // Border abu-abu sangat muda
    alignItems: 'center', 
  },
  indicator: {
    position: 'absolute',
    width: TAB_WIDTH - 16, 
    height: 48, 
    backgroundColor: '#F1F5F9', // Warna kotak indikator abu-abu super terang
    borderRadius: 24, 
    left: 8, 
    transform: [{ translateY: -24 }], 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', 
  },
  icon: {
    width: 28, height: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
  }
});

export default BottomTab;