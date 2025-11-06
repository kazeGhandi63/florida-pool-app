import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cb3c6f7a`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Daily Readings API
export async function getDailyReadings() {
  try {
    const response = await fetch(`${BASE_URL}/daily-readings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    const result: ApiResponse<any[]> = await response.json();
    if (!result.success) {
      console.error('Error fetching daily readings:', result.error);
      return null;
    }
    return result.data || [];
  } catch (error) {
    console.error('Network error fetching daily readings:', error);
    return null;
  }
}

export async function saveDailyReadings(data: any[]) {
  try {
    const response = await fetch(`${BASE_URL}/daily-readings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      console.error('Error saving daily readings:', result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Network error saving daily readings:', error);
    return false;
  }
}

// Weekly Readings API
export async function getWeeklyReadings() {
  try {
    const response = await fetch(`${BASE_URL}/weekly-readings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    const result: ApiResponse<{ sunday: any[]; wednesday: any[] }> = await response.json();
    if (!result.success) {
      console.error('Error fetching weekly readings:', result.error);
      return null;
    }
    return result.data || { sunday: [], wednesday: [] };
  } catch (error) {
    console.error('Network error fetching weekly readings:', error);
    return null;
  }
}

export async function saveWeeklyReadings(sunday?: any[], wednesday?: any[]) {
  try {
    const response = await fetch(`${BASE_URL}/weekly-readings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sunday, wednesday }),
    });
    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      console.error('Error saving weekly readings:', result.error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Network error saving weekly readings:', error);
    return false;
  }
}
