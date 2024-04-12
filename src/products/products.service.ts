import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    // return 'This action adds a new product';
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(PaginationDto: PaginationDto) {
    const { limit, page } = PaginationDto;

    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: {
          available: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        page,
        total: totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
        available: true,
      },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    // const {id:_, ...data} = updateProductDto;
    const {id, ...data} = updateProductDto;
    await this.findOne(id);
    return await this.product.update({
      where: {
        id,
      },
      data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.product.delete({
    //   where: {
    //     id
    //   }
    // })
    return await this.product.update({
      where: {
        id,
      },
      data: {
        available: false,
      },
    });
  }
}
