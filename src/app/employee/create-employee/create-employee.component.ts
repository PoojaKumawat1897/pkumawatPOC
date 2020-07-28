import { Component, OnInit } from '@angular/core';
import { FormGroup ,FormBuilder, Validators, AbstractControl, FormControl, FormArray} from '@angular/forms';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;

  validationMessages = {
    'fullName':{
      'required': 'Full Name is required',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 20 characters.',
    },
    'email':{
      'required': 'Email is required',
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

  constructor(private fb : FormBuilder ) { }

  ngOnInit(){
    this.employeeForm= this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      contactPreference:['email'],
      emailGroup: this.fb.group({
        email: ['', Validators.required],
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
    (<FormArray>this.employeeForm.get('skills')).removeAt(skillGroupIndex);
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
          abstractControl.touched || abstractControl.dirty ){
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
    console.log(this.employeeForm.touched);
    console.log(this.employeeForm.value);

    console.log(this.employeeForm.controls.fullName.touched);
    console.log(this.employeeForm.get('fullName').value);
  }
}

function matchEmail(group: AbstractControl):{ [key: string]: any} | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');

  if(emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine){
    return null;
  }else{
    return{ 'emailMismatch': true};
  }
}
