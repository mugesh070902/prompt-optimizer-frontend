# AI Prompt Optimizer - Frontend

A clean, responsive web interface for analyzing and optimizing AI prompts with real-time feedback.

## 📋 Project Overview

This frontend provides:
- **Intuitive Prompt Input**: Text area with character counter (10-5000 chars)
- **Real-time Analysis**: Displays score, issues, and improvements instantly
- **Score Visualization**: Color-coded quality indicator
- **Issue Highlighting**: Lists specific problems with the prompt
- **Improved Prompt**: Shows RTCEO-formatted enhanced version
- **Agent.md Export**: Generates structured Markdown for AI agents
- **History Management**: Browse and manage past analyses
- **Copy to Clipboard**: Easy export of improved prompts

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Server**: Node.js HTTP Server (or any static web server)
- **Communication**: Fetch API with CORS support
- **No Dependencies**: Pure vanilla stack, zero npm packages required*

*Optional: npx http-server for local development

## 📁 Project Structure

```
prompt-optimizer-frontend/
├── index.html              # Main application markup
├── style.css               # Responsive styling
├── script.js               # Business logic & API integration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (for http-server) OR any web server
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Option 1: Using Node.js HTTP Server (Recommended)

1. **Navigate to frontend directory**:
   ```bash
   cd prompt-optimizer-frontend
   ```

2. **Start the server**:
   ```bash
   npx http-server -p 3000
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

### Option 2: Using Python HTTP Server

```bash
cd prompt-optimizer-frontend
python -m http.server 3000
```

### Option 3: Using Live Server Extension (VS Code)

- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

## 📋 Features

### 1. Prompt Analysis
- Enter a prompt (10-5000 characters)
- Click "Analyze Prompt"
- Get instant feedback with scoring

### 2. Quality Score
- **80-100%**: Excellent (Green)
- **60-79%**: Good (Blue)
- **40-59%**: Fair (Amber)
- **0-39%**: Needs Improvement (Red)

### 3. Issue Detection
- Missing context
- No constraints specified
- Missing output format
- Vague language
- Structural problems

### 4. Improved Prompt
- Auto-generated with RTCEO format:
  - **R**ole: Defines the AI's position
  - **T**ask: Clear objective
  - **C**ontext: Background information
  - **E**xpectation: What should be done
  - **O**utput: Format of response

### 5. Agent.md Generation
- Structured framework for AI agents
- Includes Role, Task, Requirements, Constraints, Output
- Copy-ready format for immediate use

### 6. History Browsing
- View all past analyses
- Pagination support (10 items per page)
- Click to view detailed analysis
- Quick delete option

## 🌐 API Configuration

The frontend communicates with the backend at:

**Backend URL**: `http://localhost:8080/api`

To change, edit in `script.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📱 Responsive Design

- Desktop (1200px+): Full-width layout with optimal spacing
- Tablet (768px-1199px): Adjusted columns and padding
- Mobile (< 768px): Single column, touch-optimized buttons

## 🎨 UI Components

### Header
- Title and subtitle
- Branding

### Analyzer Section
- Text input area
- Character counter
- Analyze button with loading spinner

### Results Section
- Quality score circle with percentage
- Color-coded description
- Issues list with warning icons
- Improved prompt display
- Copy button
- Navigation buttons

### History Section
- Statistics (total prompts analyzed)
- Paginated list of past analyses
- View Details button
- Delete button for each entry

### Notification System
- Toast notifications for success/error
- Auto-dismiss after 3 seconds
- Color-coded (green/red/blue)

## 🔄 Data Flow

```
User Input
    ↓
Validation (10-5000 chars)
    ↓
Show Loading State
    ↓
POST /api/analyze
    ↓
Backend Processing
    ↓
Receive JSON Response
    ↓
Parse & Display Results
    ↓
Store in currentAnalysis
```

## 📝 Key Functions

| Function | Purpose |
|----------|---------|
| `handleFormSubmit()` | Process form submission & fetch analysis |
| `displayResults()` | Render analysis on the page |
| `loadAndShowHistory()` | Fetch & display history |
| `copyToClipboard()` | Copy improved prompt to clipboard |
| `showNotification()` | Display toast messages |

## 🌟 Code Highlights

### Safe JSON Parsing
```javascript
async function parseJsonSafe(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}
```

### Error Handling
```javascript
if (!response.ok) {
    const error = await parseJsonSafe(response);
    throw new Error(error?.message || `HTTP ${response.status}`);
}
```

## 🔒 Security

- XSS Prevention: HTML escaping in `escapeHtml()`
- CORS: Handled by backend
- Input Validation: Min/max length checks
- No sensitive data stored locally

## ⚙ Customization

### Change Colors
Edit `style.css`:
```css
--color-primary: #3b82f6;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
```

### Adjust Limits
Edit `script.js`:
```javascript
const NOTIFICATION_TIMEOUT = 3000; // ms
const pageSize = 10; // items per page
```

### Modify Score Levels
Edit `getScoreLevel()` function in `script.js`

## 🐛 Troubleshooting

### "Failed to Fetch" Error
- **Cause**: Backend not running on port 8080
- **Solution**: Start backend: `java -jar target/prompt-optimizer-backend-1.0.0.jar`
- **Alternative**: Opening `file://index.html` directly (need to use http-server)

### CORS Error
- **Cause**: Backend CORS not configured
- **Solution**: Verify `PromptOptimizerApplication.java` has CORS bean

### Blank Page
- **Cause**: JavaScript error
- **Solution**: Check browser console (F12 → Console tab)

## 📊 Performance

- **Page Load**: < 1 second
- **API Response**: ~ 100-500ms
- **Rendering**: Instant
- **History Load**: ~ 200-300ms (paginated)

## ✅ Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (uses ES6+)

## 📚 Learning Resources

- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [JSON Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

## 🚀 Deployment

### Deploy to Static Hosting

#### Netlify
1. Push to GitHub
2. Connect repository to Netlify
3. Set build command: (none)
4. Set publish directory: `./`

#### Vercel
```bash
vercel deploy
```

#### GitHub Pages
1. Push to `gh-pages` branch
2. Enable Pages in repository settings

### Environment Configuration
For production, update API_BASE_URL:
```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## 🔐 Notes for Production

- Enable HTTPS
- Configure CORS properly
- Rate limit API calls
- Add error tracking (Sentry)
- Use environment variables
- Minify CSS/JS
- Add Content Security Policy

## 📝 License

This project is part of the AI Prompt Optimizer suite.

## 📧 Support

For issues or questions, refer to the backend documentation or create an issue in the repository.
