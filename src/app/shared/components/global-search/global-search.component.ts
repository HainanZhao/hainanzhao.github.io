import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SearchService, SearchableItem } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  searchQuery = '';
  searchResults: SearchableItem[] = [];
  selectedIndex = -1;
  isVisible = false;
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to search visibility
    this.searchService.isSearchVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isVisible => {
        this.isVisible = isVisible;
        if (isVisible) {
          setTimeout(() => this.focusInput(), 100);
        } else {
          this.resetSearch();
        }
      });

    // Subscribe to search results
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.searchResults = results;
        this.selectedIndex = results.length > 0 ? 0 : -1;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    // Show search with Ctrl+K (Windows/Linux) or Cmd+K (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.showSearch();
      return;
    }

    // Handle search modal keyboard navigation
    if (!this.isVisible) return;

    switch (event.key) {
      case 'Escape':
        this.hideSearch();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateResults(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateResults(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectCurrentResult();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.isVisible && !target.closest('.search-modal') && !target.closest('.search-button')) {
      this.hideSearch();
    }
  }

  showSearch() {
    this.searchService.showSearch();
  }

  hideSearch() {
    this.searchService.hideSearch();
  }

  onSearchChange() {
    if (this.searchQuery.trim()) {
      this.searchService.search(this.searchQuery);
    } else {
      // Clear search results by calling search with empty string
      this.searchService.search('');
      this.selectedIndex = -1;
    }
  }

  navigateResults(direction: number) {
    if (this.searchResults.length === 0) return;
    
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.searchResults.length - 1;
    } else if (this.selectedIndex >= this.searchResults.length) {
      this.selectedIndex = 0;
    }
  }

  selectResult(item: SearchableItem, index: number) {
    this.selectedIndex = index;
    this.selectCurrentResult();
  }

  selectCurrentResult() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
      const selectedItem = this.searchResults[this.selectedIndex];
      this.navigateToResult(selectedItem);
    }
  }

  navigateToResult(item: SearchableItem) {
    this.hideSearch();
    
    // Navigate to the route
    this.router.navigate([item.route]).then(() => {
      // After navigation, highlight the section if specified
      if (item.section) {
        setTimeout(() => {
          this.searchService.highlightSection(item.section);
          this.scrollToSection(item.section);
        }, 300);
      }
    });
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  private focusInput() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  private resetSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedIndex = -1;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Calculator': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                      <line x1="8" y1="6" x2="16" y2="6"></line>
                      <line x1="16" y1="10" x2="8" y2="10"></line>
                      <line x1="8" y1="14" x2="16" y2="14"></line>
                      <line x1="8" y1="18" x2="16" y2="18"></line>
                    </svg>`,
      'String Utils': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>`,
      'CSV Utils': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                     <polyline points="14,2 14,8 20,8"></polyline>
                     <line x1="16" y1="13" x2="8" y2="13"></line>
                     <line x1="16" y1="17" x2="8" y2="17"></line>
                     <polyline points="10,9 9,9 8,9"></polyline>
                   </svg>`,
      'JSON Visualizer': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <polyline points="16 18 22 12 16 6"></polyline>
                           <polyline points="8 6 2 12 8 18"></polyline>
                         </svg>`,
      'JSON Query': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>`,
      'Regex Tester': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6"></path>
                        <path d="m15.5 3.5-1.5 1.5m0 12 1.5 1.5M1 12h6m6 0h6m-15.5-8.5 1.5 1.5m0 12-1.5 1.5"></path>
                      </svg>`,
      'QR Code': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <rect x="3" y="3" width="7" height="7"></rect>
                   <rect x="14" y="3" width="7" height="7"></rect>
                   <rect x="14" y="14" width="7" height="7"></rect>
                   <rect x="3" y="14" width="7" height="7"></rect>
                   <rect x="5" y="5" width="3" height="3"></rect>
                   <rect x="16" y="5" width="3" height="3"></rect>
                   <rect x="16" y="16" width="3" height="3"></rect>
                 </svg>`,
      'Date Utils': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>`,
      'Number Utils': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="4" y1="9" x2="20" y2="9"></line>
                        <line x1="4" y1="15" x2="20" y2="15"></line>
                        <line x1="10" y1="3" x2="8" y2="21"></line>
                        <line x1="16" y1="3" x2="14" y2="21"></line>
                      </svg>`,
      'Array Utils': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <rect x="3" y="3" width="7" height="7"></rect>
                       <rect x="14" y="3" width="7" height="7"></rect>
                       <rect x="14" y="14" width="7" height="7"></rect>
                       <rect x="3" y="14" width="7" height="7"></rect>
                     </svg>`,
      'Iframe Performance': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                              <circle cx="12" cy="10" r="2"></circle>
                              <path d="M12 6v2m0 6v2"></path>
                            </svg>`,
      'Data Processing': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                           <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                           <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                           <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                           <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                           <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                           <line x1="12" y1="22.08" x2="12" y2="12"></line>
                         </svg>`
    };
    return icons[category] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                              </svg>`;
  }

  highlightText(text: string, query: string): string {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}
