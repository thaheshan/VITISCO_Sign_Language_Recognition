import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#B2B5E7',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginVertical: 10,
      marginTop: 35,
      position: 'relative',
    },
    headerTextContainer: {
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
    },
    frameText: {
      fontSize: 14,
      color: '#666',
    },
    characterImageWrapper: {
      position: 'absolute',
      right: 5,
      top: -15,
      zIndex: 1,
    },
    characterImage: {
      width: 90,
      height: 100,
    },
    profileStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    statItem: {
      flex: 1,
      marginHorizontal: 5,
    },
    statBackgroundBlue: {
      backgroundColor: 'rgba(81, 92, 230, 0.2)', // Bluish transparent background
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    statBackgroundPink: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)', // Pinkish transparent background
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    xpText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginTop: 4,
    },
    leagueText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginTop: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#666',
    },
    section: {
      marginTop: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: '#333',
    },
    languageButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    languageButton: {
      paddingVertical: 26,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: '#F5F5F5',
      flex: 1,
      alignItems: 'center',
    },
    selectedLanguage: {
      backgroundColor: '#4C4469',
    },
    languageText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    selectedLanguageText: {
      color: 'white',
    },
    rewardCard: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    rewardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    rewardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rewardContent: {
      flex: 1,
    },
    rewardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    rewardDescription: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: '#E0E0E0',
      borderRadius: 3,
    },
    progressFill: {
      height: '100%',
      backgroundColor:"#4C4469",
      borderRadius: 3,
    },
    xpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingBottom: 16,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
    },
    progressSection: {
      gap: 12,
      marginBottom: 24,
    },
    progressCard: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      elevation: 2,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    progressSubtitle: {
      fontSize: 14,
      color: '#666',
    },
    chartSection: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    chart: {
      borderRadius: 12,
    },
    quizSection: {
      marginBottom: 24,
    },
    quizStats: {
      flexDirection: 'row',
      gap: 16,
    },
    statsCard: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    statsValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    statsLabel: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
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
  
  export default styles;