import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const ipAddress = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const API_BASE_URL = `http://${ipAddress}:3000`;

export const api = {
  signup: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  signin: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  getPokemons: async () => {
    const response = await fetch(`${API_BASE_URL}/list`, {
      method: 'GET',
    });
    return response.json();
  },
  getCaptured: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };
    const response = await fetch(`${API_BASE_URL}/user/captured`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  updateCapture: async (pokemonId: number, capture: boolean) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };
    const response = await fetch(`${API_BASE_URL}/user/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ pokemonId, capture }),
    });
    return response.json();
  },
  resetPassword: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  getAllUsers: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };
    const response = await fetch(`${API_BASE_URL}/user/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  updateUser: async (id: string, data: any) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };
    const response = await fetch(`${API_BASE_URL}/user/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteUser: async (id: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };
    
    console.log("Suppression via POST de l'ID:", id);

    try {
      const response = await fetch(`${API_BASE_URL}/user/admin/delete/${id}`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.json();
    } catch (error) {
      console.error("Erreur API:", error);
      return { ok: false, message: "Erreur réseau" };
    }
  },
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },
  resetPasswordV2: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
