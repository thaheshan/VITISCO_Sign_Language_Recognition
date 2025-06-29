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
  Image
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons, Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

// Local JSON data storage
const localData = {
  notifications: {
    all: [
      {
        id: 1,
        title: "Lesson Completed",
        description: "You completed the Basic Greetings lesson in Tamil",
        completion: 100,
        nextDate: "2023-05-15",
        timeSpent: "25 minutes",
        completedTasks: "5/5"
      },
      {
        id: 2,
        title: "Daily Streak",
        description: "You've maintained a 7-day learning streak!",
        completion: 100,
        nextDate: "2023-05-16",
        timeSpent: "18 minutes",
        completedTasks: "3/3"
      },
      {
        id: 3,
        title: "New Lesson Available",
        description: "New Intermediate Tamil lesson is now available",
        completion: 0,
        nextDate: "2023-05-17",
        timeSpent: "0 minutes",
        completedTasks: "0/5"
      }
    ],
    today: [
      {
        id: 1,
        title: "Lesson Completed",
        description: "You completed the Basic Greetings lesson in Tamil",
        completion: 100,
        nextDate: "2023-05-15",
        timeSpent: "25 minutes",
        completedTasks: "5/5"
      }
    ],
    yesterday: [
      {
        id: 2,
        title: "Daily Streak",
        description: "You've maintained a 7-day learning streak!",
        completion: 100,
        nextDate: "2023-05-16",
        timeSpent: "18 minutes",
        completedTasks: "3/3"
      }
    ]
  },
  feedbacks: [
    {
      id: 1,
      title: "Pronunciation Practice",
      description: "Your pronunciation has improved by 20% this week",
      completion: 85,
      date: "2023-05-14",
      timeSpent: "45 minutes",
      completedTasks: "8/10"
    },
    {
      id: 2,
      title: "Vocabulary Builder",
      description: "You've learned 15 new words this week",
      completion: 92,
      date: "2023-05-07",
      timeSpent: "38 minutes",
      completedTasks: "12/12"
    }
  ],
  suggestions: [
    {
      id: 1,
      title: "Try Virtual Room",
      description: "Join a virtual room to practice with other learners"
    },
    {
      id: 2,
      title: "Review Previous Lessons",
      description: "Revisiting past lessons can improve retention by 40%"
    },
    {
      id: 3,
      title: "Set Daily Goals",
      description: "Setting daily goals can help maintain consistency"
    }
  ]
};

const NotificationScreen = ({navigation, route}) => {
  // Main state variables
  const [activeTab, setActiveTab] = useState("Notifications");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedNotificationDetails, setSelectedNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const tabPosition = useRef(new Animated.Value(0)).current;
  const swipeOffset = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Menu animation values
  const [menuOpen, setMenuOpen] = useState(false);
  const addButtonRotation = useRef(new Animated.Value(0)).current;
  const menuHeight = useRef(new Animated.Value(0)).current;

  // Tab indices for easier reference
  const tabIndices = {
    Notifications: 0,
    Feedbacks: 1,
    Suggestions: 2,
  };

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

  // Get filtered notifications based on time filter
  const getFilteredNotifications = () => {
    return localData.notifications[timeFilter] || [];
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
  const openLessonModal = (item) => {
    setSelectedLesson(item);
    
    // For notifications, we already have the details in our local data
    if (activeTab === "Notifications") {
      const details = getFilteredNotifications().find(n => n.id === item.id);
      setSelectedNotificationDetails(details);
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
  const renderNotificationsTab = () => {
    const notifications = getFilteredNotifications();
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
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
                  {notification.description}
                </Text>
                <Text style={styles.lessonDate}>on: {notification.nextDate}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  };

  const renderFeedbacksTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {localData.feedbacks.length === 0 ? (
        <Text style={styles.emptyMessage}>No feedbacks available.</Text>
      ) : (
        localData.feedbacks.map((feedback) => (
          <TouchableOpacity
            key={feedback.id}
            style={styles.lessonCard}
            activeOpacity={0.7}
            onPress={() => openLessonModal(feedback)}
          >
            <View style={styles.lessonContent}>
              <Text style={styles.lessonTitle}>{feedback.title}</Text>
              <Text style={styles.lessonDescription}>
                {feedback.description}
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
      {localData.suggestions.length === 0 ? (
        <Text style={styles.emptyMessage}>
          No suggestions available at the moment.
        </Text>
      ) : (
        localData.suggestions.map((suggestion) => (
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
                        {selectedLesson.completion || 0}%
                      </Text>
                    </View>
                    <Text style={styles.modalProgressLabel}>
                      {selectedLesson.completion > 70 ? "Excellent Progress!" : 
                       selectedLesson.completion > 40 ? "Good Progress!" : "Keep Going!"}
                    </Text>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedLesson.description}
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Time Spent</Text>
                      <Text style={styles.statValue}>
                        {selectedNotificationDetails?.timeSpent || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Completed Tasks</Text>
                      <Text style={styles.statValue}>
                        {selectedNotificationDetails?.completedTasks || "N/A"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsLabel}>Date</Text>
                    <Text style={styles.detailsValue}>
                      {selectedLesson.date || selectedLesson.nextDate || "N/A"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={closeLessonModal}
                >
                  <Text style={styles.actionButtonText}>
                    Close
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
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('Translator');
              toggleMenu();
            }}
          >
            <Text style={styles.menuText}>Translator</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate('Scheduler');
              toggleMenu();
            }}
          >
            <Text style={styles.menuText}>Add Schedule</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="grid-outline" size={24} color="#352561" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate("ProgressAnalysis")}
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
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.activeNavIndicator} />
            <Ionicons name="notifications-outline" size={24} color="#9E9AA7" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate('Profile')}
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