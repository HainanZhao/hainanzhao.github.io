import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'debugi-theme';
  private readonly themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
    this.setupKeyboardShortcut();
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }

    // Always default to dark theme (ignoring system preference)
    // Users can manually switch to light theme if they prefer
    return 'dark';
  }

  public getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  public toggleTheme(): void {
    const newTheme: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  public setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;

    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-light');

    // Add new theme class
    body.classList.add(`theme-${theme}`);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  private updateMetaThemeColor(theme: Theme): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1c1c1e' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Ctrl+Shift+T (Windows/Linux) or Cmd+Shift+T (Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        this.toggleTheme();
      }
    });
  }
}
