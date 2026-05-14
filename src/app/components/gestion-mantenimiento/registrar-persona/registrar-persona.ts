import { Component,inject,OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup,Validators,ReactiveFormsModule} from '@angular/forms';
import { PersonaResponse } from '../../../model/api/response/persona-response';
import { PersonaRequest } from '../../../model/api/request/persona-request';
import { PersonaService } from '../../../services/persona.service';
import { TipoDocumentoService } from './../../../services/tipo-documento.service';
import { UbigeoService } from '../../../services/ubigeo.service';
import { SexoService } from '../../../services/sexo.service';
import { TipoDocumento } from '../../../model/tipo-documento';
import { Ubigeo } from '../../../model/ubigeo';
import { Sexo } from '../../../model/sexo';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-registrar-persona',
  imports: [CommonModule,ReactiveFormsModule,NgxPaginationModule],
  templateUrl: './registrar-persona.html',
  styleUrl: './registrar-persona.scss',
})
export class RegistrarPersona implements OnInit{
  title="Registrar Persona";
  private personaService = inject(PersonaService);
  private tipoDocumentoService = inject(TipoDocumentoService);
  private ubigeoService = inject(UbigeoService);
  private sexoService = inject(SexoService);
  private cdr = inject(ChangeDetectorRef);

  personaArray: PersonaResponse[]=[];
  tipoDocumentoArray: TipoDocumento[]=[];
  ubigeoArray: Ubigeo[]=[];
  sexoArray: Sexo[]=[];

  personaRequest:PersonaRequest={} as PersonaRequest;
  personaForm:FormGroup;
  page:number=1;


  constructor(){
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
    this.getSexo();
    this.getTipoDocumento();
    this.getUbigeo();
    this.getPersonas();
  }

  getPersonas():void{
    this.personaService.getPersonas().subscribe((result:any)=>{
      console.log(result);
      this.personaArray=result;
    });
  }//end getPersonas()

  setPersonaRequest():void{
    this.personaRequest.idPersona=this.personaForm.get('idPersona')?.value;
    this.personaRequest.apellidoPaterno=this.personaForm.get('apellidoPaterno')?.value;
    this.personaRequest.apellidoMaterno=this.personaForm.get('apellidoMaterno')?.value;
    this.personaRequest.nombres=this.personaForm.get('nombres')?.value;
    this.personaRequest.idSexo=this.personaForm.get('idSexo')?.value;
    this.personaRequest.fechaNacimiento=this.personaForm.get('fechaNacimiento')?.value;
    this.personaRequest.idTipoDocumento=this.personaForm.get('idTipoDocumento')?.value;
    this.personaRequest.numDocumento=this.personaForm.get('numDocumento')?.value;
    this.personaRequest.direccion=this.personaForm.get('direccion')?.value;
    this.personaRequest.telefono=this.personaForm.get('telefono')?.value;
    this.personaRequest.idUbigeo=this.personaForm.get('idUbigeo')?.value;
  }

  registrarPersona():void{
    this.setPersonaRequest();
    console.log(this.personaRequest);
    this.personaService.registrarPersona(this.personaRequest).subscribe(
      (result:any)=>{
        console.log(result);
        this.getPersonas();
      },
      (err:any)=>{
        console.log(err);
      }
    );


  }//end registrarPersona()

  editarPersona(persona: PersonaResponse):void{

  }

  eliminarPersona(persona: PersonaResponse):void{

  }

  getTipoDocumento():void{
    this.tipoDocumentoService.getTipoDocumento().subscribe(
    (result:TipoDocumento[])=>{
      console.log(result);
      this.tipoDocumentoArray=result;
      this.cdr.detectChanges();
    },
    (err:any)=>{
      console.log(err);
    }
  );
  }//end getTipoDocumento()
  setTipoDocumento(event: Event):void {
    const inputChangeValue = (event.target as HTMLInputElement).value;
    this.personaForm.controls['idTipoDocumento'].setValue(inputChangeValue);
  }

  getUbigeo():void{
    this.ubigeoService.getUbigeo().subscribe(
    (result:Ubigeo[])=>{
      console.log(result);
      this.ubigeoArray=result;
      this.cdr.detectChanges();
    },
    (err:any)=>{
      console.log(err);
    }
  );
  }//end getUbigeo()

  setUbigeo(event: Event):void {
    const inputChangeValue = (event.target as HTMLInputElement).value;
    this.personaForm.controls['idUbigeo'].setValue(inputChangeValue);
  }

  getSexo():void{
    this.sexoService.getSexo().subscribe(
    (result:Sexo[])=>{
      console.log(result);
      this.sexoArray=result;
      this.cdr.detectChanges();
    },
    (err:any)=>{
      console.log(err);
    }
  );
  }//end getSexo()

  setSexo(event: Event):void {
    const inputChangeValue = (event.target as HTMLInputElement).value;
    this.personaForm.controls['idSexo'].setValue(inputChangeValue);
  }



}
