import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { Pool } from 'pg';
import { ValidationError } from 'class-validator';
import { sendEmail } from 'src/users/sendEmail';
import { URL } from 'src/common/app.url';
import { EmailDto } from '../dtos/email.dto';
import { DataService } from 'src/common/data.service';
import { MockDataService } from '../../common/mockDataService';
import { CreateUsers } from '../dtos/create_user..dto';
import { sendResponse } from 'src/common/sendResponse';
import * as bcrypt from 'bcrypt'
describe('AuthService', () => {
  let service: AuthService;
  let dataService:MockDataService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide:DataService,
          useClass:MockDataService
        }
],
    }).compile();


    // Use the mock pool in your test

    service = module.get<AuthService>(AuthService);
    dataService= module.get<DataService>(DataService);
   // service['pool'] = mockPool;
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocked functions after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('send otp ',()=>{
    it('should throw error if email existed in db',async()=>{
      jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [{ id: 1, email: 'existing77@example.com' }]})
      const email = 'existing77@example.com';
      await expect(service.sendOtp(email)).rejects.toThrowError('user with this email existed');
    });
   
   it('should work if email not existed in db',async()=>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    let  email='sanafaraji86@gmail.com'
   const response= await service.sendOtp(email)
   const res={"message": " email is successfully sent,continue", 
    "url": "http://localhost:4000/auth/signup"}
   expect(response).toEqual(res)
  
 })
})
 describe('verification email',()=>{
  it('should throw err if otp is not correct',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    let otp=123456
    await expect(service.verificationEmail(otp)).rejects.toThrowError('otp is not correct');
  })
  it('should throw err if otp is expired',async() =>{
   let day=new Date().getDate()-8
   let date=new Date(day)

    jest.spyOn(dataService, 'runQuery').mockResolvedValue({ rowCount: 1, rows: [{ id: 1, expiresin:date}]})
    let otp=123456
    await expect(service.verificationEmail(otp)).rejects.toThrowError('otp is expired');
  })
 })

 describe('sign up',()=> {
  it('should throw err if email is existed ',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [{ id: 1, email: 'sana@gmail.com'}]})
    let body:CreateUsers={firstname:'sana',lastname:'faraji',email:'sana@gmail.com',otp:123456,password:'138080'}
    await expect(service.signUp(body)).rejects.toThrowError('user with this email existed');
  })
  it('should return response if email is not existed',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    let body:CreateUsers={firstname:'sana',lastname:'faraji',email:'sana@gmail.com',otp:123456,password:'138080'}
    jest.spyOn(service,'verificationEmail').mockResolvedValue()
    let response=await service.signUp(body)
    expect(response).toEqual(sendResponse('','new user is created'))
    expect(dataService.runQuery).toBeCalledTimes(2)
  })
 })
  
 describe('login',()=> {
  it('should throw err if user is not existed ',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    await expect(service.login('sana@gmail.com','123459')).rejects.toThrowError('you should register first');
  })
  it('should throw err if password is not correct ',async() =>{
    let user={id:1,firstname:'sana',lastname:'faraji',email:'sana@gmail.com',password:'138080'}
    jest.spyOn(bcrypt,'compare').mockImplementation(()=>{return false})
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [user]})
    await expect(service.login('sana@gmail.com','123459')).rejects.toThrowError('password is not correct');
  })
  it('should return response if user is registered and pass is correct',async() =>{
    let user={id:1 ,
      firstname:'sana',lastname:'faraji',email:'sana@gmail.com',password:'138080'}
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [user]})
    jest.spyOn(bcrypt,'compare').mockImplementation(()=>{return true})
    jest.spyOn(service,'createAccessToken').mockReturnValue('nbvcx')
    jest.spyOn(service,'createRefreshToken').mockReturnValue('mnbv')
    let res=sendResponse('',user)
    let response=await service.login('sana@gmail.com','138080')
    expect(response).toEqual({response:res,accessToken:'nbvcx',refreshToken:'mnbv'})
    
  })
 })
  
 describe('change password',()=> {
  it('should throw err if user is not existed ',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    await expect(service.changePassword({email:'sana@gmail.com',oldPassword:'138080',newPassword:'138087'})).rejects.
    toThrowError('there is no user with this email and password exists');
  })
  it('should return response if user is existed',async() =>{
    let user={id:1 ,
      firstname:'sana',lastname:'faraji',email:'sana@gmail.com',password:'138080'}
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [user]})
    let res=sendResponse('','password successfully updated')
    let response=await service.changePassword({email:'sana@gmail.com',oldPassword:'138080',newPassword:'138087'})
    expect(response).toEqual(res)
    expect(dataService.runQuery).toBeCalledTimes(2)
    
  })
 })

 describe('forget password',()=> {
  it('should throw err if user is not existed ',async() =>{
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    await expect(service.forgetPassword('sana@gmail.com')).rejects.
    toThrowError('there is no user with this email exists');
  })
  it('should return response if user is existed',async() =>{
    let user={id:1 ,
      firstname:'sana',lastname:'faraji',email:'sana@gmail.com',password:'138080'}
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [user]})
    jest.spyOn(service,'createVerifyToken').mockReturnValue('nbvcx')
    let email='sana@gmail.com'
    let response=await service.forgetPassword(email)
    expect(response).toEqual({message:'check your email',verifyToken:'nbvcx'})
    expect(dataService.runQuery).toBeCalledTimes(2)
    
  })
 })

 describe('retrive password',()=> {
  it('should throw err if verifyToken is not headers',async() =>{
    let req=''
    await expect(service.retrievePassword({newPassword:'138090'},req)).rejects.
    toThrowError('try again and check email');
  })
  it('should throw err if user is not existed ',async() =>{
    let req={headers:{verifytoken:'nbvffdsx'}}
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
    await expect(service.retrievePassword({newPassword:'138090'},req)).rejects.
    toThrowError('you cannot change password');
  })
  it('should return response if user is existed',async() => {
    let req={headers:{verifytoken:'nbvffdsx'}}
    let payload={id:1,email:'sana@email.com'}
    jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [{value:'nbvffdsx'}]})
    jest.spyOn(service,'verifyToken').mockReturnValue(payload)
    let response=await service.retrievePassword({newPassword:'138090'},req)
    expect(response).toEqual(sendResponse('','password is retrieved successfully'))
    expect(dataService.runQuery).toBeCalledTimes(2)
  })
  })
})
    


