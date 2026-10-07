export class OSCMessage {
  address: string;
  types: string;
  args: number[];

  constructor(address: string, types: string, args: number[]) {
    this.address = address;
    this.types = "," + types;
    this.args = args;
  }

  encode(): ArrayBuffer {
    const addrBuf = this.stringToBuffer(this.address);
    const typesBuf = this.stringToBuffer(this.types);
    const argsBuf = this.argsToBuffer();

    const totalSize = addrBuf.length + typesBuf.length + argsBuf.length;
    const buffer = new Uint8Array(totalSize);
    buffer.set(addrBuf, 0);
    buffer.set(typesBuf, addrBuf.length);
    buffer.set(argsBuf, addrBuf.length + typesBuf.length);
    return buffer.buffer;
  }

  private stringToBuffer(str: string): Uint8Array {
    const content = new TextEncoder().encode(str);
    const len = content.length + 1; // null terminator
    const paddedLen = Math.ceil(len / 4) * 4;
    const buffer = new Uint8Array(paddedLen);
    buffer.set(content);
    return buffer;
  }

  private argsToBuffer(): Uint8Array {
    let size = 0;
    const tChars = this.types.substring(1).split("");
    tChars.forEach(t => { 
      if (t === "i" || t === "f") size += 4; 
    });
    
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    let offset = 0;
    
    tChars.forEach((t, idx) => {
      if (t === "i") { 
        view.setInt32(offset, this.args[idx], false); // false = big-endian (network byte order)
        offset += 4; 
      }
      else if (t === "f") { 
        view.setFloat32(offset, this.args[idx], false); // false = big-endian
        offset += 4; 
      }
    });
    
    return new Uint8Array(buffer);
  }
}
