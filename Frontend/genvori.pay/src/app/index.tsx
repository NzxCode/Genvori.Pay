// src/app/index.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import BottomTab from '../Components/Bottom';
import TopUp from '../Components/TopUp';
import Transfer from '../Components/Transfer';
import CreateProject from '../Pages/CreateProject';
import Home from '../Pages/Home';
import More from '../Pages/More';
import Notifications from '../Pages/Notifications';
import Profile from '../Pages/Profile';
import Search from '../Pages/Search';
import TermsAndConditions from '../Pages/TermsAndConditions';
import SetPin from '../Pages/SetPin';
import PinLogin from '../Pages/PinLogin';
import Wallets from '../Pages/Wallets';
import WalletDetail from '../Pages/WalletDetail';

// Import komponen Auth dari folder Components
import ForgotPassword from '../Components/ForgotPassword';
import Login from '../Components/Login';
import Register from '../Components/Register';
import ResetPassword from '../Components/ResetPassword';
import VerifyOTP from '../Components/VerifyOTP';
import VerifyResetOTP from '../Components/VerifyResetOTP';

export default function MainScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'home' | 'search' | 'add' | 'notifications' | 'profile' | 'transfer' | 'topup' | 'createproject' | 'terms' | 'setpin' | 'pinlogin' | 'wallets' | 'walletdetail'>('home');

  // STATE BARU: Untuk melacak halaman Auth mana yang aktif
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'verify' | 'forgot-password' | 'verify-reset-otp' | 'reset-password'>('login');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetAccessToken, setResetAccessToken] = useState<string>('');

  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const pinEnabled = await SecureStore.getItemAsync('pin_enabled');
        if (pinEnabled === 'true') {
          setActiveScreen('pinlogin');
        }
      } catch (e) {
        console.error("[SecureStore Error] Gagal membaca status PIN:", e);
      }
    };
    checkPinStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // JIKA BELUM LOGIN: Render sistem navigasi Auth
  if (!accessToken) {
    if (activeScreen === 'pinlogin') {
      return (
        <PinLogin 
          onLoginSuccess={(token) => {
            setAccessToken(token);
            setActiveScreen('home');
          }} 
          onBack={() => {
            setActiveScreen('home'); // This is tricky since accessToken is null
            setAuthScreen('login');
          }} 
        />
      );
    }

    if (authScreen === 'login') {
      return (
        <Login
          onLoginSuccess={(token) => setAccessToken(token)}
          onNavigateToRegister={() => setAuthScreen('register')}
          onNavigateToForgotPassword={() => setAuthScreen('forgot-password')}
          onNavigateToPinLogin={() => setActiveScreen('pinlogin')}
        />
      );
    }

    if (authScreen === 'register') {
      return (
        <Register
          onNavigateToLogin={() => setAuthScreen('login')}
          onNavigateToVerify={() => setAuthScreen('verify')}
        />
      );
    }

    if (authScreen === 'verify') {
      return (
        <VerifyOTP
          onVerifySuccess={(token) => setAccessToken(token)}
        />
      );
    }

    if (authScreen === 'forgot-password') {
      return (
        <ForgotPassword
          onNavigateBack={() => setAuthScreen('login')}
          onSubmitSuccess={(email) => {
            setResetEmail(email);
            setAuthScreen('verify-reset-otp');
          }}
        />
      );
    }

    if (authScreen === 'verify-reset-otp') {
      return (
        <VerifyResetOTP
          email={resetEmail}
          onNavigateBack={() => setAuthScreen('forgot-password')}
          onVerifySuccess={(token) => {
            setResetAccessToken(token);
            setAuthScreen('reset-password');
          }}
        />
      );
    }

    if (authScreen === 'reset-password') {
      return (
        <ResetPassword
          accessToken={resetAccessToken}
          onResetSuccess={() => {
            setResetAccessToken('');
            setResetEmail('');
            setAuthScreen('login');
          }}
        />
      );
    }
  }

  // JIKA SUDAH LOGIN: Render sistem navigasi Bottom Tab
  const renderContent = () => {
    switch (activeScreen) {
      case 'home': return <Home accessToken={accessToken} onNavigate={(screen) => setActiveScreen(screen as any)} />;
      case 'search': return <Search accessToken={accessToken} />;
      case 'add': return <More accessToken={accessToken} onNavigate={(screen) => setActiveScreen(screen as any)} />;
      case 'notifications': return <Notifications accessToken={accessToken} />;
      case 'profile': return <Profile accessToken={accessToken} onLogout={() => setAccessToken(null)} onNavigate={(screen) => setActiveScreen(screen as any)} />;
      case 'transfer': return <Transfer accessToken={accessToken} onBack={() => setActiveScreen('home')} />;
      case 'topup': return <TopUp accessToken={accessToken} onBack={() => setActiveScreen('home')} />;
      case 'createproject': return <CreateProject accessToken={accessToken} onBack={() => setActiveScreen('add')} />;
      case 'terms': return <TermsAndConditions onBack={() => setActiveScreen('profile')} />;
      case 'setpin': return <SetPin accessToken={accessToken} onBack={() => setActiveScreen('profile')} />;
      case 'pinlogin': return <PinLogin onLoginSuccess={(token) => setAccessToken(token)} onBack={() => setAuthScreen('login')} />;
      case 'wallets': return <Wallets accessToken={accessToken} onBack={() => setActiveScreen('profile')} onNavigate={(screen, params) => {
        if (screen === 'walletdetail') {
          (window as any).currentWalletId = params.walletId;
          setActiveScreen('walletdetail');
        } else {
          setActiveScreen(screen as any);
        }
      }} />;
      case 'walletdetail': return <WalletDetail accessToken={accessToken} walletId={(window as any).currentWalletId || ''} onBack={() => setActiveScreen('wallets')} />;
      default: return (
        <Home
          accessToken={accessToken}
          onNavigate={(screen) => setActiveScreen(screen as any)}
        />
      );
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
      <BottomTab
        activeTab={activeScreen}
        // Pastikan tabId dianggap sebagai tipe yang valid
        onTabPress={(tabId) => setActiveScreen(tabId as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }
});