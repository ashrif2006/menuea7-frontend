import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // التوكن منتهي أو غير صالح → نمسح البيانات ونرجّع المستخدم لـ Login
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        localStorage.removeItem('cafeName');
        router.navigate(['/login']);
      }

      if (error.status === 0) {
        // السيرفر مش شغال أو مفيش اتصال بالإنترنت
        console.error('لا يمكن الاتصال بالسيرفر');
      }

      // بنرجّع الخطأ عشان الـ Component اللي طلب الـ Request يقدر يتعامل معاه كمان (زي رسالة تفصيلية)
      return throwError(() => error);
    })
  );
};