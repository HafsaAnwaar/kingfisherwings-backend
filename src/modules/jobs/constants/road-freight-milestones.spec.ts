import { ROAD_FREIGHT_MILESTONES } from "../constants/road-freight-milestones";
import { LAND_MILESTONES } from "../constants/land-milestones";

describe("ROAD_FREIGHT lifecycle", () => {
  it("matches LAND milestone spine", () => {
    expect(ROAD_FREIGHT_MILESTONES).toEqual(LAND_MILESTONES);
  });

  it("includes pickup, border, POD and close", () => {
    expect(ROAD_FREIGHT_MILESTONES).toEqual(
      expect.arrayContaining([
        "BOOKING_CREATED",
        "PICKUP_SCHEDULED",
        "CARGO_PICKED_UP",
        "AT_BORDER",
        "POD_RECEIVED",
        "JOB_CLOSED",
      ]),
    );
  });
});
