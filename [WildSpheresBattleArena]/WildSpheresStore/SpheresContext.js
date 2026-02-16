import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';

export const StoreContext = createContext(undefined);

export const useStorage = () => {
  return useContext(StoreContext);
};

const WALLPAPERS_KEY = 'DAILY_WALLPAPERS_UNLOCKED';
const SELECTED_CHARACTER_KEY = 'SELECTED_CHARACTER';

export const formattedTimer = ms => {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const StoreProvider = ({ children }) => {
  const [unlocked, setUnlocked] = useState([]);
  const [selected, setSelected] = useState('default');

  const getSavedData = async () => {
    try {
      const rawUnlocked = await AsyncStorage.getItem(WALLPAPERS_KEY);

      const rawSelected = await AsyncStorage.getItem(SELECTED_CHARACTER_KEY);

      const unlockedWallpapers = rawUnlocked ? JSON.parse(rawUnlocked) : [];

      const selectedCharacter = rawSelected || 'default';

      console.log('loaded!');

      setUnlocked(unlockedWallpapers);
      setSelected(selectedCharacter);
    } catch (error) {
      console.error('Failed to load from AsyncStorage ===', error);
    }
  };

  const contextValue = {
    getSavedData,
    unlocked,
    setUnlocked,
    selected,
    setSelected,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};
