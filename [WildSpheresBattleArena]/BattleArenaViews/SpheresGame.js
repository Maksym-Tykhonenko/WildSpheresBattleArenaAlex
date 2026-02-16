import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  useWindowDimensions,
  ImageBackground,
  Share,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { spheresCharacters } from '../ArenaSpheresConstants/spheresCharacters';

const { width: W, height: H } = Dimensions.get('window');

const STORAGE_KEY = 'WILD_SPHERES_PROGRESS';
const TOTAL_LEVELS = 18;
const LEVELS_PER_PAGE = 9;

const regFont = 'Montserrat-Regular';
const semiBoldFont = 'Montserrat-SemiBold';
const bgColor = '#151225';
const bordersColor = '#3D375D';

const SPHERES = [
  {
    key: 'SOUL',
    label: 'Soul',
    image: require('../assets/spheresImages/spheresround1.png'),
  },
  {
    key: 'POWER',
    label: 'Power',
    image: require('../assets/spheresImages/spheresround2.png'),
  },
  {
    key: 'LIGHTNING',
    label: 'Lightning',
    image: require('../assets/spheresImages/spheresround3.png'),
  },
];

const HP1 = 1000;
const D1 = 55;

const hpForRound = n => Math.round(HP1 * Math.pow(1.08, n - 1));
const timeForRound = () => 25;
const baseDamageForRound = n => D1 * Math.pow(1.12, n - 1);
const baseRegenPerSecond = (round, maxHp) => maxHp * (0.0025 + round * 0.0003);
const formatHP = v => Math.max(0, Math.round(v)).toLocaleString('ru-RU');

const pickRandomSphere = () =>
  SPHERES[Math.floor(Math.random() * SPHERES.length)];
const roll3Spheres = () => [
  pickRandomSphere(),
  pickRandomSphere(),
  pickRandomSphere(),
];
const getComboMultiplier = s => {
  const [a, b, c] = s.map(x => x.key);
  if (a === b && b === c) return 2.9;
  if (a === b || a === c || b === c) return 1.8;
  return 1.1;
};
const starsForProgress = p => {
  if (p >= 1) return 3;
  if (p >= 0.5) return 2;
  if (p >= 0.3) return 1;
  return 0;
};
const clamp01 = x => Math.max(0, Math.min(1, x));

const LevelStars = ({ value = 0, size = 21 }) => (
  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
    {[1, 2, 3].map(i => (
      <Image
        key={i}
        source={require('../assets/spheresImages/star.png')}
        style={[
          { width: size, height: size, opacity: value >= i ? 1 : 0.25 },
          i === 2 && { width: 25, height: 25 },
        ]}
      />
    ))}
  </View>
);

const GameTimer = ({ children }) => (
  <View style={styles.gameTimerWrapper}>
    <Image source={require('../assets/spheresImages/timerSmall.png')} />
    <Text style={styles.pillText}>{children}</Text>
  </View>
);

