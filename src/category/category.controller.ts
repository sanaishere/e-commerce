import { Controller,Post,Get,Delete,Put,Body,
    Param,Request,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    ParseIntPipe,
    UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/createCategory.dto';
import { authGuard } from 'src/common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';

@Controller('user/category')
export class CategoryController {
    constructor(private categoryService:CategoryService){}
    
    @Get()
    async getAllCategories(){
        return await this.categoryService.getAllCategories()
    }

    @Get('search')
    async searchCategories(@Body() {text}){
       return this.categoryService.searchCategory(text)
    }

}
@Controller('admin')
export class AdminController{
    constructor(private categoryService:CategoryService){}
    @Post('category')
    @UseGuards(authGuard,AdminGuard)
    async createCategory(@Body() body:CreateCategoryDto){
       return await this.categoryService.createCategory(body)
    }

    @Delete('category/:categoryId')
    @UseGuards(authGuard,AdminGuard)
    async deleteCategory(@Param('categoryId',ParseIntPipe) categoryId:number){
       return await this.categoryService.deleteCategory(categoryId)
    }

    @Get('category')
    async getAllCategories(){
        return await this.categoryService.getAllCategories()
    }

    @Get('category/search')
    async searchCategories(@Body() {text}){
       return this.categoryService.searchCategory(text)
    }

}
