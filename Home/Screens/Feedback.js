import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { api } from "../Backend/FeedbackBE/api"; // Import the API client



import { Ionicons, Feather } from "@expo/vector-icons";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

const NotificationScreen = ({navigation , route}) => {
  // Main state variables
  const [activeTab, setActiveTab] = useState("Notifications");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // 'all', 'today', 'yesterday'

  // Data states
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotificationDetails, setSelectedNotificationDetails] =
    useState(null);

  // Animation values
  const tabPosition = useRef(new Animated.Value(0)).current;
  const swipeOffset = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;


  const [menuOpen, setMenuOpen] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
  
    
        // Animation values
        const addButtonRotation = useRef(new Animated.Value(0)).current;
        const menuHeight = useRef(new Animated.Value(0)).current;
  
   // Toggle menu animation
    const toggleMenu = () => {
      const toValue = menuOpen ? 0 : 1;
      
      Animated.parallel([
        Animated.timing(addButtonRotation, {
          toValue,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(menuHeight, {
          toValue,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
      
      setMenuOpen(!menuOpen);
    };
    
    // Interpolate rotation for + to x animation
    const rotateInterpolation = addButtonRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg']
    });
  
    
      // Interpolate height for menu animation
      const menuHeightInterpolation = menuHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100]
      });
  
  

  // Tab indices for easier reference
  const tabIndices = {
    Notifications: 0,
    Feedbacks: 1,
    Suggestions: 2,
  };

  // Fetch data when component mounts or when timeFilter changes
  useEffect(() => {
    fetchNotifications();
    fetchFeedbacks();
    fetchSuggestions();
  }, [timeFilter]);

  // Functions to fetch data from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.getNotifications(timeFilter);
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await api.getFeedbacks();
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.getSuggestions();
      setSuggestions(response.data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Function to switch between tabs
  const switchTab = (tab) => {
    const toValue = -width * tabIndices[tab];

    Animated.spring(tabPosition, {
      toValue,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();

    setActiveTab(tab);
  };

  // Functions for modal handling
  const openLessonModal = async (item) => {
    setSelectedLesson(item);

    // If we're opening a notification, fetch its detailed data
    if (activeTab === "Notifications" && item.id) {
      try {
        const response = await api.getNotificationById(item.id);
        setSelectedNotificationDetails(response.data);
      } catch (err) {
        console.error("Error fetching notification details:", err);
      }
    }

    setModalVisible(true);

    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeLessonModal = () => {
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 0.8,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedLesson(null);
      setSelectedNotificationDetails(null);
    });
  };

  // Gesture handlers for tab swiping
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: swipeOffset } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      swipeOffset.setValue(0); // Reset swipe offset

      // Determine threshold for swipe (20% of screen width)
      const threshold = width * 0.2;

      // Get current tab index
      const currentIndex = tabIndices[activeTab];

      // Calculate next tab index based on swipe direction
      let nextIndex = currentIndex;

      if (translationX > threshold && currentIndex > 0) {
        // Swiped right, go to previous tab
        nextIndex = currentIndex - 1;
      } else if (translationX < -threshold && currentIndex < 2) {
        // Swiped left, go to next tab
        nextIndex = currentIndex + 1;
      }

      // Find tab name from index
      const nextTab = Object.keys(tabIndices).find(
        (key) => tabIndices[key] === nextIndex
      );

      // Switch to the tab
      switchTab(nextTab);
    }
  };

  // Calculate combined translation for swipe animation
  const combinedTranslateX = Animated.add(tabPosition, swipeOffset);

  // Component for the progress circle
  const ProgressCircle = ({ percentage }) => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>{percentage}%</Text>
        </View>
        <Text style={styles.progressLabel}>Excellent</Text>
      </View>
    );
  };

  // Tab content components
  const renderNotificationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5142ab" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.emptyMessage}>No notifications available.</Text>
      ) : (
        notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={styles.lessonCard}
            activeOpacity={0.7}
            onPress={() => openLessonModal(notification)}
          >
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{notification.title}</Text>
              <Text style={styles.lessonDescription}>
                {notification.description ||
                  `You Completed ${notification.completion}% from the expected lesson on this day and your learning progress was so good.`}
              </Text>
              <Text style={styles.lessonDate}>on: {notification.nextDate}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderFeedbacksTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {feedbacks.length === 0 ? (
        <Text style={styles.emptyMessage}>No feedbacks available.</Text>
      ) : (
        feedbacks.map((feedback) => (
          <TouchableOpacity
            key={feedback.id}
            style={styles.lessonCard}
            activeOpacity={0.7}
            onPress={() => openLessonModal(feedback)}
          >
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{feedback.title}</Text>
              <Text style={styles.lessonDescription}>
                {feedback.description ||
                  `You Completed ${feedback.completion}% from the expected lesson on this day and your learning progress was so good.`}
              </Text>
              <Text style={styles.lessonDate}>on: {feedback.date}</Text>
            </View>
            <ProgressCircle percentage={feedback.completion} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderSuggestionsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {suggestions.length === 0 ? (
        <Text style={styles.emptyMessage}>
          No suggestions available at the moment.
        </Text>
      ) : (
        suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.lessonCard}
            activeOpacity={0.7}
            onPress={() => openLessonModal(suggestion)}
          >
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{suggestion.title}</Text>
              <Text style={styles.lessonDescription}>
                {suggestion.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  // Function to handle time filter changes
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  // Time filter buttons component
  const renderTimeFilterButtons = () => (
    <View style={styles.timeFilterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          timeFilter === "all" && styles.activeFilterButton,
        ]}
        onPress={() => handleTimeFilterChange("all")}
      >
        <Text
          style={[
            styles.filterButtonText,
            timeFilter === "all" && styles.activeFilterButtonText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          timeFilter === "today" && styles.activeFilterButton,
        ]}
        onPress={() => handleTimeFilterChange("today")}
      >
        <Text
          style={[
            styles.filterButtonText,
            timeFilter === "today" && styles.activeFilterButtonText,
          ]}
        >
          Today
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          timeFilter === "yesterday" && styles.activeFilterButton,
        ]}
        onPress={() => handleTimeFilterChange("yesterday")}
      >
        <Text
          style={[
            styles.filterButtonText,
            timeFilter === "yesterday" && styles.activeFilterButtonText,
          ]}
        >
          Yesterday
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Modal component
  const renderLessonModal = () => (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeLessonModal}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeLessonModal}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          ]}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalCard}
            activeOpacity={1}
            onPress={() => {}}
          >
            {selectedLesson && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeLessonModal}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalProgressContainer}>
                    <View style={styles.modalProgressCircle}>
                      <Text style={styles.modalProgressText}>
                        {selectedLesson.completion}%
                      </Text>
                    </View>
                    <Text style={styles.modalProgressLabel}>
                      Excellent Progress!
                    </Text>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedLesson.description ||
                      `You completed ${selectedLesson.completion}% from the expected lesson on this day. Your learning progress was so good!`}
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Time Spent</Text>
                      <Text style={styles.statValue}>
                        {selectedNotificationDetails?.timeSpent || "45 minutes"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Completed Tasks</Text>
                      <Text style={styles.statValue}>
                        {selectedNotificationDetails?.completedTasks || "8/10"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsLabel}>Date Completed</Text>
                    <Text style={styles.detailsValue}>
                      {selectedLesson.date}
                    </Text>

                    <Text style={styles.detailsLabel}>Next Session</Text>
                    <Text style={styles.detailsValue}>
                      {selectedLesson.nextDate}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={closeLessonModal}
                >
                  <Text style={styles.actionButtonText}>
                    View Lesson Details
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#d9d4f4" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>

        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Notifications" && styles.activeTab,
            ]}
            onPress={() => switchTab("Notifications")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Notifications" && styles.activeTabText,
              ]}
            >
              Notifications
            </Text>
            {activeTab === "Notifications" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Feedbacks" && styles.activeTab]}
            onPress={() => switchTab("Feedbacks")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Feedbacks" && styles.activeTabText,
              ]}
            >
              Feedbacks
            </Text>
            {activeTab === "Feedbacks" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Suggestions" && styles.activeTab,
            ]}
            onPress={() => switchTab("Suggestions")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Suggestions" && styles.activeTabText,
              ]}
            >
              Suggestions
            </Text>
            {activeTab === "Suggestions" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {activeTab === "Notifications" && renderTimeFilterButtons()}

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.tabsContent,
              { transform: [{ translateX: combinedTranslateX }] },
            ]}
          >
            <View style={styles.tabPage}>{renderNotificationsTab()}</View>
            <View style={styles.tabPage}>{renderFeedbacksTab()}</View>
            <View style={styles.tabPage}>{renderSuggestionsTab()}</View>
          </Animated.View>
        </PanGestureHandler>

                    {/* Popup Menu */}
                    <Animated.View style={[styles.popupMenu, { height: menuHeightInterpolation }]}>
                      <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText} onPress={() => navigation.navigate('Translator', {}, { animation: 'slide_from_right' })}>Translator</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText} onPress={() => navigation.navigate('Scheduler', {}, { animation: 'slide_from_right' })}>ADD SCHEDULE</Text>
                      </TouchableOpacity>
                    </Animated.View>



      {/* Bottom Navigation - Fixed */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} 
          onPress={() => navigation && navigation.navigate("Home", {}, { animation: 'slide_from_right' })}>
          <Ionicons name="grid-outline" size={24} color="#352561" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation && navigation.navigate("ProgressAnalysis", {}, { animation: 'slide_from_right' })}
        >
          <Feather name="pie-chart" size={26} color="#9E9AA7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
            <Ionicons name="add" size={32} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation && navigation.navigate('Notifications', {}, { animation: 'slide_from_right' })}
        >
          <View style={styles.activeNavIndicator} />

          <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
         
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation && navigation.navigate('Profile', {}, { animation: 'slide_from_right' })}
        >
          <Ionicons name="person-outline" size={24} color="#9E9AA7" />
        </TouchableOpacity>
      </View>



        {renderLessonModal()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9d4f4",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#d9d4f4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#d9d4f4",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  userButtonText: {
    fontWeight: "600",
    color: "#5142ab",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d4f4",
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  activeTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5142ab",
  },
  activeTabText: {
    color: "#5142ab",
    fontWeight: "bold",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: "#5142ab",
    borderRadius: 1.5,
  },
  tabsContent: {
    flex: 1,
    flexDirection: "row",
    width: width * 3,
  },
  tabPage: {
    width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  timeFilterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#d9d4f4",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeFilterButton: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 1,
  },
  filterButtonText: {
    color: "#5142ab",
    fontWeight: "500",
  },
  activeFilterButtonText: {
    fontWeight: "bold",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  lessonDate: {
    fontSize: 12,
    color: "#888",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5142ab",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  progressLabel: {
    color: "#5142ab",
    fontSize: 12,
    marginTop: 4,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bottomButton: {
    position: "relative",
  },
  bottomButtonIcon: {
    fontSize: 24,
    color: "#5142ab",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5142ab",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 30,
    color: "#fff",
    marginTop: -2,
  },
  activeDot: {
    position: "absolute",
    top: 0,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: "transparent",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  modalBody: {
    padding: 20,
  },
  modalProgressContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalProgressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5142ab",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  modalProgressText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
  },
  modalProgressLabel: {
    color: "#5142ab",
    fontSize: 16,
    fontWeight: "600",
  },
  modalDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#5142ab",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },


  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeNavIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#352561',
    position: 'absolute',
    bottom: -6,
  },
  addButton: {
    backgroundColor: '#6B5ECD',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    bottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  bottomPadding: {
    height: 80,
  },
  
  // Instruction overlay styles
  instructionsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#352561',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  progressIndicator: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B2B5E7',
    marginRight: 4,
  },
  activeDot: {
    backgroundColor: '#6B5ECD',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  instructionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },



  popupMenu: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(107, 94, 205, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


});

export default NotificationScreen;
