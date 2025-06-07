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
  styleUrls: ['./global-search.component.css'],
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
    this.searchService.isSearchVisible$.pipe(takeUntil(this.destroy$)).subscribe(isVisible => {
      this.isVisible = isVisible;
      if (isVisible) {
        setTimeout(() => this.focusInput(), 100);
      } else {
        this.resetSearch();
      }
    });

    // Subscribe to search results
    this.searchService.searchResults$.pipe(takeUntil(this.destroy$)).subscribe(results => {
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
        inline: 'nearest',
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
    const icons: Record<string, string> = {
      Calculator: 'fas fa-calculator',
      'String Utils': 'fas fa-font',
      'CSV Utils': 'fas fa-file-csv',
      'JSON Visualizer': 'fas fa-code',
      'JSON Query': 'fas fa-database',
      'Regex Tester': 'fas fa-asterisk',
      'QR Code': 'fas fa-qrcode',
      'Date Utils': 'fas fa-calendar-alt',
      'Number Utils': 'fas fa-hashtag',
      'Array Utils': 'fas fa-list',
      'Iframe Performance': 'fas fa-tachometer-alt',
      'Data Processing': 'fas fa-cogs',
      'Text & String': 'fas fa-font',
      'Numbers & Math': 'fas fa-calculator',
      Development: 'fas fa-code',
      'Date & Time': 'fas fa-calendar-alt',
      Utilities: 'fas fa-tools',
      'Array & Data': 'fas fa-list',
    };
    return icons[category] || 'fas fa-cogs';
  }

  highlightText(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}
