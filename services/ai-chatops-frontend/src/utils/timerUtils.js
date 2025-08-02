// Timer management utilities for AI ChatOps
class TimerManager {
  constructor() {
    this.timeouts = new Set()
    this.intervals = new Set()
  }

  safeSetTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(timeoutId)
      callback()
    }, delay)
    this.timeouts.add(timeoutId)
    return timeoutId
  }

  safeSetInterval(callback, delay) {
    const intervalId = setInterval(callback, delay)
    this.intervals.add(intervalId)
    return intervalId
  }

  safeClearTimeout(timeoutId) {
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(timeoutId)
    }
  }

  safeClearInterval(intervalId) {
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete(intervalId)
    }
  }

  clearAllTimers() {
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId)
    })
    this.timeouts.clear()

    // Clear all intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId)
    })
    this.intervals.clear()
  }

  getActiveTimerCount() {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      total: this.timeouts.size + this.intervals.size
    }
  }
}

// Mixin for Vue components
export const timerMixin = {
  data() {
    return {
      timerManager: new TimerManager()
    }
  },

  beforeDestroy() {
    this.timerManager.clearAllTimers()
  },

  beforeUnmount() {
    // Vue 3 lifecycle hook
    this.timerManager.clearAllTimers()
  }
}

// Utility functions
export const timerUtils = {
  // Debounce function
  debounce(func, wait, immediate = false) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Delay function that returns a promise
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // Animation frame utilities
  requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback)
  },

  cancelAnimationFrame(id) {
    return window.cancelAnimationFrame(id)
  },

  // High precision timing
  now() {
    return performance.now()
  },

  // Format duration
  formatDuration(ms) {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    } else if (ms < 60000) {
      return `${Math.round(ms / 1000 * 10) / 10}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = Math.round((ms % 60000) / 1000)
      return `${minutes}m ${seconds}s`
    }
  }
}

export default TimerManager