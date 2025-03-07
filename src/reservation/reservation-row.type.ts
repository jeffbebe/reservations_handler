import { Expose, Type } from 'class-transformer';
import { IsDefined, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReservationStatus {
  PENDING = 'oczekująca',
  CANCELLED = 'anulowana',
  COMPLETED = 'zrealizowana',
}

export class ReservationRow {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  reservation_id: number;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  guest_name: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Date)
  check_in_date: Date;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Date)
  check_out_date: Date;
}
