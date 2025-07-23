# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI ChatOps demo application built with Vue.js 3 and Vite. It provides a chat interface with AI-powered personas for different operational categories (personal, general, operation). The application includes both user-facing chat functionality and admin interfaces for managing personas and system prompts.

## Development Commands

From `src/package.json`:
- `npm run dev` - Start development server (runs on port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build
- `npm run mock:serve` - Start mock server
- `npm run test` - Run Playwright tests
- `npm run test:ui` - Run Playwright tests with UI
- `npm run test:report` - Show test report

## Architecture Overview

### Tech Stack
- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Playwright
- **Styling**: CSS with custom properties and scoped styles

### Key Components Structure
- `src/aiOps/AIChatOpsLayout.vue` - Main layout component that orchestrates the entire chat experience
- `src/aiOps/components/` - Reusable UI components (ChatTab, FeedbackTab, Elements, LucideIcon)
- `src/aiOps/service/aiChatOpsService.js` - Central API service layer for all backend communication
- `src/aiOps/utils/` - Utility functions for i18n and timers
- `src/admin/` - Admin interface components for persona and prompt management

### Application Flow
1. **Category Selection**: Users first choose from personal, general, or operation categories
2. **Persona Selection**: Within each category, users select specific AI personas 
3. **Chat Interface**: Interactive chat with selected persona, including message history and quick questions
4. **Admin Functions**: System administration for managing personas, prompts, and viewing analytics

### API Integration
- Base URL: `http://localhost:3001` (proxied from port 3000)
- Backend API expected on port 3005
- Comprehensive error handling with fallback responses
- Session management and conversation history
- Health check monitoring

### State Management
- Local component state using Vue 3 reactive data
- LocalStorage for user preferences (language, theme, sessions)
- Message caching system with LRU-style cleanup
- Real-time processing state tracking

### Key Features
- Multi-language support (Korean/English)
- Multiple themes (AI-ChatOps, Heritage, Classic, Retro)
- Responsive design with mobile support
- Real-time chat with AI personas
- Conversation history and analytics
- System administration interface
- Easter egg features

## Development Notes

- API service includes comprehensive mock fallbacks for development
- Uses Vue 3 Composition API patterns throughout
- Scoped CSS with CSS custom properties for theming
- Extensive error handling and user feedback
- Memory management for chat history and timers