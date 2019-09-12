import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  nombreUsuario = new Subject<string>();

  constructor() { }
}
