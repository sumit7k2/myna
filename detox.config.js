/** Detox configuration - basic scaffold for Expo app. */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  apps: {
    'ios.debug': {
      type: 'ios.simulator',
      binaryPath: 'bin/Expo.app',
      build: 'echo "Detox build placeholder"',
      device: {
        type: 'iPhone 14'
      }
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    }
  }
};
