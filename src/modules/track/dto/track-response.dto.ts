import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TrackRouteLegDto {
  @ApiProperty({ enum: ["POL", "PTS", "POD"], example: "POL" })
  code!: "POL" | "PTS" | "POD";

  @ApiProperty({ example: "Jebel Ali" })
  name!: string;

  @ApiPropertyOptional({ example: "AE" })
  country?: string | null;

  @ApiPropertyOptional({ example: "AEJEA" })
  un_locode?: string | null;

  @ApiPropertyOptional({ example: true })
  current?: boolean;
}

export class TrackHistoryEventDto {
  @ApiProperty({
    enum: ["MILESTONE", "COURIER_CHECKPOINT", "CONTAINER", "STATUS", "OPS"],
  })
  type!: string;

  @ApiProperty({ example: "GATED_IN" })
  code!: string;

  @ApiProperty({ example: "Container MSCU1234567 gate in" })
  label!: string;

  @ApiPropertyOptional({
    example: "GATE IN EMPTY AT DEPOT",
    description: "Alias of label",
  })
  move?: string;

  @ApiPropertyOptional({ type: String, format: "date-time", nullable: true })
  planned_at?: string | null;

  @ApiPropertyOptional({ type: String, format: "date-time", nullable: true })
  actual_at?: string | null;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    nullable: true,
    description: "Alias of actual_at",
  })
  completed_at?: string | null;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    nullable: true,
    description: "Alias of actual_at",
  })
  occurred_at?: string | null;

  @ApiProperty()
  is_completed!: boolean;

  @ApiPropertyOptional({ nullable: true })
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  terminal?: string | null;

  @ApiPropertyOptional({ nullable: true })
  container_number?: string | null;

  @ApiPropertyOptional({ nullable: true })
  vessel_name?: string | null;

  @ApiPropertyOptional({ nullable: true })
  voyage_number?: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes?: string | null;
}

export class TrackContainerDto {
  @ApiPropertyOptional({ nullable: true, example: "MSCU1234567" })
  container_number!: string | null;

  @ApiProperty({ example: "GATED_IN" })
  status!: string;

  @ApiPropertyOptional({ example: "GATE IN" })
  status_label?: string;

  @ApiPropertyOptional({ nullable: true })
  seal_number!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: "ACTUAL",
    description: "Prefer ACTUAL over PLANNED",
  })
  kind!: string | null;

  @ApiPropertyOptional({ nullable: true, example: "40HC" })
  container_type!: string | null;

  @ApiPropertyOptional({ nullable: true, example: "40HC" })
  iso_size!: string | null;

  @ApiPropertyOptional({ type: String, format: "date-time", nullable: true })
  gate_in_at!: string | null;

  @ApiPropertyOptional({ type: String, format: "date-time", nullable: true })
  returned_at!: string | null;
}

export class TrackShipmentBodyDto {
  @ApiProperty({ example: "GATE IN EMPTY AT DEPOT" })
  current_status!: string;

  @ApiPropertyOptional({ nullable: true, example: "MSCU1234567" })
  container_number?: string | null;

  @ApiPropertyOptional({ nullable: true, example: "40HC" })
  container_type?: string | null;

  @ApiPropertyOptional({ nullable: true, example: "40HC" })
  iso_size?: string | null;

  @ApiPropertyOptional({ type: [TrackRouteLegDto] })
  progress_legs?: TrackRouteLegDto[];

  @ApiPropertyOptional({ type: [TrackRouteLegDto] })
  route_legs?: TrackRouteLegDto[];

  @ApiPropertyOptional({ type: [TrackRouteLegDto] })
  ports?: TrackRouteLegDto[];

  @ApiPropertyOptional({ type: [TrackHistoryEventDto] })
  history?: TrackHistoryEventDto[];

  @ApiPropertyOptional({
    type: [TrackHistoryEventDto],
    description: "Alias of history",
  })
  moves?: TrackHistoryEventDto[];

  @ApiPropertyOptional({
    type: [TrackHistoryEventDto],
    description: "Alias of history",
  })
  events?: TrackHistoryEventDto[];

  @ApiPropertyOptional({ type: [TrackContainerDto] })
  containers?: TrackContainerDto[];

  @ApiPropertyOptional({ nullable: true })
  vessel_name?: string | null;

  @ApiPropertyOptional({ nullable: true })
  voyage_number?: string | null;

  @ApiPropertyOptional()
  job_number?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  summary?: Record<string, unknown>;
}

export class TrackShipmentResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({
    description:
      "Live track payload. Key FE fields also mirrored at data root (current_status, progress_legs, history, …).",
  })
  data!: {
    branding: Record<string, unknown>;
    query: string;
    matched_container: string | null;
    shipment: TrackShipmentBodyDto;
    current_status: string;
    container_number: string | null;
    container_type: string | null;
    iso_size: string | null;
    progress_legs: TrackRouteLegDto[];
    route_legs: TrackRouteLegDto[];
    ports: TrackRouteLegDto[];
    history: TrackHistoryEventDto[];
    moves: TrackHistoryEventDto[];
    events: TrackHistoryEventDto[];
    pdf_url: string;
    public_url: string | null;
  };
}
