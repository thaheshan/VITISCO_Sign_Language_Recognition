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

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationCount}>21</Text>
          <View style={styles.notificationDot} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <Image
            source={require("./assets/thalaivar.jpg")}
            style={styles.avatar}
          />
          <Text style={styles.username}>fathima thahesan</Text>
          <Text style={styles.handle}>@aarvakolearu</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>LEVEL 5</Text>
          </View>

          {/* Achievement Badge */}
          {/*
           */}
        </View>

        {/* Frame ID */}
        <Text style={styles.frameId}>Frame 261047</Text>

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
            {[1, 2, 3, 4].map((item) => (
              <View key={`reward-${item}`} style={styles.hexagonBadge}>
                <Image
                  source={require(`./assets/thalaivar.jpg`)}
                  style={styles.badgeIcon}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>BADGES</Text>
          <View style={styles.badgesRow}>
            {[1, 2, 3, 4].map((item) => (
              <View
                key={`badge-${item}`}
                style={[
                  styles.circleBadge,
                  item === 4 ? styles.blueBadge : styles.goldBadge,
                ]}
              >
                <Text style={styles.badgeText}>
                  {item === 3 || item === 4 ? "Cl" : ""}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Account Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Add Social Medias</Text>
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

        {/* Bottom Info */}
        <View style={styles.bottomContainer}>
          <View style={styles.infoBox}>
            <View style={styles.goldIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Gold</Text>
              <Text style={styles.infoSubtitle}>Membership</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.goldIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>1,200</Text>
              <Text style={styles.infoSubtitle}>Points</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#5d5b8d",
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
    fontSize: 14,
    marginRight: 4,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "orange",
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  handle: {
    color: "#DDD",
    fontSize: 14,
  },
  levelContainer: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  achievementBadge: {
    position: "relative",
    marginTop: 16,
  },
  starBadge: {
    width: 50,
    height: 50,
  },
  ribbon: {
    position: "absolute",
    width: 20,
    height: 30,
    bottom: -10,
    right: -5,
  },
  frameId: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    alignSelf: "center",
    marginTop: 8,
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
  },
  hexagonBadge: {
    width: 60,
    height: 60,
    backgroundColor: "#C75050",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  circleBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  goldBadge: {
    backgroundColor: "#5d5b8d",
    borderWidth: 2,
    borderColor: "#FFC700",
  },
  blueBadge: {
    backgroundColor: "#4A69FF",
  },
  badgeIcon: {
    width: 30,
    height: 30,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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
  infoBox: {
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
});

export default ProfileScreen;
