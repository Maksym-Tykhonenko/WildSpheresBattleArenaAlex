import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import { spheresCharacters } from '../ArenaSpheresConstants/spheresCharacters';
import { useStorage } from '../WildSpheresStore/SpheresContext';
import { captureRef } from 'react-native-view-shot';

const semiBoldFont = 'Montserrat-SemiBold';
const bgColor = '#151225';
const bordersColor = '#3D375D';

export default function CollectionSpheresScreen() {
  const { getSavedData, unlocked, setSelected, selected } = useStorage();

  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const imageRef = useRef(null);

  useEffect(() => {
    getSavedData();

    console.log('saved data loaded!');
  }, []);

  const selectCharacter = async id => {
    setSelected(id);
    await AsyncStorage.setItem('SELECTED_CHARACTER', id);
  };

  const visibleCharacters = spheresCharacters.filter(
    char => char.id === 'default' || unlocked.includes(char.id),
  );

  const shareImage = async () => {
    try {
      const tmpUri = await captureRef(imageRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      let fileUri = tmpUri.startsWith('file://') ? tmpUri : 'file://' + tmpUri;
      const pathToCheck = fileUri.replace('file://', '');
      const exists = await RNFS.exists(pathToCheck);
      if (!exists) return;

      await Share.open({
        url: fileUri,
        type: 'image/png',
        failOnCancel: false,
      });
    } catch (error) {
      if (!error?.message?.includes('User did not share')) {
        console.error('shareWallpaper error', error);
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 5,
            paddingTop: height * 0.064,
            paddingBottom: height * 0.05,
          }}
        >
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Image
              source={require('../assets/spheresImages/material-symbols_arrow-back-rounded.png')}
            />
          </TouchableOpacity>

          <View style={styles.head}>
            <Text style={styles.headerTitle}>Collection</Text>
          </View>

          {Platform.OS === 'ios' ? (
            <Image source={require('../assets/spheresImages/headerLogo.png')} />
          ) : (
            <Image
              source={require('../assets/spheresImages/andrIcon.png')}
              style={{
                width: 76,
                height: 76,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: bordersColor,
              }}
            />
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 15,
            marginBottom: height * 0.03,
          }}
        >
          {spheresCharacters.map(char => (
            <Image
              key={char.id}
              source={char.source}
              style={[
                {
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                },
                selected === char.id
                  ? { borderWidth: 1, borderColor: '#9185D3' }
                  : {},
              ]}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {visibleCharacters.map(char => {
            const isSelected = selected === char.id;

            return (
              <View key={char.id} style={styles.card}>
                <Image
                  source={char.source}
                  style={styles.image}
                  ref={imageRef}
                />

                <View style={styles.buttonsWrap}>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isSelected && styles.btnActive,
                      { width: width * 0.4 },
                    ]}
                    onPress={() => selectCharacter(char.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <Image
                        source={require('../assets/spheresImages/dressed.png')}
                      />
                    )}
                    <Text style={styles.btnText}>
                      {isSelected ? 'Dressed' : 'To dress'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareBtn]}
                    onPress={shareImage}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={require('../assets/spheresImages/shareIcon.png')}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: bgColor,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    padding: 6,
  },
  buttonsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  shareBtn: {
    width: 59,
    height: 59,
    backgroundColor: '#231E3E',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: bordersColor,
  },
  card: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: bordersColor,
    marginBottom: 24,
    overflow: 'hidden',
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
  navButton: {
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    paddingVertical: 14,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    alignSelf: 'center',
  },
  head: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    height: 76,
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
  image: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  btn: {
    margin: 14,
    backgroundColor: '#231E3E',
    borderRadius: 22,
    paddingVertical: 5,
    width: '50%',
    height: 59,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: bordersColor,
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
});
