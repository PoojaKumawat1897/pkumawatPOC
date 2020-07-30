import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { ListEmployeesComponent } from './list-employees/list-employees.component';

const appRoutes: Routes = [
  { path: 'list',component: ListEmployeesComponent },
  { path: 'create', component: CreateEmployeeComponent},
  { path: 'edit/:id', component: CreateEmployeeComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports:[ RouterModule]
})
export class EmployeeRoutingModule { }
