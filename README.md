# Common Utilities UI

This is an Angular application providing a collection of common utility tools. It is hosted on GitLab Pages.

## Utilities Included

*   **Online Calculator**: Performs basic arithmetic operations (addition, subtraction, multiplication, division).
*   **String Case Converter**: Converts text to UPPERCASE, lowercase, or CamelCase.
*   **CSV to Google Sheets Formatter**: Converts comma-separated values (CSV) into a tab-separated format suitable for direct pasting into Google Sheets.

## Development Setup

To run this project locally, you need to have Node.js and Angular CLI installed.

1.  **Clone the repository:**
    ```bash
    git clone https://gitlab.com/your-username/common-utils-ui.git
    cd common-utils-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use `ng build --configuration production` for a production build.

## GitLab Pages

This project is configured for automatic deployment to GitLab Pages whenever changes are pushed to the default branch. The live version can be accessed at the URL provided by GitLab Pages for this repository.
(The specific URL will be `https://<your-gitlab-username_or_group>.gitlab.io/common-utils-ui/` if the repository is public and named `common-utils-ui`).
