# Prettier Setup Documentation

## Overview
This document describes the Prettier integration setup for the Debugi project, providing automatic code formatting that works seamlessly with ESLint.

## What is Prettier?
Prettier is an opinionated code formatter that enforces consistent code style across your project. It automatically formats code according to predefined rules, eliminating style discussions and manual formatting efforts.

## Installation
The following packages have been installed:

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

### Dependencies
- **prettier**: The core Prettier formatter
- **eslint-config-prettier**: Disables ESLint rules that conflict with Prettier
- **eslint-plugin-prettier**: Runs Prettier as an ESLint rule

## Configuration Files

### .prettierrc.json
Contains Prettier formatting rules:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "printWidth": 120,
        "htmlWhitespaceSensitivity": "ignore"
      }
    },
    {
      "files": "*.json",
      "options": {
        "printWidth": 80
      }
    }
  ]
}
```

### .prettierignore
Excludes certain files and directories from formatting:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/
.angular/

# IDE files
.vscode/
.idea/

# Generated files
coverage/
.nyc_output/

# OS generated files
.DS_Store
Thumbs.db

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Angular specific
*.ngfactory.ts
*.ngstyle.ts

# Root HTML files (not Angular templates)
src/index.html
```

## ESLint Integration

### Updated eslint.config.js
The ESLint configuration has been updated to integrate with Prettier:

1. **Added Prettier imports**: `eslint-plugin-prettier` and `eslint-config-prettier`
2. **Extended configurations**: Added `prettierConfig` to disable conflicting rules
3. **Added Prettier plugin**: Integrated Prettier as an ESLint plugin
4. **Added Prettier rule**: `"prettier/prettier": "error"` to show formatting issues as errors
5. **Separated HTML configurations**: Different rules for Angular templates vs. regular HTML files

## NPM Scripts

The following scripts have been added to package.json:

```json
{
  "scripts": {
    "format": "prettier --write \"src/app/**/*.{ts,html,css,scss,json}\"",
    "format:check": "prettier --check \"src/app/**/*.{ts,html,css,scss,json}\"",
    "format:lint": "npm run format && npm run lint:fix"
  }
}
```

### Script Descriptions

- **`npm run format`**: Formats all TypeScript, HTML, CSS, SCSS, and JSON files in the `src/app` directory
- **`npm run format:check`**: Checks if files are formatted according to Prettier rules (useful for CI/CD)
- **`npm run format:lint`**: Formats code and then runs ESLint with auto-fix

## Usage

### Formatting Code
```bash
# Format all files
npm run format

# Check if files are properly formatted
npm run format:check

# Format and fix linting issues
npm run format:lint
```

### IDE Integration
Most modern IDEs support Prettier integration:

1. **VS Code**: Install the "Prettier - Code formatter" extension
2. **WebStorm/IntelliJ**: Built-in Prettier support
3. **Vim/Neovim**: Use plugins like `prettier/vim-prettier`

### Pre-commit Hooks (Recommended)
Consider adding Prettier to your pre-commit hooks using tools like:

- `husky` + `lint-staged`
- `pre-commit` (Python-based)

Example with husky and lint-staged:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/app/**/*.{ts,html,css,scss,json}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

## Formatting Rules Explained

### TypeScript/JavaScript Rules
- **Semi-colons**: Always used (`"semi": true`)
- **Quotes**: Single quotes preferred (`"singleQuote": true`)
- **Line width**: 100 characters (`"printWidth": 100`)
- **Indentation**: 2 spaces (`"tabWidth": 2`)
- **Trailing commas**: ES5 compatible (`"trailingComma": "es5"`)
- **Arrow functions**: Omit parentheses when possible (`"arrowParens": "avoid"`)

### HTML Rules
- **Line width**: 120 characters (longer for HTML readability)
- **Whitespace sensitivity**: Ignored for Angular templates

### JSON Rules
- **Line width**: 80 characters (more compact for configuration files)

## Best Practices

### 1. Format Before Committing
Always run `npm run format` before committing code to ensure consistency.

### 2. Use IDE Integration
Set up your IDE to format on save for the best developer experience.

### 3. Team Consistency
Ensure all team members use the same Prettier configuration to avoid formatting conflicts.

### 4. CI/CD Integration
Add `npm run format:check` to your CI/CD pipeline to ensure all code is properly formatted.

## Troubleshooting

### Common Issues

1. **ESLint and Prettier conflicts**: 
   - Solution: Ensure `eslint-config-prettier` is properly configured
   - The configuration disables conflicting ESLint rules

2. **HTML formatting issues**:
   - Angular templates are handled differently from regular HTML files
   - `src/index.html` is excluded from formatting to avoid conflicts

3. **Large diffs after formatting**:
   - Run `npm run format` once on the entire codebase
   - Commit the formatting changes separately from functional changes

### Debugging
- Use `npm run format:check` to see which files need formatting
- Check the `.prettierignore` file if certain files aren't being formatted
- Verify ESLint configuration if you see conflicts between Prettier and ESLint

## Benefits

### For Developers
- **Consistent code style**: No more debates about formatting
- **Time savings**: Automatic formatting reduces manual effort
- **Better focus**: Concentrate on logic rather than formatting
- **Easy onboarding**: New team members don't need to learn style guidelines

### For the Project
- **Reduced diffs**: Consistent formatting means cleaner git diffs
- **Improved readability**: Consistent code is easier to read and review
- **Reduced bugs**: Consistent formatting can help identify issues
- **Professional appearance**: Well-formatted code looks more professional

## Integration Status

✅ **Prettier installed and configured**  
✅ **ESLint integration working**  
✅ **NPM scripts added**  
✅ **Configuration files created**  
✅ **HTML parsing issues resolved**  
✅ **Format checking working**  

The Prettier integration is now fully functional and ready for development use.
