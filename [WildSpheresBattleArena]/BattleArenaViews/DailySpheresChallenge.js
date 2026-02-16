import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formattedTimer } from '../WildSpheresStore/SpheresContext';
import { captureRef } from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const STORAGE_KEY = 'DAILY_CHALLENGE_STATE';
const WALLPAPERS_KEY = 'DAILY_WALLPAPERS_UNLOCKED';

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const STRUCTURE_SIZE = 9;
const ROUNDS_TOTAL = 3;
const SHOW_TIME = 900;

const regFont = 'Montserrat-Regular';
const semiBoldFont = 'Montserrat-SemiBold';
const bgColor = '#151225';
const bordersColor = '#3D375D';

const ROUND_IMAGES = [
  { id: 'fire', source: require('../assets/spheresImages/spheresround1.png') },
  { id: 'ice', source: require('../assets/spheresImages/spheresround2.png') },
  { id: 'light', source: require('../assets/spheresImages/spheresround3.png') },
];

const WALLPAPERS = [
  { id: 'wall_1', source: require('../assets/spheresImages/wallp1.png') },
  { id: 'wall_2', source: require('../assets/spheresImages/wallp2.png') },
  { id: 'wall_3', source: require('../assets/spheresImages/wallp3.png') },
];

export default function DailySpheresChallenge() {
  const [screen, setScreen] = useState('ENTRY');
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState(0);

  const [activeIndex, setActiveIndex] = useState(null);
  const [resultIndex, setResultIndex] = useState(null);
  const [resultSuccess, setResultSuccess] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [locked, setLocked] = useState(false);

  const [reward, setReward] = useState(null);
  const [cooldownEnd, setCooldownEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const showTimer = useRef(null);
  const appearTimer = useRef(null);
  const imageRef = useRef(null);

  const navigation = useNavigation();
  const { height } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then(rawData => {
        if (!rawData) return;

        const parsedData = JSON.parse(rawData);

        if (parsedData.cooldownEnd && Date.now() < parsedData.cooldownEnd) {
          setCooldownEnd(parsedData.cooldownEnd);
          setTimeLeft(formattedTimer(parsedData.cooldownEnd - Date.now()));
          setScreen('TIMER');
        }
      });
    }, []),
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

  useEffect(() => {
    if (!cooldownEnd) return;

    const intervalId = setInterval(() => {
      const remainingTime = cooldownEnd - Date.now();

      if (remainingTime <= 0) {
        clearInterval(intervalId);
        setCooldownEnd(null);
        setScreen('ENTRY');
        return;
      }

      setTimeLeft(formattedTimer(remainingTime));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownEnd]);

  const startRound = () => {
    setLocked(false);
    setActiveIndex(null);
    setResultIndex(null);
    setResultSuccess(null);

    const img = ROUND_IMAGES[round - 1];
    const index = Math.floor(Math.random() * STRUCTURE_SIZE);
    const delay = 1000 + Math.random() * 2000;

    setCurrentImage(img);

    appearTimer.current = setTimeout(() => {
      setActiveIndex(index);

      showTimer.current = setTimeout(() => {
        finishRound(false, index);
      }, SHOW_TIME);
    }, delay);
  };

  const tapCell = index => {
    if (locked || activeIndex === null) return;

    clearTimeout(showTimer.current);
    clearTimeout(appearTimer.current);

    const isCorrectTap = index === activeIndex;
    finishRound(isCorrectTap, activeIndex);
  };

  const finishRound = (success, index) => {
    setLocked(true);
    setActiveIndex(null);
    setResultIndex(index);
    setResultSuccess(success);
    if (success) setWins(w => w + 1);
  };

  const nextRound = () => {
    if (round >= ROUNDS_TOTAL) {
      endChallenge(wins);
    } else {
      setRound(r => r + 1);
      setTimeout(startRound, 500);
    }
  };

  const endChallenge = async totalWins => {
    const won = totalWins >= 2;

    if (won) {
      const raw = await AsyncStorage.getItem(WALLPAPERS_KEY);
      const unlocked = raw ? JSON.parse(raw) : [];
      const available = WALLPAPERS.filter(w => !unlocked.includes(w.id));

      if (available.length > 0) {
        const prize = available[Math.floor(Math.random() * available.length)];
        await AsyncStorage.setItem(
          WALLPAPERS_KEY,
          JSON.stringify([...unlocked, prize.id]),
        );
        setReward(prize);
      }
    }

    const cooldown = Date.now() + COOLDOWN_MS;
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cooldownEnd: cooldown }),
    );

    setCooldownEnd(cooldown);
    setTimeLeft(formattedTimer(cooldown - Date.now()));
    setScreen('RESULT');
  };

  if (screen === 'ENTRY') {
    return (
      <View style={styles.mainCont}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
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
              <Text style={styles.headerTitle}>Daily Challenge</Text>
            </View>

            {Platform.OS === 'ios' ? (
              <Image
                source={require('../assets/spheresImages/headerLogo.png')}
              />
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
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={[styles.introTitle, { marginBottom: height * 0.09 }]}>
              A game of reaction awaits you!
            </Text>
            <Text
              style={[styles.introSubText, { marginBottom: height * 0.12 }]}
            >
              You will have 3 rounds, if you win 2 or more you will get a
              character skin, good luck!
            </Text>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                setRound(1);
                setWins(0);
                setReward(null);
                setScreen('PLAY');
                setTimeout(startRound, 600);
              }}
            >
              <Text style={styles.btnText}>Start</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'PLAY') {
    return (
      <View style={styles.mainCont}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
              marginBottom: height * 0.05,
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
              <Text style={styles.headerTitle}>Daily Challenge</Text>
            </View>

            {Platform.OS === 'ios' ? (
              <Image
                source={require('../assets/spheresImages/headerLogo.png')}
              />
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
          <View style={styles.gameTimerContainer}>
            <Text style={styles.subtitle}>Round {round}/3</Text>
          </View>

          <View style={styles.grid}>
            {Array.from({ length: STRUCTURE_SIZE }).map((_, i) => {
              const showImage = i === activeIndex || i === resultIndex;

              return (
                <TouchableOpacity
                  key={i}
                  disabled={locked}
                  onPress={() => tapCell(i)}
                  style={[
                    styles.cell,
                    i === resultIndex &&
                      (resultSuccess ? styles.cellSuccess : styles.cellFail),
                  ]}
                >
                  {showImage && currentImage && (
                    <Image source={currentImage.source} style={styles.image} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {locked && (
            <TouchableOpacity
              style={styles.btn}
              onPress={nextRound}
              activeOpacity={0.7}
            >
              <Text style={styles.btnText}>
                {round === 3 && locked ? 'Result' : 'Next round'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  if (screen === 'RESULT') {
    const win = wins >= 2;
    return (
      <View style={styles.mainCont}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
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
              <Text style={styles.headerTitle}>Daily Challenge</Text>
            </View>

            {Platform.OS === 'ios' ? (
              <Image
                source={require('../assets/spheresImages/headerLogo.png')}
              />
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
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            {win && reward && (
              <Image
                source={reward.source}
                style={[styles.rewardImage, { marginBottom: height * 0.02 }]}
                ref={imageRef}
              />
            )}
            <Text style={[styles.introTitle, { marginBottom: height * 0.05 }]}>
              {win ? 'Congratulations!!!' : 'Better luck next time...'}
            </Text>
            <Text
              style={[styles.introSubText, { marginBottom: height * 0.07 }]}
            >
              You won {wins} round out of 3 so you don't get the skin, try again
              the next day, I'm sure you'll be lucky.
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={shareImage}
              activeOpacity={0.7}
            >
              <Text style={styles.btnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'TIMER') {
    return (
      <View style={styles.mainCont}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
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
              <Text style={styles.headerTitle}>Daily Challenge</Text>
            </View>

            <Image source={require('../assets/spheresImages/headerLogo.png')} />
          </View>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <View style={styles.timerContainer}>
              <Image source={require('../assets/spheresImages/timer.png')} />
              <Text style={styles.timer}>{timeLeft}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    backgroundColor: bgColor,
    padding: 6,
  },
  gameTimerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 15,
    height: 51,
    width: 135,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  introTitle: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: semiBoldFont,
    marginTop: 20,
  },
  introSubText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: regFont,
    paddingHorizontal: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 3.4,
    borderColor: bordersColor,
    padding: 16,
    borderRadius: 22,
    height: 86,
    minWidth: 230,
    justifyContent: 'center',
  },
  title: { color: 'white', fontSize: 26, fontWeight: '900', marginBottom: 16 },
  subtitle: { color: '#fff', fontFamily: semiBoldFont, fontSize: 16 },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: regFont,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#04EBB7',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 22,
    marginTop: 30,
    width: '90%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  btnText: { color: '#000', fontSize: 18, fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '95%',
    gap: 12,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cell: {
    width: 103,
    height: 103,
    borderRadius: 30,
    borderWidth: 2.7,
    borderColor: bordersColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  cellSuccess: {
    borderColor: '#00AA55',
  },
  cellFail: {
    borderColor: '#AA0003',
  },
  image: { width: 44, height: 44, resizeMode: 'contain' },
  rewardImage: {
    width: 326,
    height: 326,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: bordersColor,
  },
  timer: { color: '#fff', fontSize: 24, fontFamily: semiBoldFont },
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
    textAlign: 'center',
  },
});
