import { CustomValidators } from './../../shared/custom.validators';
import { ISkill } from './../ISkill';
import { IEmployee } from './../IEmployee';
import { EmployeeService } from './../employee.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup ,FormBuilder, Validators, AbstractControl, FormControl, FormArray} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  iemployee: IEmployee;
  pageTitle: string;

  validationMessages = {
    'fullName':{
      'required': 'Full Name is required',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 20 characters.',
    },
    'email':{
      'required': 'Email is required',
      'emailDomain': 'Email domain should be gmail.com'
    },
    'confirmEmail':{
      'required': 'Confirm Email is required',
    },
    'emailGroup':{
      'emailMismatch': 'Email and Confirm Email do not match',
    },
    'phone':{
      'required': 'Phone is required',
    }
  }

  formErrors = {
   'fullName': '',
   'email': '',
   'confirmEmail': '',
   'emailGroup': '',
   'phone': '',
   'skillName': '',
   'experienceInYears': '',
   'proficiency': ''
};

  constructor(private fb : FormBuilder,
              private route:ActivatedRoute,
              private employeeService: EmployeeService,
              private router : Router ) { }

  ngOnInit(){
    this.employeeForm= this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      contactPreference:['email'],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('gmail.com')]],
        confirmEmail: ['',Validators.required],
      },{validators: matchEmail}),
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ])
    });

    this.employeeForm.get('contactPreference').valueChanges.subscribe((data : string) => {
      this.onContactPreferenceChange(data);
    });

    this.employeeForm.valueChanges.subscribe((data) =>{
      this.logValidationErrors(this.employeeForm);
    });


    this.route.paramMap.subscribe(params =>{
      const empId = +params.get('id');
      if(empId){
        this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      } else {
        this.pageTitle = 'Create Employee';
        this.iemployee={
          id : null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };
      }
    });
  }

  getEmployee(id: number){
    this.employeeService.getEmployee(id).subscribe(
      (employee: IEmployee) => {
      this.editEmployee(employee);
      this.iemployee = employee;
    },
      (err: any) => console.log(err)
    );
  }

  editEmployee(employee: IEmployee){
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });
    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }

  setExistingSkills(skillSets: ISkill[]) : FormArray{
    const formArray= new FormArray([]);
    skillSets.forEach(s=> {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears : s.experienceInYears,
        proficiency : s.proficiency
      }));
    });
    return formArray;
  }

  onContactPreferenceChange(selectedValue: string){
    const phoneControl = this.employeeForm.get('phone');
    if(selectedValue === 'phone'){
      phoneControl.setValidators(Validators.required);
    }else{
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  addSkillButtonClick():void{
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }

  removeSkillButtonClick(skillGroupIndex: number): void{
    const skillsFormArray = (<FormArray>this.employeeForm.get('skills'));
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

  addSkillFormGroup(): FormGroup{
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['',Validators.required],
      proficiency: ['',Validators.required]
    });
  }

  logValidationErrors(group: FormGroup = this.employeeForm):void{
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';
        if(abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty || abstractControl.value !=='' )){
          const messages = this.validationMessages[key];
          //console.log(messages);
           for(const errorKey in abstractControl.errors){
             if(errorKey){
               this.formErrors[key] += messages[errorKey] + '';
             }
           }
        }
      if(abstractControl instanceof FormGroup){
        this.logValidationErrors(abstractControl);
      }

      // if(abstractControl instanceof FormArray){
      //   for(const control of abstractControl.controls){
      //     if(control instanceof FormGroup){
      //       this.logValidationErrors(control);
      //     }
      //   }
      // }
    });
  }

  logKeyValuePairs(group: FormGroup):void{
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if(abstractControl instanceof FormGroup){
        this.logKeyValuePairs(abstractControl);
        abstractControl.disable();
      }else{

      }
    });
  }

  onLoadDataClick(): void{

    const formArray = this.fb.array([
      new FormControl('John', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('Male', Validators.required)
    ]);

    const formGroup = this.fb.group([
      new FormControl('John', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('Male', Validators.required)
    ]);

    console.log(formArray);
    console.log(formGroup);
    }

  onSubmit(): void{
    this.mapFormValuesToEmployeeModel();
    if(this.iemployee.id){
      this.employeeService.updateEmployee(this.iemployee).subscribe(
        ()=> this.router.navigate(['list']),
        (err : any) => console.log(err)
      );
    } else {
      this.employeeService.addEmployee(this.iemployee).subscribe(
        ()=> this.router.navigate(['list']),
        (err : any) => console.log(err)
      );
    }
  }

  mapFormValuesToEmployeeModel(){
    this.iemployee.fullName = this.employeeForm.value.fullName;
    this.iemployee.contactPreference= this.employeeForm.value.contactPreference;
    this.iemployee.email = this.employeeForm.value.emailGroup.email;
    this.iemployee.phone = this.employeeForm.value.phone;
    this.iemployee.skills = this.employeeForm.value.skills;
  }
}

function matchEmail(group: AbstractControl):{ [key: string]: any} | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');

  if(emailControl.value === confirmEmailControl.value
    || (confirmEmailControl.pristine && confirmEmailControl.value === '')){
    return null;
  }else{
    return{ 'emailMismatch': true};
  }
}
