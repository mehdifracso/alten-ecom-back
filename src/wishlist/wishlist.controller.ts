import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { User } from '../decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user wishlist with all items',
  })
  @Get()
  async getWishlist(@User('id') userId: string) {
    return await this.wishlistService.getWishlist(userId);
  }

  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiBody({ type: AddToWishlistDto })
  @ApiResponse({
    status: 201,
    description: 'Item successfully added to wishlist',
  })
  @Post()
  async addToWishlist(
    @User('id') userId: string,
    @Body() dto: AddToWishlistDto,
  ) {
    return await this.wishlistService.addToWishlist(userId, dto);
  }

  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiParam({ name: 'id', description: 'Wishlist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item successfully removed from wishlist',
  })
  @Delete('items/:id')
  async removeFromWishlist(
    @User('id') userId: string,
    @Param('id') itemId: string,
  ) {
    return await this.wishlistService.removeFromWishlist(userId, itemId);
  }
}
