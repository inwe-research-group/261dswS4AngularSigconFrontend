import { Component,inject,OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormGroup,Validators,ReactiveFormsModule,AbstractControl,ValidationErrors,ValidatorFn} from '@angular/forms';
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
import Swal from 'sweetalert2';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-registrar-persona',
  imports: [CommonModule,ReactiveFormsModule,NgxPaginationModule,NgbTooltip],
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
  isEdited:boolean=false;


  constructor(){
    this.personaForm=new FormGroup({
      idPersona:new FormControl(''),
      apellidoPaterno:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      apellidoMaterno:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      nombres:new FormControl('',[Validators.required,Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ ]{0,29}$/),]),
      idSexo:new FormControl('',Validators.required),
      fechaNacimiento:new FormControl('',[Validators.required, this.ageRangeValidator(18, 80)]),
      idTipoDocumento:new FormControl('',Validators.required),
      numDocumento:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator(), this.maxConsecutiveSameDigitsValidator(4)]),
      telefono:new FormControl('',[Validators.required, Validators.pattern('^[0-9]{9}$'), this.noSameDigitsValidator(), this.maxConsecutiveSameDigitsValidator(4)]),
      direccion:new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(35),
        Validators.pattern(/^[A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚ .°-]*(\d{1,4}[A-ZÑÁÉÍÓÚ .°-]*)?$/),
        this.noRepeatedCharsValidator()
      ]),
      idDepartamento:new FormControl('',Validators.required),
      idProvincia:new FormControl('',Validators.required),
      idDistrito:new FormControl('',Validators.required),
    });//end new FormGroup
  }//end del constructor

  ngOnInit(){
    this.getSexo();
    this.getTipoDocumento();
    this.getUbigeo();
    this.getPersonas();
  }

  private ageRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= min && age <= max ? null : { ageRange: true };
    };
  }

  private noSameDigitsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      if (val.length < 7) return null;
      const allSame = val.split('').every((char: string) => char === val[0]);
      return allSame ? { sameDigits: true } : null;
    };
  }

  private maxConsecutiveSameDigitsValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      const regex = new RegExp(`(.)\\1{${max},}`);
      return regex.test(val) ? { maxConsecutive: true } : null;
    };
  }

  private noRepeatedCharsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const val = control.value.toString();
      // Detecta 3 o más caracteres idénticos consecutivos
      const hasRepeated = /(.)\1\1/.test(val);
      return hasRepeated ? { repeatedChars: true } : null;
    };
  }

  getErrorMessage(controlName: string): string {
    const control = this.personaForm.get(controlName);
    if (control?.touched || control?.dirty) {
      if (control?.hasError('required')) return 'Este campo es obligatorio';
      if (control?.hasError('ageRange')) return 'Debe tener entre 18 y 80 años';
      if (control?.hasError('sameDigits')) return 'No se permiten todos los dígitos iguales';
      if (control?.hasError('repeatedChars')) return 'No se permiten 3 caracteres iguales seguidos';
      if (control?.hasError('maxConsecutive')) return 'No se permiten más de 4 dígitos iguales seguidos';
      if (control?.hasError('pattern')) {
        switch (controlName) {
          case 'apellidoPaterno':
          case 'apellidoMaterno':
          case 'nombres':
            return 'Solo letras mayúsculas (incluyendo Ñ y tildes), máx 30';
          case 'numDocumento':
            return '9 dígitos, sin 5 repetidos';
          case 'telefono':
            return '9 dígitos, sin 5 repetidos';
          case 'direccion':
            return 'Inicia con letra, un solo número (1-4 dígitos), símbolos: . ° -';
          default:
            return 'Formato inválido';
        }
      }
      if (control?.hasError('minlength')) return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
      if (control?.hasError('maxlength')) return `Máximo ${control.getError('maxlength').requiredLength} caracteres`;
    }
    return '';
  }

  getPersonas():void{
    this.personaService.getPersonas().subscribe((result:any)=>{
      //console.log(result);
      this.personaArray=result;
      this.cdr.detectChanges()
    });
  }//end getPersonas()

  setFormValueIni(){
    this.personaForm.patchValue({
      idSexo:'I',
      idTipoDocumento: '1',
      idUbigeo: '150101'
    });
  }

  refreshForm(){
    this.getPersonas();
    this.personaForm.reset();
    this.isEdited=false;
    this.setFormValueIni();
  }

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
    if(this.isEdited) this.actualizarPersona();
    else
      this.insertarPersona();
  }

  insertarPersona():void{
    Swal.fire({
      title:'Esta seguro de registrar los datos de la persona?',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor: '#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        this.personaService.registrarPersona(this.personaRequest).subscribe(
        (result:PersonaResponse)=>{
          this.cdr.detectChanges()
          this.refreshForm();
          Swal.fire({
            icon:'success',
            title:'registrarPersona...',
            text:'!Se registro exitosamente los datos de la persona',
            confirmButtonColor:'#000080'
          });
        },
        (err:any)=>{
          console.log(err);
          Swal.fire({
            icon:'error',
            title:'Advertencia...',
            text:'!Ah ocurrido un error al registrar persona',
            confirmButtonColor:'#000080'
          });
        }//cierre del err
        );//cierre del suscribe
      }//end if
    })//end then
  }//end insertarPersona()

  actualizarPersona():void{
    Swal.fire({
      title:'Esta seguro de actualizar los datos de la persona?',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor: '#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        this.personaService.updatePersona(this.personaRequest).subscribe(
        (result:PersonaResponse)=>{
          this.cdr.detectChanges()
          this.refreshForm();
          Swal.fire({
            icon:'success',
            title:'actualizarPersona...',
            text:'!Se actualizó exitosamente los datos de la persona',
            confirmButtonColor:'#000080'
          });
        },
        (err:any)=>{
          console.log(err);
          Swal.fire({
            icon:'error',
            title:'Advertencia...',
            text:'!Ah ocurrido un error al actualizar persona',
            confirmButtonColor:'#000080'
          });
        }//cierre del err
        );//cierre del suscribe
      }//end if
    })//end then

  }

  editarPersona(persona:PersonaResponse):void{
     Swal.fire({
      title:'Esta seguro de editar los datos de la persona?',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor: '#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        this.personaForm.patchValue({
          idPersona:persona.idPersona,
          apellidoPaterno:persona.apellidoPaterno,
          apellidoMaterno:persona.apellidoMaterno,
          nombres:persona.nombres,
          idSexo:persona?.sexo?.idSexo,
          fechaNacimiento:persona.fechaNacimiento,
          idTipoDocumento:persona?.tipoDocumento?.idTipoDocumento,
          numDocumento:persona.numDocumento,
          telefono:persona.telefono,
          direccion:persona.direccion,
          idUbigeo:persona?.ubigeo?.idUbigeo,
        });
        this.isEdited=true;
      }//end if
    })//end then

  }

  eliminarPersona(persona: PersonaResponse):void{
    Swal.fire({
      title:'Esta seguro de eliminar la persona seleccionada?',
      showCancelButton:true,
      cancelButtonText:'No',
      confirmButtonText:'Si',
      confirmButtonColor:'#000080',
      cancelButtonColor: '#ff0000',
      focusCancel:true,
    }).then((result)=>{
      if(result.isConfirmed){
        const request:PersonaRequest={...this.personaRequest, idPersona:persona.idPersona}
        console.log(request);
        this.personaService.deletePersona(request).subscribe(
        (result:PersonaResponse)=>{
          this.cdr.detectChanges()
          this.refreshForm();
          Swal.fire({
            icon:'success',
            title:'eliminarPersona...',
            text:'!Se eliminó exitosamente la persona',
            confirmButtonColor:'#000080'
          });
        },
        (err:any)=>{
          console.log(err);
          Swal.fire({
            icon:'error',
            title:'Advertencia...',
            text:'!Ah ocurrido un error al eliminar persona',
            confirmButtonColor:'#000080'
          });
        }//cierre del err
        );//cierre del suscribe
      }//end if
    })//end then

  }


  getTipoDocumento():void{
    this.tipoDocumentoService.getTipoDocumento().subscribe(
    (result:TipoDocumento[])=>{
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
