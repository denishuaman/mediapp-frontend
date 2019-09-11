import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Medico } from '../_model/medico';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  medicoCambio = new Subject<Medico[]>();
  mensajeCambio = new Subject<string>();

  url: string = `${environment.HOST}/medicos`;
  //url: string = `${environment.HOST}/${environment.MICRO_CRUD}/medicos`;

  constructor(private http: HttpClient) { }

  listar() {
    return this.http.get<Medico[]>(this.url);
  }

  listarPorId(idmedico: number) {
    return this.http.get<Medico>(`${this.url}/${idmedico}`);
  }

  registrar(medico: Medico) {
    return this.http.post(this.url, medico);
  }

  modificar(medico: Medico) {
    return this.http.put(this.url, medico);
  }

  eliminar(idmedico: number) {
    return this.http.delete(`${this.url}/${idmedico}`);
  }
}
