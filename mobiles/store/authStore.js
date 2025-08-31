import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true,
    hasCheckedAuth: false,

    register: async (username, email, password) => {
        set({isLoading: true});
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, email, password}),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                // If response is not JSON, get text content
                const textResponse = await response.text();
                throw new Error(textResponse || 'Registration failed');
            }
            
            if (!response.ok) throw new Error(data.message || 'Registration failed');
            // Optionally, update the store with user/token here
            
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            set({user: data.user, token: data.token, isLoading: false});
            return {success: true};

        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
    },

    login: async (email, password) => {
        set({isLoading: true});
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                // If response is not JSON, get text content
                const textResponse = await response.text();
                throw new Error(textResponse || 'Login failed');
            }
            
            if (!response.ok) throw new Error(data.message || 'Login failed');
            // Optionally, update the store with user/token here
            
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            set({user: data.user, token: data.token, isLoading: false});
            return {success: true};

        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            let user = null;
            
            if (userJson) {
                try {
                    user = JSON.parse(userJson);
                } catch (parseError) {
                    console.error('Error parsing stored user data:', parseError);
                    // Clear corrupted data
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('token');
                }
            }

            set({token, user});
        } catch (error) {
            console.error('Error in checkAuth:', error);
            set({token: null, user: null, isLoading: false});
        }
        finally{
            set({isCheckingAuth: false, hasCheckedAuth: true})
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({token: null, user: null});
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    },
}));

        