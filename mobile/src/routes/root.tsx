import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NewPaymentScreen from '../screens/payments/new';
import PaymentsListScreen from '../screens/payments/list';

export type RootTabParamList = {
  PaymentsList: undefined;
  NewPayment: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
  },
};

export function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="PaymentsList"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#004c48',
          },
          headerTintColor: '#ffffff',
          sceneStyle: {
            backgroundColor: '#f5f5f5',
          },
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
          },
          tabBarActiveTintColor: '#004c48',
          tabBarInactiveTintColor: '#7a7a7a7e',
        }}
      >
        <Tab.Screen
          name="PaymentsList"
          component={PaymentsListScreen}
          options={{
            title: t('payments.tabs.list'),
            tabBarLabel: t('payments.tabs.list'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="list" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="NewPayment"
          component={NewPaymentScreen}
          options={{
            title: t('payments.form.submit.idle'),
            tabBarLabel: t('payments.tabs.new'),
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="dollar" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;