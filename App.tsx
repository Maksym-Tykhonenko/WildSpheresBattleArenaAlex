import { NavigationContainer } from '@react-navigation/native';
import WildSpheresStack from './[WildSpheresBattleArena]/SpheresRoutes/WildSpheresStack';
import { StoreProvider } from './[WildSpheresBattleArena]/WildSpheresStore/SpheresContext';

const App = () => {
  return (
    <NavigationContainer>
      <StoreProvider>
        <WildSpheresStack />
      </StoreProvider>
    </NavigationContainer>
  );
};

export default App;
