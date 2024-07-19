import { Injectable } from "@nestjs/common"
import { PoolClient } from "pg"


export class  MockDataService {
    client:PoolClient
   async connectToDb() {
    //jest.fn()
}

   async runQuery (query:string ,params:unknown[]) {
   return {}

   }
   
}