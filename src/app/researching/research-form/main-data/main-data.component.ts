import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ResourceList } from '../../../model/example-data';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-main-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, 
    MatInputModule, MatFormFieldModule, MatCheckboxModule,
    MatRadioModule],
  templateUrl: './main-data.component.html',
  styleUrl: './main-data.component.css'
})
export class MainDataComponent {
  
  public resourceList: any = ResourceList;
  public resourceForm!: FormGroup;
  public mainDataForm!: FormGroup;

  constructor(private formService: FormService){ }

  ngOnInit(){
    this.resourceForm = this.formService.resourceForm;
    this.mainDataForm = this.formService.mainDataForm;
  }
}
