import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileSetup = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: "",
    preferredLanguage: "",
    experience: "beginner", // beginner, intermediate, advanced
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Handle form submission
      console.log("Form submitted:", formData);
      // Navigate to next screen or home
      // navigation.navigate('Home');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Welcome to Vitisco!</Text>
      <Text style={styles.stepDescription}>Let's set up your profile</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => setFormData({ ...formData, username: text })}
          placeholder="Choose a username"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>About You</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preferred Sign Language</Text>
        <TextInput
          style={styles.input}
          value={formData.preferredLanguage}
          onChangeText={(text) =>
            setFormData({ ...formData, preferredLanguage: text })
          }
          placeholder="e.g., ASL, BSL"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Experience Level</Text>

      <View style={styles.experienceContainer}>
        {["beginner", "intermediate", "advanced"].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.experienceButton,
              formData.experience === level && styles.experienceButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, experience: level })}
          >
            <Text
              style={[
                styles.experienceText,
                formData.experience === level && styles.experienceTextActive,
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          )}
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 3 ? "Complete Setup" : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0FF",
  },
  scrollView: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  stepIndicator: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  stepContainer: {
    padding: 24,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  nextButton: {
    backgroundColor: "#6C63FF",
    margin: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  experienceContainer: {
    marginTop: 16,
  },
  experienceButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  experienceButtonActive: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  experienceText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  experienceTextActive: {
    color: "white",
  },
});

export default ProfileSetup;
