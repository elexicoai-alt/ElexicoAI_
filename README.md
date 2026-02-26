# ElexicoAI - Backend Learning Platform

A professional, high-fidelity React web application for learning backend concepts with an elegant Apple-style design.

## Features

- 🔐 **Password-Protected Access**: Secure entry with access code "2026"
- 📊 **Interactive Slide Presentation**: 8 comprehensive slides covering backend fundamentals
- 🎨 **Apple-Style UI**: Clean white backgrounds, soft gray borders, high-contrast accents
- 🤖 **AI Insights Panel**: Real-time AI chat powered by backend API (OpenAI or smart mock responses)
- 💬 **Interactive Q&A**: Ask questions about each slide and get intelligent responses
- 🔍 **Zoom Controls**: In/out/reset zoom functionality
- 📱 **Fully Responsive**: Mobile-first design with collapsible sidebars
- ✨ **Smooth Animations**: Framer Motion transitions and interactions
- 📄 **Detailed View**: Slide-over modal with deep-dive technical content
- ⬅️➡️ **Easy Navigation**: Arrow controls with slide counter
- 🔌 **Backend API**: Node.js/Express server for AI chat functionality

## Tech Stack

**Frontend:**
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Lucide React** - Beautiful icon set

**Backend:**
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **OpenAI API** - AI chat responses (optional)
- **CORS** - Cross-origin requests

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will start at `http://localhost:5173`

### 3. Login

Enter access code: **2026**

### 4. Build for Production

\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
│   ├── LoginPage.jsx         # Password gate component
│   ├── Dashboard.jsx          # Main layout orchestrator
│   ├── LeftSidebar.jsx        # Slide thumbnail list
│   ├── MainCanvas.jsx         # Active slide display
│   ├── AIInsightsPanel.jsx    # AI summary & chat
│   ├── SlideOverModal.jsx     # Detailed content modal
│   └── NavigationControls.jsx # Prev/Next buttons
├── data/
│   └── slides.js              # Slide content and metadata
├── App.jsx                    # Root component with auth logic
├── main.jsx                   # App entry point
└── index.css                  # Global styles
\`\`\`

## Slide Topics

1. **Introduction to Backend** - The engine room of the web
2. **Server** - High-power computers hosting apps
3. **APIs** - Bridges between software
4. **Database** - Digital filing cabinets
5. **Authentication** - Locks and keys for data
6. **Node.js & Express** - Tools to build the logic
7. **Request-Response Cycle** - The internet's order & delivery
8. **Real-Time Systems** - Live, instant communication

## Key Features Breakdown

### Password Gate (Page 1)
- Centered elegant login card
- Shake animation on incorrect code
- Clean error messaging

### Dashboard (Page 2)
- **Left Sidebar** (250px): Scrollable slide thumbnails
- **Main Canvas** (Center): High-res slide with "View More" button
- **AI Insights** (320px right): Dynamic summaries + chat input

### Interactive Controls
- **Toolbar**: Zoom In/Out, Reset, Export PDF
- **Footer**: Left/Right arrows + "Slide X of 8" counter
- **AI Chat**: Ask questions and get intelligent responses from backend API
- Framer Motion transitions between slides

### Backend API
- **Health Check**: `GET /api/health` - Check API status
- **AI Chat**: `POST /api/chat` - Get AI responses for slide questions
- **Smart Fallbacks**: Works with or without OpenAI API key
- **Connection Status**: Visual indicator shows API connectivity

### Responsive Design
- Desktop: 3-column layout
- Tablet/Mobile: Collapsible hamburger menu
- AI panel opens as drawer on mobile

## Customization

### Change Access Code
Edit the password in [src/App.jsx](src/App.jsx#L9):
\`\`\`javascript
if (code === '2026') // Change '2026' to your code
\`\`\`

### Add/Edit Slides
Modify [src/data/slides.js](src/data/slides.js) - each slide needs:
- `id`, `title`, `summary`
- `thumbnail` and `image` URLs
- `detailedContent` HTML string

### Update Colors
Edit [tailwind.config.js](tailwind.config.js) theme section

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Free to use and modify

## Credits

Built with ❤️ for backend education
Images from Unsplash
