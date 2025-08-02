<!-- Copy of LucideIcon from frontend service -->
<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 24 24`"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap"
    :stroke-linejoin="strokeLinejoin"
    :class="iconClasses"
    v-html="iconSvg"
  ></svg>
</template>

<script>
// Icon map for common icons used in the admin app
const ICON_MAP = {
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-2-2a4 4 0 0 0-4-4h-1"/>',
  'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L10 17H7v-3z"/>',
  'trash': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="m15 18-.722-3.25"/><path d="M2 2l20 20"/><path d="M6.71 6.71C4.25 8.33 2.5 11.75 2.5 12S4.25 15.67 6.71 17.29"/><path d="m10 16 4-4"/><path d="m14 6-.722 3.25"/><path d="M17.29 17.29C19.75 15.67 21.5 12.25 21.5 12S19.75 8.33 17.29 6.71"/>',
  'check': '<polyline points="20,6 9,17 4,12"/>',
  'x': '<path d="M18 6L6 18M6 6l12 12"/>',
  'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  'filter': '<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>',
  'more-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="m12 8h.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'calendar': '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'trending-up': '<polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/>'
}

export default {
  name: 'LucideIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    width: {
      type: [String, Number],
      default: 24
    },
    height: {
      type: [String, Number],
      default: 24
    },
    fill: {
      type: String,
      default: 'none'
    },
    stroke: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [String, Number],
      default: 2
    },
    strokeLinecap: {
      type: String,
      default: 'round'
    },
    strokeLinejoin: {
      type: String,
      default: 'round'
    },
    interactive: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    iconClasses() {
      return {
        'lucide-icon': true,
        'lucide-icon--interactive': this.interactive
      }
    },

    iconSvg() {
      return ICON_MAP[this.name] || ICON_MAP['help-circle'] || '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="m12 17h.01"/>'
    }
  }
}
</script>

<style scoped>
.lucide-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.lucide-icon--interactive {
  cursor: pointer;
  transition: all 0.15s ease;
}

.lucide-icon--interactive:hover {
  transform: scale(1.05);
  opacity: 0.8;
}
</style>