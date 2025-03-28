/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, ParseIntPipe } from "@nestjs/common"
import  { MovementsService } from "./movements.service"
import  { CreateMovementDto } from "./dto/create-movement.dto"

@Controller("movements")
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementsService.create(createMovementDto);
  }

  @Get()
  findAll() {
    return this.movementsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findOne(id);
  }

  @Get('box/:id')
  findByBox(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findByBox(id);
  }

  @Get('user/:id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.movementsService.findByUser(id);
  }
}

