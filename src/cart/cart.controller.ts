import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user cart with all items',
  })
  @Get()
  async getCart(@User('id') userId: string) {
    return await this.cartService.getCart(userId);
  }

  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({
    status: 201,
    description: 'Item successfully added to cart',
  })
  @Post()
  async addToCart(@User('id') userId: string, @Body() dto: AddToCartDto) {
    return await this.cartService.addToCart(userId, dto);
  }

  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity updated successfully',
  })
  @Put('item/:id')
  async updateCartItem(
    @User('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCartItem(userId, itemId, dto);
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item successfully removed from cart',
  })
  @Delete('item/:id')
  async removeFromCart(
    @User('id') userId: string,
    @Param('id') itemId: string,
  ) {
    return await this.cartService.removeFromCart(userId, itemId);
  }
}
