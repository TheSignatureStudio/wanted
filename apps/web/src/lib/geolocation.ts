import type { GeoLocation } from './types';

/**
 * Get current geolocation from browser
 */
export async function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch geolocation changes
 */
export function watchLocation(
  onSuccess: (location: GeoLocation) => void,
  onError: (error: Error) => void
): number {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      onError(new Error(error.message));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  );
}

/**
 * Stop watching geolocation
 */
export function clearWatch(watchId: number): void {
  if (watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Check if location is within allowed radius
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radiusMeters;
}

