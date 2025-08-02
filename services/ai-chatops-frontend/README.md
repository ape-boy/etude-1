# AI ChatOps Frontend Service

Vue.js-based frontend application providing the main chat interface for AI-powered operational assistance.

## Overview

The AI ChatOps Frontend Service is a modern, responsive web application built with Vue.js 3 and Vite. It provides users with an intuitive chat interface to interact with AI personas for various operational categories including personal tasks, general assistance, and system operations.

## Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite 4.4.5
- **HTTP Client**: Axios 1.6.0
- **Routing**: Vue Router 4.5.1
- **Icons**: Custom Lucide Icon implementation
- **Styling**: Custom CSS with CSS custom properties
- **Testing**: Playwright for E2E testing

## Features

### 🎭 Multi-Persona Chat System
- Dynamic persona selection by category
- Context-aware conversations with memory
- Real-time message processing with loading states
- Message history caching and management

### 🎨 Modern UI/UX
- Responsive design with mobile support
- Multiple theme support (AI-ChatOps, Heritage, Classic, Retro)
- Multi-language support (Korean/English)
- Smooth animations and transitions

### ⚡ Performance Optimized
- Component-based architecture
- Efficient state management
- Memory management for chat history
- Optimized bundle size

### 🔧 Developer Experience
- Hot module replacement (HMR)
- Modern development tooling
- Comprehensive error handling
- Debugging utilities

## Project Structure

```
src/
├── main.js                 # Application entry point
├── App.vue                 # Root component
├── router/
│   └── index.js           # Vue Router configuration
├── views/
│   └── AIChatOpsLayout.vue # Main chat layout component
├── components/
│   ├── ChatTab.vue        # Chat interface component
│   ├── FeedbackTab.vue    # User feedback component
│   ├── Elements.vue       # Reusable UI elements
│   └── LucideIcon.vue     # Icon component system
├── services/
│   └── aiChatOpsService.js # API communication service
├── utils/
│   ├── i18n.js            # Internationalization utilities
│   └── timerUtils.js      # Timer management utilities
└── styles/
    ├── main.css           # Main stylesheet
    ├── variables.css      # CSS custom properties
    ├── components.css     # Component styles
    ├── utilities.css      # Utility classes
    ├── aiChatOps.css      # Legacy styles
    └── customMarkdown.css # Markdown formatting
```

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Development Setup
```bash
# Navigate to the service directory
cd services/ai-chatops-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The application will be available at http://localhost:3000
```

### Build for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables
Configure the application through Vite's proxy settings in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### API Configuration
The service expects the backend API to be available at:
- Development: `http://localhost:3005`
- API Proxy: `http://localhost:3001` (proxied from port 3000)

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## API Integration

The frontend communicates with the backend through REST APIs:

### Persona Management
- `GET /personas` - Fetch available personas
- `POST /message-async` - Send chat messages
- `GET /health` - Health check endpoint

### Service Layer
The `aiChatOpsService.js` provides:
- Health monitoring
- Persona data fetching
- Message sending with error handling
- Mock data fallbacks for development

## Theming System

### Available Themes
- **AI-ChatOps** (Default): Blue primary colors
- **Heritage**: Purple accent colors  
- **Classic**: Red-based color scheme
- **Retro**: Green nature-inspired palette

### Theme Configuration
Themes are implemented through CSS custom properties and can be dynamically switched:

```css
.theme-ai-chatops {
  --color-primary: #2563eb;
  --color-accent: #0891b2;
}
```

## Internationalization

### Supported Languages
- Korean (ko) - Default
- English (en)

### Usage
```javascript
import { getText } from '@utils/i18n.js'

// Get translated text
const message = getText(this.currentLanguage, 'welcomeTitle')
```

## State Management

### Local State
- Component-level state using Vue 3 reactive data
- Session storage for user preferences
- Memory management for chat history

### Message Caching
- LRU-style cache cleanup
- Configurable message limits per persona
- Automatic cleanup intervals

## Testing

### E2E Testing with Playwright
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# View test report
npm run test:report
```

## Deployment

### Production Build
```bash
npm run build
```

The build outputs to the `dist/` directory and includes:
- Minified JavaScript and CSS
- Optimized assets
- Source maps (in development)

### Deployment Options
- Static hosting (Nginx, Apache)
- CDN deployment
- Container deployment with Docker

## Development Guidelines

### Code Style
- Use Vue 3 Composition API
- Follow ESLint configuration
- Use semantic commit messages
- Write comprehensive comments

### Component Development
- Keep components focused and reusable
- Use proper prop validation
- Implement proper error boundaries
- Follow accessibility guidelines

### Performance Considerations
- Lazy load components when possible
- Optimize bundle size
- Use efficient state updates
- Implement proper cleanup in lifecycle hooks

## Browser Support

- Chrome/Chromium >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend service is running on port 3005
   - Check CORS configuration
   - Verify proxy settings

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Development Server Issues**
   - Check port 3000 availability
   - Verify Vite configuration
   - Clear browser cache

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
5. Test in multiple browsers

## License

This project is part of the AI ChatOps system and follows the main project's licensing terms.