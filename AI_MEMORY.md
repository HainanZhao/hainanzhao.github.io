# Debugi Project - AI Memory & Development Guidelines

## Project Overview
Debugi is an Angular-based web application providing developer utilities like calculators, formatters, and testing tools. The project emphasizes clean design, professional aesthetics, and excellent UX for software engineers.

## Design System & Styling Principles

### Color Palette & Variables
```css
/* Primary colors used throughout the application */
--accent-primary: #3b82f6 (blue)
--accent-primary-rgb: 59, 130, 246
--bg-primary: #ffffff
--bg-secondary: #f8fafc
--bg-tertiary: #f1f5f9
--text-primary: #1e293b
--text-secondary: #64748b
--border-primary: #e2e8f0
--border-secondary: #cbd5e1
```

### Key Styling Patterns

#### Button System (Critical)
- **Global button system exists** at `/src/app/shared/styles/button-system.css`
- Applies `transition: all 0.2s ease` to ALL buttons globally
- **When fixing button animations**: Use `!important` declarations to override:
  ```css
  .button-class {
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
  ```

#### Search Component Styling
- **Close button positioning**: Use `right: 16px; top: 8px` with fixed positioning
- **Search input padding**: Right padding should be `56px` to accommodate close button
- **Icon system**: Always use SVG icons, never emoji, for consistency with navigation
- **Animation fixes**: Apply aggressive CSS overrides for buttons affected by global system

