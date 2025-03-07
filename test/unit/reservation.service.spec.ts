import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from 'src/database/schemas/reservation.schema';
import {
  ReservationRow,
  ReservationStatus,
} from 'src/reservation/reservation-row.type';
import { ReservationService } from 'src/reservation/reservation.service';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let reservationModel: Model<ReservationDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getModelToken(Reservation.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    reservationModel = module.get<Model<ReservationDocument>>(
      getModelToken(Reservation.name),
    );
  });

  it('should be defined', () => {
    expect(reservationService).toBeDefined();
  });

  describe('validateReservationsSchema', () => {
    it('should return instance if payload is correct', async () => {
      const mockReservationRow = {
        guest_name: 'John Doe',
        reservation_id: 101,
        check_in_date: new Date(),
        check_out_date: new Date(),
        status: ReservationStatus.PENDING,
      };

      const result = await reservationService['validateReservationsSchema']({
        index: 1,
        rowData: mockReservationRow,
      });

      expect(result).toBeInstanceOf(ReservationRow);
    });
    it('should throw an error if fields are incorrect and validation fails', async () => {
      const mockReservationRow = {
        guest_name: 'John Doe',
        reservation_id: 101,
        check_in_date: new Date(),
        check_out_date: 'invalid date',
        status: 'wrong status',
      };

      expect(
        reservationService['validateReservationsSchema']({
          index: 1,
          rowData: mockReservationRow as any,
        }),
      ).rejects.toThrow();
    });
  });
});
