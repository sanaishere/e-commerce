import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AdminController, CommentController } from './comment.controller';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';
import { DataService } from 'src/common/data.service';

@Module({
  imports:[ProductsModule],
  providers: [CommentService,DataService],
  controllers: [CommentController,AdminController]
})
export class CommentModule {}
