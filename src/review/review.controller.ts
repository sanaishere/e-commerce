import { Controller ,Post,Get,Param,Body, UseGuards,Request} from '@nestjs/common';
import { authGuard } from 'src/common/auth.guard';
import { ReviewDto } from './dtos/review.dto';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
    constructor(private reviewService:ReviewService){}
    @Post(':productId')
    @UseGuards(authGuard)
    async ratingProduct(@Body() review:ReviewDto,@Request() {user},@Param('productId') productId:number) {
       return await this.reviewService.ratingProduct(review,user,productId)
    }

    @Get(':productId')
    async getReviewOfProduct(@Param('productId') productId:number){
       return await this.reviewService.getReview(productId)
    }
}

@Controller('admin')
export class AdminController {
    constructor(private reviewService:ReviewService){}
    @Get(':productId')
    async getReviewOfProduct(@Param('productId') productId:number){
        return await this.reviewService.getReview(productId)
    }
}

