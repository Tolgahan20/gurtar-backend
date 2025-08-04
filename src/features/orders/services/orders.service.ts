import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Package } from '../../packages/entities/package.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.enum';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderStatus } from '../entities/order-status.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Average CO2 emissions saved per kg of food waste (in kg CO2e)
const AVG_CO2_PER_KG = 2.5;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  private getPaginationParams(dto: PaginationDto) {
    return {
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
      page: dto.page,
      limit: dto.limit,
    } as const;
  }

  async create(
    createOrderDto: CreateOrderDto,
    currentUser: User,
  ): Promise<Order> {
    const package_ = await this.packageRepository.findOne({
      where: { id: createOrderDto.package_id },
      relations: ['business'],
    });

    if (!package_) {
      throw new NotFoundException('Package not found');
    }

    if (!package_.is_active) {
      throw new BadRequestException('Package is not available');
    }

    if (!package_.business.is_verified) {
      throw new BadRequestException('Business is not verified');
    }

    if (package_.quantity_available < createOrderDto.quantity) {
      throw new BadRequestException('Not enough quantity available');
    }

    const now = new Date();
    if (package_.pickup_start_time <= now) {
      throw new BadRequestException('Pickup time has already started');
    }

    // Calculate total price and savings
    const total_price = package_.price * createOrderDto.quantity;
    const original_total = package_.original_price * createOrderDto.quantity;
    const money_saved = original_total - total_price;

    // Calculate environmental impact
    const total_weight = package_.estimated_weight * createOrderDto.quantity;
    const co2_saved_kg = total_weight * AVG_CO2_PER_KG;

    // Create order
    const order = this.orderRepository.create({
      quantity: createOrderDto.quantity,
      total_price,
      money_saved,
      co2_saved_kg,
      user: currentUser,
      package: package_,
      status: OrderStatus.PENDING,
    });

    // Update package quantity
    package_.quantity_available -= createOrderDto.quantity;
    await this.packageRepository.save(package_);

    return this.orderRepository.save(order);
  }

  async findAll(
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    const params = this.getPaginationParams(paginationDto);

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: currentUser.id } },
      relations: ['package', 'package.business', 'picked_up_by_worker'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: orders,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findAllByUser(
    userId: string,
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    // Only admins can view other users' orders
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const params = this.getPaginationParams(paginationDto);

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['package', 'package.business', 'picked_up_by_worker', 'user'],
      skip: params.skip,
      take: params.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: orders,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findAllByBusiness(
    businessId: string,
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    const params = this.getPaginationParams(paginationDto);

    // Build query based on user role and business relationship
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.package', 'package')
      .leftJoinAndSelect('package.business', 'business')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.picked_up_by_worker', 'picked_up_by_worker')
      .where('business.id = :businessId', { businessId });

    // If not admin, check business relationship
    if (currentUser.role !== UserRole.ADMIN) {
      const isBusinessOwner = await this.packageRepository
        .createQueryBuilder('package')
        .leftJoin('package.business', 'business')
        .where('business.id = :businessId', { businessId })
        .andWhere('business.owner_id = :userId', { userId: currentUser.id })
        .getExists();

      const isWorker = await this.packageRepository
        .createQueryBuilder('package')
        .leftJoin('package.business', 'business')
        .leftJoin('business.workers', 'worker')
        .where('business.id = :businessId', { businessId })
        .andWhere('worker.user_id = :userId', { userId: currentUser.id })
        .andWhere('worker.is_active = true')
        .getExists();

      if (!isBusinessOwner && !isWorker) {
        throw new ForbiddenException('Access denied');
      }

      // Workers can only see confirmed orders
      if (!isBusinessOwner && isWorker) {
        queryBuilder.andWhere('order.status = :status', {
          status: OrderStatus.CONFIRMED,
        });
      }
    }

    const [orders, total] = await queryBuilder
      .skip(params.skip)
      .take(params.take)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async findOne(id: string, currentUser: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['package', 'package.business', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow access to own orders or if admin/worker
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.WORKER &&
      currentUser.id !== order.user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    currentUser: User,
  ): Promise<Order> {
    const order = await this.findOne(id, currentUser);

    // Validate status transition
    switch (order.status) {
      case OrderStatus.PENDING:
        if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
          // Return quantity to package
          const package_ = await this.packageRepository.findOne({
            where: { id: order.package.id },
          });
          if (package_) {
            package_.quantity_available += order.quantity;
            await this.packageRepository.save(package_);
          }
        } else if (updateOrderStatusDto.status !== OrderStatus.CONFIRMED) {
          throw new BadRequestException('Invalid status transition');
        }
        break;

      case OrderStatus.CONFIRMED:
        if (updateOrderStatusDto.status === OrderStatus.PICKED_UP) {
          if (currentUser.role !== UserRole.WORKER) {
            throw new ForbiddenException(
              'Only workers can mark orders as picked up',
            );
          }
          order.picked_up_by_worker = currentUser;
        } else {
          throw new BadRequestException('Invalid status transition');
        }
        break;

      case OrderStatus.PICKED_UP:
      case OrderStatus.CANCELLED:
        throw new BadRequestException('Order status cannot be changed');
    }

    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}
