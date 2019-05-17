import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { AppConfig } from '../app.config';
import { Router, ActivatedRoute } from '@angular/router';
import { SweetAlertService } from 'angular-sweetalert-service';
import swal from 'sweetalert2';
import { CurrUser } from '../_model/curruser.model';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FilePreviewModel, ValidationError } from 'ngx-awesome-uploader';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { ProfileDetailsService } from '../innerpageheader/services/profile-details.service';
import { HttpClient } from '@angular/common/http';
import { EditProfile } from '../innerpageheader/models/edit-profile.model';
import { ChnagepasswordService } from '../changepassword/service/chnagepassword.service';
import {CompanyProfileService} from '../_service/company-profile.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  show: boolean = true;
  appConfig: AppConfig;
  currUser: CurrUser;
  userDetails: any;
  id: number;
  private sub: any;
  projectId: string;
  editprofileForm: FormGroup;
  public myEditProfileForm: FormGroup;
  public width: number = 300;
  public height: number = 300;
  public label: string = 'Sign above';
  //company profile setting
  public CompanyName:string;
  public companyProfileForm: FormGroup;
  //
  profileData: any;
  myFiles: FilePreviewModel[] = [];
  isPasswordValid: boolean;
  isPasswordMatched: boolean;
  displayPassword: boolean;
  registerForm: FormGroup;

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'canvasWidth': 300,
    'canvasHeight': 150,
    'label': 'Sign Above',
    // 'backgroundColor': '#f6fbff',
    'width': 100,
    'height': 100,
    "penColor": "rgb(0,0,0)",
    "dotSize": 1,
    "minWidth": 0.01,
    "maxWidth": 0.01,
  };
  clearSignaturetext: boolean = true;
  signatureSubmit: boolean;
  submitted: boolean;
  uploadImageData: boolean;
  signatureUrl: string;
  displaySignatureImage: boolean;
  drawSignature: boolean = true;
  file: any;
  fileName: string;
  openUploadDialog: boolean;
  displaySignaturepad: boolean;
  notdisplaySignaturepad: boolean;
  fileUploadEnable: boolean;
  base64textString: string;
  base64String: string[] = [];
  displayOldPassword: boolean;
  displaynewPassword: boolean;
  displayconfirmPassword: boolean;
  isSignaturePad: boolean = true;
  isSignaturePadEmpty: boolean;
  url: string;


  constructor(private router: Router, private alertService: SweetAlertService, public toastr: ToastrManager, private route: ActivatedRoute, private http: HttpClient,
    private fb: FormBuilder,private fb1: FormBuilder, private profileDetailsService: ProfileDetailsService, public chnagepasswordService: ChnagepasswordService,private companyProfileService:CompanyProfileService
  ) {
    this.appConfig = new AppConfig();
    this.userDetails = this.appConfig.getCurrentUser();
    this.getProfileDetails();
    if (this.userDetails == null) {
      this.toastr.errorToastr('Please Login!', 'Oops Session Expired!');
      this.router.navigate(['/login']);
    }
    if (this.userDetails.fullName != null || undefined) {
      let stringToSplit = this.userDetails.fullName;
      let x = stringToSplit.split(" ");
      if (x.length > 1)
        this.userDetails.IntialFirstName = x[0].charAt(0) + x[1].charAt(0);
      else
        this.userDetails.IntialFirstName = x[0].charAt(0);

    }
  }

  ngOnInit() {
    this.companyProfileForm = new FormGroup({
      company: new FormControl(''),
    });
    debugger;
    this.CompanyName = this.companyProfileService.getCompanyById(2);
    //this.CompanyName="pQRST";
    this.show = true;
    this.editprofileForm = this.fb.group({
      FirstName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      LastName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      CompanyName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      MobileNo: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      Signature: ['', Validators.required]
    });
    this.create_Cp_Form();
    this.createMyProfileEditForm();

  }

  logout() {
    this.appConfig.removeCurrentUser();
    this.router.navigate(['/login']);

  }

  workInProgressMessage() {
    swal({
      title: "Work in Progress!!",
      //text: "Work in Progress!!",
      imageUrl: 'https://static.thenounproject.com/png/593651-200.png'
    });
  }
  LessonLearntMsg() {
    this.toastr.errorToastr('Please select a project.', 'Oops!!');
  }

  ngAfterViewInit() {
    $.getScript('../assets/js/custom.js', function () { });

    this.signaturePad.set('minWidth', 3); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API

  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    //console.log(this.signaturePad.toDataURL());
    this.signatureUrl = this.signaturePad.toDataURL();
    this.clearSignaturetext = false;
    this.signatureSubmit = true;
    this.isSignaturePadEmpty=false;
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    // console.log('begin drawing');
  }

  clearSignature() {
    this.signaturePad.clear();
    this.isSignaturePadEmpty=true;

    this.clearSignaturetext = true;
    this.signatureSubmit = false;
  }

  refreshPopupData(event) {
    this.editprofileForm = this.fb.group({
      FirstName: [this.profileData.FirstName, Validators.compose([Validators.required, Validators.maxLength(50)])],
      LastName: [this.profileData.LastName ? this.profileData.LastName : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      CompanyName: [this.profileData.CompanyName ? this.profileData.CompanyName : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      MobileNo: [this.profileData.CellPhone ? this.profileData.CellPhone : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      Signature: [this.profileData.Signature]
    });
    this.getProfileDetails();
    this.openUploadDialog = false;
    this.notdisplaySignaturepad = false;

  }

  createForm() {
    this.editprofileForm = this.fb.group({
      FirstName: [this.profileData.FirstName, Validators.compose([Validators.required, Validators.maxLength(50)])],
      LastName: [this.profileData.LastName ? this.profileData.LastName : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      CompanyName: [this.profileData.CompanyName ? this.profileData.CompanyName : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      MobileNo: [this.profileData.CellPhone ? this.profileData.CellPhone : '', Validators.compose([Validators.required, Validators.maxLength(50)])],
      Signature: [this.profileData.Signature, Validators.required]
    });
  }

  get fg() {
    return this.editprofileForm.controls;
  }

  createMyProfileEditForm() {
		this.myEditProfileForm = this.fb1.group({
			FirstName: ['',  [Validators.required,  Validators.maxLength(50)]],
			LastName: ['',  [Validators.required,  Validators.maxLength(50)]],
			CellPhone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],

    });
    
	}
	get fg1() {
		return this.myEditProfileForm.controls;
	}

  getProfileDetails() {
    this.profileDetailsService.getProfileDetails(this.userDetails.usermasterId).subscribe(result => {
      if (result.ResponseCode == 200 && result.Status == 1) {
        this.profileData = result.ResponseData;
        if (result.ResponseData.Signature !== null) {
          this.isSignaturePadEmpty=false;
          this.signaturePad.fromDataURL(result.ResponseData.Signature)
        }

        this.myEditProfileForm = this.fb.group({
					FirstName: [result.ResponseData.FirstName, [Validators.required,  Validators.maxLength(50)]],
					LastName: [result.ResponseData.LastName, [Validators.required,  Validators.maxLength(50)]],
					CellPhone: [result.ResponseData.CellPhone, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
				});

        // if (result.ResponseData.Signature.length > 22) {
        //   this.displaySignatureImage = true;
        //   this.drawSignature = false;
        //   this.signatureSubmit = true;
        // }
        // this.createForm();
        // this.closeLessonLearntModal.nativeElement.click();
      }
      else if (result.ResponseCode == 300) {
        // console.log(result);
        this.toastr.warningToastr("Please enter a valid file", "Invalid file type!!")
      }
      else {
        this.toastr.errorToastr('Something went wrong!', 'Oops!!');

      }

    })
  }



  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onValidationError(error: ValidationError) {
    //alert(`Validation Error ${error.error} in ${error.file.name}`);
    this.toastr.warningToastr("Maximum size allowed 30 MB", "Oops!!");
  }
  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    //  console.log("*****",btoa(binaryString));
    //  console.log("-----",this.base64textString);
    this.base64String.push('data:image/png;base64,' + btoa(binaryString));
  }

  onSubmit(data) {
    //console.log(this.signatureUrl);
    this.submitted = true;
    // if (this.signatureUrl == undefined && !this.fileUploadEnable  ) {
    //     this.validateAllFormFields(this.editprofileForm);
    //     return;
    // }
    // if (this.fileUploadEnable) {
    //   this.signatureUrl = this.base64String[0]
    // }
    if (this.isSignaturePad === true) {
      if (this.signaturePad.isEmpty()) {
        this.toastr.errorToastr('Please enter a valid signature!', 'Oops!!');
        return
      }

    }
    if (this.isSignaturePad === false && this.url === '') {
      this.toastr.errorToastr('Please upload a valid signature!', 'Oops!!');
      return
    }

    let editProfileModel: EditProfile = new EditProfile();
    editProfileModel.FirstName = data.FirstName;
    editProfileModel.LastName = data.LastName;
    editProfileModel.CompanyName = data.CompanyName;
    editProfileModel.CellPhone = data.MobileNo;
    // editProfileModel.Signature = this.signatureUrl ? this.signatureUrl : null;
    if (this.isSignaturePad === true) {
      editProfileModel.Signature = this.signaturePad.toDataURL();
    }
    else {
      editProfileModel.Signature = "Signature Image Url";
    }

    editProfileModel.UserMasterId = this.userDetails.usermasterId;
    if (this.isSignaturePad) {
      editProfileModel.IsSignaturePad = true;
    }
    else {
      editProfileModel.IsSignaturePad = false;
    }

    this.profileDetailsService.editProfileDetails(editProfileModel).subscribe(result => {
      if (result.ResponseCode == 200 && result.Status == 1) {
        document.getElementById('closeBtn').click();
        this.getProfileDetails();
        this.openUploadDialog = false;
        this.notdisplaySignaturepad = false;
        this.displaySignatureImage = true;
        this.drawSignature = false;
        this.fileUploadEnable = false;
        this.signatureUrl = undefined;
        var signatureimagevalue = (<HTMLInputElement>document.getElementById('imageName'));
        signatureimagevalue.value = "";
      }
      else if (result.ResponseCode == 300) {
        // console.log(result);
        this.toastr.warningToastr("Please enter a valid file", "Invalid file type!!");
        this.fileUploadEnable = false;
        this.signatureUrl = undefined;
      }
      else {
        this.toastr.errorToastr('Something went wrong!', 'Oops!!');
        this.fileUploadEnable = false;
        this.signatureUrl = undefined;

      }
    })

  }

  uploadImage() {
    this.uploadImageData = true;
  }

  deleteSignature() {
    this.signaturePad.clear();
    this.clearSignaturetext = true;


    this.displaySignatureImage = false;
    this.drawSignature = true;
    var signaturevalue = (<HTMLInputElement>document.getElementById('signature'));
    signaturevalue.value = "";
    this.signatureSubmit = false;
  }

  uploadSignatureImage() {
    this.openUploadDialog = true;
    this.drawSignature = false;
    this.notdisplaySignaturepad = true;
  }
  displaySignaturePad() {
    this.openUploadDialog = false;
    this.drawSignature = true;
    this.notdisplaySignaturepad = false;
    var signatureimagevalue = (<HTMLInputElement>document.getElementById('imageName'));
    signatureimagevalue.value = "";
    this.file = "";
  }

  onUploadSuccess(e: FilePreviewModel) {
    console.log(e);
    console.log(this.myFiles)
  }
  onRemoveSuccess(e: FilePreviewModel) {
    console.log(e);
  }
  onFileAdded(file: FilePreviewModel, evt) {
    this.myFiles.push(file);
    var file1 = (<HTMLInputElement>document.getElementById('fileInput'));
    this.fileName = file1.files[0].name
    this.file = this.fileName;
    //console.log("file added after selecting");
    this.fileUploadEnable = true;
    //console.log(this.fileUploadEnable);



    var file2 = (<HTMLInputElement>document.getElementById('fileInput'));

    if (file2) {
      var reader = new FileReader();

      // reader.onload = this._handleReaderLoaded.bind(this);

      // reader.readAsBinaryString(file2.files[0]);

      reader.readAsDataURL(file2.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = reader.result;
      }
    }
  }
  GetFiles() {
    //	console.log(this.myFiles);
    //  this.uploadFiles(this.assetAttachId);
    //this.uploadFiles(1);
  }


  // Code for change password

  create_Cp_Form() {
    this.registerForm = this.fb.group({
      oldHashedPassword: ['', Validators.required],
      HashedPassword: ['', Validators.required],
      ConfirmHashedPassword1: ['', Validators.required]
    })
  }

  onSubmit_Cp(value) {
    this.submitted = true;
    if (this.isPasswordValid == true) {
      return;
    }
    if (this.isPasswordMatched == true) {
      return;
    }
    if (this.registerForm.invalid) {
      return;
    }
    this.chnagepasswordService.changePassword(this.userDetails.usermasterId, value.oldHashedPassword, value.HashedPassword).subscribe(result => {
      if (result.ResponseCode == 200 && result.Status == 1) {

        this.toastr.successToastr('Succesfully Change password!', 'Success!');
        document.getElementById('closeBtn_Cp').click();
        this.create_Cp_Form();
      }
      else if (result.ResponseCode == 409) {
        // console.log(result);
        this.toastr.warningToastr("Problem with entered data! ", "Current Password not matched!!")
      }
      else {
        this.toastr.errorToastr('Something went wrong!', 'Oops!!');

      }
    })
  }

  passwordValidation(event: any) {
    if (event.target.value.length >= 8) {
      this.isPasswordValid = false;
      let el: HTMLElement;
      el = document.getElementById('hashedPassword');
      el.classList.remove('is-invalid');
    }
    else if (event.target.value.length == 0) {
      this.isPasswordValid = false;
      let el: HTMLElement;
      el = document.getElementById('hashedPassword');
      el.classList.remove('is-invalid');
    }
    else {
      this.isPasswordValid = true;
      let el: HTMLElement;
      el = document.getElementById('hashedPassword');
      el.classList.add('is-invalid');
    }
  }

  passwordMatchValidation(event: any) {
    if (this.f.HashedPassword.value == event.target.value) {

      this.isPasswordMatched = false;
      let el: HTMLElement;
      el = document.getElementById('ConfirmHashedPassword');
      el.classList.remove('is-invalid');

    }
    else if (event.target.value.length == 0) {
      this.isPasswordMatched = false;
      let el: HTMLElement;
      el = document.getElementById('ConfirmHashedPassword');
      el.classList.remove('is-invalid');
    }
    else {
      this.isPasswordMatched = true;
      let el: HTMLElement;
      el = document.getElementById('ConfirmHashedPassword');
      el.classList.add('is-invalid');
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  viewoldHashedPassword() {
    this.displayPassword = true;
    this.displayOldPassword = true;
    if (document.getElementById('oldHashedPassword').getAttribute('type') == 'password') {
      document.getElementById('oldHashedPassword').setAttribute('type', 'text');
    } else {
      document.getElementById('oldHashedPassword').setAttribute('type', 'password');
      this.displayOldPassword = false;
    }


  }
  viewHashedPassword() {
    this.displayPassword = true;
    this.displaynewPassword = true;
    if (document.getElementById('hashedPassword').getAttribute('type') == 'password') {
      document.getElementById('hashedPassword').setAttribute('type', 'text');
    } else {
      document.getElementById('hashedPassword').setAttribute('type', 'password');
      this.displaynewPassword = false;
    }


  }

  viewnewHashedPassword() {
    this.displayPassword = true;
    this.displayconfirmPassword = true;
    if (document.getElementById('ConfirmHashedPassword').getAttribute('type') == 'password') {
      document.getElementById('ConfirmHashedPassword').setAttribute('type', 'text');
    } else {
      document.getElementById('ConfirmHashedPassword').setAttribute('type', 'password');
      this.displayconfirmPassword = false;
    }

  }

  refresh_Password_PopupData() {
    this.registerForm = this.fb.group({
      oldHashedPassword: ['', Validators.required],
      HashedPassword: ['', Validators.required],
      ConfirmHashedPassword1: ['', Validators.required]
    });
    this.isPasswordMatched = false;
    this.isPasswordValid = false;
  }


  refresh_Passeord_PopupData() {
    this.create_Cp_Form();
    this.isPasswordMatched = false;
    this.isPasswordValid = false;
  }


  showSignaturePad() {
    this.isSignaturePad = true;
  }
  showSignatureImage() {
    // this.isSignaturePad = false;
  }
  clearImage() {
    console.log('Before', this.myFiles);
    console.log('Before', this.url);
    this.myFiles = [];
    this.url = '';
    console.log('After', this.myFiles);
    console.log('After', this.url);
  }

	validateAllFieldsEditProfile(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });  
  }
  onMyEditProfileSubmit(){
    if (this.myEditProfileForm.valid) {

      if (this.isSignaturePad === true) {
        if (this.signaturePad.isEmpty()) {
          this.isSignaturePadEmpty=true;
          // this.toastr.errorToastr('Please enter a valid signature!', 'Oops!!');
          return
        }
      }
      if (this.isSignaturePad === false && this.url === '') {
        this.toastr.errorToastr('Please upload a valid signature!', 'Oops!!');
        return
      }
  
      let editProfileModel: EditProfile = new EditProfile();
      editProfileModel.FirstName = this.myEditProfileForm.controls.FirstName.value;
      editProfileModel.LastName = this.myEditProfileForm.controls.LastName.value;
      editProfileModel.CellPhone = this.myEditProfileForm.controls.CellPhone.value;
      if (this.isSignaturePad === true) {
        editProfileModel.Signature = this.signaturePad.toDataURL();
      }
      else {
        editProfileModel.Signature = "Signature Image Url";
      }

      editProfileModel.UserMasterId = this.userDetails.usermasterId;

      if (this.isSignaturePad) {
        editProfileModel.IsSignaturePad = true;
      }
      else {
        editProfileModel.IsSignaturePad = false;
      }
  
      this.profileDetailsService.editProfileDetails(editProfileModel).subscribe(result => {
        if (result.ResponseCode == 200 && result.Status == 1) {
          document.getElementById('myEditProfileCloseBtn').click();
          this.getProfileDetails();
        }
        else if (result.ResponseCode == 300) {
          this.toastr.warningToastr("Please enter a valid file", "Invalid file type!!");
        }
        else {
          this.toastr.errorToastr('Something went wrong!', 'Oops!!');
        }
      })
    }
    else{
      this.validateAllFieldsEditProfile(this.myEditProfileForm);
    }
  }

  redirectToLessonLearnt() {
    this.router.navigate(['/lessonlearnt']);
  }
  
}
