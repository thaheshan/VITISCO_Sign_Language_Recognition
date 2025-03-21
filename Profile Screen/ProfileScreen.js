import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Avatar, Title, Caption } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  // State for user data
  const [userData, setUserData] = useState({
    userId: "ZA7194",
    name: "Zuhar Ahamed",
    handle: "@zheong123",
    level: 5,
    location: "Puttalam, Sri Lanka",
    phone: "+94 76 495 7194",
    email: "zuharahamed007@gmail.com",
    gender: "Male",
    nativeLanguage: "Tamil",
    profilePic: "http://localhost:3001/uploads/Zuhar.jpg",
    following: 140,
    followers: 100,
    membershipType: "Gold",
    points: 1200,
    notifications: 21,
  });

  // State for editable user information
  const [editableData, setEditableData] = useState({ ...userData });

  // State for edit modal visibility
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  // Fetch user profile data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/profile/ZA7194"
        );
        const data = await response.json();
        setUserData(data);
        setEditableData(data); // Initialize editable data with fetched data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Function to update user profile
  const updateProfile = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/profile/ZA7194", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableData),
      });
      const data = await response.json();
      Alert.alert("Success", data.message);
      setUserData({ ...userData, ...editableData }); // Update local state
      setEditModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  // Function to upload profile picture
  const uploadProfilePic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to upload a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("profilePic", {
        uri: file.uri,
        name: file.fileName || "profile.jpg",
        type: file.type || "image/jpeg",
      });

      try {
        const response = await fetch(
          "http://localhost:3001/api/profile/ZA7194/upload",
          {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const data = await response.json();
        Alert.alert("Success", data.message);
        setUserData({ ...userData, profilePic: data.profilePicUrl }); // Update profile picture in state
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        Alert.alert("Error", "Failed to upload profile picture.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
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
          <TouchableOpacity onPress={uploadProfilePic}>
            <Avatar.Image source={{ uri: userData.profilePic }} size={80} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <Text style={styles.username}>{userData.name}</Text>
          <Text style={styles.handle}>{userData.handle}</Text>
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
          <View style={styles.row}>
            <Icon name="gender-male-female" color="#777777" size={20} />
            <Text style={styles.infoText}>{userData.gender}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="translate" color="#777777" size={20} />
            <Text style={styles.infoText}>
              Native: {userData.nativeLanguage}
            </Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Rest of your UI components (Rewards, Badges, etc.) */}
      </ScrollView>

      {/* Edit Profile Modal */}
      {isEditModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={editableData.name}
              onChangeText={(text) =>
                setEditableData({ ...editableData, name: text })
              }
              placeholder="Name"
            />
            <TextInput
              style={styles.input}
              value={editableData.location}
              onChangeText={(text) =>
                setEditableData({ ...editableData, location: text })
              }
              placeholder="Location"
            />
            <TextInput
              style={styles.input}
              value={editableData.phone}
              onChangeText={(text) =>
                setEditableData({ ...editableData, phone: text })
              }
              placeholder="Phone"
            />
            <TextInput
              style={styles.input}
              value={editableData.email}
              onChangeText={(text) =>
                setEditableData({ ...editableData, email: text })
              }
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={editableData.gender}
              onChangeText={(text) =>
                setEditableData({ ...editableData, gender: text })
              }
              placeholder="Gender"
            />
            <TextInput
              style={styles.input}
              value={editableData.nativeLanguage}
              onChangeText={(text) =>
                setEditableData({ ...editableData, nativeLanguage: text })
              }
              placeholder="Native Language"
            />
            <Button title="Save" onPress={updateProfile} />
            <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
          </View>
        </View>
      )}
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
  editText: {
    color: "#4E7BEF",
    marginTop: 5,
    textAlign: "center",
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
  editProfileButton: {
    backgroundColor: "#5d5b8d",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  editProfileButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ProfileScreen;
