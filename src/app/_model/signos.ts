import { Paciente } from './paciente';

export class Signos {
    idSignos: number;
    fecha: string;
    temperatura: number;
    pulso: number;
    ritmoRespiratorio: number;
    paciente: Paciente;
}