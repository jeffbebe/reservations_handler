import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { MongooseDatabaseModule } from './database/mongoose.module';
import { ReservationModule } from './reservation/reservation.module';
import { TaskModule } from './tasks/task.module';

@Module({
  imports: [
    MongooseDatabaseModule,
    AppConfigModule,
    TaskModule,
    ReservationModule,
  ],
})
export class AppModule {}
