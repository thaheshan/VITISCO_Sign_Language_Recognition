
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');



export default function  CustomizationScreen({ navigate }) {
 const scaleAnim = useRef(new Animated.Value(0.9)).current;
   
   useEffect(() => {
     Animated.spring(scaleAnim, {
       toValue: 1,
       friction: 4,
       useNativeDriver: true,
     }).start();
   }, []);
   
   return (
     <SafeAreaView style={styles.container}>
       <Animated.Text 
         style={[
           styles.customizeTitle, 
           { transform: [{ scale: scaleAnim }] }
         ]}
       >
         Do You Want To Customize Your Learning Pathway?
       </Animated.Text>
       
       <View style={styles.buttonRow}>
         <TouchableOpacity 
           style={[styles.optionButton, styles.yesButton]}
           onPress={() => {
             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
             navigation.navigate('LearningPathwayCustomization');
           }}
         >
           <Text style={styles.optionButtonText}>YES</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
           style={[styles.optionButton, styles.noButton]}
           onPress={() => {
             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
             navigation.navigate('ReadyCountdown');
           }}
         >
           <Text style={styles.optionButtonText}>NO</Text>
         </TouchableOpacity>
       </View>
       
       <Image
         source={require('../../images/jumps.png')}
         style={styles.characterImage}
         resizeMode="contain"
       />
     </SafeAreaView>
   );

}