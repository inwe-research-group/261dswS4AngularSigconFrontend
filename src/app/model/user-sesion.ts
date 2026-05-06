import { Rol } from "./rol";
import { Modulo } from "./modulo";

export interface UserSesion {
  personaId: number;
  email:string;
  names:string;
  rol:Rol;
  modulos:Modulo[];
}
