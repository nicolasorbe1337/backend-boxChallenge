/* eslint-disable prettier/prettier */
import { PartialType } from "@nestjs/mapped-types"
import { CreateBoxDto } from "./create-box.dto"
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateBoxDto extends PartialType(CreateBoxDto) {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    alerta_umbral?: number;
}

