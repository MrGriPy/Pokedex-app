import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const router = useRouter();

  const loadData = useCallback(async () => {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      const userData = JSON.parse(storedUser);
      const key = 'capturedIds_' + userData._id;
      const storedCaptured = await AsyncStorage.getItem(key);
      if (storedCaptured) {
        const capturedIds = JSON.parse(storedCaptured);
        setCapturedCount(capturedIds.length);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const { first_name, last_name } = user;
  const username = `${first_name} ${last_name}`;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{first_name[0]}</Text>
        </View>

        <Text style={styles.username}>{username}</Text>
        <Text style={styles.captured}>
          Pokémon capturés : {capturedCount}
        </Text>

        {user.email === 'admin@admin' && (
          <TouchableOpacity style={styles.adminButton} onPress={() => router.push('/admin')}>
            <Text style={styles.adminText}>Administration</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Link href="/login">
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F08030', // Orange Feu Pokédex
    marginVertical: 20,
  },
  profileCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#438CA7', // Bleu pétrole
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38342E', // Marron foncé
    marginBottom: 10,
  },
  captured: {
    fontSize: 16,
    color: '#2A9D8F', // Vert eau pour le chiffre
    fontWeight: 'bold',
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 10,
  },
  adminText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#F08030',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
