// Simple i18n implementation for the AI ChatOps frontend
const translations = {
  ko: {
    // Common
    back: '뒤로',
    cancel: '취소',
    confirm: '확인',
    ok: '확인',
    yes: '예',
    no: '아니오',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    online: '온라인',
    offline: '오프라인',

    // Chat
    aiChatOpsTitle: 'AI ChatOps',
    welcomeTitle: '안녕하세요! 👋',
    welcomeMessage: '어떤 도움이 필요하신가요? 카테고리를 선택해주세요.',
    noPersonaSelected: '페르소나를 선택해주세요',
    noPersonaDesc: '대화를 시작하려면 먼저 페르소나를 선택해야 합니다.',
    selectPersonaDesc: '대화할 페르소나를 선택해주세요',
    
    // Categories
    personalCategory: '개인',
    personalCategoryDesc: '개인적인 업무와 생산성 도구',
    generalCategory: '일반',
    generalCategoryDesc: '일반적인 질문과 도움',
    operationCategory: '운영',
    operationCategoryDesc: '시스템 운영 및 관리',
    systemAdminCategory: '시스템 관리',

    // Personas
    loadingPersonas: '페르소나를 불러오는 중...',
    noPersonas: '사용 가능한 페르소나가 없습니다',
    noPersonasDesc: '현재 이 카테고리에는 사용 가능한 페르소나가 없습니다.',
    goHome: '홈으로 가기',
    defaultPersonaDesc: 'AI 어시스턴트',

    // Chat interface
    loadingHistory: '대화 기록을 불러오는 중...',
    welcomeTip: '무엇을 도와드릴까요?',
    
    // Feedback
    sendFeedback: '피드백 보내기',
    feedbackTitle: '피드백',
    feedbackDescription: '서비스 개선을 위한 의견을 보내주세요.',
    feedbackType: '피드백 유형',
    feedbackMessage: '메시지',
    feedbackPlaceholder: '의견을 입력해주세요...',
    suggestion: '제안',
    bug: '버그 신고',
    feature: '기능 요청',

    // Messages
    aiError: 'AI 응답 중 오류가 발생했습니다.',
    networkError: '네트워크 연결을 확인해주세요.',
    
    // Toast messages
    messageCopied: '메시지가 복사되었습니다',
    copyFailed: '복사에 실패했습니다'
  },

  en: {
    // Common
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    online: 'Online',
    offline: 'Offline',

    // Chat
    aiChatOpsTitle: 'AI ChatOps',
    welcomeTitle: 'Hello! 👋',
    welcomeMessage: 'How can I help you? Please select a category.',
    noPersonaSelected: 'Please select a persona',
    noPersonaDesc: 'You need to select a persona first to start chatting.',
    selectPersonaDesc: 'Please select a persona to chat with',
    
    // Categories
    personalCategory: 'Personal',
    personalCategoryDesc: 'Personal tasks and productivity tools',
    generalCategory: 'General',
    generalCategoryDesc: 'General questions and assistance',
    operationCategory: 'Operations',
    operationCategoryDesc: 'System operations and management',
    systemAdminCategory: 'System Admin',

    // Personas
    loadingPersonas: 'Loading personas...',
    noPersonas: 'No personas available',
    noPersonasDesc: 'There are no available personas in this category.',
    goHome: 'Go Home',
    defaultPersonaDesc: 'AI Assistant',

    // Chat interface
    loadingHistory: 'Loading chat history...',
    welcomeTip: 'How can I assist you?',
    
    // Feedback
    sendFeedback: 'Send Feedback',
    feedbackTitle: 'Feedback',
    feedbackDescription: 'Please share your thoughts to help us improve.',
    feedbackType: 'Feedback Type',
    feedbackMessage: 'Message',
    feedbackPlaceholder: 'Please enter your feedback...',
    suggestion: 'Suggestion',
    bug: 'Bug Report',
    feature: 'Feature Request',

    // Messages
    aiError: 'An error occurred while processing AI response.',
    networkError: 'Please check your network connection.',
    
    // Toast messages
    messageCopied: 'Message copied to clipboard',
    copyFailed: 'Failed to copy message'
  }
}

// Get translated text
export function getText(lang, key, params = {}) {
  const translation = translations[lang] || translations['ko']
  let text = translation[key] || key
  
  // Replace parameters in the text
  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`{${param}}`, 'g'), params[param])
  })
  
  return text
}

// Get available languages
export function getAvailableLanguages() {
  return Object.keys(translations)
}

// Check if language is supported
export function isLanguageSupported(lang) {
  return translations.hasOwnProperty(lang)
}

export default {
  getText,
  getAvailableLanguages,
  isLanguageSupported
}