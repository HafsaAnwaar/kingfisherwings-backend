import {
  convertCbm,
  convertLength,
  convertLiquid,
  convertVolume,
  convertWeight,
  FRESA_VALIDATION,
} from "./fresa-converter.util";

describe("fresa-converter.util", () => {
  describe("convertLength", () => {
    it("returns validation message when empty", () => {
      expect(convertLength({}).message).toBe(FRESA_VALIDATION.LENGTH);
    });

    it("matches Fresa from 1 meter", () => {
      const r = convertLength({ meter: 1 });
      expect(r.mm).toBe(1000);
      expect(r.cm).toBe(100);
      expect(r.meter).toBe(1);
      expect(r.inch).toBe(39.37);
      expect(r.feet).toBe(3.281);
      expect(r.yard).toBe(1.094);
      expect(r.mile).toBe(0.001);
      expect(r.nautical_mile).toBe(0.001);
    });

    it("matches Fresa from 1 mile", () => {
      const r = convertLength({ mile: 1 });
      expect(r.mm).toBe(1609347);
      expect(r.cm).toBe(160934.7);
      expect(r.meter).toBe(1609.347);
      expect(r.inch).toBeCloseTo(63360.152, 0);
      expect(r.feet).toBeCloseTo(5280.01, 0);
      expect(r.yard).toBeCloseTo(1759.998, 0);
      expect(r.mile).toBe(1);
      expect(r.nautical_mile).toBe(0.88);
    });
  });

  describe("convertCbm", () => {
    it("returns validation when dims missing", () => {
      expect(convertCbm({ length: 1 }).message).toBe(FRESA_VALIDATION.CBM);
    });

    it("100×50×40×2 cm → 0.4 CBM / 66.667 VW", () => {
      const r = convertCbm({
        length: 100,
        width: 50,
        height: 40,
        quantity: 2,
        unit: "C",
      });
      expect(r.cubic_meter).toBe(0.4);
      expect(r.volume_weight).toBe(66.667);
    });

    it("1×1×1×1 m → 1 CBM / 166.667 VW", () => {
      const r = convertCbm({
        length: 1,
        width: 1,
        height: 1,
        quantity: 1,
        unit: "M",
      });
      expect(r.cubic_meter).toBe(1);
      expect(r.volume_weight).toBe(166.667);
    });

    it("1000 mm cube → 1 CBM", () => {
      const r = convertCbm({
        length: 1000,
        width: 1000,
        height: 1000,
        quantity: 1,
        unit: "MM",
      });
      expect(r.cubic_meter).toBe(1);
      expect(r.volume_weight).toBe(166.667);
    });

    it("40×40×40 in → ~1.049 CBM / 174.795 VW", () => {
      const r = convertCbm({
        length: 40,
        width: 40,
        height: 40,
        quantity: 1,
        unit: "I",
      });
      expect(r.cubic_meter).toBe(1.049);
      expect(r.volume_weight).toBe(174.795);
    });

    it("2×2×2 ft → 0.227 CBM / 37.756 VW", () => {
      const r = convertCbm({
        length: 2,
        width: 2,
        height: 2,
        quantity: 1,
        unit: "F",
      });
      expect(r.cubic_meter).toBe(0.227);
      expect(r.volume_weight).toBe(37.756);
    });
  });

  describe("convertWeight", () => {
    it("returns validation when empty", () => {
      expect(convertWeight({}).message).toBe(FRESA_VALIDATION.WEIGHT);
    });

    it("first field wins: gram before kilogram", () => {
      const r = convertWeight({ gram: 1000, kilogram: 5 });
      expect(r.kilogram).toBe(1);
    });

    it("matches Fresa from 1 kg", () => {
      const r = convertWeight({ kilogram: 1 });
      expect(r.gram).toBe(1000);
      expect(r.kilogram).toBe(1);
      expect(r.ton).toBe(0.001);
      expect(r.ounce).toBe(35.274);
      expect(r.pound).toBe(2.205);
    });
  });

  describe("convertLiquid", () => {
    it("returns validation when empty", () => {
      expect(convertLiquid({}).message).toBe(FRESA_VALIDATION.LIQUID);
    });

    it("matches Fresa from 1 litre", () => {
      const r = convertLiquid({ litre: 1 });
      expect(r.litre).toBe(1);
      expect(r.fluid_ounce).toBe(33.824);
      expect(r.quart).toBe(1.057);
      expect(r.gallon).toBe(0.264);
      expect(r.imperial_gallon).toBe(0.22);
    });
  });

  describe("convertVolume", () => {
    it("returns validation when value missing", () => {
      expect(
        convertVolume({ input_unit: "MT", output_unit: "CM" }).message,
      ).toBe(FRESA_VALIDATION.VOLUME);
    });

    it("1 m³ → 1,000,000 cm³", () => {
      const r = convertVolume({
        input_unit: "MT",
        value: 1,
        output_unit: "CM",
      });
      expect(r.result).toBe(1_000_000);
      expect(r.display).toBe("1,000,000.000");
    });

    it("1 m³ → 35.315 ft³", () => {
      const r = convertVolume({
        input_unit: "MT",
        value: 1,
        output_unit: "FT",
      });
      expect(r.result).toBe(35.315);
    });

    it("1 ft³ → 0.028 m³", () => {
      const r = convertVolume({
        input_unit: "FT",
        value: 1,
        output_unit: "MT",
      });
      expect(r.result).toBe(0.028);
    });
  });
});
