import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dtos/create_product.dto';
import { CategoryService } from 'src/category/category.service';
import { sendResponse } from 'src/common/sendResponse';
import { Product } from './product.interface';
import { UpdateProductDto } from './dtos/update_product.dto';
import { pagination } from 'src/common/pagination';
import { URL } from 'src/common/app.url';
import { DataService } from 'src/common/data.service';
import { PaginateDto } from 'src/common/paginate.dto';
@Injectable()
export class ProductsService {
    constructor(private categoryService:CategoryService,
        private dataService:DataService
    ){}

    async createProduct(body:CreateProductDto,src:string) {
      await this.categoryService.foundCategory(Number(body.category_id))
      let values=[]
      let photoSrc=src===''?'':`${URL}/products/${src}`
     await this.dataService.connectToDb()
      let query=`INSERT INTO products (name,price,quantity,category_id,
        image_src,is_delete) VALUES ($1,$2,$3,$4,$5,$6) 
      `
      values=[body.name,body.price,body.quantity,body.category_id,photoSrc]
      values.push(false)
      try{
        const result=await this.dataService.runQuery(query,values)
        console.log(result.rows[0])
        const response=sendResponse('','product is created')
        return response
     }catch(err){

         throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
     }
    }

    async getAll({page,limit}) {
        if(!page) page=1
        if(!limit) limit=5
       // let client=await clientAsPromise
        const query=`SELECT p.id,p.name,c.name AS category,p.price,p.quantity,p.image_src FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_delete=false`
        try{
           await this.dataService.connectToDb()
           const result=await this.dataService.runQuery(query,null)
           const products:Product[]=result.rows
           const paginatedData=pagination(products,page,limit,`${URL}/products`)
           const response=sendResponse('',paginatedData.dataToshow)
           return Object.assign(response,{num_pages:paginatedData.numberOfPages,
            next_url:paginatedData.nextUrl,previous_url:paginatedData.previousUrl})
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    
    async delete(productId:number) {
      // await this.dataService.connectToDb()
        try{
            const product:Product=(await this.getProductById(productId)).data
          //  await this.dataService.client.query('BEGIN')
            const queryToDelete=`UPDATE products SET is_delete=true WHERE id=($1)`
            await this.dataService.runQuery(queryToDelete,[productId])
            await this.removeo_order_item(productId)
          //  await this.dataService.client.query('COMMIT')
            const response=sendResponse('',`product with id ${productId} is deleted`)
            return response
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }
    }

    async getProductById(productId:number) {
       await this.dataService.connectToDb()
        const query=`SELECT p.id,p.name,c.name AS category,p.price,p.quantity,p.image_src FROM products p
        LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=($1) AND p.is_delete=false`
        try{
            const foundedProduct =await this.dataService.runQuery(query,[productId])
            if(foundedProduct.rowCount===0){
             throw new HttpException('product with this id is not found',HttpStatus.NOT_FOUND)
            }
            const response=sendResponse('',foundedProduct.rows[0])
            return response
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }
    }

    async edit(productId:number,body:UpdateProductDto,src:string) {
      // await this.dataService.connectToDb()
        await this.getProductById(productId)
         try{
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(body)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }
        if(src!==''){
            fields.push(`image_src = $${index}`)
            values.push(`${URL}/products/${src}`)
            index++
        }

        const queryForUpdate = `UPDATE products SET ${fields.join(', ')} WHERE id = $${index} AND is_delete=false`;
        values.push(productId);
        await this.dataService.runQuery(queryForUpdate,values)
        if(body.price){
          await this.update_order_item(body.price,productId)
          console.log('price is changed')
        }
        const response= sendResponse('','product is updated')
        return response

     }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }

    }

    async search(text:string,{page,limit}) {
        await this.dataService.connectToDb()
        if(!page) page=1
        if(!limit) limit=10
        const query=`SELECT p.id,p.name,c.name AS category,p.price,p.quantity,p.image_src FROM products p
        LEFT JOIN categories c ON p.category_id=c.id WHERE ( p.name ILIKE $1 OR c.name ILIKE $1) AND p.is_delete=false  `
        try{
            const foundedProducts:Product[] =(await this.dataService.runQuery(query,[`%${text}%`])).rows
            const paginatedData=pagination(foundedProducts,page,limit,`${URL}/products/search`)
            const response=sendResponse('',paginatedData.dataToshow)
            return Object.assign(response,{num_pages:paginatedData.numberOfPages,
                next_url:paginatedData.nextUrl,previous_url:paginatedData.previousUrl})
            
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }
    }

    async sort(queryArgs:PaginateDto){
        let {page,limit,sortByPrice}=queryArgs
        await this.dataService.connectToDb()
        if(!page) page=1
        if(!limit) limit=10
        const query=`SELECT p.id,p.name,c.name,p.price,p.quantity,p.image_src FROM products p
        LEFT JOIN categories c ON p.category_id=c.id WHERE p.is_delete=false  ORDER BY price ${sortByPrice}`
        try{
            const result =await this.dataService.runQuery(query,null)
            const products:Product[]=result.rows
            const paginatedData=pagination(products,page,limit,`${URL}/products/sort`)
            const response=sendResponse('',paginatedData.dataToshow)
            return Object.assign(response,{num_pages:paginatedData.numberOfPages,
                next_url:paginatedData.nextUrl,previous_url:paginatedData.previousUrl})
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }

    }
   async getProductsOfCategory(category_id:number,{page,limit}){
    if(!page) page=1
    if(!limit) limit=5
    await this.categoryService.foundCategory(category_id)
    await this.dataService.connectToDb()
        const query=`SELECT p.id,p.name,c.name AS category,p.price,p.quantity,p.image_src FROM products p
        LEFT JOIN categories c ON p.category_id=c.id WHERE p.category_id=($1) AND p.is_delete=false`
        try{
            const foundedProducts:Product[] =(await this.dataService.runQuery(query,[category_id])).rows
            const paginatedData=pagination(foundedProducts,page,limit,`${URL}/products/getproducts/${category_id}`)
            const response=sendResponse('',paginatedData.dataToshow)
            return Object.assign(response,{num_pages:paginatedData.numberOfPages,
                next_url:paginatedData.nextUrl,previous_url:paginatedData.previousUrl})
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }
   }
     async deleteProductsOfCategory(category_id:number){
    await this.dataService.connectToDb()
     const queryToDelete=`UPDATE products SET is_delete=true WHERE category_id=($1)`
     try{
        const foundedCategory =await this.dataService.runQuery(queryToDelete,[category_id])
     }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
     }
}

   async removeo_order_item(product_id:number){
    // await this.dataService.connectToDb()
        const query=`UPDATE order_items SET is_delete=true WHERE product_id=$1 `
        try{
          await this.dataService.runQuery(query,[product_id])
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }

   }

   async update_order_item(price:number,product_id:number){
   // await this.dataService.connectToDb()
        const query=`UPDATE order_items SET price=$1,total_price=$1*number WHERE product_id=$2 AND is_delete=false`
        try{
          await this.dataService.runQuery(query,[price,product_id])
         }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
         }

   }
}
