/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common"
import  { BoxService } from "./box.service"
import  { CreateBoxDto } from "./dto/create-box.dto"
import  { UpdateBoxDto } from "./dto/update-box.dto"

@Controller("box")
export class BoxController {
  constructor(private readonly boxService: BoxService) {}

  @Post()
  create(@Body() createBoxDto: CreateBoxDto) {
    return this.boxService.create(createBoxDto);
  }

  @Get()
  findAll() {
    return this.boxService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boxService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBoxDto: UpdateBoxDto) {
    return this.boxService.update(id, updateBoxDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.boxService.remove(id);
  }

  @Get(':id/verificar-stock')
  verificarStock(@Param('id', ParseIntPipe) id: number) {
    return this.boxService.verificarStock(id);
  }
}

