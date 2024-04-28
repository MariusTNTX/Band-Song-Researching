import { Routes } from '@angular/router';
import { HomeComponent } from './course/home/home.component';
import { ResearchFormComponent } from './researching/research-form/research-form.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'researching',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'researching',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'researching',
        component: ResearchFormComponent,
        pathMatch: 'full'
    }
];
