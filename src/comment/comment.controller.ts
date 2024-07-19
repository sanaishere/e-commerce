import { Controller,Post,Get,Delete,Body, UseGuards,Request, Param } from '@nestjs/common';
import { CommentDto } from './dtos/createcomment.dto';
import { CommentService } from './comment.service';
import { authGuard } from '../common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';

@Controller('comment')
export class CommentController {
    constructor(private commentService:CommentService){}
    @Post()
    @UseGuards(authGuard)
    async createComment(@Body() comment:CommentDto,@Request() {user}) {
        return await this.commentService.createComment(comment,user)

    }

    @Get('/:productId')
    async getComments(@Param('productId') productId:number) {
        return await this.commentService.getComments(productId)

    }

    @Delete('/:id')
    @UseGuards(authGuard)
    async deleteComment(@Param('id') commentId:number,@Request() {user}){
        return await this.commentService.deleteComment(commentId,user)
    }
}

@Controller('admin')
export class AdminController {
    constructor(private commentService:CommentService){}
    @Get('/:productId')
    async getComments(@Param('productId') productId:number) {
        return await this.commentService.getComments(productId)

    }

    @Delete('/:id')
    @UseGuards(authGuard)
    async deleteComment(@Param('id') commentId:number,@Request() {user}){
        return await this.commentService.deleteComment(commentId,user)
    }
}