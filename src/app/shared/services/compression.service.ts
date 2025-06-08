import { Injectable } from '@angular/core';
import * as pako from 'pako';

/**
 * Service for string compression and decompression
 * Uses pako (zlib) for efficient compression of large strings
 */
@Injectable({
  providedIn: 'root',
})
export class CompressionService {
  private readonly MAX_URL_LENGTH = 2000; // Safe URL length limit
  private readonly MIN_COMPRESSION_SIZE = 100; // Only compress strings larger than this

  /**
   * Compress a string if it's large enough to benefit from compression
   * @param data - The string to potentially compress
   * @returns Object containing the data (compressed or original) and metadata
   */
  compressIfNeeded(data: string): {
    data: string;
    isCompressed: boolean;
    originalSize: number;
    compressedSize: number;
  } {
    const originalSize = data.length;

    // Don't compress small strings as they may actually get larger
    if (originalSize < this.MIN_COMPRESSION_SIZE) {
      return {
        data,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize,
      };
    }

    try {
      // Compress the string
      const compressed = this.compress(data);
      const compressedSize = compressed.length;

      // Only use compression if it actually reduces size significantly
      if (compressedSize < originalSize * 0.8) {
        return {
          data: compressed,
          isCompressed: true,
          originalSize,
          compressedSize,
        };
      } else {
        // Compression didn't help much, return original
        return {
          data,
          isCompressed: false,
          originalSize,
          compressedSize: originalSize,
        };
      }
    } catch (error) {
      console.warn('Compression failed, using original data:', error);
      return {
        data,
        isCompressed: false,
        originalSize,
        compressedSize: originalSize,
      };
    }
  }

  /**
   * Compress a string using pako/zlib compression
   * @param data - The string to compress
   * @returns Base64 encoded compressed string
   */
  compress(data: string): string {
    try {
      // Convert string to Uint8Array
      const textEncoder = new TextEncoder();
      const uint8Array = textEncoder.encode(data);

      // Compress using pako
      const compressed = pako.deflate(uint8Array, { level: 9 }); // Maximum compression

      // Convert to base64 for URL-safe storage
      const base64 = btoa(String.fromCharCode(...compressed));

      // Add compression marker prefix
      return `pako:${base64}`;
    } catch (error) {
      throw new Error(`Compression failed: ${error}`);
    }
  }

  /**
   * Decompress a string that was compressed with compress()
   * @param compressedData - The compressed string (with pako: prefix)
   * @returns The original uncompressed string
   */
  decompress(compressedData: string): string {
    try {
      // Check if data is actually compressed
      if (!compressedData.startsWith('pako:')) {
        // Not compressed, return as-is
        return compressedData;
      }

      // Remove the compression marker prefix
      const base64Data = compressedData.substring(5);

      // Convert from base64 to Uint8Array
      const binaryString = atob(base64Data);
      const compressed = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i);
      }

      // Decompress using pako
      const decompressed = pako.inflate(compressed);

      // Convert back to string
      const textDecoder = new TextDecoder();
      return textDecoder.decode(decompressed);
    } catch (error) {
      throw new Error(`Decompression failed: ${error}`);
    }
  }

  /**
   * Check if a string appears to be compressed by this service
   * @param data - The string to check
   * @returns True if the string appears to be compressed
   */
  isCompressed(data: string): boolean {
    return data.startsWith('pako:');
  }

  /**
   * Get compression statistics for a string
   * @param originalData - The original uncompressed string
   * @returns Statistics about compression effectiveness
   */
  getCompressionStats(originalData: string): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    spaceSaved: number;
    spaceSavedPercent: number;
  } {
    try {
      const compressed = this.compress(originalData);
      const originalSize = originalData.length;
      const compressedSize = compressed.length;
      const spaceSaved = originalSize - compressedSize;
      const compressionRatio = compressedSize / originalSize;
      const spaceSavedPercent = (spaceSaved / originalSize) * 100;

      return {
        originalSize,
        compressedSize,
        compressionRatio,
        spaceSaved,
        spaceSavedPercent,
      };
    } catch {
      return {
        originalSize: originalData.length,
        compressedSize: originalData.length,
        compressionRatio: 1,
        spaceSaved: 0,
        spaceSavedPercent: 0,
      };
    }
  }

  /**
   * Check if the data would fit in a URL after compression
   * @param data - The data to check
   * @returns True if the data (compressed if beneficial) would fit in a URL
   */
  willFitInUrl(data: string): boolean {
    const compressed = this.compressIfNeeded(data);
    return compressed.data.length <= this.MAX_URL_LENGTH;
  }
}
