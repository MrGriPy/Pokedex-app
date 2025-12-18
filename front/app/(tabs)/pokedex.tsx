import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

type Pokemon = {
  id: number;
  name: string;
  types: string[];
  // image: any; // image commentée pour le moment
};

const typeColors: Record<string, string> = {
  Plante: '#78C850',
  Poison: '#A040A0',
  Feu: '#F08030',
  Vol: '#A890F0',
  Eau: '#6890F0',
  Insecte: '#A8B820',
  Normal: '#A8A878',
  Électrik: '#F8D030',
  Sol: '#E0C068',
  Fée: '#EE99AC',
  Psy: '#F85888',
  Combat: '#C03028',
  Roche: '#B8A038',
  Spectre: '#705898',
  Glace: '#98D8D8',
  Dragon: '#7038F8',
};



export default function Pokedex() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [capturedIds, setCapturedIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getPokemons();
        if (result.ok) {
          setPokemons(result.data);
        } else {
          Alert.alert('Erreur', 'Impossible de charger les Pokémon');
        }

        // Load user
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          const key = 'capturedIds_' + userData._id;

          // Load captured from AsyncStorage
          const storedCaptured = await AsyncStorage.getItem(key);
          if (storedCaptured) {
            setCapturedIds(JSON.parse(storedCaptured));
          }

          // Try to load from API
          const capturedResult = await api.getCaptured();
          if (capturedResult.ok) {
            setCapturedIds(capturedResult.captured);
            await AsyncStorage.setItem(key, JSON.stringify(capturedResult.captured));
          }
        }
      } catch (error) {
        Alert.alert('Erreur', 'Erreur réseau');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPokemons = pokemons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.types.some(type => type.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleCapture = async (id: number, name: string) => {
    if (!user) return;

    const currentlyCaptured = capturedIds.includes(id);
    const newCapture = !currentlyCaptured;

    // Update local state
    const newCapturedIds = newCapture
      ? [...capturedIds, id]
      : capturedIds.filter(c => c !== id);

    setCapturedIds(newCapturedIds);

    // Save to AsyncStorage
    const key = 'capturedIds_' + user._id;
    await AsyncStorage.setItem(key, JSON.stringify(newCapturedIds));

    // Show alert
    if (newCapture) {
      Alert.alert('Félicitations !', `${name} a été capturé !`);
    } else {
      Alert.alert('Annulé', `${name} n'est plus capturé.`);
    }

    // Try to update server
    try {
      const result = await api.updateCapture(id, newCapture);
      if (!result.ok) {
        Alert.alert('Attention', 'La capture n\'a pas pu être sauvegardée sur le serveur.');
      }
    } catch (error) {
      Alert.alert('Attention', 'Erreur réseau : la capture n\'est pas sauvegardée.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Pokédex</Text>

      <TextInput
        style={styles.input}
        placeholder="Rechercher un Pokémon..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.grid}>
        {filteredPokemons.map(pokemon => {
          const captured = capturedIds.includes(pokemon.id);

          return (
            <TouchableOpacity
              key={pokemon.id}
              style={[styles.card, captured && { opacity: 0.6 }]}
              onPress={() => toggleCapture(pokemon.id, pokemon.name)}
            >
              {/*
              <Image source={pokemon.image} style={styles.image} />
              */}
              <Text style={styles.name}>{pokemon.name}</Text>
              <View style={styles.typesContainer}>
                {pokemon.types.map(type => (
                  <View
                    key={type}
                    style={[styles.typeBadge, { backgroundColor: typeColors[type] || '#777' }]}
                  >
                    <Text style={styles.typeText}>{type}</Text>
                  </View>
                ))}
              </View>
              {captured && (
                <View style={styles.capturedBadge}>
                  <Text style={styles.capturedText}>Capturé</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Compteur en bas */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {capturedIds.length} / {pokemons.length} Pokémon capturé(s)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  /*
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  */
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    margin: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
  },
  capturedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  capturedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
