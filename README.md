# Debugi - Developer Utilities

This is utils application providing a collection of common utility tools for developers. It is hosted on GitHub Pages.

## Utilities Included

### Calculator
- **Basic Arithmetic**: Addition, subtraction, multiplication, division
- **Advanced Operations**: Square root, power, percentage calculations

### String Utilities
- **Case Conversion**: UPPERCASE, lowercase, camelCase, PascalCase, kebab-case, snake_case
- **Text Analysis**: Character count, word count, reading time, frequency analysis
- **Text Manipulation**: Find & replace, reverse text, line operations
- **Encoding/Decoding**: Base64, URL encoding, HTML encoding
- **Hash Generation**: SHA-256, MD5 cryptographic hashes
- **QR Code Generator**: Generate QR codes with customizable size and error correction
- **Password Generator**: Secure password generation with customizable options

### Data Utilities
- **JSON Visualizer**: Format and visualize JSON data
- **CSV Formatter**: Convert CSV to various formats (Google Sheets, JSON, SQL, HTML, XML, Markdown)
- **Array Utils**: Sort, filter, deduplicate arrays
- **Date Utils**: Date formatting and manipulation
- **Number Utils**: Number formatting, rounding, currency formatting
- **Regex Tester**: Test and validate regular expressions

## Development Setup

To run this project locally, you need to have Node.js and Angular CLI installed.

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd debugi

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm start

# Build for production
npm run build:prod
```

### Static Site Generation

This project uses an advanced dynamic queue system for pre-rendering:

```bash
# Pre-render the site with the default configuration
npm run prerender:advanced

# Pre-render with custom configuration from .env.prerender
npm run prerender:advanced:config
```

See [Advanced Pre-rendering](docs/ADVANCED_PRERENDERING.md) and [Queue System Enhancements](docs/QUEUE_SYSTEM_ENHANCEMENTS.md) for details.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HainanZhao/hainanzhao.github.io.git
    cd debugi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. 

For GitHub Pages deployment:
```bash
# Use the lightweight build for GitHub Pages to avoid timeouts
npm run build:gh-pages:lightweight
```

## GitHub Pages

This project is configured for deployment to GitHub Pages. The live version can be accessed at:
https://hainanzhao.github.io/

### Deployment Notes

The GitHub Pages deployment uses a lightweight build process that:
- Skips resource-intensive pre-rendering
- Uses simplified SEO file generation
- Configures proper SPA routing via 404.html

See `docs/GITHUB_PAGES_DEPLOYMENT.md` for detailed information.

## Features

- **Modern UI**: Clean, dark theme with responsive design
- **Global Search**: Search across all utilities and features
- **Flattened HTML**: Optimized DOM structure for better performance
- **Mobile Friendly**: Responsive design that works on all devices
- **Fast Loading**: Optimized bundle sizes and lazy loading
