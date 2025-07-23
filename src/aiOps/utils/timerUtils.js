// Timer utility functions for safe timer management
export class TimerManager {
  constructor() {
    this.activeTimers = new Set();
    this.activeIntervals = new Set();
  }

  safeSetTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      this.activeTimers.delete(timerId);
      if (typeof callback === 'function') {
        callback();
      }
    }, delay);
    this.activeTimers.add(timerId);
    return timerId;
  }

  safeSetInterval(callback, interval) {
    const intervalId = setInterval(() => {
      if (typeof callback === 'function') {
        callback();
      }
    }, interval);
    this.activeIntervals.add(intervalId);
    return intervalId;
  }

  safeClearTimeout(timerId) {
    if (timerId && this.activeTimers.has(timerId)) {
      clearTimeout(timerId);
      this.activeTimers.delete(timerId);
    }
  }

  safeClearInterval(intervalId) {
    if (intervalId && this.activeIntervals.has(intervalId)) {
      clearInterval(intervalId);
      this.activeIntervals.delete(intervalId);
    }
  }

  clearAllTimers() {
    this.activeTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.activeTimers.clear();

    this.activeIntervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.activeIntervals.clear();
  }

  destroy() {
    this.clearAllTimers();
  }
}

// Mixin for Vue components
export const timerMixin = {
  data() {
    return {
      timerManager: new TimerManager()
    };
  },

  methods: {
    safeSetTimeout(callback, delay) {
      return this.timerManager.safeSetTimeout(callback, delay);
    },

    safeSetInterval(callback, interval) {
      return this.timerManager.safeSetInterval(callback, interval);
    },

    safeClearTimeout(timerId) {
      this.timerManager.safeClearTimeout(timerId);
    },

    safeClearInterval(intervalId) {
      this.timerManager.safeClearInterval(intervalId);
    }
  },

  beforeDestroy() {
    if (this.timerManager) {
      this.timerManager.destroy();
    }
  },

  // Vue 3 compatibility
  beforeUnmount() {
    if (this.timerManager) {
      this.timerManager.destroy();
    }
  }
};