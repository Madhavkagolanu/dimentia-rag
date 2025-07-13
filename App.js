import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import Navbar from './navbar';
import ProfileSetup from './screens/ProfileSetup';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // 'home' | 'profile' | null

  useEffect(() => {
    const checkStoredProfile = async () => {
      try {
        const keys = [
          'resumeName',
          'resumeURL',
          'skills',
          'description',
          'experience',
        ];
        const values = await AsyncStorage.multiGet(keys);

        const allFieldsPresent = values.every(
          ([key, value]) => value !== null && value.trim() !== ''
        );

        // Add a short delay to ensure no premature render
        setTimeout(() => {
          setInitialRoute(allFieldsPresent ? 'home' : 'profile');
        }, 100); // 100ms delay ensures state is updated after any React render quirks
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
        setInitialRoute('profile');
      }
    };

    checkStoredProfile();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {initialRoute === 'home' ? (
          <Navbar />
        ) : (
          <ProfileSetup onFinish={() => setInitialRoute('home')} />
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
