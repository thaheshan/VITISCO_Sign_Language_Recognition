// ProfileScreen.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo vector icons

const ProfileScreen = () => {
  const userProfile = {
    name: "Mohamed Thaheeshan",
    username: "@thaheeshan123",
    level: 5,
    profilePic: require("./assets/thalaivar.jpg"), // You'll need to add your own image
    rewards: [
      {
        id: 1,
        icon: "🏆",
        description: "Achievement Badge",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={userProfile.profilePic}
            style={styles.profileImage}
            defaultSource={require("./assets/thalaivar.jpg")}
          />
        </View>

        <Text style={styles.name}>{userProfile.name}</Text>
        <Text style={styles.username}>{userProfile.username}</Text>

        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>LEVEL {userProfile.level}</Text>
        </View>

        <View style={styles.rewardsSection}>
          <Text style={styles.rewardsTitle}>REWARDS</Text>
          <View style={styles.rewardsList}>
            {userProfile.rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardBadge}>
                <Text style={styles.rewardIcon}>{reward.icon}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6FA", // Light purple background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  profileContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  levelContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  rewardsSection: {
    width: "100%",
    padding: 20,
    marginTop: 20,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  rewardsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  rewardBadge: {
    width: 60,
    height: 60,
    backgroundColor: "#FF6B6B",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardIcon: {
    fontSize: 24,
  },
});

export default ProfileScreen;
