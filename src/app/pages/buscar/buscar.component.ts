import { UtilService } from './../../_service/util.service';
import { DialogoDetalleComponent } from './dialogo-detalle/dialogo-detalle.component';
import { Consulta } from './../../_model/consulta';
import { MatTableDataSource } from '@angular/material/table';
import { FiltroConsultaDTO } from './../../_dto/filtroConsultaDTO';
import { ConsultaService } from './../../_service/consulta.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatPaginator, MatDialog } from '@angular/material';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css']
})
export class BuscarComponent implements OnInit {

  maxFecha: Date = new Date();
  form: FormGroup;
  displayedColumns = ['paciente', 'medico', 'especialidad', 'fecha', 'acciones'];
  dataSource: MatTableDataSource<Consulta>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  progress: boolean = false;

  constructor(private consultaService: ConsultaService, private dialog: MatDialog, private utilService: UtilService) { }

  ngOnInit() {
    this.form = new FormGroup({
      'dni': new FormControl(''),
      'nombreCompleto': new FormControl(''),
      'fechaConsulta': new FormControl()
    });

    this.utilService.estadoProgress.subscribe(data => {
      this.progress = data;
    });
  }

  buscar() {
    let filtro = new FiltroConsultaDTO(this.form.value['dni'], this.form.value['nombreCompleto'], this.form.value['fechaConsulta']);
    filtro.nombreCompleto = filtro.nombreCompleto.toLowerCase();

    this.utilService.estadoProgress.next(true);

    setTimeout(() => {

    }, 2000);
    /*{
      "dni" : "785956",
      "nombreCompleto" : "Jaime",
      "fechaConsulta" : "20-08-2019"
    }*/

    if (filtro.fechaConsulta) {

      delete filtro.dni;
      delete filtro.nombreCompleto;

      //console.log(filtro);

      this.consultaService.buscar(filtro).subscribe(data => {
        this.dataSource = new MatTableDataSource(data)
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.utilService.estadoProgress.next(false);
      });
    } else {
      delete filtro.fechaConsulta;

      if (filtro.dni.length === 0) {
        delete filtro.dni;
      }

      if (filtro.nombreCompleto.length === 0) {
        delete filtro.nombreCompleto
      }

      this.consultaService.buscar(filtro).subscribe(data => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    }
  }

  verDetalle(consulta: Consulta) {
    this.dialog.open(DialogoDetalleComponent, {
      data: consulta
    });
  }

}
