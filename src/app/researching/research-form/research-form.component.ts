import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlbumsComponent } from './albums/albums.component';
import { GeneratorComponent } from './generator/generator.component';
import { MainDataComponent } from './main-data/main-data.component';
import { ResourcesComponent } from './resources/resources.component';
import { ResultComponent } from './result/result.component';

@Component({
  selector: 'app-research-form',
  standalone: true,
  imports: [CommonModule, MainDataComponent, ResourcesComponent, 
            AlbumsComponent, GeneratorComponent, ResultComponent],
  templateUrl: './research-form.component.html',
  styleUrl: './research-form.component.css'
})
export class ResearchFormComponent {

  constructor(){ }

}
