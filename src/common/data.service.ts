import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { pool } from 'src/common/config';

@Injectable()
export class DataService {
    client:PoolClient
    constructor(){
    }
     async connectToDb() {
        try{
        if(!this.client){
        console.log('Connecting to the database...');
        this.client=await pool.connect()
        console.log('Connected to the database...');
        }
    }catch(err){
        console.log(err)
        throw new HttpException(err,err.status||HttpStatus.BAD_GATEWAY)
    }
     }
 
     async runQuery(query:string,params:unknown[]) {
        if(params===null){
            return await this.client.query(query)
        }else{
         return await this.client.query(query,params)
        }
        
     }
}
