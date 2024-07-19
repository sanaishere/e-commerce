import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/createCategory.dto';
import { pool } from 'src/common/config';
import { sendResponse } from 'src/common/sendResponse';
import { Categoryies } from './category.interface';
import { Product } from 'src/products/product.interface';
import { DataService } from 'src/common/data.service';

@Injectable()
export class CategoryService {
    constructor(private dataService:DataService){}
    async createCategory(body:CreateCategoryDto){
        await this.checkDuplicateName(body.name)
        await this.dataService.connectToDb()
        const query=`INSERT INTO categories(name,is_delete) VALUES ($1,false)`
        try{
           const result=await this.dataService.runQuery(query,[body.name])
           const response=sendResponse('','category is created')
           return response
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getAllCategories(){
        await this.dataService.connectToDb()
        const query=`SELECT * FROM categories WHERE is_delete=false`
        try{
           const result=await this.dataService.runQuery(query,null)
           console.log(result)
           const categories:Categoryies[]=result.rows
           const response=sendResponse('',categories)
           return response
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
   ///first delete related products
    async deleteCategory(categoryId:number){
       await this.dataService.connectToDb()
        const queryToFind=`SELECT * FROM categories WHERE id=($1)`
        try{
           const foundedCategory =await this.dataService.runQuery(queryToFind,[categoryId])
           if(foundedCategory.rowCount===0){
            throw new HttpException('category with this id is not found',HttpStatus.NOT_FOUND)
           }
          
         await this.checkProducts(categoryId)
           const queryToDelete=`UPDATE categories SET is_delete=true WHERE id=($1)`
           await this.dataService.runQuery(queryToDelete,[categoryId])
           const response=sendResponse('',`category with id ${categoryId} is deleted`)
           return response
        }catch(err){
            console.log(err)
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async searchCategory(text:String){
        await this.dataService.connectToDb()
        const query=`SELECT * FROM categories WHERE name ILIKE $1 AND is_delete=false`
        try{
           const result=await this.dataService.runQuery(query,[`%${text}%`])
           console.log(text)
           const categories:Categoryies[]=result.rows
           const response=sendResponse('',categories)
           return response
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async foundCategory(id:number):Promise<Categoryies>{
        await this.dataService.connectToDb()
        const queryToFind=`SELECT * FROM categories WHERE id=($1) AND is_delete=false`
        try{
           const foundedCategory =await this.dataService.runQuery(queryToFind,[id])
           if(foundedCategory.rowCount===0){
            throw new HttpException('category with this id is not found',HttpStatus.NOT_FOUND)
           }
           return foundedCategory.rows[0]
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async checkProducts(category_id:number){
        await this.dataService.connectToDb()
        const query=`SELECT * FROM products p
        LEFT JOIN categories c ON p.category_id=c.id WHERE p.category_id=($1) 
        AND P.is_delete=false`
        try{
            const products:Product[] = (await this.dataService.runQuery(query,[category_id])).rows
            if(products.length>0){
             throw new HttpException('delte products of this category first',HttpStatus.BAD_GATEWAY)
            }
           
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }
    }
    async checkDuplicateName(name:string){
        await this.dataService.connectToDb()
        const queryForDuplicate=`SELECT * FROM categories
        WHERE name=$1 AND is_delete=false`
        const queryForDeleted=`SELECT * FROM categories
        WHERE name=$1 AND is_delete=true`
        try{
            const existed=await this.dataService.runQuery(queryForDuplicate,[name])
            if(existed.rowCount>0){
                throw new HttpException('there is also category with this name',HttpStatus.BAD_REQUEST)
            }
            const result=await this.dataService.runQuery(queryForDeleted,[name])
            const category:Categoryies=result.rows[0]
            if(result.rowCount>0){
               let query=`UPDATE categories SET is_delete=false WHERE id=$1 `
               await this.dataService.runQuery(query,[category.id])
            }
        
        }catch(err){
         throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


}

