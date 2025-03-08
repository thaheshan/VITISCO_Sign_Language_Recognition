import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Avatar, Title, Caption, TouchableRipple } from "react-native-paper";

const ProfileScreen = () => {
  // Sample data structures for your local images
  const badgeImages = [
    {
      id: 1,
      source: require("../Profile Screen/assets/b1.png"),
      name: "Badge 1",
    },
    {
      id: 2,
      source: require("../Profile Screen/assets/b2.png"),
      name: "Badge 2",
    },
    {
      id: 3,
      source: require("../Profile Screen/assets/b3.png"),
      name: "Badge 3",
    },
    {
      id: 4,
      source: require("../Profile Screen/assets/b4.png"),
      name: "Badge 4",
    },
  ];

  const rewardImages = [
    {
      id: 1,
      source: require("../Profile Screen/assets/r1.png"),
      name: "Reward 1",
    },
    {
      id: 2,
      source: require("../Profile Screen/assets/r2.png"),
      name: "Reward 2",
    },
    {
      id: 3,
      source: require("../Profile Screen/assets/r3.png"),
      name: "Reward 3",
    },
    {
      id: 4,
      source: require("../Profile Screen/assets/r4.png"),
      name: "Reward 4",
    },
  ];

  // User profile data
  const userData = {
    userId: "ZA7194",
    name: "Zuhar Ahamed",
    handle: "@zheong123",
    level: 5,
    location: "Puttalam, Sri Lanka",
    phone: "+94 76 495 7194",
    email: "zuharahamed007@gmail.com",
    gender: "Male",
    nativeLanguage: "Tamil",
    following: 140,
    followers: 100,
    membershipType: "Gold",
    points: 1200,
    notifications: 21,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header - Updated to match the screenshot */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationCount}>
              {userData.notifications}
            </Text>
            <Text style={styles.notificationIcon}>🔥</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <Avatar.Image
            source={require("../Profile Screen/assets/Zuhar.jpg")}
            size={80}
          />
          <Text style={styles.username}>{userData.name}</Text>
          <Text style={styles.handle}>{userData.handle}</Text>

          {/* User ID */}
          <Text style={styles.userId}>ID: {userData.userId}</Text>

          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>LEVEL {userData.level}</Text>
          </View>
        </View>

        {/* User Information Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <Icon name="map-marker-radius" color="#777777" size={20} />
            <Text style={styles.infoText}>{userData.location}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="phone" color="#777777" size={20} />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="email" color="#777777" size={20} />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>

          {/* Gender */}
          <View style={styles.row}>
            <Icon name="gender-male-female" color="#777777" size={20} />
            <Text style={styles.infoText}>{userData.gender}</Text>
          </View>

          {/* Native language */}
          <View style={styles.row}>
            <Icon name="translate" color="#777777" size={20} />
            <Text style={styles.infoText}>
              Native: {userData.nativeLanguage}
            </Text>
          </View>
        </View>

        {/* Follower Stats */}
        <View style={styles.infoBoxWrapper}>
          <View
            style={[
              styles.infoBox,
              { borderRightWidth: 1, borderRightColor: "#dddddd" },
            ]}
          >
            <Title style={styles.statsNumber}>{userData.following}</Title>
            <Caption style={styles.statsCaption}>Following</Caption>
          </View>
          <View style={styles.infoBox}>
            <Title style={styles.statsNumber}>{userData.followers}</Title>
            <Caption style={styles.statsCaption}>Followers</Caption>
          </View>
        </View>

        {/* Vouchers */}
        <View style={styles.vouchersContainer}>
          {/* 10% Voucher */}
          <View style={styles.voucherCard}>
            <View style={[styles.voucherHeader, styles.purpleHeader]}>
              <Text style={styles.voucherHeaderTitle}>
                10% discount voucher
              </Text>
              <Text style={styles.voucherHeaderSubtitle}>For all members</Text>
            </View>
            <View style={styles.voucherBody}>
              <Text style={styles.voucherTitle}>10% discount voucher</Text>
              <Text style={styles.voucherPoints}>1,000 Points</Text>
              <TouchableOpacity style={styles.redeemButton}>
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 25% Voucher */}
          <View style={styles.voucherCard}>
            <View style={[styles.voucherHeader, styles.blueHeader]}>
              <Text style={styles.voucherHeaderTitle}>
                25% discount voucher
              </Text>
              <Text style={styles.voucherHeaderSubtitle}>
                For platinum members
              </Text>
            </View>
            <View style={styles.voucherBody}>
              <Text style={styles.voucherTitle}>25% discount voucher</Text>
              <Text style={styles.voucherPoints}>2,500 Points</Text>
              <TouchableOpacity style={styles.redeemButton}>
                <Text style={styles.redeemButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>REWARDS</Text>
          <View style={styles.badgesRow}>
            {rewardImages.map((reward) => (
              <View key={`reward-${reward.id}`} style={styles.rewardContainer}>
                <View style={styles.hexagonBadge}>
                  <Image
                    source={reward.source}
                    style={styles.badgeIcon}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.rewardLabel}>{reward.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>BADGES</Text>
          <View style={styles.badgesRow}>
            {badgeImages.map((badge) => (
              <View key={`badge-${badge.id}`} style={styles.badgeContainer}>
                <View style={styles.circleBadge}>
                  <Image
                    source={badge.source}
                    style={styles.badgeIcon}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.badgeLabel}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* XP Points Section - New section added below badges */}
        <View style={styles.bottomContainer}>
          <View style={styles.infoBox2}>
            <View style={styles.xpIcon}>
              <Ionicons name="star" size={18} color="#FFF" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>2,500</Text>
              <Text style={styles.infoSubtitle}>XP Points</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomContainer}>
          <View style={styles.infoBox2}>
            <View style={styles.goldIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{userData.membershipType}</Text>
              <Text style={styles.infoSubtitle}>Membership</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </View>

          <View style={styles.infoBox2}>
            <View style={styles.goldIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                {userData.points.toLocaleString()}
              </Text>
              <Text style={styles.infoSubtitle}>Points</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </View>
        </View>

        {/* Account Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Account Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Add Social Media</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Referral Code</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5c6e8",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Updated header styles to match the screenshot
  header: {
    backgroundColor: "#5d5b8d",
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationCount: {
    color: "white",
    fontSize: 16,
    marginRight: 4,
  },
  notificationIcon: {
    fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  username: {
    color: "#333",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  handle: {
    color: "#777777",
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500",
  },
  userId: {
    color: "#777777",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
  },
  levelContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#5d5b8d",
  },
  levelText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },
  infoText: {
    color: "#777777",
    marginLeft: 20,
    fontSize: 14,
  },
  infoBoxWrapper: {
    borderBottomColor: "#dddddd",
    borderBottomWidth: 1,
    borderTopColor: "#dddddd",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statsCaption: {
    fontSize: 14,
    color: "#666",
  },
  vouchersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  voucherCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  voucherHeader: {
    padding: 12,
  },
  purpleHeader: {
    backgroundColor: "#C73BCC",
  },
  blueHeader: {
    backgroundColor: "#3B77CC",
  },
  voucherHeaderTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  voucherHeaderSubtitle: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
  voucherBody: {
    padding: 12,
  },
  voucherTitle: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  voucherPoints: {
    color: "#FF9900",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  redeemButton: {
    borderWidth: 1,
    borderColor: "#7C76A3",
    borderRadius: 16,
    paddingVertical: 6,
    alignItems: "center",
    marginTop: 4,
  },
  redeemButtonText: {
    color: "#7C76A3",
    fontWeight: "500",
  },
  sectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  badgeContainer: {
    alignItems: "center",
    width: "22%",
  },
  rewardContainer: {
    alignItems: "center",
    width: "22%",
  },
  hexagonBadge: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 5,
  },
  circleBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFC700",
    marginBottom: 5,
  },
  badgeIcon: {
    width: "100%",
    height: "100%",
  },
  badgeLabel: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  rewardLabel: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  menuContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    padding: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginHorizontal: 16,
  },
  bottomContainer: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  infoBox2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5d5b8d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  goldIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFD700",
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "white",
  },
  infoSubtitle: {
    color: "#ffffff",
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: "#5d5b8d",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  xpIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4E7BEF", // Blue color for XP
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProfileScreen;
