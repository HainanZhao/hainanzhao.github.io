# GitHub Copilot Instructions for Debugi Project

## Project Context
Angular-based developer utilities web application. Focus on clean design, professional UX, and comprehensive utility tools.

## Key Development Patterns

### CSS Strategy
- Leverage global styles first (check `/src/styles.css`)
- Aim for <50 lines per component CSS file
- Always test light/dark theme compatibility
- Use CSS custom properties, never hardcoded colors

### Component Development
- Build comprehensive utilities (5-7 feature categories)
- Always add search entries to `/src/app/shared/services/search.service.ts`
- Use Font Awesome icons for search, SVG for navigation
- Follow standard Angular structure

### Critical Files
- Search service: `/src/app/shared/services/search.service.ts`
- Global styles: `/src/styles.css` 
- Routes: `/src/app/app.routes.ts`
- Button system: `/src/app/shared/styles/button-system.css`

### Anti-Patterns
- Don't duplicate global form/input styling in components
- Don't override theme variables with hardcoded values
- Don't create basic utilities - make them comprehensive
- Don't forget search entries for new components

For detailed context, see `/AI_MEMORY.md`
