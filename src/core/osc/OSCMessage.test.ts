import { describe, it, expect } from 'vitest';
import { OSCMessage } from './OSCMessage';

describe('OSCMessage encoding', () => {
  it('should encode string address with null-termination and 4-byte padding', () => {
    // '/test' is 5 bytes + 1 null = 6 bytes => padded to 8 bytes
    const msg = new OSCMessage('/test', '', []);
    const buf = new Uint8Array(msg.encode());
    
    // Address starts with '/test\0'
    const textDecoder = new TextDecoder();
    expect(textDecoder.decode(buf.slice(0, 5))).toBe('/test');
    expect(buf[5]).toBe(0); // null terminator
    expect(buf[6]).toBe(0); // padding
    expect(buf[7]).toBe(0); // padding
  });

  it('should correctly pack float arguments in Big-Endian network order', () => {
    const msg = new OSCMessage('/mnote', 'ff', [60.5, 127.0]);
    const arrayBuffer = msg.encode();
    const view = new DataView(arrayBuffer);
    
    // Address '/mnote' (6 chars) + 1 null = 7 => padded to 8 bytes
    // Types ',ff' (3 chars) + 1 null = 4 => padded to 4 bytes
    // Total header = 12 bytes
    const float1 = view.getFloat32(12, false);
    const float2 = view.getFloat32(16, false);

    expect(float1).toBeCloseTo(60.5, 4);
    expect(float2).toBeCloseTo(127.0, 4);
  });

  it('should pack integer arguments in Big-Endian network order', () => {
    const msg = new OSCMessage('/cmd', 'i', [1024]);
    const arrayBuffer = msg.encode();
    const view = new DataView(arrayBuffer);
    
    // '/cmd' (4) + 1 null = 5 => 8 bytes
    // ',i' (2) + 1 null = 3 => 4 bytes
    // args offset = 12
    const intVal = view.getInt32(12, false);
    expect(intVal).toBe(1024);
  });
});
