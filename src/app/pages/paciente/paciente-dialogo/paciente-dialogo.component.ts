import { Component, OnInit } from '@angular/core';
import { Paciente } from 'src/app/_model/paciente';
import { MatDialogRef } from '@angular/material';
import { PacienteService } from 'src/app/_service/paciente.service';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-paciente-dialogo',
  templateUrl: './paciente-dialogo.component.html',
  styleUrls: ['./paciente-dialogo.component.css']
})
export class PacienteDialogoComponent implements OnInit {

  paciente: Paciente;
  nuevoPacienteRegistrado: Paciente;
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<PacienteDialogoComponent>, 
    private pacienteService: PacienteService) { }

  ngOnInit() {
    this.paciente = new Paciente();
    this.form = new FormGroup({
      'nombres': new FormControl('', [Validators.minLength(3), Validators.maxLength(70)]),
      'apellidos': new FormControl('', [Validators.minLength(3), Validators.maxLength(70)]),
      'email': new FormControl('', [Validators.email, Validators.maxLength(55)]),
      'telefono': new FormControl('', [Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^-?(0|[0-9]\d*)?$/)]),
      'dni': new FormControl('', [Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^-?(0|[0-9]\d*)?$/)]),
      'direccion': new FormControl('', [Validators.minLength(3), Validators.maxLength(150)])
    });
  }

  registrar() {
    console.log('***** REGISTRAR PACIENTE ******');
    console.log('PACIENTE A REGISTRAR', this.paciente);
    this.pacienteService.registrar(this.paciente).pipe(switchMap((data: Paciente) => {
      this.nuevoPacienteRegistrado = data;
      return this.pacienteService.listar();
    })).subscribe(data => {
      this.pacienteService.pacienteCambio.next(data);
      this.pacienteService.nuevoPacienteAgregado.next(this.nuevoPacienteRegistrado);
      this.pacienteService.mensajeCambio.next('Se agregó un nuevo paciente');
    });
    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }
}
