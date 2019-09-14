import { Paciente } from './paciente';

export class Signos {
    idSignos: number;
    fecha: Date;
    temperatura: number;
    pulso: number;
    ritmoRespiratorio: number;
    paciente: Paciente;
}