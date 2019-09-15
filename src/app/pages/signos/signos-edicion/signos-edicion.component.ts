import { Component, OnInit } from '@angular/core';
import { Signos } from 'src/app/_model/signos';
import { FormGroup, FormControl } from '@angular/forms';
import { SignosService } from 'src/app/_service/signos.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Paciente } from 'src/app/_model/paciente';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
  pulso: number;
  ritmoRespiratorio: number;

  signos: Signos;
  form: FormGroup;
  edicion = false;

  paciente: Paciente;
  filteredOptions: Observable<any[]>;
  myControlPaciente: FormControl = new FormControl();

  constructor(private signosService: SignosService, private pacienteService: PacienteService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      'id': new FormControl(0),
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
        console.log('signos vitales (seleccionado)', data);
        let id = data.idSignos;
        this.fechaString = data.fecha;
        let temperatura = data.temperatura;
        let pulso = data.pulso;
        let ritmoRespiratorio = data.ritmoRespiratorio;
        this.paciente = data.paciente;
        this.myControlPaciente = new FormControl(this.paciente);
        this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
        this.form = new FormGroup({
          'id': new FormControl(id),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(new Date(this.fechaString)),
          'temperatura': new FormControl(temperatura),
          'pulso': new FormControl(pulso),
          'ritmoRespiratorio': new FormControl(ritmoRespiratorio)
        });
      });
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
    this.signos = new Signos();
    this.signos.idSignos = this.form.value['id'];
    this.signos.paciente = this.paciente;
    
    let tzoffset = (this.fecha).getTimezoneOffset() * 60000;
    let localISOTime = (new Date(Date.now() - tzoffset)).toISOString();
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
      })
    } else {
      this.signosService.registrar(this.signos).pipe(switchMap(() => {
        return this.signosService.listar();
      })).subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('Se registró un nuevo signo vital del paciente '
          + this.signos.paciente.nombres + ' ' + this.signos.paciente.apellidos);
      })
    }
    this.router.navigate(['signos']);
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

}
