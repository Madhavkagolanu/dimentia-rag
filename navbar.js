import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import Home from './screens/Home';
import Jobs from './screens/Jobs';
import Contact from './screens/Contact';
import Settings from './screens/Settings';

const { width } = Dimensions.get('window');
const TAB_WIDTH = (width - 40) / 4; // 4 tabs and 20 padding each side

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      damping: 15,
      stiffness: 120,
    }).start();

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [state.index]);

  return (
    <View style={styles.tabBar}>
      <Animated.View 
        style={[
          styles.indicator,
          {
            transform: [{ translateX }],
          }
        ]} 
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconNameMap = {
          Home: ['home-outline', 'home'],
          Jobs: ['briefcase-outline', 'briefcase'],
          'Contact Us': ['chatbubble-outline', 'chatbubble'],
          Settings: ['settings-outline', 'settings'],
        };

        const [inactiveIcon, activeIcon] = iconNameMap[route.name];

        return (
          <Pressable 
            key={route.key} 
            style={styles.tabItem}
            onPress={onPress}
          >
            <Animated.View style={[
              isFocused ? styles.iconFocused : styles.iconBase,
              isFocused && { transform: [{ scale }] }
            ]}>
              <Ionicons
                name={isFocused ? activeIcon : inactiveIcon}
                size={24}
                color={isFocused ? '#2563eb' : '#94a3b8'}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

const Navbar = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Jobs" component={Jobs} />
      <Tab.Screen name="Contact Us" component={Contact} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 2,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBase: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  iconFocused: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
});

export default Navbar;