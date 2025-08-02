# AI ChatOps Admin Service

Vue.js-based administrative interface for managing AI ChatOps personas, system prompts, and conversation analytics.

## Overview

The AI ChatOps Admin Service provides a comprehensive web-based interface for system administrators to manage AI personas, configure system prompts, monitor conversation analytics, and maintain the overall ChatOps system. Built with Vue.js 3 and modern web technologies.

## Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite 4.4.5
- **HTTP Client**: Axios 1.6.0
- **Routing**: Vue Router 4.5.1
- **UI Components**: Custom component library with responsive design
- **Styling**: CSS with custom properties and scoped styles
- **Charts**: Chart.js 4.4.0 for analytics visualization
- **Testing**: Playwright for E2E testing

## Features

### 🎭 Persona Management
- Create, edit, and delete AI personas
- Category-based organization (Personal, General, Operations)
- System prompt configuration and testing
- Real-time persona status management
- Bulk operations for persona management

### 📊 Analytics Dashboard
- Real-time conversation statistics
- Usage trends and performance metrics
- Interactive charts and data visualization
- Export capabilities for reports
- Historical data analysis

### 🔧 System Administration
- Configuration management interface
- Health monitoring and system status
- User access and permissions management
- System maintenance tools and utilities
- Automated reporting and alerts

### 📈 Reporting System
- Weekly/monthly usage reports
- Performance analysis and insights
- Custom report generation
- Data export in multiple formats
- Scheduled report automation

## Project Structure

```
src/
├── main.js                     # Application entry point
├── App.vue                     # Root component
├── router/
│   └── index.js               # Vue Router configuration
├── views/
│   ├── AdminDashboard.vue     # Main dashboard view
│   ├── PersonaManagement.vue  # Persona CRUD interface
│   ├── SystemPrompts.vue      # System prompt management
│   ├── ConversationStats.vue  # Analytics and statistics
│   └── SystemSettings.vue     # System configuration
├── components/
│   ├── PersonaEditor.vue      # Persona creation/editing modal
│   ├── PromptTester.vue       # System prompt testing tool
│   ├── StatsChart.vue         # Chart visualization component
│   ├── DataTable.vue          # Reusable data table component
│   └── StatusIndicator.vue    # System status display
├── services/
│   └── adminService.js        # Admin API communication service
├── utils/
│   ├── chartConfig.js         # Chart.js configuration utilities
│   ├── dataExport.js          # Data export functionality
│   └── validation.js          # Form validation utilities
└── styles/
    ├── main.css              # Main stylesheet
    ├── admin.css             # Admin-specific styles
    ├── components.css        # Component styles
    └── variables.css         # CSS custom properties
```

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- AI ChatOps Backend Service running on port 3005

### Development Setup
```bash
# Navigate to the service directory
cd services/ai-chatops-admin

# Install dependencies
npm install

# Start development server
npm run dev

# The application will be available at http://localhost:3002
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
  port: 3002,
  proxy: {
    '/admin': {
      target: 'http://localhost:3005',
      changeOrigin: true
    }
  }
}
```

### API Configuration
The service expects the backend API to be available at:
- Development: `http://localhost:3005`
- Admin API Endpoints: `/admin/*`

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## API Integration

The admin service communicates with the backend through REST APIs:

### Persona Management APIs
- `GET /admin/personas` - Fetch all personas
- `POST /admin/personas` - Create new persona
- `PUT /admin/personas/{code}` - Update existing persona
- `DELETE /admin/personas/{code}` - Delete persona
- `POST /admin/system-prompt/test` - Test system prompts

### Analytics APIs
- `GET /admin/conversations/stats` - Get conversation statistics
- `GET /admin/usage/trends` - Get usage trend data
- `GET /admin/performance/metrics` - Get performance metrics

### System Management APIs
- `GET /admin/health` - System health check
- `GET /admin/config` - Get system configuration
- `PUT /admin/config` - Update system configuration

## Service Layer

The `adminService.js` provides:
- Comprehensive API communication
- Error handling and retry logic
- Mock data fallbacks for development
- Request/response transformation
- Automatic token management

Example usage:
```javascript
import adminService from '@services/adminService.js'

// Fetch personas with error handling
const loadPersonas = async () => {
  try {
    const response = await adminService.getPersonas()
    if (response.success) {
      personas.value = response.data
    }
  } catch (error) {
    console.error('Failed to load personas:', error)
  }
}
```

## Component Architecture

### PersonaManagement.vue
Complete CRUD interface for persona management:
- Modal-based create/edit dialogs
- Real-time validation and testing
- Bulk operations and filtering
- Category-based organization

### AdminDashboard.vue
System overview and quick actions:
- Real-time system status
- Key performance indicators
- Quick access to common tasks
- Recent activity monitoring

### ConversationStats.vue
Analytics and reporting interface:
- Interactive charts and graphs
- Time-based filtering and analysis
- Export functionality
- Trend analysis and insights

## Styling System

### Theme Support
- Professional admin theme with dark/light mode
- Consistent color palette and typography
- Responsive design patterns
- Accessibility-compliant styles

### CSS Architecture
```css
:root {
  --admin-primary: #1e40af;
  --admin-secondary: #0891b2;
  --admin-success: #059669;
  --admin-warning: #d97706;
  --admin-error: #dc2626;
}
```

## Data Management

### State Management
- Component-level reactive state
- Centralized service layer
- Local storage for user preferences
- Real-time data synchronization

### Caching Strategy
- API response caching
- Optimistic UI updates
- Background data refresh
- Memory management

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

Test coverage includes:
- Persona CRUD operations
- System prompt testing
- Analytics data visualization
- User interface interactions

## Security

### Authentication & Authorization
- Token-based authentication
- Role-based access control
- Session management
- API security headers

### Data Protection
- Input validation and sanitization
- XSS and CSRF protection
- Secure API communication
- Audit logging

## Performance

### Optimization Features
- Code splitting and lazy loading
- Component virtualization for large datasets
- Efficient state updates
- Bundle size optimization

### Monitoring
- Performance metrics tracking
- Error reporting and logging
- User interaction analytics
- Resource usage monitoring

## Deployment

### Production Build
```bash
npm run build
```

The build outputs to the `dist/` directory and includes:
- Minified JavaScript and CSS
- Optimized assets and images
- Source maps (configurable)

### Deployment Options
- Static hosting (Nginx, Apache)
- CDN deployment
- Container deployment with Docker
- Integration with CI/CD pipelines

## Browser Support

- Chrome/Chromium >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## Development Guidelines

### Code Style
- Vue 3 Composition API patterns
- TypeScript support (optional)
- ESLint configuration compliance
- Semantic commit messages

### Component Development
- Reusable and focused components
- Proper prop validation
- Event handling best practices
- Accessibility guidelines compliance

### Performance Considerations
- Lazy loading for heavy components
- Efficient data fetching strategies
- Memory leak prevention
- Bundle size optimization

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend service is running on port 3005
   - Check CORS configuration in backend
   - Verify proxy settings in vite.config.js

2. **Authentication Issues**
   - Check token validity and expiration
   - Verify API endpoint configuration
   - Review browser storage permissions

3. **Chart Rendering Problems**
   - Verify Chart.js dependencies
   - Check data format compatibility
   - Review console for JavaScript errors

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
5. Test admin functionality thoroughly

## License

This project is part of the AI ChatOps system and follows the main project's licensing terms.