import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import "./global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-white text-2xl font-bold tracking-wider text-center px-4">
        Onlinja is ready
      </Text>
      <StatusBar style="light"/>
    </View>
  );
}
