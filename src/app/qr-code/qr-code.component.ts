import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../shared/services/search.service';
import { Subject, takeUntil } from 'rxjs';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  imports: [FormsModule, CommonModule],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css',
})
export class QrCodeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  highlightedSection = '';

  // QR Code generation properties
  inputText = 'Visit our app: https://debugi.com/';
  qrCodeDataURL = '';
  qrCodeErrorLevel: 'L' | 'M' | 'Q' | 'H' = 'M';
  qrCodeSize = 256;

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    // Subscribe to section highlighting
    this.searchService.highlightedSection$.pipe(takeUntil(this.destroy$)).subscribe(sectionId => {
      this.highlightedSection = sectionId;
    });

    // Generate initial QR code
    this.generateQRCode();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // QR Code Generation Methods
  async generateQRCode() {
    if (!this.inputText.trim()) {
      this.qrCodeDataURL = '';
      return;
    }

    try {
      this.qrCodeDataURL = await QRCode.toDataURL(this.inputText, {
        errorCorrectionLevel: this.qrCodeErrorLevel,
        margin: 1,
        width: this.qrCodeSize,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.qrCodeDataURL = '';
    }
  }

  downloadQRCode() {
    if (!this.qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = this.qrCodeDataURL;
    link.click();
  }

  loadQRExample() {
    this.inputText = 'Visit our app: https://debugi.com/';
    this.generateQRCode();
  }

  loadTextExample() {
    this.inputText = 'Hello World! This is a QR code containing text.';
    this.generateQRCode();
  }

  loadContactExample() {
    this.inputText = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Company
TEL:+1-555-123-4567
EMAIL:john.doe@example.com
URL:https://example.com
END:VCARD`;
    this.generateQRCode();
  }

  loadWifiExample() {
    this.inputText = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;';
    this.generateQRCode();
  }

  clearQRCode() {
    this.inputText = '';
    this.qrCodeDataURL = '';
  }
}
