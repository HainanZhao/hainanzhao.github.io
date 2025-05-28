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
- **Random Character Generator**: Generate random text, numbers, or special characters

### Data Utilities
- **JSON Visualizer**: Format and visualize JSON data
- **CSV Formatter**: Convert CSV to various formats (Google Sheets, JSON, SQL, HTML, XML, Markdown)
- **Array Utils**: Sort, filter, deduplicate arrays
- **Date Utils**: Date formatting and manipulation
- **Number Utils**: Number formatting, rounding, currency formatting
- **Regex Tester**: Test and validate regular expressions

## Development Setup

To run this project locally, you need to have Node.js and Angular CLI installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hainanzhao/debugi.git
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
npm run build:gh-pages
```

## GitHub Pages

This project is configured for deployment to GitHub Pages. The live version can be accessed at:
https://hainanzhao.github.io/

## Features

- **Modern UI**: Clean, dark theme with responsive design
- **Global Search**: Search across all utilities and features
- **Flattened HTML**: Optimized DOM structure for better performance
- **Mobile Friendly**: Responsive design that works on all devices
- **Fast Loading**: Optimized bundle sizes and lazy loading
