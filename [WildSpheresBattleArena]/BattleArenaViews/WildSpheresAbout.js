import { useNavigation } from '@react-navigation/native';
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const regFont = 'Montserrat-Regular';
const semiBoldFont = 'Montserrat-SemiBold';
const bgColor = '#151225';
const bordersColor = '#3D375D';

const WildSpheresAbout = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();

  const shareWildSpheresInfo = () => {
    const message =
      'Wild Spheres Battle Arena is a fast-paced action clicker where you battle powerful enemies against the clock using magical spheres. Combine spheres, deal massive damage, earn stars, and unlock unique character skins through daily challenges and progression.';

    Share.share({ message })
      .then(result => {
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('Shared with activity type:', result.activityType);
          } else {
            console.log('Shared successfully!!');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('dismissed');
        }
      })
      .catch(error => console.error('Error ===', error));
  };

  return (
    <View style={[s.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 5,
            paddingTop: height * 0.064,
          }}
        >
          <TouchableOpacity
            style={s.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Image
              source={require('../assets/spheresImages/material-symbols_arrow-back-rounded.png')}
            />
          </TouchableOpacity>

          <View style={s.head}>
            <Text style={s.headerTitle}>About</Text>
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

        {Platform.OS === 'ios' ? (
          <Image
            source={require('../assets/spheresImages/homeImg.png')}
            style={{ marginTop: 30 }}
          />
        ) : (
          <Image
            source={require('../assets/spheresImages/andrIcon.png')}
            style={{ width: 320, height: 320, borderRadius: 50, marginTop: 30 }}
          />
        )}

        <Text style={s.aboutText}>
          Wild Spheres Battle Arena is a fast-paced action clicker where you
          battle powerful enemies against the clock using magical spheres.
          Combine spheres, deal massive damage, earn stars, and unlock unique
          character skins through daily challenges and progression.
        </Text>

        <TouchableOpacity
          style={s.button}
          onPress={shareWildSpheresInfo}
          activeOpacity={0.6}
        >
          <Text style={s.buttonText}>Share</Text>
        </TouchableOpacity>
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
    padding: 6,
    paddingBottom: 30,
  },
  aboutText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 33,
    fontFamily: regFont,
    paddingHorizontal: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#04EBB7',
    borderRadius: 22,
    paddingVertical: 14,
    height: 76,
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
});

export default WildSpheresAbout;
