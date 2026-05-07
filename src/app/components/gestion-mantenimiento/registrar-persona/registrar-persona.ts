import { Component } from '@angular/core';
import {FormControl, FormGroup,Validators,ReactiveFormsModule} from '@angular/forms';
import { PersonaResponse } from '../../../model/api/response/persona-response';
import { PersonaRequest } from '../../../model/api/request/persona-request';
import { PersonaService } from '../../../services/persona.service';


@Component({
  selector: 'app-registrar-persona',
  imports: [ReactiveFormsModule],
  templateUrl: './registrar-persona.html',
  styleUrl: './registrar-persona.scss',
})
export class RegistrarPersona {
  title="Registrar Persona";
  personaArray: PersonaResponse[]=[];
  personaRequest:PersonaRequest={} as PersonaRequest;
  personaForm:FormGroup;

  constructor(
    private personaService:PersonaService,
  ){
    this.personaForm=new FormGroup({
      idPersona:new FormControl('',[Validators.required]),
      apellidoPaterno:new FormControl('',[Validators.required]),
      apellidoMaterno:new FormControl('',[Validators.required]),
      nombres:new FormControl('',[Validators.required]),
      idSexo:new FormControl('3',[Validators.required]),
      fechaNacimiento:new FormControl('',[Validators.required]),
      idTipoDocumento:new FormControl('1',[Validators.required]),
      numDocumento:new FormControl('',[Validators.required]),
      direccion:new FormControl('',[Validators.required]),
      telefono:new FormControl('',[Validators.required]),
      idUbigeo:new FormControl('150101',[Validators.required]),
    });//end new FormGroup
  }//end del constructor

  ngOnInit(){
    this.getPersonas();
  }

  getPersonas():void{
    this.personaService.getPersonas().subscribe((result:any)=>{
      console.log(result);
      this.personaArray=result;
    });
  }



}
