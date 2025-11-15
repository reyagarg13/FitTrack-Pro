# 🏃 FitTrack Pro — Personal Fitness & Wellness Dashboard

<div align="center">

![FitTrack Pro](https://img.shields.io/badge/FitTrack-Pro-06b6d4?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern, visually engaging fitness tracking dashboard built with vanilla JavaScript, HTML, and CSS**

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage) • [Structure](#-project-structure) • [Technologies](#-technologies)

</div>

---

## 📖 Overview

FitTrack Pro is a **client-side only** fitness and wellness dashboard that simulates goal tracking, activity logging, meal planning, and insights generation. Built entirely with vanilla JavaScript (ES6+), HTML5, and CSS3, it demonstrates modern web development practices without relying on frameworks or backend services.

### ✨ Highlights

- 🎯 **100% Client-Side** - No backend required, runs entirely in the browser
- 💾 **LocalStorage Persistence** - Data persists across sessions
- 🎨 **Modern UI/UX** - Smooth animations, responsive design, and intuitive interface
- ♿ **Accessible** - ARIA labels, keyboard shortcuts, and focus management
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Performance Optimized** - Fast loading, smooth animations, efficient rendering

---

## 🎯 Features

### Page 1: Daily Wellness Overview (Dashboard)
- 📊 **Visual Progress Tracking**
  - Animated circular progress meters for steps, calories, and water intake
  - Real-time data loaded from JavaScript objects
  - Smooth CSS animations with gradient fills
- ⏰ **Live Clock** - Auto-updating clock showing current time
- 🔄 **Dynamic Updates** - Real-time recalculation based on activities and meals

### Page 2: Activity Log
- 📝 **Activity Management**
  - Pre-loaded sample activities (running, cycling, yoga, etc.)
  - Add new activities with comprehensive form validation
  - Delete activities with one click
- 🔍 **Smart Filtering** - Filter by time of day (Morning/Afternoon/Evening)
- ✅ **Form Validation**
  - Activity name (minimum 2 characters)
  - Duration (1-1440 minutes)
  - Calories (0-10000 kcal)
  - Time of day selection
- 🎨 **Visual Indicators** - Color-coded activities by time of day
- 🎭 **Custom Modal** - Success confirmation with custom overlay

### Page 3: Meal Planner
- 🍽️ **Meal Organization** - Separate tiles for Breakfast, Lunch, and Dinner
- ➕ **Add Meals** - Quick meal entry with name and calories
- ❌ **Remove Meals** - One-click meal deletion
- 🔢 **Live Calorie Tracking** - Automatic daily calorie total calculation
- 📊 **Visual Feedback** - Animated calorie counter with pulse effect
- ✨ **Input Validation** - Ensures valid meal names and calorie values

### Page 4: Insights & Summary
- 📈 **Visual Analytics**
  - Weekly activity minutes bar chart (CSS-based, no libraries)
  - Weekly calorie consumption graph
  - Animated bar transitions with stagger effect
- 📊 **Quick Stats Dashboard**
  - Total activities count
  - Total meals logged
  - Calories burned
  - Calories consumed
- 💾 **Download Summary** - Export all data as JSON file
- 🔄 **Reset Dashboard** - Clear all data with confirmation
- 🖱️ **Interactive Tooltips** - Hover over bars for detailed information

### Additional Features
- 🎹 **Keyboard Shortcuts** - Alt+1/2/3/4 to navigate pages
- 🔔 **Toast Notifications** - Success/error feedback system
- 🎨 **Smooth Transitions** - Page transitions with fade and slide effects
- 📱 **Responsive Navigation** - Active page indicator, live calorie badges
- ♿ **Accessibility** - Keyboard navigation, focus trapping in modals, ARIA labels

---

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local development server (recommended)

### Installation & Running

#### Option 1: Using VS Code Live Server (Recommended)
```bash
1. Open the project folder in VS Code
2. Install the "Live Server" extension
3. Right-click on index.html
4. Select "Open with Live Server"
5. Your browser will open at http://localhost:5500
```

#### Option 2: Using Python HTTP Server
```bash
# Python 3
cd FitTrackPro
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

#### Option 3: Using Node.js http-server
```bash
# Install globally
npm install -g http-server

# Run in project directory
cd FitTrackPro
http-server -p 8000

# Open http://localhost:8000
```

> **⚠️ Important:** Do not open `index.html` directly in the browser using `file://` protocol as ES6 modules won't work properly. Always use a local server.

---

## 💡 Usage

### Navigation
- Click navigation buttons in the header to switch between pages
- Use keyboard shortcuts: **Alt+1** (Dashboard), **Alt+2** (Activity), **Alt+3** (Meals), **Alt+4** (Insights)
- URL hash updates automatically for bookmarking specific pages

### Adding Activities
1. Go to Activity Log page
2. Click "Add Activity" button
3. Fill in the form:
   - Activity name (e.g., "Morning Yoga")
   - Duration in minutes
   - Calories burned
   - Select time of day
4. Click "Add Activity" to save
5. View success confirmation modal

### Managing Meals
1. Navigate to Meal Planner page
2. Choose meal type (Breakfast/Lunch/Dinner)
3. Enter meal name and calories
4. Click "Add" button
5. Watch total calories update automatically
6. Remove meals using the delete button

### Viewing Insights
1. Go to Insights & Summary page
2. View weekly activity and calorie charts
3. Check quick stats for overview
4. Download summary as JSON file
5. Reset all data if needed (with confirmation)

### Data Persistence
- All activities and meals are automatically saved to browser's LocalStorage
- Data persists across browser sessions
- Use "Reset Dashboard" to clear all data

---

## 📁 Project Structure

```
FitTrackPro/
├── index.html                 # Main HTML file
├── script.js                  # App initialization
├── style.css                  # Global styles
├── README.md                  # Documentation
│
├── assets/                    # Static assets
│   ├── icons/                 # Icon files
│   └── logo/                  # Logo files
│
├── components/                # HTML component templates
│   ├── modal.html            # Modal component
│   ├── navbar.html           # Navigation bar
│   └── progressCircle.html   # Progress circle (if needed)
│
├── css/                      # Stylesheets
│   ├── components/
│   │   ├── modal.css         # Modal styles
│   │   ├── navbar.css        # Navigation styles
│   │   └── progressCircle.css # Progress indicator styles
│   └── pages/
│       ├── activity.css      # Activity page styles
│       ├── dashboard.css     # Dashboard styles
│       ├── insights.css      # Insights page styles
│       └── meals.css         # Meal planner styles
│
├── data/                     # Static data sources
│   ├── activitiesData.js    # Sample activities
│   ├── mealsData.js         # Sample meals
│   ├── weeklyData.js        # Weekly chart data
│   └── wellnessData.js      # Wellness metrics
│
└── js/                       # JavaScript modules
    ├── pages/
    │   ├── activity.js      # Activity page logic
    │   ├── dashboard.js     # Dashboard logic
    │   ├── insights.js      # Insights page logic
    │   └── meals.js         # Meal planner logic
    └── utilities/
        ├── helpers.js       # Utility functions
        ├── keyboard.js      # Keyboard shortcuts
        ├── modal.js         # Modal manager
        ├── navigation.js    # Page routing
        ├── storage.js       # LocalStorage wrapper
        └── toast.js         # Toast notifications
```

---

## 🛠️ Technologies

### Core Technologies
- **HTML5** - Semantic markup, accessibility features
- **CSS3** - Modern styling, animations, flexbox, grid
- **JavaScript ES6+** - Modules, async/await, modern syntax

### Styling & UI
- **TailwindCSS (CDN)** - Utility-first CSS framework
- **Custom CSS** - Component-specific styles and animations
- **CSS Animations** - Smooth transitions and micro-interactions

### Architecture Patterns
- **ES6 Modules** - Modular code organization
- **Event-Driven** - Custom events for component communication
- **Component-Based** - Reusable UI components
- **MVC-like** - Separation of data, view, and logic

### Browser APIs Used
- **LocalStorage** - Data persistence
- **Custom Events** - Component communication
- **Fetch API** - Loading HTML components
- **DOM Manipulation** - Dynamic content rendering

---

## 🎨 Design Principles

1. **Mobile-First Responsive** - Built for all screen sizes
2. **Progressive Enhancement** - Core functionality works everywhere
3. **Accessibility First** - WCAG compliant, keyboard navigable
4. **Performance Optimized** - Minimal dependencies, optimized rendering
5. **User-Friendly** - Intuitive interface with helpful feedback

---

## 📊 Technical Constraints (As Per Requirements)

✅ **Only HTML, CSS, JavaScript (ES6+)** - No frameworks used  
✅ **No Backend or Database** - Fully client-side  
✅ **Dynamic Updates via DOM Manipulation** - Pure JavaScript  
✅ **Custom Modals Only** - No browser alerts (except confirmation)  
✅ **Static Hosting Compatible** - Works on GitHub Pages, Netlify, etc.  
✅ **LocalStorage for Persistence** - Session and local storage used  
✅ **No Chart Libraries** - Graphs built with pure CSS/JS  

---

## 🚀 Deployment

### GitHub Pages
```bash
1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select main branch and root directory
4. Click Save
5. Access at https://yourusername.github.io/FitTrackPro
```

### Netlify
```bash
1. Drag and drop the FitTrackPro folder to Netlify
2. Or connect GitHub repository
3. Deploy automatically
```

### Vercel
```bash
vercel --prod
```

---

## 🎯 Future Enhancements

- [ ] Export data as PDF report
- [ ] Dark mode toggle
- [ ] Goal setting and tracking
- [ ] Water intake tracker with reminders
- [ ] Exercise library with instructions
- [ ] Calorie calculator
- [ ] BMI and BMR calculators
- [ ] Social sharing features
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality

---

## 📝 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Developer Notes

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Known Limitations
- Requires modern browser with ES6 module support
- LocalStorage has 5-10MB limit (sufficient for this use case)
- Must be served via HTTP/HTTPS (not file://)

### Performance Tips
- All animations use CSS transforms for 60fps
- Debounced event handlers for optimal performance
- Lazy loading of components
- Minimal DOM manipulation

---

<div align="center">

**Built with ❤️ using Vanilla JavaScript**

*No frameworks. No dependencies. Just pure web technologies.*

</div>
