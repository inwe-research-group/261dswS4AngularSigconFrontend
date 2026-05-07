import { Sexo } from "../../sexo";
import { TipoDocumento } from "../../tipo-documento";
import { Ubigeo } from "../../ubigeo";

export interface PersonaResponse {
  idPersona: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo:Sexo;
  fechaNacimiento: Date;
  numDocumento: string;
  direccion: string;
  telefono: string;
  tipoDocumento: TipoDocumento;
  ubigeo: Ubigeo;
}
