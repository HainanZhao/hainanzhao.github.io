import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalSearchComponent } from './shared/components/global-search/global-search.component';
import { SearchService } from './shared/services/search.service';
import { ThemeService, Theme } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, GlobalSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'common-utils-ui';
  currentTheme: Theme = 'dark';

  constructor(
    private searchService: SearchService,
    private themeService: ThemeService
  ) {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  openSearch() {
    this.searchService.showSearch();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
