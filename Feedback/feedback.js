import React, { useState, useRef } from "react";
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
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const NotificationScreen = () => {
  // Main state variables
  const [activeTab, setActiveTab] = useState("Notifications");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // 'all', 'today', 'yesterday'

  // Animation values
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Sample data for lessons
  const lessons = [
    {
      id: 1,
      title: "Lessons",
      completion: 75,
      date: "21 March",
      nextDate: "Next week",
      category: "today",
    },
    {
      id: 2,
      title: "Lessons",
      completion: 75,
      date: "21 March",
      nextDate: "Next week",
      category: "today",
    },
    {
      id: 3,
      title: "Lessons",
      completion: 75,
      date: "21 March",
      nextDate: "Next week",
      category: "yesterday",
    },
    {
      id: 4,
      title: "Lessons",
      completion: 75,
      date: "21 March",
      nextDate: "Next week",
      category: "yesterday",
    },
  ];

  // Filtered lessons based on selected time filter
  const filteredLessons =
    timeFilter === "all"
      ? lessons
      : lessons.filter((lesson) => lesson.category === timeFilter);

  // Function to switch between tabs
  const switchTab = (tab) => {
    let toValue = 0;
    if (tab === "Feedbacks") toValue = -width;
    if (tab === "Suggestions") toValue = -2 * width;

    Animated.spring(tabTranslateX, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

    setActiveTab(tab);
  };

  // Functions for modal handling
  const openLessonModal = (lesson) => {
    setSelectedLesson(lesson);
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
    });
  };

  // Swipe gesture handler for tab switching
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: tabTranslateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      // Determine which tab to select based on swipe direction
      if (translationX > 50) {
        if (activeTab === "Suggestions") switchTab("Feedbacks");
        else if (activeTab === "Feedbacks") switchTab("Notifications");
      } else if (translationX < -50) {
        if (activeTab === "Notifications") switchTab("Feedbacks");
        else if (activeTab === "Feedbacks") switchTab("Suggestions");
      } else {
        // If swipe is not significant, reset to current tab
        switchTab(activeTab);
      }
    }
  };

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
      {filteredLessons.map((lesson) => (
        <TouchableOpacity
          key={lesson.id}
          style={styles.lessonCard}
          activeOpacity={0.7}
          onPress={() => openLessonModal(lesson)}
        >
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>
              You Completed {lesson.completion}% from the expected lesson on
              thus day and your learning progress was so good.
            </Text>
            <Text style={styles.lessonDate}>on : {lesson.nextDate}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeedbacksTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {lessons.map((lesson) => (
        <TouchableOpacity
          key={lesson.id}
          style={styles.lessonCard}
          activeOpacity={0.7}
          onPress={() => openLessonModal(lesson)}
        >
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>
              You Completed {lesson.completion}% from the expected lesson on
              thus day and your learning progress was so good.
            </Text>
            <Text style={styles.lessonDate}>on : {lesson.date}</Text>
          </View>
          <ProgressCircle percentage={lesson.completion} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSuggestionsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.emptyMessage}>
        No suggestions available at the moment.
      </Text>
    </ScrollView>
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
                    You completed {selectedLesson.completion}% from the expected
                    lesson on thus day. Your learning progress was so good!
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Time Spent</Text>
                      <Text style={styles.statValue}>45 minutes</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Completed Tasks</Text>
                      <Text style={styles.statValue}>8/10</Text>
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
          <TouchableOpacity style={styles.userButton}>
            <Text style={styles.userButtonText}>USER ID</Text>
          </TouchableOpacity>
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

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.tabsContent,
              { transform: [{ translateX: tabTranslateX }] },
            ]}
          >
            <View style={styles.tabPage}>{renderNotificationsTab()}</View>
            <View style={styles.tabPage}>{renderFeedbacksTab()}</View>
            <View style={styles.tabPage}>{renderSuggestionsTab()}</View>
          </Animated.View>
        </PanGestureHandler>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonIcon}>□</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonIcon}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonIcon}>🔔</Text>
            <View style={styles.activeDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.bottomButtonIcon}>👤</Text>
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
});

export default NotificationScreen;
