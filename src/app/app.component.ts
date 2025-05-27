import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { GlobalSearchComponent } from './shared/components/global-search/global-search.component';
import { SearchService } from './shared/services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, GlobalSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'common-utils-ui';

  constructor(private searchService: SearchService) {}

  openSearch() {
    this.searchService.showSearch();
  }
}
