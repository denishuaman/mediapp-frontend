import { environment } from './../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginService } from '../_service/login.service';

@Injectable({
    providedIn: 'root'
})
export class ServerErrorsInterceptor implements HttpInterceptor {

    constructor(private snackBar: MatSnackBar, private router: Router, private loginService: LoginService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(retry(environment.REINTENTOS)).
            pipe(tap(event => {
                if (event instanceof HttpResponse) {
                    if (event.body && event.body.error === true && event.body.errorMessage) {
                        throw new Error(event.body.errorMessage);
                    }/*else{
                        this.snackBar.open("EXITO", 'AVISO', { duration: 5000 });    
                    }*/
                }
            })).pipe(catchError((err) => {
                console.log('err', err);
                //https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                let mensaje = '';
                if(err.error && err.error.mensaje) {
                    mensaje = err.error.mensaje;
                } else {
                    mensaje = err.message;
                }
                if (err.status === 400) {
                    this.snackBar.open(mensaje, 'ERROR 400', { duration: 5000 });
                }
                else if (err.status === 401) {
                    //console.log(err.message);
                    this.snackBar.open(mensaje, 'ERROR 401', { duration: 5000 });
                    sessionStorage.clear();
                    this.router.navigate(['/login']);
                }
                else if (err.status === 500) {
                    this.snackBar.open(mensaje, 'ERROR 500', { duration: 5000 });
                } else {
                    this.snackBar.open(mensaje, 'ERROR', { duration: 5000 });
                }
                return EMPTY;
            }));
    }
}