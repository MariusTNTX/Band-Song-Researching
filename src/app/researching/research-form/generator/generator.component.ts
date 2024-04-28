import { Component } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BandResult } from '../../../model/band-result';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule],
  templateUrl: './generator.component.html',
  styleUrl: './generator.component.css'
})
export class GeneratorComponent {

  public resources!: any;
  public mainData!: any;
  public albums!: any;
  public songs!: any;
  
  constructor(private formService: FormService){ 
    this.resources = formService.resourceForm.value;
    this.mainData = formService.mainDataForm.value;
    this.albums = formService.albumForm.value;
    this.songs = formService.songControl.value;
  }
  
  generateResult(){
    //Por cada fuente obtener una lista de canciones (filtradas por checked) que estén en los primeros 10 puestos 
    //Almacenar número de repeticiones de cada canción en cada canción
    //(Si hay que ampliar): Por cada fuente añadir tantas canciones como repeticiones=1 haya y volver a calcular las repeticiones
    //
    
  }
}
