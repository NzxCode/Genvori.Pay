import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { locationApi } from '../services/api';
import { Alert } from 'react-native';

export function useLocation(accessToken: string | null) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const updateLocationToBackend = async (loc: Location.LocationObject) => {
    if (!accessToken) return;

    try {
      setUpdating(true);
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      
      const address = reverseGeocode.length > 0 
        ? `${reverseGeocode[0].street || ''} ${reverseGeocode[0].city || ''}, ${reverseGeocode[0].region || ''}` 
        : 'Unknown Address';

      await locationApi.updateLocation(accessToken, {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 0,
        address: address,
      });
      
      console.log('Location updated successfully');
    } catch (err: any) {
      console.error('Failed to update location:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const requestPermissionsAndGetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(loc);
      await updateLocationToBackend(loc);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    requestPermissionsAndGetLocation();
  }, []);

  return {
    location,
    error,
    updating,
    updateLocation: requestPermissionsAndGetLocation,
  };
}
