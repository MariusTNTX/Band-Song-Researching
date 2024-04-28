import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ResourceList } from '../../../model/example-data';
import { FormService } from '../../../services/form.service';
import { MatButtonModule } from '@angular/material/button';
import { ResourceSongsComponent } from './resource-songs/resource-songs.component';
import { MatIconModule } from '@angular/material/icon';
import { TotalSongsComponent } from './total-songs/total-songs.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatCheckboxModule, 
    MatTabsModule, MatButtonModule, MatSelectModule, 
    MatIconModule, ResourceSongsComponent, TotalSongsComponent],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent {

  public resourceList: any = ResourceList;
  public resourceForm!: FormGroup;

  constructor(private formService: FormService){ }

  get filtered(){
    return this.resourceForm.value.filtered;
  }

  ngOnInit(){
    this.resourceForm = this.formService.resourceForm;
  }

  getFormGroup(id: string){
    return this.resourceForm.get(id) as FormGroup;
  }

  toggleResourceFilter(){
    this.resourceForm.get('filtered')?.setValue(!this.resourceForm.value.filtered);
  }
}