#### Logo & Branding
- **Current logo**: Terminal icon with "D:" prompt (represents Debugi/Debug)
- **Favicon**: Matches logo design with terminal window and "D:" prompt
- **Color**: Uses `--accent-primary` (#3b82f6) for brand consistency
- **Font**: Monospace for terminal elements (Monaco, Courier New)

## Component Architecture

### Utility Components Structure
Each utility component follows this pattern:
```
component-name/
├── component-name.component.html
├── component-name.component.css
├── component-name.component.ts
└── component-name.component.spec.ts (optional)
```

### Search Service Integration
**Location**: `/src/app/shared/services/search.service.ts`

#### Adding New Components to Search
1. **Add to searchableComponents array**:
```typescript
{
  title: 'Component Name',
  description: 'Brief description of functionality',
  route: '/route-path',
  category: 'Appropriate category',
  tags: ['relevant', 'search', 'keywords']
}
```

2. **Category Guidelines**:
   - "Data Processing" - CSV, JSON, data manipulation
   - "Text & String" - String utilities, case conversion
   - "Numbers & Math" - Calculator, number utilities
   - "Development" - Regex, code tools
   - "Date & Time" - Date utilities
   - "Utilities" - QR codes, general tools
   - "Array & Data" - Array operations
   - "Iframe Performance" - Performance testing

3. **Icon System** (Updated to Font Awesome):
```typescript
getCategoryIcon(category: string): string {
  // Returns Font Awesome class names (fas fa-*)
  // Updated from Phosphor icons to Font Awesome icons
  const icons: Record<string, string> = {
    'Calculator': 'fas fa-calculator',
    'String Utils': 'fas fa-font',
    'CSV Utils': 'fas fa-file-csv',
    'JSON Visualizer': 'fas fa-code',
    // ... other mappings
  };
  return icons[category] || 'fas fa-cogs';
}
```

**Icon System Notes**:
- **Current**: Font Awesome icons (`fas fa-*` classes)
- **Previous**: Phosphor icons (`ph ph-*` classes) - migrated away
- **Import**: `@import '@fortawesome/fontawesome-free/css/all.css';` in `styles.css`
- **Package**: `@fortawesome/fontawesome-free` installed via npm
- **Accessibility**: All clickable icons include keyboard support (tabindex, keydown events)

### Route Integration
**Location**: `/src/app/app.routes.ts`

When adding new components:
1. Add route to `app.routes.ts`
2. Add navigation item to `app.component.html`
3. Add search entry to `search.service.ts`
4. Ensure icon consistency between nav and search

## CSS Architecture & Best Practices

### File Organization
```
src/
├── styles.css (global styles)
├── app/
│   ├── app.component.css (main layout)
│   └── shared/
│       └── styles/
│           └── button-system.css (global button styles)
```

### Component-Level CSS Patterns
1. **Use CSS custom properties** for theming
2. **Responsive design**: Mobile-first approach with breakpoints
3. **Consistent spacing**: Use standard values (8px, 16px, 24px grid)
4. **Shadow system**: Use `--shadow-sm`, `--shadow-md` variables

### Common CSS Fixes Applied

#### Search Modal Styling
```css
.search-input {
  padding-right: 56px; /* Space for close button */
}

.close-button {
  position: absolute;
  right: 16px;
  top: 8px;
  /* Override global button system */
  transform: none !important;
  transition: none !important;
  animation: none !important;
}
```

#### Icon Consistency
- **Navigation**: SVG icons with `stroke="currentColor" stroke-width="2"`
- **Search results**: Font Awesome icons using `fas fa-*` classes
- **Global search**: Uses Font Awesome icons imported from `@fortawesome/fontawesome-free`
- **Icon migration**: Moved from Phosphor icons to Font Awesome for better consistency
- **Never mix**: Don't use emoji and different icon systems in the same interface

## Development Workflow

### Adding New Utility Components
1. **Generate component**: `ng generate component component-name`
2. **Add route**: Update `app.routes.ts`
3. **Add navigation**: Update `app.component.html` with SVG icon
4. **Add search entry**: Update `search.service.ts`
5. **Ensure icon consistency**: Same SVG in nav and search
6. **Test responsiveness**: Verify mobile layout
7. **Verify search functionality**: Test search keywords and category

### CSS Debugging Checklist
1. **Button animation issues**: Check if global button system is interfering
2. **Icon inconsistency**: Verify SVG vs emoji usage
3. **Positioning issues**: Check for transform conflicts with global styles
4. **Responsive issues**: Test mobile breakpoints
5. **Color contrast**: Ensure accessibility standards

## Known Technical Challenges & Solutions

### Global Button System Override
**Problem**: Global CSS applies transitions to all buttons
**Solution**: Use `!important` declarations with `none` values
```css
transform: none !important;
transition: none !important;
animation: none !important;
```

### Search Icon Consistency
**Problem**: Navigation uses SVG, search used emoji
**Solution**: Updated search service to return SVG strings, use `[innerHTML]` binding

### Favicon Generation
**Current setup**: 
- Source: `favicon-minimal.svg` (terminal with D: prompt)
- Generator: `generate-minimal-favicons.js` using Sharp
- Output: All standard favicon sizes in `/public/`

## File Dependencies Map

### Critical Files for Styling
- `/src/app/app.component.css` - Main layout and navigation
- `/src/app/shared/styles/button-system.css` - Global button behavior
- `/src/styles.css` - Global theme variables and Font Awesome imports
- `/package.json` - Contains `@fortawesome/fontawesome-free` dependency

### Critical Files for Search
- `/src/app/shared/services/search.service.ts` - Search data
- `/src/app/shared/components/global-search/` - Search UI components
- `/src/app/app.routes.ts` - Route definitions

### Critical Files for Branding
- `/src/app/app.component.html` - Logo structure
- `/favicon-minimal.svg` - Favicon source
- `/generate-minimal-favicons.js` - Favicon generator

## Future Development Guidelines

### When Adding New Components
1. **Always maintain icon consistency** (SVG only)
2. **Update search service** immediately after creating component
3. **Test mobile responsiveness** for all new layouts
4. **Follow established color scheme** and spacing patterns
5. **Document any new global CSS** that might affect other components

### When Fixing CSS Issues
1. **Check global button system first** for animation problems
2. **Use browser dev tools** to identify conflicting styles
3. **Apply targeted fixes** rather than broad overrides when possible
4. **Test across different screen sizes** after CSS changes
5. **Verify accessibility** (contrast, focus states) after style updates

### When Modifying Search Functionality
1. **Keep categories consistent** with established naming
2. **Ensure all routes have search entries** for completeness
3. **Test search keywords** to verify discoverability
4. **Maintain SVG icon system** in search results

---

## Quick Reference Commands

### Favicon Generation
```bash
node generate-minimal-favicons.js
```

### Development Server
```bash
npm start
```
The app runs on port 4200 by default, if there's already a server running, don't start a new instance.

### Common Git Commands
```bash
git status  # or 'gst' if aliased
git add .
git commit -m "message"
```

---

*This memory file should be referenced whenever making styling changes, adding components, or debugging UI issues in the Debugi project.*
