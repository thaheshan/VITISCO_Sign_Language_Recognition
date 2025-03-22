// NodeDestinations.js
// This file maps node indices to their respective navigation destinations

/**
 * Returns the destination screen name for a given node index
 * @param {number} nodeIndex - The index of the node (0-based)
 * @returns {string} The navigation destination screen name
 */
export function getNodeDestination(nodeIndex) {
    // Map of node indices to their destinations
    const destinations = {
      0: 'AtoD',      // Node 1
      1: 'Quiz1',     // Node 2
      2: 'EtoH',      // Node 3
      3: 'Quiz2',     // Node 4
      4: 'ItoL',      // Node 5
      5: 'Quiz3',     // Node 6
      6: 'MtoP',      // Node 7
      7: 'Quiz4',     // Node 8
      8: 'QtoT',      // Node 9
      9: 'Quiz5',     // Node 10
      10: 'UtoZ',     // Node 11
      11: 'Quiz6'     // Node 12
    };
    
    // Return the destination for the given node index, or a default if not found
    return destinations[nodeIndex] || "LearningHomeScreen";
  }
  
  /**
   * Returns the theme information for a specific node
   * @param {number} nodeIndex - The index of the node (0-based)
   * @returns {Object} Object containing theme information like color, icon, etc.
   */
  export function getNodeTheme(nodeIndex) {
    // These match the nodeThemes defined in the LearningPathwayScreen
    const nodeThemes = [
      { icon: 'school', color: '#4e54c8', name: 'Literacy' },
      { icon: 'calculate', color: '#8a2be2', name: 'Numeracy' },
      { icon: 'science', color: '#20b2aa', name: 'Science' },
      { icon: 'music-note', color: '#ff8c00', name: 'Arts' },
      { icon: 'psychology', color: '#e91e63', name: 'Social' },
      { icon: 'extension', color: '#8bc34a', name: 'Challenge' }
    ];
    
    // Return the theme based on the node index (using modulo to cycle through themes)
    return nodeThemes[nodeIndex % nodeThemes.length];
  }
  
  /**
   * Returns whether a given node is a milestone node
   * @param {number} nodeIndex - The index of the node (0-based)
   * @returns {boolean} True if the node is a milestone node
   */
  export function isMilestoneNode(nodeIndex) {
    // This matches the milestoneNodes array in the LearningPathwayScreen
    const milestoneNodes = [3, 7, 11];
    return milestoneNodes.includes(nodeIndex);
  }
  
  /**
   * Returns the description for a specific node
   * @param {number} nodeIndex - The index of the node (0-based)
   * @returns {string} Description of the node content
   */
  export function getNodeDescription(nodeIndex) {
    const descriptions = {
      0: "Letters A to D - Basic Introduction",
      1: "Quiz 1 - Test your knowledge of A-D",
      2: "Letters E to H - Expanding Vocabulary",
      3: "Quiz 2 - Test your knowledge of E-H",
      4: "Letters I to L - Intermediate Learning",
      5: "Quiz 3 - Test your knowledge of I-L",
      6: "Letters M to P - Progressive Learning",
      7: "Quiz 4 - Test your knowledge of M-P",
      8: "Letters Q to T - Advanced Concepts",
      9: "Quiz 5 - Test your knowledge of Q-T",
      10: "Letters U to Z - Completing the Alphabet",
      11: "Quiz 6 - Final Comprehensive Test"
    };
    
    return descriptions[nodeIndex] || "Learning journey continues";
  }
  
  /**
   * Returns whether a node is a quiz node
   * @param {number} nodeIndex - The index of the node (0-based)
   * @returns {boolean} True if the node is a quiz node
   */
  export function isQuizNode(nodeIndex) {
    // Quiz nodes are at odd indices (1, 3, 5, 7, 9, 11)
    return nodeIndex % 2 === 1;
  }

  ``