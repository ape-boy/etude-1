<template>
  <span :class="['lucide-icon', { 'lucide-icon--interactive': interactive }]" :style="{
    width: size + 'px',
    height: size + 'px',
    color: fill,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  }" v-html="iconSvg"></span>
</template>

<script>
export default {
  name: 'LucideIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    fill: {
      type: String,
      default: 'currentColor'
    },
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    interactive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      svgCache: new Map(),
      safePersonaIcons: [
        'robot', 'brain', 'cpu', 'database', 'shield', 'terminal',
        'compass', 'briefcase', 'target', 'lightbulb', 'award', 'gem',
        'users', 'user', 'settings', 'home', 'star', 'heart',
        'rocket', 'code', 'message-circle', 'check', 'copy', 'info',
        'palette', 'camera', 'music', 'book', 'gamepad-2', 'wrench',
        'mail', 'phone', 'edit', 'trash', 'send', 'layers',
        'refresh-cw', 'sparkles', 'zap', 'check-circle', 'alert-triangle',
        'wand-sparkles', 'grid', 'arrow-up-right'
      ]
    };
  },
  computed: {
    size() {
      return Number(this.width || this.height || 24);
    },
    iconSvg() {
      const iconName = this.name;
      return this.loadSvgContent(iconName);
    }
  },
  methods: {
    getPersonaIcon(description = '', title = '') {
      const seed = (description + title).length || 1;
      const index = seed % this.safePersonaIcons.length;
      return this.safePersonaIcons[index];
    },

    loadSvgContent(iconName) {
      if (this.svgCache.has(iconName)) {
        return this.processIconSvg(this.svgCache.get(iconName));
      }

      const hardcodedIcon = this.getHardcodedIcon(iconName);
      if (hardcodedIcon) {
        this.svgCache.set(iconName, hardcodedIcon);
        return hardcodedIcon;
      }

      return this.getFallbackIcon();
    },

    processIconSvg(svgContent) {
      return svgContent
        .replace(/width="[^"]*"/g, `width="${this.size}"`)
        .replace(/height="[^"]*"/g, `height="${this.size}"`)
        .replace(/stroke="[^"]*"/g, `stroke="${this.fill}"`)
        .replace(/fill="currentColor"/g, `fill="${this.fill}"`)
        .replace(/stroke-width="[^"]*"/g, 'stroke-width="2"'); // 일관된 stroke-width 설정
    },

    getHardcodedIcon(iconName) {
      const essentialIcons = {
        'x': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,

        'heart': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`,

        'message-circle': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,

        'minus': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`,

        'maximize-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,

        'minimize-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,14 10,14 10,20"/><polyline points="20,10 14,10 14,4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,

        'chevron-right': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"/></svg>`,

        'arrow-left': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>`,

        'user': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,

        'users': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,

        'settings': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,

        'star': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,

        'home': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,

        'briefcase': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,

        'brain': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3 4 4 0 0 0-6 6 4 4 0 0 0-1.5 8.2A4 4 0 0 0 2 20c.3 0 .6 0 .9-.1A3 3 0 0 0 6 22h12a3 3 0 0 0 3.1-2.1c.3.1.6.1.9.1a4 4 0 0 0 .5-1.8A4 4 0 0 0 21 11a4 4 0 0 0-6-6 3 3 0 0 0-3-3Z"/></svg>`,

        'robot': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4h-4"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M2 14h2"/><path d="M20 14h2"/></svg>`,

        'rocket': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,

        'cpu': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/></svg>`,

        'database': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>`,

        'shield': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,

        'terminal': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,17 10,11 4,5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,

        'code': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,

        'compass': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>`,

        'target': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,

        'lightbulb': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,

        'award': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,

        'gem': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`,

        'mail': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,

        'phone': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,

        'check': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>`,

        'copy': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,

        'trash': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,

        'send-horizontal': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l17-8.5a.5.5 0 0 0 0-.895z"/><path d="M6 12h16"/></svg>`,

        'send': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>`,

        'message-square-plus': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>`,

        'layers': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>`,

        'refresh-cw': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,

        'sparkles': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l0 0a2 2 0 0 0-1.437 1.437l0 0a2 2 0 0 0 1.437 1.437l0 0a2 2 0 0 0 1.437-1.437Z"/><path d="M14.5 8.5a2 2 0 0 0-1.437-1.437l0 0A2 2 0 0 0 11.626 8.5l0 0a2 2 0 0 0 1.437 1.437l0 0A2 2 0 0 0 14.5 8.5Z"/><path d="M15.5 4.5a1 1 0 0 0-.7-.7l0 0a1 1 0 0 0-.7.7l0 0a1 1 0 0 0 .7.7l0 0a1 1 0 0 0 .7-.7Z"/><path d="M19.5 8.5a1 1 0 0 0-.7-.7l0 0a1 1 0 0 0-.7.7l0 0a1 1 0 0 0 .7.7l0 0a1 1 0 0 0 .7-.7Z"/></svg>`,

        'wand-sparkles': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2l-1 1-1-1v2l1 1 1-1z"/><path d="M22 6V4l-1 1-1-1v2l1 1 1-1z"/><path d="M8.5 8.5 16 16"/><path d="M4 4 2 6l14 14 2-2L4 4z"/><path d="M10.5 2.5 13 5l-2.5 2.5L8 5l2.5-2.5z"/></svg>`,

        'zap': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>`,

        'info': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,

        'check-circle': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`,

        'alert-triangle': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

        'edit': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`,

        'palette': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,

        'camera': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,

        'music': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,

        'book': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,

        'gamepad-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>`,

        'grid': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,

        'wrench': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,

        'arrow-up-right': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7,7 17,7 17,17"/></svg>`,

        'home-heart': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M16 13.5c0-1.5-1-2.5-2.5-2.5S11 12 11 13.5c0 1 .5 2 1 2.5l1.5 1.5 1.5-1.5c.5-.5 1-1.5 1-2.5z"/></svg>`,

        'message-square-heart': `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M14.8 9c-.2-.7-.8-1-1.3-1s-1.1.3-1.3 1c-.2-.7-.8-1-1.3-1s-1.1.3-1.3 1a2 2 0 0 0 1.3 1.8L12 12l1.1-1.2A2 2 0 0 0 14.8 9z"/></svg>`
      };

      return essentialIcons[iconName];
    },

    getFallbackIcon() {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}" viewBox="0 0 24 24" fill="none" stroke="${this.fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
    }
  }
};
</script>

<style scoped>
.lucide-icon {
  line-height: 1 !important;
  vertical-align: middle !important;
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
  will-change: transform !important;
  font-family: var(--font-family) !important;
  overflow: hidden !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.lucide-icon svg {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  shape-rendering: geometricPrecision !important;
  text-rendering: optimizeLegibility !important;
  font-family: inherit !important;
  overflow: visible !important;
  stroke-width: 2 !important;
  fill: none !important;
  stroke: currentColor !important;
}

.lucide-icon {
  transition: all 0.15s ease-out;
}

.lucide-icon--interactive {
  cursor: pointer;
}

.lucide-icon--interactive:hover {
  transform: translateZ(0) scale(1.1);
}

.lucide-icon--interactive:active {
  transform: translateZ(0) scale(0.95);
}
</style>