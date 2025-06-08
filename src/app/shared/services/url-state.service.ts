import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompressionService } from './compression.service';

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
    private route: ActivatedRoute,
    private compressionService: CompressionService
  ) {}

  /**
   * Read state from URL parameters with automatic decompression
   * @param key - The parameter key to read
   * @returns The decoded and decompressed parameter value or null if not present
   */
  getStateFromUrl(key: string): string | null {
    let value: string | null = null;

    // Use snapshot for one-time read
    const params = this.route.snapshot.queryParamMap;
    if (params.has(key)) {
      try {
        const encodedValue = params.get(key) || '';
        const decodedValue = decodeURIComponent(encodedValue);

        // Try to decompress if it's compressed
        if (this.compressionService.isCompressed(decodedValue)) {
          try {
            value = this.compressionService.decompress(decodedValue);
          } catch (error) {
            console.warn(`Failed to decompress URL parameter '${key}', using raw value:`, error);
            value = decodedValue;
          }
        } else {
          value = decodedValue;
        }
      } catch (error) {
        console.error(`Error decoding URL parameter '${key}':`, error);
      }
    }

    return value;
  }

  /**
   * Update URL with state parameter (with automatic compression for large data)
   * @param key - The parameter key
   * @param value - The value to store (will be compressed if beneficial and encoded)
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
    const queryParams: Record<string, string | null> = {};

    // Only add the parameter if it has a value
    if (value !== null && value.trim() !== '') {
      try {
        // Compress the data if it would be beneficial
        const compressionResult = this.compressionService.compressIfNeeded(value);
        const finalValue = compressionResult.data;

        // Log compression results for debugging
        if (compressionResult.isCompressed) {
          console.log(
            `Compressed data for ${key}: ${compressionResult.originalSize} → ${compressionResult.compressedSize} bytes ` +
              `(${((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100).toFixed(1)}% saved)`
          );
        }

        queryParams[key] = encodeURIComponent(finalValue);
      } catch (error) {
        console.error(`Error processing data for URL parameter '${key}':`, error);
        // Fallback to original value without compression
        queryParams[key] = encodeURIComponent(value);
      }
    } else {
      // Set to null to remove the parameter
      queryParams[key] = null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: options.keepParams ? 'merge' : undefined, // Merge or overwrite
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
   * Create a shareable URL with the current state (with compression support)
   * @param key - The parameter key
   * @param value - The value to include in the URL
   * @returns Full URL string that can be shared
   */
  createShareableUrl(key: string, value: string): string {
    // Create a URL object based on the current URL
    const url = new URL(window.location.href);

    // Set the parameter
    if (value && value.trim() !== '') {
      try {
        // Compress the data if it would be beneficial
        const compressionResult = this.compressionService.compressIfNeeded(value);
        const finalValue = compressionResult.data;

        url.searchParams.set(key, encodeURIComponent(finalValue));
      } catch (error) {
        console.error('Error processing data for shareable URL:', error);
        // Fallback to original value
        url.searchParams.set(key, encodeURIComponent(value));
      }
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
   * Share the URL with current state via clipboard with enhanced error handling
   * @param key - The parameter key
   * @param value - The value to include in the URL
   * @param buttonElement - Optional button element for visual feedback
   * @returns Promise resolving to true if successful, false otherwise
   */
  async shareUrlWithFeedback(
    key: string,
    value: string,
    buttonElement?: HTMLElement
  ): Promise<boolean> {
    try {
      // Check if the data can be shared effectively
      if (!this.compressionService.willFitInUrl(value)) {
        this.showShareFeedback(
          buttonElement,
          'error',
          'Data is too large to share via URL. Try reducing the data size.'
        );
        return false;
      }

      const success = await this.shareUrl(key, value);

      if (success) {
        // Get compression stats for user feedback
        const stats = this.compressionService.getCompressionStats(value);
        let message = 'URL copied to clipboard!';

        if (stats.spaceSavedPercent > 10) {
          message += ` (${stats.spaceSavedPercent.toFixed(0)}% compressed)`;
        }

        this.showShareFeedback(buttonElement, 'success', message);
      } else {
        this.showShareFeedback(buttonElement, 'error', 'Failed to copy URL to clipboard');
      }

      return success;
    } catch (error) {
      console.error('Error sharing URL:', error);
      this.showShareFeedback(
        buttonElement,
        'error',
        'Error creating shareable URL. Data may be too large or contain invalid characters.'
      );
      return false;
    }
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
