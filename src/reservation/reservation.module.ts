import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Reservation,
  ReservationSchema,
} from 'src/database/schemas/reservation.schema';
import { ReservationService } from './reservation.service';

@Module({
  providers: [ReservationService],
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  exports: [ReservationService],
})
export class ReservationModule {}
