import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path:'',component: Home},
  { path: 'login', component: InicioSesion},
  { path: 'dashboard', component: Dashboard},
  { path:'**',redirectTo:''},
];