const TurquoiseBtn = ({ label, onPress, disabled }) => (
  <TouchableOpacity
    style={styles.primaryBtn}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <Text style={styles.primaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

export default function SpheresGame() {
  // use state hooks
  const [screen, setScreen] = useState('LEVELS');
  const [unlockedRound, setUnlockedRound] = useState(1);
  const [starsByRound, setStarsByRound] = useState({});
  const [levelPage, setLevelPage] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxHp, setMaxHp] = useState(0);
  const [hp, setHp] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [lastSpheres, setLastSpheres] = useState([]);
  const [resultStars, setResultStars] = useState(0);
  const [resultText, setResultText] = useState('');
  const [pushCooldown, setPushCooldown] = useState(false);
  const [visibleIndexes, setVisibleIndexes] = useState([]);

  const navigation = useNavigation();
  const { height } = useWindowDimensions();

  // use ref hooks
  const timerRef = useRef(null);
  const regenRef = useRef(null);
  const badComboRef = useRef(0);
  const goodComboRef = useRef(0);
  const fatigueRef = useRef(1);
  const [characterImage, setCharacterImage] = useState(
    require('../assets/spheresImages/shperes1.png'),
  );
  const baseDamage = useMemo(
    () => baseDamageForRound(currentRound),
    [currentRound],
  );

  const onPush = () => {
    if (pushCooldown) return;

    setPushCooldown(true);

    setVisibleIndexes([]);

    const spheres = roll3Spheres();

    for (let i = 0; i < spheres.length; i++) {
      setTimeout(() => {
        setVisibleIndexes(indexes => [...indexes, i]);
      }, i * 400);
    }

    setTimeout(() => {
      const mult = getComboMultiplier(spheres);

      if (mult <= 1.1) {
        badComboRef.current++;
        fatigueRef.current = Math.max(0.8, fatigueRef.current - 0.05);
      } else {
        goodComboRef.current++;
        fatigueRef.current = Math.min(1, fatigueRef.current + 0.05);
      }

      const dmg = Math.round(baseDamage * mult * fatigueRef.current);

      setLastSpheres(spheres);
      setHp(h => Math.max(0, h - dmg));
      setPushCooldown(false);
    }, spheres.length * 500);
  };

  useEffect(() => {
    AsyncStorage.getItem('SELECTED_CHARACTER').then(id => {
      const char = spheresCharacters.find(c => c.id === id);
      if (char) setCharacterImage(char.source);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(svd => {
      if (!svd) return;
      const dataJSON = JSON.parse(svd);

      console.log('get unlocked!');
      setUnlockedRound(dataJSON.unlockedRound || 1);
      setStarsByRound(dataJSON.starsByRound || {});
    });
  }, []);

  const startRound = round => {
    const hpN = hpForRound(round);

    setCurrentRound(round);

    setMaxHp(hpN);

    setHp(hpN);

    setTimeLeft(timeForRound());
    setRunning(true);
    setScreen('GAME');
    setPushCooldown(false);
    badComboRef.current = 0;
    goodComboRef.current = 0;
    fatigueRef.current = 1;
    setLastSpheres(roll3Spheres());
    timerRef.current = setInterval(
      () => setTimeLeft(t => Math.max(0, +(t - 0.1).toFixed(1))),
      100,
    );
    regenRef.current = setInterval(() => {
      setHp(prev => {
        if (prev <= 0) return prev;
        let regen = baseRegenPerSecond(round, hpN);
        regen *= 1 + badComboRef.current * 0.2 - goodComboRef.current * 0.1;
        if (timeLeft < 15 * 0.3) regen *= 1.5;
        if (timeLeft < 15 * 0.15) regen *= 2.2;
        return Math.min(hpN, prev + regen / 10);
      });
    }, 100);
  };

  useEffect(() => {
    if (!running) return;
    if (hp <= 0 || timeLeft <= 0) finishRound();
  }, [hp, timeLeft]);

  // const onPush = () => {
  //   if (pushCooldown) return;
  //   setPushCooldown(true);
  //   setTimeout(() => setPushCooldown(false), 300);
  //   const spheres = roll3Spheres();
  //   const mult = getComboMultiplier(spheres);
  //   if (mult <= 1.1) {
  //     badComboRef.current++;
  //     fatigueRef.current = Math.max(0.8, fatigueRef.current - 0.05);
  //   } else {
  //     goodComboRef.current++;
  //     fatigueRef.current = Math.min(1, fatigueRef.current + 0.05);
  //   }
  //   const dmg = Math.round(baseDamage * mult * fatigueRef.current);
  //   setLastSpheres(spheres);
  //   setHp(h => Math.max(0, h - dmg));
  // };

  const finishRound = () => {
    clearInterval(timerRef.current);
    clearInterval(regenRef.current);
    setRunning(false);
    const progress = (maxHp - hp) / maxHp;
    const stars = starsForProgress(progress);
    setResultStars(stars);
    const updatedStars = {
      ...starsByRound,
      [currentRound]: Math.max(starsByRound[currentRound] || 0, stars),
    };
    const updatedUnlocked =
      stars >= 2 ? Math.max(unlockedRound, currentRound + 1) : unlockedRound;
    setStarsByRound(updatedStars);
    setUnlockedRound(updatedUnlocked);

    console.log('updated unlocked!!');

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        unlockedRound: updatedUnlocked,
        starsByRound: updatedStars,
      }),
    );
    setResultText(
      stars === 3
        ? `You have knocked out 100% of the boss's life and received 3 stars, you can move on to the next round.`
        : stars === 2
        ? `You have knocked out more than 50% of the boss's life and received 2 stars, you can move on to the next round.`
        : `You knocked out less than 30% of the boss's life and received 1 star, you need to improve your score to move on to the next level.`,
    );
    setScreen('RESULT');
  };

  const shareGameResult = resultMessage => {
    Share.share({ message: resultMessage });

    console.log('shared :)');
  };

  const levelScreen = () => {
    const start = levelPage * LEVELS_PER_PAGE + 1;
    const end = Math.min(start + LEVELS_PER_PAGE - 1, TOTAL_LEVELS);
    const levels = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return (
      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
              marginBottom: height * 0.064,
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
              <Text style={styles.headerTitle}>About</Text>
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
          <View style={styles.levelGrid}>
            {levels.map(r => {
              const locked = r > unlockedRound;
              return (
                <TouchableOpacity
                  style={{ alignItems: 'center', marginBottom: 15 }}
                  key={r}
                  activeOpacity={0.9}
                  disabled={locked}
                  onPress={() => startRound(r)}
                >
                  <ImageBackground
                    source={require('../assets/spheresImages/level_box.png')}
                    style={{
                      width: 100,
                      height: 100,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={styles.levelTileInner}>
                      {locked ? (
                        <Image
                          source={require('../assets/spheresImages/typcn_lock-closed.png')}
                        />
                      ) : (
                        <Text style={styles.levelTileText}>{r}</Text>
                      )}
                    </View>
                  </ImageBackground>
                  {starsByRound[r] > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <LevelStars value={starsByRound[r]} size={18} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.navBox}>
            <TouchableOpacity
              disabled={levelPage === 0}
              onPress={() => setLevelPage(p => p - 1)}
              style={{ opacity: levelPage === 0 ? 0.3 : 1 }}
            >
              <Image source={require('../assets/spheresImages/right.png')} />
            </TouchableOpacity>
            <View style={styles.verticalLine} />
            <TouchableOpacity
              disabled={end >= TOTAL_LEVELS}
              onPress={() => setLevelPage(p => p + 1)}
              style={{ opacity: end >= TOTAL_LEVELS ? 0.3 : 1 }}
            >
              <Image source={require('../assets/spheresImages/left.png')} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const gameScreen = () => {
    const p = clamp01(hp / maxHp);
    return (
      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        >
          <View>
            <Image
              source={characterImage}
              style={{ width: '100%', height: 440, resizeMode: 'cover' }}
            />
            <View
              style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}
            >
              <GameTimer>{`00:${Math.ceil(timeLeft)
                .toString()
                .padStart(2, '0')}`}</GameTimer>
              <View style={styles.hpWrap}>
                <View style={styles.hpOuter}>
                  <View style={[styles.hpInner, { width: `${p * 100}%` }]} />
                </View>
                <Text style={styles.hpText}>{formatHP(hp)} HP</Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomTitle}>Evil enemies are rising</Text>

            <View style={styles.sphereRow}>
              {lastSpheres.map((s, i) => (
                <View key={i} style={styles.sphereCard}>
                  {visibleIndexes.includes(i) && (
                    <Image source={s.image} style={{ width: 75, height: 75 }} />
                  )}
                </View>
              ))}
            </View>
            <TurquoiseBtn
              label="Push"
              onPress={onPush}
              disabled={pushCooldown}
            />
            <TouchableOpacity
              style={[
                styles.navHomeButton,
                { marginTop: height * 0.04, alignSelf: 'center' },
              ]}
              onPress={() => setScreen('LEVELS')}
              activeOpacity={0.6}
            >
              <Image source={require('../assets/spheresImages/home.png')} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const resultScreen = () => {
    const canGoNext = resultStars >= 2;
    return (
      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              paddingTop: height * 0.064,
              marginBottom: height * 0.064,
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
              <Text style={styles.headerTitle}>About</Text>
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
              flexDirection: 'row',
              gap: 4,
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: height * 0.06,
            }}
          >
            {[1, 2, 3].map(i => (
              <Image
                key={i}
                source={require('../assets/spheresImages/lstar.png')}
                style={[
                  {
                    width: 90,
                    height: 90,
                    opacity: resultStars >= i ? 1 : 0.25,
                  },
                  i === 2 && { width: 119, height: 119 },
                ]}
              />
            ))}
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultBodyTitle}>Result</Text>
            <Text style={styles.resultBody}>{resultText}</Text>
          </View>
          {canGoNext ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 20,
                flex: 1,
                paddingBottom: 50,
              }}
            >
              <TouchableOpacity
                style={styles.shareBtn}
                activeOpacity={0.8}
                onPress={() => shareGameResult(resultText)}
              >
                <Text style={styles.primaryBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navHomeButton}
                onPress={() => startRound(currentRound + 1)}
                activeOpacity={0.6}
              >
                <Image source={require('../assets/spheresImages/left.png')} />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 20,
                flex: 1,
                paddingBottom: 50,
              }}
            >
              <TouchableOpacity
                style={styles.shareBtn}
                activeOpacity={0.8}
                onPress={() => shareGameResult(resultText)}
              >
                <Text style={styles.primaryBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navHomeButton}
                onPress={() => startRound(currentRound)}
                activeOpacity={0.6}
              >
                <Image
                  source={require('../assets/spheresImages/restart.png')}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (screen === 'LEVELS') return levelScreen();
  if (screen === 'GAME') return gameScreen();
  return resultScreen();
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: bgColor, paddingHorizontal: 6 },
  page: { flex: 1 },
  gameTimerWrapper: {
    backgroundColor: '#231E3E',
    borderWidth: 1,
    borderColor: bordersColor,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    alignSelf: 'center',
    marginTop: 10,
    height: 51,
    justifyContent: 'center',
    width: 134,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bottomTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: semiBoldFont,
    textAlign: 'center',
  },
  pillText: {
    color: '#FFFFFF',
    fontFamily: semiBoldFont,
    fontSize: 16,
  },
  navBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 44,
    borderWidth: 2,
    borderColor: bordersColor,
    width: 267,
    borderRadius: 25,
    alignSelf: 'center',
    height: 89,
    alignItems: 'center',
  },
  resultBox: {
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    padding: 20,
    paddingTop: 6,
    marginVertical: 20,
    minHeight: 120,
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 80,
  },
  bottomSheet: {
    backgroundColor: '#151225',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 28,
    paddingTop: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: bordersColor,
    flex: 1,
    paddingBottom: 30,
    borderBottomColor: 'transparent',
    marginTop: -20,
  },
  verticalLine: { width: 2, height: 89, backgroundColor: '#3D375D' },
  primaryBtn: {
    backgroundColor: '#04EBB7',
    borderRadius: 22,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: '#000', fontSize: 20, fontWeight: '800' },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
  shareBtn: {
    backgroundColor: '#04EBB7',
    borderRadius: 22,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    width: '65%',
  },
  navHomeButton: {
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    paddingVertical: 14,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
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
  bossBlock: {
    height: Math.min(290, H * 0.34),
    borderRadius: 22,
    backgroundColor: '#1B1733',
    borderWidth: 2,
    borderColor: bordersColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossTitle: { color: 'white', fontSize: 28, fontWeight: '900' },
  bossSub: { color: '#CFCBE6', marginTop: 6, fontSize: 14, fontWeight: '700' },
  hpWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  hpOuter: {
    width: '100%',
    height: 31,
    borderRadius: 999,
    backgroundColor: '#2B2549',
    borderWidth: 1,
    borderColor: bordersColor,
    overflow: 'hidden',
    padding: 3,
    marginBottom: 10,
  },
  hpInner: { height: '100%', backgroundColor: '#F45757', borderRadius: 999 },
  hpText: {
    color: 'white',
    fontFamily: semiBoldFont,
    position: 'absolute',
    top: 7,
  },
  sphereRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 20,
  },
  sphereCard: {
    width: 103,
    height: 103,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: bordersColor,
    backgroundColor: '#1A1630',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sphereEmoji: { fontSize: 34 },
  sphereLabel: {
    color: '#D6D2EE',
    marginTop: 8,
    fontWeight: '800',
    fontSize: 12,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    paddingTop: 8,
    marginBottom: 10,
  },
  levelTile: {
    width: (W - 24 - 28) / 3,
    maxWidth: 120,
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#1A1630',
    borderWidth: 2,
    borderColor: '#C89CFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  levelTileInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTileText: {
    color: '#fff',
    fontSize: 32,
    fontFamily: semiBoldFont,
  },
  resultBody: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 20,
    fontFamily: semiBoldFont,
  },
  resultBodyTitle: {
    color: '#fff',
    fontSize: 15,
    fontFamily: regFont,
    textAlign: 'center',
  },
});
