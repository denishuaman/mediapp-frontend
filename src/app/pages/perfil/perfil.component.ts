import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/_service/usuario.service';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  nombreUsuario: string;
  roles: string[];

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit() {
    console.log('Inicio de PerfilComponent');
    const helper = new JwtHelperService();
    let token = sessionStorage.getItem(environment.TOKEN_NAME);
    let decodedToken = helper.decodeToken(token);
    this.nombreUsuario = decodedToken.user_name;
    this.roles = decodedToken.authorities;
  }

}
