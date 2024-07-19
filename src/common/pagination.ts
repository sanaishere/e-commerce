import { URL } from "./app.url"

export function pagination(data:any,page:number,limit:number,url:string){
const length=data.length
let dataToshow=''
const startIndex=(page-1)*limit
if (startIndex>length){
    dataToshow=''
}
let previousPage=page-1
const endIndex=(page*limit)>length?length:page*limit
const numberOfPages=Math.ceil(length/limit)
 dataToshow=data.slice(startIndex,endIndex)
let nextUrl=`${url}?page=${+page+1}`
let previousUrl=`${url}?page=${previousPage>0?previousPage:page}`

return {
    dataToshow,
    numberOfPages,
    nextUrl,
    previousUrl
}

}