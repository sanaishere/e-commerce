import { Controller,Post,Get,Delete,Put,Body,
    Param,Request,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    ParseIntPipe,
UseGuards, 
Query,
UploadedFile,
Res} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create_product.dto';
import { UpdateProductDto } from './dtos/update_product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { imageFileFilter } from 'src/common/utils';
import {v4 as uuidv4} from 'uuid'
import { ApiBearerAuth } from '@nestjs/swagger';
import { authGuard } from 'src/common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';
import { PaginateDto } from 'src/common/paginate.dto';
@Controller('products')
export class ProductsController {
    constructor(private productService:ProductsService){}
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getAllProducts(@Query() query:PaginateDto) {
       return await this.productService.getAll(query)
    }

    @Get('getOne/:productId')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async getProductById(@Param('productId',ParseIntPipe) productId:number) {
        return await this.productService.getProductById(productId)
    }

    @Get('search')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async searchProducts(@Body() {text},@Query() query:PaginateDto) {
       return await this.productService.search(text,query)
    }

    @Get('sort')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async sortProducts(@Query() query:PaginateDto) {
       return await this.productService.sort(query)
    }
    
    @Get('getproducts/:categoryId')
    async getProductsOfCategory(@Param('categoryId',ParseIntPipe) categoryId:number,@Query() query:PaginateDto) {
      return await this.productService.getProductsOfCategory(categoryId,query)

    }
}

@Controller('admin')
export class AdminController{
  constructor(private productService:ProductsService){}
  @Post('products')
  @UseGuards(authGuard,AdminGuard)
  @UseInterceptors(FileInterceptor('photo', {
      storage: diskStorage({
        destination: './files/image', 
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + '-' + Date.now();
          const extension = extname(file.originalname);
          callback(null, uniqueSuffix + extension); // Define the filename
        },
        
      }),
      fileFilter:imageFileFilter,
    }))
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  async createProduct(@Body() body:CreateProductDto,@UploadedFile() file:Express.Multer.File) {
      let src=''
      if(file) src=file.filename
      return await this.productService.createProduct(body,src)

  }

  @Delete('products/:productId')
  @UseGuards(authGuard,AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async deleteProducts(@Param('productId',ParseIntPipe) productId:number) {
      return await this.productService.delete(productId)
  }
  @Delete('products/Category/:categoryId')
  @UseGuards(authGuard,AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async deleteProductsOfCategory(@Param('categoryId',ParseIntPipe) categoryId:number) {
      return await this.productService.deleteProductsOfCategory(categoryId)
  }

  @Put('products/:productId')
  @UseGuards(authGuard,AdminGuard)
  @UseInterceptors(FileInterceptor('photo', {
      storage: diskStorage({
        destination: './files/image', 
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + '-' + Date.now();
          const extension = extname(file.originalname);
          callback(null, uniqueSuffix + extension); // Define the filename
        },
        
      }),
      fileFilter:imageFileFilter,
    }))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async editProducts(@Param('productId',ParseIntPipe) productId:number,@Body() body:UpdateProductDto,
  @UploadedFile() file:Express.Multer.File){
      let src=''
      if(file) src=file.filename
     return await this.productService.edit(productId,body,src)
  }

  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getAllProducts(@Query() query:PaginateDto) {
     return await this.productService.getAll(query)
  }

  @Get('products/getOne/:productId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('productId',ParseIntPipe) productId:number) {
      return await this.productService.getProductById(productId)
  }
  
  @Get('products/getproducts/:categoryId')
  async getProductsOfCategory(@Param('categoryId',ParseIntPipe) categoryId:number,@Query() query:PaginateDto){
    return await this.productService.getProductsOfCategory(categoryId,query)

  }

}
