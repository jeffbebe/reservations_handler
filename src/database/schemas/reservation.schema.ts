import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ReservationStatus } from 'src/reservation/reservation-row.type';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema()
export class Reservation {
  @Prop({ required: true, enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ required: true })
  reservationId: string;

  @Prop({ required: true })
  guestName: string;

  @Prop({ required: true, type: Date })
  checkInDate: Date;

  @Prop({ required: true, type: Date })
  checkOutDate: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
