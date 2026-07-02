import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';

export class PaginationMetaResponse {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [UserResponse] })
  data!: UserResponse[];

  @ApiProperty({ type: PaginationMetaResponse })
  meta!: PaginationMetaResponse;
}
