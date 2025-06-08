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

### Standard Component Structure
```
component-name/
├── component-name.component.html
├── component-name.component.css
├── component-name.component.ts
└── component-name.component.spec.ts (optional)
```

### Component Integration Workflow
1. **Generate component**: `ng generate component component-name`
2. **Add route**: Update `/src/app/app.routes.ts`
3. **Add navigation**: Update `app.component.html` with SVG icon
4. **Add search entries**: Update `/src/app/shared/services/search.service.ts`
5. **Test integration**: Verify routing, search, and icons work

### Search Service Integration
**Location**: `/src/app/shared/services/search.service.ts`

#### Search Entry Format
```typescript
{
  title: 'Component Name',
  description: 'Brief description of functionality',
  route: '/route-path',
  category: 'Appropriate category',
  tags: ['relevant', 'search', 'keywords']
}
```

#### Standard Categories
- "Data Processing" - CSV, JSON, data manipulation
- "Text & String" - String utilities, case conversion  
- "Numbers & Math" - Calculator, number utilities
- "Development" - Regex, code tools
- "Date & Time" - Date utilities
- "Utilities" - QR codes, general tools
- "Array & Data" - Array operations

#### Icon System (Font Awesome)
- **Navigation**: SVG icons with `stroke="currentColor" stroke-width="2"`
- **Search results**: Font Awesome `fas fa-*` classes
- **Import**: `@import '@fortawesome/fontawesome-free/css/all.css';` in `styles.css`
- **Package**: `@fortawesome/fontawesome-free` (installed via npm)

## CSS Architecture & Optimization

### File Organization
```
src/
├── styles.css (global styles & Font Awesome imports)
├── app/
│   ├── app.component.css (main layout)
│   └── shared/
│       └── styles/
│           └── button-system.css (global button styles)
```

### Critical CSS Optimization Strategy
**The "Global First" Principle**: Always leverage global styles before writing component CSS

#### CSS Reduction Pattern (From Number Utils Success)
- **Before**: 290 lines of component CSS with redundant styling
- **After**: 45 lines (85% reduction) by removing global style duplicates
- **Key**: Only include component-specific layout and unique sizing

#### What's Already Global (Don't Duplicate)
```css
/* ❌ DON'T Override - Already handled globally */
input, select, textarea     /* Form element styling */
.result, .section          /* Standard layout patterns */
theme variables            /* Light/dark mode handling */
responsive breakpoints     /* Mobile-first patterns */
```

#### Minimal Component CSS Pattern
```css
/* ✅ DO: Only component-specific rules */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.compact-result {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.85rem;
}
```

### Theme Compatibility Rules
- **Never** override theme variables with hardcoded values
- **Always** test both light and dark modes
- **Use** CSS custom properties for all colors
- **Remove** any `body.theme-*` specific sections

### Common CSS Fixes

#### Global Button System Override
```css
/* When global button animations interfere */
.button-class {
  transform: none !important;
  transition: none !important;
  animation: none !important;
}
```

#### Search Modal Styling
```css
.search-input {
  padding-right: 56px; /* Space for close button */
}

.close-button {
  position: absolute;
  right: 16px;
  top: 8px;
}
```

### CSS Performance Guidelines
- **Target**: <50 lines for typical utility components
- **Audit checklist**: Check if global styles already handle the pattern
- **Test impact**: Verify theme switching works without custom overrides

## Component Development Best Practices

### Utility Component Design Strategy
**Build comprehensive, not basic** - aim for 5-7 feature categories:
1. **Basic Operations** - Core mathematical functions
2. **Data Conversion** - Format transformations (bytes, bases)
3. **Formatting** - Display and locale-specific formatting  
4. **Unit Conversion** - Physical unit transformations
5. **Specialized Functions** - Domain-specific calculations

### Multiple Search Entry Pattern
For complex components, create multiple search entries:
```typescript
{
  title: 'Basic Number Operations',
  description: 'Round, format, clamp, and generate random numbers',
  route: '/number-utils',
  category: 'Numbers & Math',
  tags: ['round', 'format', 'clamp', 'random']
},
{
  title: 'Byte Conversion', 
  description: 'Convert between KB, MB, GB, TB units',
  route: '/number-utils',
  category: 'Numbers & Math',
  tags: ['bytes', 'KB', 'MB', 'GB', 'TB', 'conversion']
}
```

### Component Enhancement Checklist
When improving existing components:
- [ ] **Audit CSS size** - if >100 lines, likely has redundancy
- [ ] **Check global conflicts** - look for hardcoded backgrounds
- [ ] **Test both themes** - verify no custom backgrounds persist
- [ ] **Reduce CSS** - remove rather than adding overrides
- [ ] **Design for compactness** - use `--spacing-xs`, smaller fonts
- [ ] **Leverage global styles** - avoid duplicating form/result styling

### Common Issues & Solutions

#### Global Button System Conflicts
**Problem**: Global CSS applies transitions to all buttons
**Solution**: Override with `!important` declarations
```css
transform: none !important;
transition: none !important; 
animation: none !important;
```

#### Theme Compatibility Issues
**Problem**: Custom backgrounds appear in wrong theme
**Root Cause**: Component CSS overriding global theme variables
**Solution**: Remove all theme-specific CSS, use only CSS custom properties

#### Icon Inconsistency
**Problem**: Mixed icon systems (SVG, emoji, Font Awesome)
**Solution**: 
- Navigation: SVG icons only
- Search: Font Awesome classes only
- Never mix systems in same interface

### Favicon Generation
**Current setup**: 
- Source: `favicon-minimal.svg` (terminal with D: prompt)
- Generator: `generate-minimal-favicons.js` using Sharp
- Output: All standard favicon sizes in `/public/`

## Critical File Dependencies

### Styling Files
- `/src/app/app.component.css` - Main layout and navigation
- `/src/app/shared/styles/button-system.css` - Global button behavior  
- `/src/styles.css` - Global theme variables and Font Awesome imports
- `/package.json` - Contains `@fortawesome/fontawesome-free` dependency

### Search & Routing Files
- `/src/app/shared/services/search.service.ts` - Search data and categories
- `/src/app/shared/components/global-search/` - Search UI components
- `/src/app/app.routes.ts` - Route definitions

### Branding Files
- `/src/app/app.component.html` - Logo structure
- `/favicon-minimal.svg` - Favicon source  
- `/generate-minimal-favicons.js` - Favicon generator

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
