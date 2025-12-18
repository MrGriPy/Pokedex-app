import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { api } from './services/api';

export default function SigninScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('⚠️ Veuillez remplir tous les champs.');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('⚠️ Les mots de passe ne correspondent pas.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.signup({ email, password, first_name: firstName, last_name: lastName });
      if (result.ok) {
        setSuccess('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => router.push('/login'), 1000);
      } else {
        setError(`⚠️ ${result.message || 'Erreur d\'inscription'}`);
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
      <Text style={styles.subtitle}>Crée ton compte</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre prénom"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre nom"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#aaa"
        />
      </View>

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

      <View style={styles.field}>
        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmez votre mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#aaa"
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : 'S’inscrire'}</Text>
      </TouchableOpacity>

      <Link href="/login" style={styles.backLink}>
        <Text style={styles.backText}>Retour à la connexion</Text>
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
  backLink: {
    marginTop: 15,
  },
  backText: {
    color: '#438CA7',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});