import { Component, OnInit } from '@angular/core';
import { Signos } from 'src/app/_model/signos';
import { FormGroup, FormControl } from '@angular/forms';
import { SignosService } from 'src/app/_service/signos.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Paciente } from 'src/app/_model/paciente';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  pacientes: Paciente[] = [];
  idSignos: number;
  fecha: Date = new Date();
  maxFecha: Date = new Date();
  temperatura: number;
  pulso: number;
  ritmoRespiratorio: number;

  signos: Signos;
  form: FormGroup;
  edicion = false;

  pacienteSeleccionado: Paciente;
  filteredOptions: Observable<any[]>;
  myControlPaciente: FormControl = new FormControl();

  constructor(private signosService: SignosService, private pacienteService: PacienteService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(0),
      'pulso': new FormControl(0),
      'ritmoRespiratorio': new FormControl(0)
    });
    this.route.params.subscribe((params: Params) => {
      this.idSignos = params['id'];
      this.edicion = params['id'] != null;
    });
    this.listarPacientes();
    this.initForm();
  }

  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.idSignos).subscribe(data => {
        let id = data.idSignos;
        this.fecha = data.fecha;
        let temperatura = data.temperatura;
        let pulso = data.pulso;
        let ritmoRespiratorio = data.ritmoRespiratorio;
        this.pacienteSeleccionado = data.paciente;
        this.myControlPaciente = new FormControl(this.pacienteSeleccionado);
        this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
        this.form = new FormGroup({
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(new Date(this.fecha)),
          'temperatura': new FormControl(temperatura),
          'pulso': new FormControl(pulso),
          'ritmoRespiratorio': new FormControl(ritmoRespiratorio)
        });
      })
    } else {
      this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
    }
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  registrar() {
    console.log('******* REGISTRAR *******');
  }

  displayFn(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
  }

  filter(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.dni.includes(val.dni));
    } else {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.dni.includes(val));
    }
  }

}
