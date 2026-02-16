import { useNavigation } from '@react-navigation/native';

import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const regFont = 'Montserrat-Regular';
const semiBoldFont = 'Montserrat-SemiBold';
const bgColor = '#151225';
const bordersColor = '#3D375D';

const WildSpheresHome = () => {
  const navigation = useNavigation();

  const handleNavigateTo = screen => {
    navigation.navigate(screen);
  };

  return (
    <View style={[s.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {Platform.OS === 'ios' ? (
          <Image source={require('../assets/spheresImages/homeImg.png')} />
        ) : (
          <Image
            source={require('../assets/spheresImages/andrIcon.png')}
            style={{ width: 320, height: 320, borderRadius: 50 }}
          />
        )}

        <TouchableOpacity
          style={s.button}
          onPress={() => handleNavigateTo('SpheresGame')}
          activeOpacity={0.6}
        >
          <Text style={s.buttonText}>Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.challengeButton}
          onPress={() => handleNavigateTo('DailySpheresChallenge')}
          activeOpacity={0.6}
        >
          <Text style={s.challengeButtonText}>Daily Challenge</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 20 }}>
          <TouchableOpacity
            style={s.navButton}
            onPress={() => handleNavigateTo('CollectionSpheresScreen')}
            activeOpacity={0.6}
          >
            <Image
              source={require('../assets/spheresImages/bxs_collection.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.navButton}
            onPress={() => handleNavigateTo('WildSpheresAbout')}
            activeOpacity={0.6}
          >
            <Image source={require('../assets/spheresImages/mdi_about.png')} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
    height: 76,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    alignSelf: 'center',
  },
  challengeButton: {
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    paddingVertical: 14,
    height: 76,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '55%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: semiBoldFont,
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: semiBoldFont,
  },
  navButton: {
    borderWidth: 2,
    borderColor: bordersColor,
    borderRadius: 22,
    paddingVertical: 14,
    height: 76,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    alignSelf: 'center',
  },
});

export default WildSpheresHome;
