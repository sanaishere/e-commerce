import { Module } from '@nestjs/common';
import { AdminController, ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';
import { DataService } from 'src/common/data.service';

@Module({
  imports:[ProductsModule],
  controllers: [ReviewController,AdminController],
  providers: [ReviewService,DataService]
})
export class ReviewModule {}
