const LessonCompleteScreen = ({ route, navigation }) => {
    const { lessonId, xpEarned, lessonTitle, onComplete } = route.params || {};
    const [showConfetti, setShowConfetti] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.2)).current;
    
    useEffect(() => {
      // Show confetti with delay
      setTimeout(() => setShowConfetti(true), 500);
      
      // Trophy animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      }).start();
      
      // Call the onComplete callback
      if (onComplete) {
        onComplete(xpEarned);
      }
    }, []);
    
    // Determine rewards based on lesson
    const getRewards = (id) => {
      switch (id) {
        case 1:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Basic Alphabet Badge',
            '🔓 Unlocked More Vowels lesson'
          ];
        case 2:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Vowels Master Badge',
            '🔓 Unlocked Basic Consonants lesson'
          ];
        case 3:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Consonants Badge',
            '🔓 Unlocked Simple Greetings lesson'
          ];
        case 4:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Greetings Expert Badge',
            '🔓 Unlocked Numbers 1-10 lesson'
          ];
        case 5:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Numbers Novice Badge',
            '🔓 Unlocked Family Members lesson'
          ];
        default:
          return [
            `🌟 +${xpEarned} XP Points`,
            '🏅 Learning Badge',
            '🔓 Unlocked next lesson'
          ];
      }
    };
    
    const rewards = getRewards(lessonId);
    
    return (
      <SafeAreaView style={styles.container}>
        <Confetti show={showConfetti} />
        
        <Text style={styles.lessonCompleteTitle}>LESSON COMPLETE!</Text>
        <Text style={styles.lessonCompleteName}>{lessonTitle}</Text>
        
        <Animated.View 
          style={[
            styles.trophyContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.trophyIcon}>🏆</Text>
        </Animated.View>
        
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>Rewards Earned:</Text>
          <View style={styles.rewardsList}>
            {rewards.map((reward, index) => (
              <Text key={index} style={styles.rewardItem}>{reward}</Text>
            ))}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // CORRECTED: Changed navigation target to 'LearningPathway'
            navigation.navigate('quizzes');
          }}
        >
          <Text style={styles.nextButtonText}>Practice</Text>
  
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // CORRECTED: Changed navigation target to 'LearningPathway'
            navigation.navigate('quizzes');
          }}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
  
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };