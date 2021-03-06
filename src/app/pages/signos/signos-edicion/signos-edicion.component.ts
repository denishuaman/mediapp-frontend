import { Component, OnInit } from '@angular/core';
import { Signos } from 'src/app/_model/signos';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SignosService } from 'src/app/_service/signos.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Paciente } from 'src/app/_model/paciente';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatSnackBar, MatDialog } from '@angular/material';
import { PacienteDialogoComponent } from '../../paciente/paciente-dialogo/paciente-dialogo.component';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  pacientes: Paciente[] = [];
  idSignos: number;
  fecha: Date = new Date();
  fechaString: string;
  maxFecha: Date = new Date();
  temperatura: number;
  pulso: number;
  ritmoRespiratorio: number;

  signos: Signos;
  form: FormGroup;
  edicion = false;

  paciente: Paciente;
  filteredOptions: Observable<any[]>;
  myControlPaciente: FormControl = new FormControl();

  constructor(private signosService: SignosService, private pacienteService: PacienteService,
    private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(0, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')),
      'pulso': new FormControl(0, Validators.pattern(/^-?(0|[1-9]\d*)?$/)),
      'ritmoRespiratorio': new FormControl(0, Validators.pattern(/^-?(0|[1-9]\d*)?$/))
    });
    this.route.params.subscribe((params: Params) => {
      this.idSignos = params['id'];
      this.edicion = params['id'] != null;
    });
    console.log('VERIFICANDO SI EXISTEN NUEVOS PACIENTES');
    this.pacienteService.pacienteCambio.subscribe(data => {
      console.log('EXISTEN NUEVOS PACIENTES');
      this.pacientes = data;
    });
    this.pacienteService.nuevoPacienteAgregado.subscribe(data => {
      console.log('NUEVO PACIENTE AGREGADO', data);
      console.log('DATOS INICIALES');
      console.log('fecha', this.fecha);
      console.log('temperatura', this.temperatura);
      console.log('pulso', this.pulso);
      console.log('ritmoRespiratorio', this.ritmoRespiratorio);
      this.paciente = data;
      this.myControlPaciente = new FormControl(this.paciente);
      this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
      this.form = new FormGroup({
        'id': this.edicion ? new FormControl(this.idSignos) : new FormControl(0),
        'paciente': this.myControlPaciente,
        'fecha': new FormControl(new Date(this.fecha)),
        'temperatura': new FormControl(this.temperatura, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')),
        'pulso': new FormControl(this.pulso, Validators.pattern(/^-?(0|[1-9]\d*)?$/)),
        'ritmoRespiratorio': new FormControl(this.ritmoRespiratorio, Validators.pattern(/^-?(0|[1-9]\d*)?$/))
      });
      console.log('DATOS FINALES');
      console.log('fecha', this.fecha);
      console.log('temperatura', this.temperatura);
      console.log('pulso', this.pulso);
      console.log('ritmoRespiratorio', this.ritmoRespiratorio);
    });
    this.pacienteService.mensajeCambio.subscribe(data => {
      console.log(data);
      this.snackBar.open(data, 'AVISO', {
        duration: 5000
      });
    })
    this.listarPacientes();
    this.initForm();
  }

  initForm() {
    console.log('*************** INICIO DEL FORMULARIO ****************');
    if (this.edicion) {
      console.log('ES UNA EDICIÓN');
      this.signosService.listarPorId(this.idSignos).subscribe(data => {
        console.log('signos vitales (seleccionado)', data);
        let id = data.idSignos;
        this.fechaString = data.fecha;
        this.fecha = new Date(this.fechaString);
        this.temperatura = data.temperatura;
        this.pulso = data.pulso;
        this.ritmoRespiratorio = data.ritmoRespiratorio;
        this.paciente = data.paciente;
        this.myControlPaciente = new FormControl(this.paciente);
        this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
        this.form = new FormGroup({
          'id': new FormControl(id),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(new Date(this.fecha)),
          'temperatura': new FormControl(this.temperatura, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')),
          'pulso': new FormControl(this.pulso, Validators.pattern(/^-?(0|[1-9]\d*)?$/)),
          'ritmoRespiratorio': new FormControl(this.ritmoRespiratorio, Validators.pattern(/^-?(0|[1-9]\d*)?$/))
        });
      });
    } else {
      console.log('ES UN REGISTRO NUEVO');
      this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
    }
  }

  listarPacientes() {
    console.log('LISTANDO PACIENTES');
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  registrar() {
    console.log('******* REGISTRAR *******');
    if(!this.paciente || this.paciente.idPaciente === 0) {
      this.snackBar.open('Debe seleccionar un paciente', 'Aviso', {
        duration: 5000
      });
      return;
    }
    this.signos = new Signos();
    this.signos.idSignos = this.form.value['id'];
    this.signos.paciente = this.form.value['paciente'];
    if(!this.signos.paciente.idPaciente || this.signos.paciente.idPaciente <= 0) {
      this.snackBar.open('Debe seleccionar un paciente válido', 'Aviso', {
        duration: 5000
      });
      return;
    }
    console.log('Fecha seleccionada', this.fecha);

    let tzoffset = (this.fecha).getTimezoneOffset() * 60000;
    let localISOTime = (new Date(this.fecha.getTime() - tzoffset)).toISOString();
    this.signos.fecha = localISOTime;

    this.signos.temperatura = this.form.value['temperatura'];
    this.signos.pulso = this.form.value['pulso'];
    this.signos.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];
    console.log('signos vitales a guardar', this.signos);
    if(this.signos.idSignos > 0) {
      this.signosService.modificar(this.signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('Se modificó los signos vitales con id ' + this.signos.idSignos + ' del paciente '
          + this.signos.paciente.nombres + ' ' + this.signos.paciente.apellidos);
          this.router.navigate(['signos']);
      });
    } else {
      this.signosService.registrar(this.signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('Se registró un nuevo signo vital del paciente '
          + this.signos.paciente.nombres + ' ' + this.signos.paciente.apellidos);
        this.router.navigate(['signos']);
      });
    }
  }

  displayFn(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  seleccionarPaciente(e: any) {
    this.paciente = e.option.value;
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

  openDialog() {
    console.log('************** ABRIENDO DIÁLOGO - NUEVO PACIENTE *************');
    this.dialog.open(PacienteDialogoComponent, {
      width: '500px'
    });
  }

}
