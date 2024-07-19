import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { MockDataService } from 'src/common/mockDataService';
import { DataService } from 'src/common/data.service';
import { ProductsModule } from 'src/products/products.module';
import { ProductsService } from 'src/products/products.service';
import { sendResponse } from 'src/common/sendResponse';
import * as utils from 'src/common/check';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CommentService', () => {
  let commentService: CommentService;
  let dataService:MockDataService;
  let productService:ProductsService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService,
        {
          provide:DataService,
          useClass:MockDataService
        }
      ],
      imports:[ProductsModule]
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    dataService=module.get<DataService>(DataService)
    productService=module.get<ProductsService>(ProductsService)
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });
  describe('create comments',()=>{
    it('should return response if user bought that product',async ()=>{
      jest.spyOn(productService,'getProductById').mockResolvedValue(sendResponse('',{}))
      let user={id:1,
      firstname:"example",
      lastname:"for example",
      password:"password",
      email:"email",
      is_admin:true,
      is_delete:false
      }
     jest.fn(utils.checkCondition).mockResolvedValue()
     let comment={text:'good',productId:2}
     let response=await commentService.createComment(comment,user)
     expect(response).toEqual(sendResponse('','your comment is submitted'))

    })
    it('should throw error if product is not in db',async ()=>{
      jest.spyOn(dataService, 'runQuery').mockResolvedValue({rowCount: 0, rows: []})
      let user={id:1,
      firstname:"example",
      lastname:"for example",
      password:"password",
      email:"email",
      is_admin:true,
      is_delete:false
      }
     let comment={text:'good',productId:2}
     await expect( commentService.createComment(comment,user)).rejects.toThrowError('product with this id is not found')

    })
    it('should throw error if user did not buy product',async ()=>{
     jest.spyOn(productService,'getProductById').mockResolvedValue(sendResponse('',{}))
    jest.spyOn(utils,'checkCondition').mockImplementation(async () => {
         throw new HttpException('you did not buy this product', HttpStatus.BAD_REQUEST)})
  
       let user={id:1,
       firstname:"example",
       lastname:"for example",
       password:"password",
       email:"email",
       is_admin:true,
       is_delete:false
       }
      let comment={text:'good',productId:2}
      await expect( commentService.createComment(comment,user)).rejects.toThrowError('you did not buy this product')
 
     })
  })
});
