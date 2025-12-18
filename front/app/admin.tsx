import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { api } from './services/api';

interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  last_login_at: string;
  captured: number[];
}

export default function AdminScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editData, setEditData] = useState({ email: '', first_name: '', last_name: '', password: '' });
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await api.getAllUsers();
      if (result.ok) {
        setUsers(result.data);
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de charger les utilisateurs');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const data: any = {};
    if (editData.email) data.email = editData.email;
    if (editData.first_name) data.first_name = editData.first_name;
    if (editData.last_name) data.last_name = editData.last_name;
    if (editData.password) data.password = editData.password;

    try {
      const result = await api.updateUser(editingUser._id, data);
      if (result.ok) {
        Alert.alert('Succès', 'Utilisateur mis à jour');
        setEditingUser(null);
        loadUsers();
      } else {
        Alert.alert('Erreur', result.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau');
    }
  };

  const handleDelete = async (user: User) => {
    console.log("🚀 1. Lancement suppression DIRECTE pour :", user.email);
    console.log("🔍 ID visé :", user._id);

    try {
      const result = await api.deleteUser(user._id);

      console.log("📥 2. Réponse du serveur :", JSON.stringify(result));

      if (result.ok) {
        console.log("✅ Succès !");
        alert("Utilisateur supprimé avec succès !"); 
        loadUsers();
      } else {
        console.log("❌ Échec serveur");
        alert("Erreur : " + (result.message || "Inconnue"));
      }
    } catch (err) {
      console.error("💥 3. CRASH API :", err);
      alert("Erreur réseau ou crash code");
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.userText}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (editingUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Modifier l'utilisateur</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={editData.email}
          onChangeText={(text) => setEditData({ ...editData, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={editData.first_name}
          onChangeText={(text) => setEditData({ ...editData, first_name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={editData.last_name}
          onChangeText={(text) => setEditData({ ...editData, last_name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe (optionnel)"
          value={editData.password}
          onChangeText={(text) => setEditData({ ...editData, password: text })}
          secureTextEntry
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
          <Text style={styles.buttonText}>Sauvegarder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingUser(null)}>
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administration</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        style={styles.list}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/profil')}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F08030',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  userText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
    padding: 15,
    borderRadius: 5,
  },
  backButton: {
    backgroundColor: '#F08030',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});