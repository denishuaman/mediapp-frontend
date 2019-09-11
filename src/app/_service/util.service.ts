import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  estadoProgress = new Subject<boolean>();
  
  constructor() { }
}
