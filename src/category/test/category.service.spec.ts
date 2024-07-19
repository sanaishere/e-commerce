import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { MockDataService } from 'src/common/mockDataService';
import { DataService } from 'src/common/data.service';
import { sendResponse } from 'src/common/sendResponse';
import { Categoryies } from '../category.interface';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let dataService:MockDataService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService,
        {
          provide:DataService,
          useClass:MockDataService
        }
      ],
    }).compile();
    dataService=module.get<DataService>(DataService)
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });
  describe('create category',()=>{
    it('should return response ',async ()=>{
     expect(await categoryService.createCategory({name:'shoes'})).toEqual(sendResponse('','category is created'))
    })
  })
   
  describe('get all categories',()=>{
    it('should return response ',async()=>{
      let categories:Categoryies[]=[{id:1,name:'shoes',is_delete:false},{id:2,name:'cloth',is_delete:false}]
      jest.spyOn(dataService,'runQuery').mockResolvedValue({rowCount:1,rows:categories})
     expect(await categoryService.getAllCategories()).toEqual(sendResponse('',categories))
    })
  })
});
