import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../shared/services/search.service';
import { UrlStateService } from '../shared/services/url-state.service';
import { Subject, takeUntil } from 'rxjs';

interface JwtHeader {
  typ?: string;
  alg?: string;
  kid?: string;
  [key: string]: any;
}

interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

interface ParsedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  expirationDate?: Date;
  issuedDate?: Date;
  notBeforeDate?: Date;
  timeToExpiry?: string;
}

@Component({
  selector: 'app-jwt-parser',
  imports: [CommonModule, FormsModule],
  templateUrl: './jwt-parser.component.html',
  styleUrl: './jwt-parser.component.css',
})
export class JwtParserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // JWT Input/Output
  jwtToken = '';
  parsedJwt: ParsedJwt | null = null;
  parseError = '';

  // JWT Generation
  headerInput = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
  payloadInput =
    '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": ' +
    Math.floor(Date.now() / 1000) +
    '\n}';
  secretKey = 'your-256-bit-secret';

  // Display options
  showRawData = false;
  autoRefresh = true;
  showHelp: boolean = false;

  // Sample JWTs
  sampleJwts = [
    {
      name: 'Standard JWT',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
    {
      name: 'Auth Token with Expiry',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NjQwMH0.8VJJnOgtgqqW9q-HYPCJcjM7k4VF7j5YrF8q-_Ct7WE',
    },
    {
      name: 'Complex JWT with Custom Claims',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleTEifQ.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwic3ViIjoidXNlcl8xMjM0NSIsImF1ZCI6WyJhcGkxIiwiYXBpMiJdLCJleHAiOjE3MzM2MjA4MDAsIm5iZiI6MTczMzUzNDQwMCwiaWF0IjoxNzMzNTM0NDAwLCJqdGkiOiJhdXRoXzEyMzQ1IiwibmFtZSI6IkFsaWNlIEpvaG5zb24iLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdLCJjdXN0b21fY2xhaW0iOiJjdXN0b21fdmFsdWUifQ.wK9aZQZQ1F2J3q8rN5L7X9Y6M4P2K8R3T1V0S7U6W9E',
    },
  ];

  constructor(
    private searchService: SearchService,
    private urlStateService: UrlStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to section highlighting
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });

    // Load JWT from URL if present
    this.loadUrlState();

    // Parse initial JWT if present
    if (this.jwtToken) {
      this.parseJwt();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // JWT Parsing Methods
  parseJwt(): void {
    if (!this.jwtToken.trim()) {
      this.parsedJwt = null;
      this.parseError = '';
      return;
    }

    try {
      const parts = this.jwtToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - must have exactly 3 parts separated by dots');
      }

      // Decode header
      const header = this.decodeBase64Url(parts[0]);

      // Decode payload
      const payload = this.decodeBase64Url(parts[1]);

      // Get signature (keep as base64url encoded)
      const signature = parts[2];

      // Validate token structure
      const isValid = this.validateJwtStructure(header, payload);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;

      // Calculate dates
      const expirationDate = payload.exp ? new Date(payload.exp * 1000) : undefined;
      const issuedDate = payload.iat ? new Date(payload.iat * 1000) : undefined;
      const notBeforeDate = payload.nbf ? new Date(payload.nbf * 1000) : undefined;

      // Calculate time to expiry
      const timeToExpiry = payload.exp ? this.calculateTimeToExpiry(payload.exp, now) : undefined;

      this.parsedJwt = {
        header,
        payload,
        signature,
        isValid,
        isExpired,
        expirationDate,
        issuedDate,
        notBeforeDate,
        timeToExpiry,
      };

      this.parseError = '';
      this.updateUrlState();
    } catch (error) {
      this.parseError = error instanceof Error ? error.message : 'Failed to parse JWT';
      this.parsedJwt = null;
    }
  }

  private decodeBase64Url(encoded: string): any {
    try {
      // Add padding if needed
      let padded = encoded;
      while (padded.length % 4) {
        padded += '=';
      }

      // Replace URL-safe characters
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

      // Decode and parse JSON
      const decoded = atob(base64);
      return JSON.parse(decoded);
    } catch {
      throw new Error('Invalid Base64URL encoding');
    }
  }

  private validateJwtStructure(header: any, payload: any): boolean {
    // Basic validation
    if (!header || !payload) return false;

    // Check required header fields
    if (!header.alg || !header.typ) return false;

    // Validate numeric timestamp fields
    if (payload.exp && (typeof payload.exp !== 'number' || payload.exp <= 0)) return false;
    if (payload.iat && (typeof payload.iat !== 'number' || payload.iat <= 0)) return false;
    if (payload.nbf && (typeof payload.nbf !== 'number' || payload.nbf <= 0)) return false;

    return true;
  }

  private calculateTimeToExpiry(exp: number, now: number): string {
    const diffSeconds = exp - now;

    if (diffSeconds <= 0) {
      return 'Expired';
    }

    const days = Math.floor(diffSeconds / (24 * 60 * 60));
    const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
    const seconds = diffSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // JWT Generation Methods
  generateJwt(): void {
    try {
      const header = JSON.parse(this.headerInput);
      const payload = JSON.parse(this.payloadInput);

      // Encode header and payload
      const encodedHeader = this.encodeBase64Url(JSON.stringify(header));
      const encodedPayload = this.encodeBase64Url(JSON.stringify(payload));

      // Create signature placeholder (in real implementation, this would use the secret)
      const data = `${encodedHeader}.${encodedPayload}`;
      const signature = this.createMockSignature(data, this.secretKey);

      // Create JWT
      this.jwtToken = `${data}.${signature}`;

      // Parse the generated JWT
      this.parseJwt();
    } catch (error) {
      this.parseError = `Generation failed: ${error instanceof Error ? error.message : 'Invalid JSON in header or payload'}`;
    }
  }

  private encodeBase64Url(data: string): string {
    const base64 = btoa(data);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private createMockSignature(data: string, secret: string): string {
    // This is a mock signature for demonstration
    // In production, use proper HMAC-SHA256 or RSA signing
    const combined = data + secret;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return this.encodeBase64Url(Math.abs(hash).toString(36));
  }

  // Sample Data Methods
  loadSample(index: number): void {
    if (index >= 0 && index < this.sampleJwts.length) {
      this.jwtToken = this.sampleJwts[index].token;
      this.parseJwt();
    }
  }

  loadExpiredSample(): void {
    // Create a JWT that's already expired
    const expiredPayload = {
      sub: '1234567890',
      name: 'Expired User',
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
    };

    this.payloadInput = JSON.stringify(expiredPayload, null, 2);
    this.generateJwt();
  }

  loadFutureSample(): void {
    // Create a JWT with future dates
    const futurePayload = {
      sub: '1234567890',
      name: 'Future User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
      nbf: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now (not before)
    };

    this.payloadInput = JSON.stringify(futurePayload, null, 2);
    this.generateJwt();
  }

  // Utility Methods
  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }

  clearAll(): void {
    this.jwtToken = '';
    this.parsedJwt = null;
    this.parseError = '';
    this.headerInput = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
    this.payloadInput =
      '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": ' +
      Math.floor(Date.now() / 1000) +
      '\n}';
    this.secretKey = 'your-256-bit-secret';
  }

  // URL State Management
  private loadUrlState(): void {
    const jwtState = this.urlStateService.getStateFromUrl('jwt');
    if (jwtState) {
      try {
        const state = JSON.parse(jwtState);
        this.jwtToken = state.token || '';
      } catch (error) {
        console.error('Error loading JWT URL state:', error);
      }
    }
  }

  private updateUrlState(): void {
    if (this.jwtToken) {
      const state = { token: this.jwtToken };
      this.urlStateService.updateUrlState('jwt', JSON.stringify(state));
    }
  }

  shareState(event?: Event): void {
    if (this.jwtToken) {
      const state = { token: this.jwtToken };
      const buttonElement = event?.target as HTMLElement;
      this.urlStateService.shareUrlWithFeedback('jwt', JSON.stringify(state), buttonElement);
    }
  }

  // Helper methods for template
  getAlgorithmInfo(alg: string | undefined): string {
    if (!alg) {
      return 'No algorithm specified';
    }
    const algorithms: Record<string, string> = {
      HS256: 'HMAC using SHA-256',
      HS384: 'HMAC using SHA-384',
      HS512: 'HMAC using SHA-512',
      RS256: 'RSA using SHA-256',
      RS384: 'RSA using SHA-384',
      RS512: 'RSA using SHA-512',
      ES256: 'ECDSA using SHA-256',
      ES384: 'ECDSA using SHA-384',
      ES512: 'ECDSA using SHA-512',
      none: 'No digital signature or MAC',
    };
    return algorithms[alg] || 'Unknown algorithm';
  }

  getClaimDescription(claim: string): string {
    const descriptions: Record<string, string> = {
      iss: 'Issuer - identifies the principal that issued the JWT',
      sub: 'Subject - identifies the principal that is the subject of the JWT',
      aud: 'Audience - identifies the recipients that the JWT is intended for',
      exp: 'Expiration Time - identifies the expiration time after which the JWT must not be accepted',
      nbf: 'Not Before Time - identifies the time before which the JWT must not be accepted',
      iat: 'Issued At - identifies the time at which the JWT was issued',
      jti: 'JWT ID - provides a unique identifier for the JWT',
    };
    return descriptions[claim] || 'Custom claim';
  }

  isStandardClaim(claim: string): boolean {
    return ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'].includes(claim);
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  getValidationStatus(): string {
    if (!this.parsedJwt) return '';

    if (!this.parsedJwt.isValid) return 'Invalid structure';
    if (this.parsedJwt.isExpired) return 'Expired';

    // Check not-before
    if (this.parsedJwt.payload.nbf) {
      const now = Math.floor(Date.now() / 1000);
      if (this.parsedJwt.payload.nbf > now) {
        return 'Not yet valid';
      }
    }

    return 'Valid';
  }

  getValidationClass(): string {
    const status = this.getValidationStatus();
    if (status === 'Valid') return 'status-valid';
    if (status === 'Expired' || status === 'Invalid structure') return 'status-invalid';
    if (status === 'Not yet valid') return 'status-warning';
    return '';
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
