// Environment configuration for different environments
// You can expand this with more environments as needed

const ENV = {
    dev: {
      // For local development
      apiUrl: "http://172.20.10.14:3001",
      socketUrl: "http://172.20.10.14:3001",
      enableLogging: true,
    },
    staging: {
      // For testing on a deployed server
      apiUrl: "https://your-staging-server.com",
      socketUrl: "https://your-staging-server.com",
      enableLogging: true,
    },
    prod: {
      // For production
      apiUrl: "https://your-production-server.com",
      socketUrl: "https://your-production-server.com",
      enableLogging: false,
    },
  }
  
  // Default to dev environment
  const getEnvVars = (env = "dev") => {
    // For release builds, use prod config
    if (env === "prod") {
      return ENV.prod
    }
  
    // For staging builds
    if (env === "staging") {
      return ENV.staging
    }
  
    // Default to dev
    return ENV.dev
  }
  
  // Export the environment variables
  export default getEnvVars()
  
  