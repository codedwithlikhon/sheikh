# CodeAct AI Agent - Web Interface Integrations

This document describes the comprehensive web interface for interacting with GitHub, GitLab, Slack, and other integrations in the CodeAct AI Agent.

## 🚀 Features Overview

### Landing Page
The landing page provides a centralized hub where users can:
- **Select Repository**: Choose from GitHub, GitLab, or Bitbucket repositories
- **Launch New Conversations**: Start AI conversations without connecting a repository
- **View Suggested Tasks**: See AI-powered task recommendations
- **Access Recent Conversations**: Quick access to previous sessions

### GitHub Integration
Full-featured GitHub repository integration with:
- **File Explorer**: Browse repository files and directories
- **Issues Management**: View, filter, and interact with GitHub issues
- **Pull Requests**: Monitor and manage pull requests
- **Commit History**: Track recent commits and changes
- **Branch Management**: View and switch between branches
- **Repository Stats**: Stars, forks, and watchers

### GitLab Integration
Comprehensive GitLab repository support including:
- **File Management**: Navigate repository structure
- **Issues & Merge Requests**: Handle GitLab-specific workflows
- **Pipeline Monitoring**: Track CI/CD pipeline status
- **Branch Protection**: View protected and default branches
- **Project Statistics**: Contributors and activity metrics

### Slack Integration (Beta)
Real-time collaboration features:
- **Channel Management**: Browse and switch between channels
- **Direct Messages**: Private conversations
- **Message History**: View conversation threads
- **Bot Interactions**: AI assistant integration
- **Reactions & Attachments**: Full Slack feature support

### Event Tracking System
Comprehensive lifecycle event monitoring:
- **Message Events**: Assistant message streaming
- **Tool Call Events**: Function call lifecycle tracking
- **State Management Events**: Agent state updates
- **Step Tracking**: Run and step progress monitoring
- **Error Handling**: Error event capture and display
- **Real-time Updates**: Live event streaming

### Suggested Tasks
AI-powered task recommendations:
- **Smart Filtering**: Filter by difficulty, category, and priority
- **Task Management**: Start, complete, and track tasks
- **Progress Tracking**: Visual progress indicators
- **Tag System**: Categorize and organize tasks
- **Search Functionality**: Find specific tasks quickly

### Recent Conversations
Session management and history:
- **Session Overview**: Title, status, and latest message
- **Status Filtering**: Active, completed, and archived sessions
- **Sorting Options**: Latest, oldest, title, and unread first
- **Favorites**: Mark important conversations
- **Quick Actions**: Delete and manage sessions

## 🛠 Technical Implementation

### Component Architecture
```
src/components/
├── LandingPage.jsx           # Main landing page
├── GitHubIntegration.jsx     # GitHub repository integration
├── GitLabIntegration.jsx     # GitLab repository integration
├── SlackIntegration.jsx      # Slack workspace integration
├── EventTracker.jsx          # Event monitoring system
├── SuggestedTasks.jsx        # Task recommendation system
├── RecentConversations.jsx   # Session management
└── ...existing components
```

### State Management
The main App component manages:
- **View State**: Current active view (landing, workspace, github, gitlab)
- **Repository State**: Selected repository information
- **Session State**: Active sessions and conversation history
- **Integration State**: Toggle states for various integrations
- **Event State**: Real-time event tracking

### API Integration
All components integrate with the backend API:
- **Session Management**: `/api/v1/sessions`
- **Repository Data**: Provider-specific API endpoints
- **Event Streaming**: WebSocket connections
- **Tool Invocation**: MCP server integration

## 🎨 User Interface

### Design System
- **Color Scheme**: Dark theme with purple/blue accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Icons**: Lucide React icon library
- **Layout**: Responsive grid system with sidebar navigation
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Desktop**: Full sidebar with multiple panels
- **Tablet**: Collapsible sidebar with touch-friendly controls
- **Mobile**: Stacked layout with bottom navigation

## 🔧 Configuration

### Environment Variables
```bash
# GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_ORG=your_organization

# GitLab Integration
GITLAB_TOKEN=your_gitlab_token
GITLAB_URL=https://gitlab.com

# Slack Integration
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret
```

### API Endpoints
The interface connects to these backend endpoints:
- `PUT /api/v1/sessions` - Create new session
- `GET /api/v1/sessions` - List all sessions
- `GET /api/v1/sessions/{id}` - Get session details
- `POST /api/v1/sessions/{id}/chat` - Send message
- `DELETE /api/v1/sessions/{id}` - Delete session

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Configure Integrations**
   - Set up GitHub/GitLab tokens
   - Configure Slack workspace
   - Enable desired MCP servers

4. **Access the Interface**
   - Open browser to `http://localhost:3000`
   - Start with the landing page
   - Connect your repositories
   - Begin AI-assisted development

## 📱 Usage Guide

### Connecting Repositories
1. Navigate to the landing page
2. Select your preferred provider (GitHub/GitLab/Bitbucket)
3. Enter repository URL
4. Click "Connect Repository"
5. Access repository features in the sidebar

### Starting Conversations
1. Click "New Conversation" on landing page
2. Or use the "Chat" button in the workspace
3. Type your message and press Enter
4. Watch real-time AI responses

### Managing Tasks
1. Open "Tasks" panel from sidebar
2. Browse suggested tasks
3. Filter by difficulty or category
4. Click "Start Task" to begin
5. Track progress in real-time

### Monitoring Events
1. Open "Events" panel from sidebar
2. View real-time event stream
3. Filter by event type
4. Click events for detailed information

## 🔮 Future Enhancements

- **Bitbucket Integration**: Full Atlassian Bitbucket support
- **Advanced Analytics**: Usage statistics and insights
- **Custom Workflows**: User-defined automation rules
- **Team Collaboration**: Multi-user session sharing
- **Mobile App**: Native mobile application
- **Plugin System**: Third-party integration support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

