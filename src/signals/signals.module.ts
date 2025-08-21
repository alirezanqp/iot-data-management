import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SignalsService } from "./signals.service";
import { SignalsController } from "./signals.controller";
import { Signal, SignalSchema } from "./signal.schema";
import { MongoSignalRepository } from "./repositories/signal.repository";
import { SIGNAL_REPOSITORY_TOKEN } from "./constants/tokens";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Signal.name, schema: SignalSchema }]),
  ],
  controllers: [SignalsController],
  providers: [
    SignalsService,
    MongoSignalRepository,
    {
      provide: SIGNAL_REPOSITORY_TOKEN,
      useClass: MongoSignalRepository,
    },
  ],
  exports: [SignalsService, SIGNAL_REPOSITORY_TOKEN],
})
export class SignalsModule {}
