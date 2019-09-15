import { Component, OnInit, ViewChild } from '@angular/core';
import { Signos } from 'src/app/_model/signos';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { SignosService } from 'src/app/_service/signos.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { filter } from 'minimatch';

@Component({
  selector: 'app-signos',
  templateUrl: './signos.component.html',
  styleUrls: ['./signos.component.css']
})
export class SignosComponent implements OnInit {

  displayedColumns = ['idSignos', 'fecha', 'temperatura', 'pulso', 'ritmoRespiratorio', 'paciente', 'acciones'];
  dataSource: MatTableDataSource<Signos>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private signosService: SignosService, private snackBar: MatSnackBar, public route: ActivatedRoute) { }

  ngOnInit() {
    this.signosService.signosCambio.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.filterPredicate = (data, filter) => {
        // console.log('filtrando.....');
        // console.log('data a filtrar:', data);
        // console.log('filtro:', filter);
        const dataStr = data.idSignos + ';' + data.fecha + ';' + data.temperatura + ';' + data.pulso + ';' + data.ritmoRespiratorio
          + ';' + data.paciente.dni + ';' + data.paciente.nombres + ';' + data.paciente.apellidos;
        // console.log('dataStr:', dataStr);
        return dataStr.indexOf(filter) != -1;
      }
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });

    this.signosService.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'Aviso', {
        duration: 5000,
      });
    });

    this.signosService.listar().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.filterPredicate = (data, filter) => {
        // console.log('filtrando.....');
        // console.log('data a filtrar:', data);
        // console.log('filtro:', filter);
        const dataStr = data.idSignos + ';' + data.fecha + ';' + data.temperatura + ';' + data.pulso + ';' + data.ritmoRespiratorio
          + ';' + data.paciente.dni + ';' + data.paciente.nombres + ';' + data.paciente.apellidos;
        // console.log('dataStr:', dataStr);
        return dataStr.trim().toLowerCase().indexOf(filter) != -1;
      }
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    })
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  eliminar(idSignos: number) {
    this.signosService.eliminar(idSignos).pipe(switchMap(() => {
      return this.signosService.listar();
    })).subscribe(data => {
      this.signosService.signosCambio.next(data);
      this.signosService.mensajeCambio.next('Se eliminó');
    });
  }

}
