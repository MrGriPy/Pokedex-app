import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from './services/api';

export default function ResetPasswordScreen() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const router = useRouter();

  const handleSendCode = async () => {
    setMessage({ text: '', type: '' });
    if (!email) {
      setMessage({ text: 'Veuillez entrer votre email', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.forgotPassword(email);
      if (result.ok) {
        setMessage({ text: '📩 Code envoyé ! Vérifiez vos emails (et la console serveur)', type: 'success' });
        setStep(2);
      } else {
        setMessage({ text: '❌ ' + (result.message || 'Erreur'), type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Erreur réseau', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async () => {
    setMessage({ text: '', type: '' });
    if (!code || !newPassword) {
      setMessage({ text: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.resetPassword({
        email,
        code,
        newPassword
      });

      if (result.ok) {
        setMessage({ text: '✅ Mot de passe modifié ! Redirection...', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage({ text: '❌ ' + (result.message || 'Erreur'), type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Erreur réseau', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 ? 'Mot de passe oublié' : 'Vérification du code'}
      </Text>

      {message.text ? (
        <View style={[styles.messageBox, message.type === 'error' ? styles.errorBox : styles.successBox]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      ) : null}

      {step === 1 && (
        <>
          <Text style={styles.instruction}>
            Entrez votre email pour recevoir un code de vérification à 6 chiffres.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Votre Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer le code</Text>}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.instruction}>
            Code envoyé à : {email}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Code à 6 chiffres"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetConfirm}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmer le changement</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#F08030', textDecorationLine: 'underline' }}>Renvoyer le code ?</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
        <Text style={styles.backText}>Retour au login</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F08030',
    marginBottom: 10,
  },
  instruction: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  messageBox: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  messageText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F08030',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: '#007BFF',
    fontSize: 16,
  },
});