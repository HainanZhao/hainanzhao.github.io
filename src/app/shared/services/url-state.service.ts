import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Service for sharing application state via URL parameters
 * Provides methods to read and write parameters to the URL
 */
@Injectable({
  providedIn: 'root',
})
export class UrlStateService {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Read state from URL parameters
   * @param key - The parameter key to read
   * @returns The decoded parameter value or null if not present
   */
  getStateFromUrl(key: string): string | null {
    let value: string | null = null;

    // Use snapshot for one-time read
    const params = this.route.snapshot.queryParamMap;
    if (params.has(key)) {
      try {
        value = decodeURIComponent(params.get(key) || '');
      } catch (error) {
        console.error(`Error decoding URL parameter '${key}':`, error);
      }
    }

    return value;
  }

  /**
   * Update URL with state parameter
   * @param key - The parameter key
   * @param value - The value to store (will be encoded)
   * @param options - Additional options for URL updating
   */
  updateUrlState(
    key: string,
    value: string | null,
    options: {
      replace?: boolean; // Whether to replace URL in history instead of adding new entry
      keepParams?: boolean; // Whether to keep other query parameters
    } = { replace: true, keepParams: true }
  ): void {
    const queryParams: { [key: string]: string | null } = {};

    // Only add the parameter if it has a value
    if (value !== null && value.trim() !== '') {
      queryParams[key] = encodeURIComponent(value);
    } else {
      // Set to null to remove the parameter
      queryParams[key] = null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: options.keepParams ? 'merge' : '', // Merge or overwrite
      replaceUrl: options.replace,
    });
  }

  /**
   * Clear a specific URL parameter
   * @param key - The parameter key to clear
   */
  clearUrlState(key: string): void {
    this.updateUrlState(key, null);
  }

  /**
   * Create a shareable URL with the current state
   * @param key - The parameter key
   * @param value - The value to include in the URL
   * @returns Full URL string that can be shared
   */
  createShareableUrl(key: string, value: string): string {
    // Create a URL object based on the current URL
    const url = new URL(window.location.href);

    // Set the parameter
    if (value && value.trim() !== '') {
      url.searchParams.set(key, encodeURIComponent(value));
    }

    return url.toString();
  }

  /**
   * Share the URL with current state via clipboard
   * @param key - The parameter key
   * @param value - The value to include in the URL
   * @returns Promise resolving to true if successful, false otherwise
   */
  async shareUrl(key: string, value: string): Promise<boolean> {
    const url = this.createShareableUrl(key, value);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
      return false;
    }
  }

  /**
   * Share the URL with current state via clipboard with visual feedback
   * @param key - The parameter key
   * @param value - The value to include in the URL
   * @param buttonElement - Optional button element to show feedback on
   * @returns Promise resolving to true if successful, false otherwise
   */
  async shareUrlWithFeedback(
    key: string,
    value: string,
    buttonElement?: HTMLElement
  ): Promise<boolean> {
    const success = await this.shareUrl(key, value);

    if (success) {
      this.showShareFeedback(buttonElement, 'success', 'URL copied to clipboard!');
    } else {
      this.showShareFeedback(buttonElement, 'error', 'Failed to copy URL');
    }

    return success;
  }

  /**
   * Show visual feedback for share operations
   * @param buttonElement - Button element to show feedback on
   * @param type - Type of feedback ('success' or 'error')
   * @param message - Message to display
   */
  private showShareFeedback(
    buttonElement: HTMLElement | undefined,
    type: 'success' | 'error',
    message: string
  ): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = `share-notification share-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ${
        type === 'success'
          ? 'background: linear-gradient(135deg, #28a745 0%, #20c997 100%);'
          : 'background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);'
      }
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // If there's a button element, briefly highlight it
    if (buttonElement) {
      const originalTransition = buttonElement.style.transition;
      buttonElement.style.transition = 'all 0.2s ease';
      buttonElement.style.transform = 'scale(0.95)';

      setTimeout(() => {
        buttonElement.style.transform = 'scale(1)';
        setTimeout(() => {
          buttonElement.style.transition = originalTransition;
        }, 200);
      }, 100);
    }

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }
}
