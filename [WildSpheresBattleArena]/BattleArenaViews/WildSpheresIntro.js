import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const onboardImages = [
  require('../assets/spheresImages/onboard_1.png'),
  require('../assets/spheresImages/onboard_2.png'),
  require('../assets/spheresImages/onboard_3.png'),
];

const bgColor = '#151225';
const regFont = 'Montserrat-Regular';
const semiBoldFont = 'Montserrat-SemiBold';

const WildSpheresIntro = () => {
  const { width, height } = useWindowDimensions();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const navigation = useNavigation();

  const isPortraitMode = width < height;

  const handleNextStep = () => {
    if (onboardingStep < 2) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      navigation.replace('WildSpheresHome');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      >
        <Image
          source={onboardImages[onboardingStep]}
          style={{
            width: '100%',
            aspectRatio: isPortraitMode ? 12 / 16 : 15 / 9,
            resizeMode: 'cover',
          }}
        />
        <View style={s.bottomSheet}>
          <Text style={s.introText}>
            {onboardingStep === 0
              ? 'Evil enemies are rising'
              : onboardingStep === 1
              ? 'Press the button to summon spheres'
              : 'Earn stars by dealing damage'}
          </Text>
          <Text style={s.introSecondText}>
            {onboardingStep === 0
              ? 'Each battle is limited by time — your goal is to deal as much damage as possible and destroy them.'
              : onboardingStep === 1
              ? 'Different combinations deal different damage.'
              : 'Win daily reaction challenges to unlock skins and boost your power.'}
          </Text>

          <TouchableOpacity
            style={s.button}
            onPress={handleNextStep}
            activeOpacity={0.6}
          >
            <Text style={s.buttonText}>
              {onboardingStep === 0
                ? 'Next'
                : onboardingStep === 1
                ? 'Okay'
                : 'Start'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {[1, 2, 3].map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 90,
                  height: 7,
                  borderRadius: 5,
                  backgroundColor:
                    idx <= onboardingStep ? '#9185D3' : '#3D375D',
                  marginTop: 28,
                  marginHorizontal: 10,
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#151225',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingTop: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: '#3D375D',
    flex: 1,
    paddingBottom: 30,
    borderBottomColor: 'transparent',
  },
  introText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: semiBoldFont,
  },
  introSecondText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 33,
    fontFamily: regFont,
  },
  button: {
    backgroundColor: '#04EBB7',
    borderRadius: 22,
    paddingVertical: 14,
    height: 70,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
});

export default WildSpheresIntro;
