const { detectImageType } = require('../src/utils/image');

const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

describe('detectImageType', () => {
  test('JPEG', () => expect(detectImageType(pad([0xff, 0xd8, 0xff, 0xe0])).mime).toBe('image/jpeg'));
  test('PNG', () => expect(detectImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).mime).toBe('image/png'));
  test('WebP', () => {
    const b = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 '), Buffer.alloc(8)]);
    expect(detectImageType(b).ext).toBe('.webp');
  });
  test('rejects text pretending to be an image', () => expect(detectImageType(Buffer.from('<?php echo 1; ?> this is not an image'))).toBe(null));
  test('rejects an SVG (can contain scripts)', () => expect(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe(null));
  test('rejects empty and tiny input', () => { expect(detectImageType(Buffer.alloc(0))).toBe(null); expect(detectImageType(Buffer.from([0xff, 0xd8]))).toBe(null); });
  test('rejects non-buffers', () => expect(detectImageType('FFD8FF')).toBe(null));
});
