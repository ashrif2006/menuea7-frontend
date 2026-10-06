import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css'
})
export class QrCodeComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Tenant`;

  qrImageUrl = signal<string | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit() {
    this.loadQrCode();
  }

  loadQrCode() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http.get(`${this.apiUrl}/qr-code`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // بنحول الصورة (blob) لرابط مؤقت يقدر الـ <img> يعرضه
        const objectUrl = URL.createObjectURL(blob);
        this.qrImageUrl.set(objectUrl);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('حدث خطأ أثناء تحميل كود QR، حاول مرة أخرى');
      }
    });
  }

  download() {
    const url = this.qrImageUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-qr-${this.authService.currentUser()?.cafeName ?? 'cafe'}.png`;
    link.click();
  }
}