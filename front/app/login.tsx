import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('⚠️ Veuillez remplir tous les champs.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.signin({ email, password });
      if (result.ok) {
        await AsyncStorage.setItem('token', result.token);
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        setSuccess('✅ Connexion réussie ! Bienvenue dans le Pokédex.');
        setTimeout(() => router.push('/(tabs)/pokedex'), 1000);
      } else {
        setError(`⚠️ ${result.message || 'Email ou mot de passe incorrect.'}`);
      }
    } catch (err) {
      setError('⚠️ Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Connecte-toi pour continuer</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>

      {/* 🔑 Lien vers la page d'inscription */}
      <Link href="/signup" style={styles.signupButton}>
        <Text style={styles.signupText}>S’inscrire au Pokédex</Text>
      </Link>

      {/* 🔑 Lien vers la réinitialisation de mot de passe */}
      <Link href="/reset-password" style={styles.resetButton}>
        <Text style={styles.resetText}>Mot de passe oublié ?</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f03030ff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  field: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#38342E',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#438CA7',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  error: {
    color: '#E63946',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: '#2A9D8F',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#78C850',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signupButton: {
    borderWidth: 2,
    borderColor: '#438CA7',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    fontSize: 16,
    color: '#438CA7',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    alignItems: 'center',
    marginTop: 10,
  },
  resetText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});