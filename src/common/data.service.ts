import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { pool } from 'src/common/config';

@Injectable()
export class DataService {
    client:any
    constructor(){
    }
     async connectToDb() {
        if(this.client){
            return this.client
        }else{
      this.client=await pool.connect()
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
