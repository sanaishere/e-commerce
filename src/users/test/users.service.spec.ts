import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { MockDataService } from 'src/common/mockDataService';
import { DataService } from 'src/common/data.service';
import { sendResponse } from 'src/common/sendResponse';

describe('UsersService', () => {
  let userService: UsersService;
  let dataService:MockDataService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,{
        provide:DataService,
        useClass:MockDataService
      }],

    }).compile();
    userService = module.get<UsersService>(UsersService);
    dataService=module.get<DataService>(DataService)
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  describe('editProfile',()=>{
    it('throw error if not in db',async()=>{
      jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
      let body={email:'example@gmail.com'}
     await  expect(userService.editProfile(1,body)).rejects.toThrowError('user with this id not found')
    })
    it('will return response',async()=>{
      jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 1, rows: [{ id: 1, email: 'sana@gmail.com'}]})
      let body={email:'example@gmail.com'}
      expect(await userService.editProfile(1,body)).toEqual(sendResponse('','user is updated'))
    })
  })
});
