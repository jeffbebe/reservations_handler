import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import {
  Reservation,
  ReservationDocument,
  ReservationSchema,
} from 'src/database/schemas/reservation.schema';
import {
  ReservationRow,
  ReservationStatus,
} from 'src/reservation/reservation-row.type';
import { ReservationService } from 'src/reservation/reservation.service';
import { MongooseDatabaseModule } from '../../src/database/mongoose.module';
import { Model } from 'mongoose';
import { AppConfigModule } from '../../src/config/config.module';

const mockReservationRows: [ReservationRow, ReservationRow, ReservationRow] = [
  plainToInstance(ReservationRow, {
    guest_name: 'John Doe1',
    reservation_id: 101,
    check_in_date: new Date(),
    check_out_date: new Date(),
    status: ReservationStatus.PENDING,
  }),

  plainToInstance(ReservationRow, {
    guest_name: 'John Doe2',
    reservation_id: 102,
    check_in_date: new Date(),
    check_out_date: new Date(),
    status: ReservationStatus.CANCELLED,
  }),

  plainToInstance(ReservationRow, {
    guest_name: 'John Doe3',
    reservation_id: 103,
    check_in_date: new Date(),
    check_out_date: new Date(),
    status: ReservationStatus.COMPLETED,
  }),
];

const cleanup = async (model: Model<ReservationDocument>) => {
  await model.deleteMany({
    reservationId: {
      $in: mockReservationRows.map((it) => it.reservation_id),
    },
  });
};

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let reservationModel: Model<ReservationDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationService, AppConfigModule],
      imports: [
        MongooseDatabaseModule,
        MongooseModule.forFeature([
          { name: Reservation.name, schema: ReservationSchema },
        ]),
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    reservationModel = module.get<Model<ReservationDocument>>(
      getModelToken(Reservation.name),
    );

    await cleanup(reservationModel);
  });

  beforeEach(async () => {
    await cleanup(reservationModel);
  });

  afterEach(async () => {
    await cleanup(reservationModel);
  });

  describe('processReservationRows', () => {
    describe('if status is cancelled or completed', () => {
      it('should update existing ones', async () => {
        const initialRows = [mockReservationRows[1]];

        const initialDocs = initialRows.map((it) =>
          reservationService['createReservationEntryFromRow'](it),
        );

        await reservationModel.insertMany(initialDocs);

        const doc1BeforeChange = await reservationModel.findOne({
          reservationId: mockReservationRows[1].reservation_id,
        });

        const payload = [
          { ...mockReservationRows[1], guest_name: 'Changed' },
          mockReservationRows[2],
        ];

        await reservationService.processReservationRows(payload);

        const doc1 = await reservationModel.findOne({
          reservationId: mockReservationRows[1].reservation_id,
        });
        const doc2 = await reservationModel.findOne({
          reservationId: mockReservationRows[2].reservation_id,
        });

        expect(doc1).toBeDefined();
        expect(doc1BeforeChange).toBeDefined();
        expect(doc1?.guestName).not.toEqual(doc1BeforeChange?.guestName);

        expect(doc2).toBeNull();
      });
    });
    describe('if status is pending', () => {
      it('should upsert', async () => {
        const initialRows = [mockReservationRows[0]];

        const initialDocs = initialRows.map((it) =>
          reservationService['createReservationEntryFromRow'](it),
        );

        await reservationModel.insertMany(initialDocs);

        const doc1BeforeChange = await reservationModel.findOne({
          reservationId: mockReservationRows[0].reservation_id,
        });

        const payload: [ReservationRow, ReservationRow] = [
          { ...mockReservationRows[0], guest_name: 'Changed' },
          { ...mockReservationRows[0], reservation_id: 555 },
        ];

        await reservationService.processReservationRows(payload);

        const doc1 = await reservationModel.findOne({
          reservationId: payload[0].reservation_id,
        });
        const doc2 = await reservationModel.findOne({
          reservationId: payload[1].reservation_id,
        });

        expect(doc1).toBeDefined();
        expect(doc1BeforeChange).toBeDefined();
        expect(doc1?.guestName).not.toEqual(doc1BeforeChange?.guestName);

        expect(doc2).toBeDefined();
      });
    });
  });
});
