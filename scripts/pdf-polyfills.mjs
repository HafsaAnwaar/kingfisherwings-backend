globalThis.DOMMatrix = class DOMMatrix {
  constructor(init) {
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    if (Array.isArray(init) && init.length >= 6) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = init;
    }
  }
  multiply() { return this; }
  translate() { return this; }
  scale() { return this; }
  inverse() { return this; }
  transformPoint(p = { x: 0, y: 0 }) { return { ...p }; }
  static fromMatrix() { return new DOMMatrix(); }
};
globalThis.ImageData = class ImageData {
  constructor(w, h) {
    this.width = w;
    this.height = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }
};
globalThis.Path2D = class Path2D {};
