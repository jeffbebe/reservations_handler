import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Model } from 'mongoose';
import { mapValidationErrors } from 'src/common/validation-error.helper';
import { Reservation } from 'src/database/schemas/reservation.schema';
import { ReservationRow, ReservationStatus } from './reservation-row.type';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
  ) {}

  public async processReservationRows(reservationRows: ReservationRow[]) {
    const docs = reservationRows.map((reservationRow) =>
      this.createReservationEntryFromRow(reservationRow),
    );

    const bulkOps = docs.map(
      ({ reservationId, status, guestName, checkInDate, checkOutDate }) => {
        // If status is "canceled" or "completed", only update if exists
        if (
          status === ReservationStatus.CANCELLED ||
          status === ReservationStatus.COMPLETED
        ) {
          return {
            updateOne: {
              filter: { reservationId },
              update: {
                $set: { status, guestName, checkInDate, checkOutDate },
              },
              upsert: false,
            },
          };
        }

        // Otherwise, upsert
        return {
          updateOne: {
            filter: { reservationId },
            update: {
              $set: {
                status,
                guestName,
                checkInDate,
                checkOutDate,
              },
            }, // note: it's not possible to pass the whole object here, because existing id would be overwritten, leading to an error
            upsert: true,
          },
        };
      },
    );
    const result = await this.reservationModel.bulkWrite(bulkOps);

    const b = result;
  }

  private createReservationEntryFromRow(reservationRow: ReservationRow) {
    return new this.reservationModel({
      status: reservationRow.status,
      guestName: reservationRow.guest_name,
      checkInDate: reservationRow.check_in_date,
      checkOutDate: reservationRow.check_out_date,
      reservationId: reservationRow.reservation_id,
    });
  }

  public async validateReservationsSchema(data: {
    index: number;
    rowData: ReservationRow;
  }): Promise<ReservationRow> {
    const instance = plainToInstance(ReservationRow, data.rowData);

    const errors = await validate(instance);

    if (errors.length > 0) {
      throw new Error(
        `Validation error on row ${data.index}: ${mapValidationErrors(errors)}`,
      );
    }

    return instance;
  }
}
