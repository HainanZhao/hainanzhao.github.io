# Theme Toggle Feature

## Overview
The Debugi application now supports dark/light theme switching with localStorage persistence.

## Features

### Theme Toggle Button
- Located in the navigation header next to the search button
- Shows sun icon (☀️) in dark mode, moon icon (🌙) in light mode
- Displays "Light mode" or "Dark mode" text on desktop
- Icon-only on mobile devices for space efficiency

### Theme Persistence
- User's theme preference is saved to localStorage with key `debugi-theme`
- Theme is restored on page reload/app restart
- Falls back to system preference if no saved theme exists
- Defaults to dark theme if system preference unavailable

### Theme Variables
The application uses CSS custom properties for theming:

#### Dark Theme (default)
- Primary background: `#1c1c1e`
- Secondary background: `#26262a`
- Primary text: `#f2f2f7`
- Accent color: `#5ac8fa`

#### Light Theme
- Primary background: `#ffffff`
- Secondary background: `#f8fafc`
- Primary text: `#1e293b`
- Accent color: `#3b82f6`

### Technical Implementation

#### Theme Service (`theme.service.ts`)
- Manages theme state with BehaviorSubject
- Handles localStorage persistence
- Applies theme classes to document body
- Updates meta theme-color for mobile browsers

#### Component Integration
- App component subscribes to theme changes
- Template uses conditional classes for icons
- CSS variables ensure consistent theming across all components

### Mobile Support
- Meta theme-color tag updates automatically
- Responsive design maintains usability on all devices
- Theme toggle button adapts to mobile layout

## Usage
1. Click the theme toggle button in the navigation header
2. Theme changes immediately and is saved automatically
3. Preference persists across browser sessions
4. Works seamlessly across all application pages and components

## Browser Compatibility
- Supports all modern browsers with CSS custom properties
- LocalStorage support required for persistence
- Graceful fallback to default theme if localStorage unavailable
