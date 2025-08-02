# AI ChatOps Weekly Report Extension

VSCode extension for AI-powered weekly report generation with automated git integration and workspace management.

## Overview

The AI ChatOps Weekly Report Extension is a lightweight VSCode extension that enables developers to generate AI-powered weekly reports directly within their development environment. It integrates with git to extract user information and provides seamless report generation and feedback capabilities.

## Features

### 📋 Weekly Report Generation
- AI-powered weekly report creation
- Git integration for automatic user identification
- Feedback system for report refinement
- Automatic report saving to workspace

### 🔄 Report Management
- Generate new reports or refine existing ones
- Interactive feedback processing
- Workspace-based report storage
- Automatic file organization by date/time

### ⚙️ Simple Configuration
- Minimal setup required
- API endpoint configuration
- Optional authentication token support
- Workspace-aware report storage

## Installation

### From VSIX Package
1. Download the latest `.vsix` file
2. Open VSCode
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file

### From Source
```bash
# Navigate to extension directory
cd services/ai-chatops-vscode-extension

# Install dependencies
npm install

# Compile extension
npm run compile

# Package extension (optional)
npm run package
```

## Configuration

Open VSCode settings and configure:

```json
{
  "aiChatOps.apiUrl": "http://localhost:3005",
  "aiChatOps.authToken": ""
}
```

### Configuration Options

- **apiUrl**: Base URL for the AI ChatOps backend API (default: `http://localhost:3005`)
- **authToken**: Authentication token for API access (optional)

## Usage

### Quick Start
1. Install and configure the extension
2. Open a workspace folder in VSCode
3. Open Command Palette (`Ctrl+Shift+P`)
4. Run "AI ChatOps: Generate Weekly Report"

### Available Commands

- **AI ChatOps: Generate Weekly Report** - Generate a new weekly report or provide feedback on existing one
- **View → AI ChatOps Reports** - Access the Weekly Reports panel in the sidebar

### Report Generation Process

1. **New Report Generation**:
   - Extension extracts user ID from git configuration
   - Sends request to AI ChatOps backend
   - Automatically saves generated report to workspace
   - Opens report file for review

2. **Feedback Processing**:
   - If a report already exists, choose "Provide Feedback"
   - Enter your feedback or modification requests
   - AI processes feedback and updates the report
   - Updated report is automatically saved

### File Organization

Reports are saved to your workspace in the following structure:
```
your-workspace/
└── ai_chatops/
    └── weekly_reports/
        ├── weekly_report_250801_1430.md
        ├── weekly_report_250808_1445.md
        └── ...
```

## Development

### Project Structure
```
src/
├── extension.js          # Main extension entry point
├── apiService.js         # API communication service
├── gitUtils.js           # Git integration utilities
└── logger.js             # Logging utilities
```

### Building from Source
```bash
# Install dependencies
npm install

# Compile for development
npm run compile:dev

# Compile for production
npm run compile

# Watch for changes during development
npm run watch

# Package extension
npm run package
```

### API Integration

The extension communicates with the AI ChatOps backend through:

- **POST /message-async** - Weekly report generation endpoint
- Expects user ID from git configuration
- Supports feedback processing for iterative report improvement

## Troubleshooting

### Common Issues

1. **Git Configuration Not Found**
   - Ensure git is installed and configured
   - Run `git config --global user.name "Your Name"`
   - Run `git config --global user.email "your.email@company.com"`

2. **API Connection Failed**
   - Verify backend service is running on configured port
   - Check API URL in settings
   - Verify network connectivity

3. **Report Save Failed**
   - Ensure workspace folder is open in VSCode
   - Check file system permissions
   - Verify adequate disk space

4. **Extension Not Loading**
   - Check VSCode version compatibility (>=1.74.0)
   - Verify extension installation
   - Check Output panel for error messages

## Requirements

- VSCode >= 1.74.0
- Node.js >= 18.0.0 (for development)
- Git configuration with user.name and user.email
- AI ChatOps backend service running

## License

This project is part of the AI ChatOps system and follows the main project's licensing terms.

## Support

For support and questions:
- Check the troubleshooting section above
- Review VSCode's Output panel for detailed error messages
- Ensure proper git and API configuration