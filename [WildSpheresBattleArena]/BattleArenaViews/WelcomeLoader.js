import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { wildSpheresHtmlLoader } from '../ArenaSpheresConstants/wildSpheresHtmlLoader';

const WelcomeLoader = () => {
  const nav = useNavigation();
  const timerRef = useRef(null);

  {
    /***/
  }
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      try {
        nav.replace('WildSpheresIntro');

        console.log('nav!');
      } catch (err) {
        console.warn('replace failed', err);
        try {
          nav.navigate('WildSpheresIntro');
        } catch (err2) {
          console.error('failed', err2);
        }
      }
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        console.log('[Loader] timer cleared on unmount');
      }
    };
  }, [nav]);

  return (
    <View style={{ flex: 1, backgroundColor: '#151225' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={sty.wrapper} accessibilityLabel="loader-screen">
          {Platform.OS === 'ios' ? (
            <Image source={require('../assets/spheresImages/homeImg.png')} />
          ) : (
            <Image
              source={require('../assets/spheresImages/andrIcon.png')}
              style={{ width: 320, height: 320, borderRadius: 50 }}
            />
          )}
        </View>

        <View
          style={{
            flex: 1,
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
          }}
        >
          <WebView
            originWhitelist={['*']}
            source={{ html: wildSpheresHtmlLoader }}
            style={sty.webview}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const sty = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 650,
  },
  webview: {
    width: 360,
    height: 180,
    backgroundColor: 'transparent',
  },
});

export default WelcomeLoader;
