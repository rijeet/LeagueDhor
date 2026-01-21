import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../APP.Entity/person.entity';
import { Crime } from '../../APP.Entity/crime.entity';

export class PersonFeedItemDto {
  @ApiProperty({ type: () => Person })
  person!: Person;

  @ApiProperty({ type: () => Crime, required: false })
  latestCrime?: Crime | null;

  @ApiProperty({ type: Number, required: false, example: 0 })
  crimeCount?: number;
}
