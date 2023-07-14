interface onDataBrowserCallBack {
  ():any;
}

export class BrowserComPort {

  public onData: onDataBrowserCallBack;
  private com: SerialPort | undefined = undefined;
  private data: Array<number> = [];
  private ChunkEndTimer: any = undefined;
  private ChunkEndTime: number = 10;
  private TimeOutTimer: any = undefined;
  
  constructor (com: SerialPort) {
    this.com = com;
    this.onData = this.onDataDefault;
  }

  private onDataDefault():any {
    return 0;
  }

  private onTimeOut() {
    clearTimeout(this.TimeOutTimer);
    console.log('time out');
  }

  private async readRespond(): Promise<Array<number>> {
    var res: Array<number> = [];
    const reader: any = this.com!.readable!.getReader();
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        if (value) {
          res.push(...value);
          if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
          this.ChunkEndTimer = setTimeout(async () =>{
            if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
            clearTimeout(this.ChunkEndTimer);
            await reader.releaseLock();
          }, 1);
        } else {
          clearTimeout(this.ChunkEndTimer);
          await reader.releaseLock();
        }
      }
    } finally {
        await reader.releaseLock();
        return res;
    }
  }

  public async sendMessage(uint8Array:Uint8Array): Promise<Array<number>> {
    console.log('--new respond--');
    const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.com!.writable?.getWriter();
    await writer!.write(uint8Array);
    writer!.releaseLock();
    if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
    this.TimeOutTimer  = setTimeout(()=>{this.onTimeOut()}, 3000);
    this.data = await this.readRespond();
    console.log('MY DATA-ARRAY:',this.data);
    return this.data;
  }

  public async initialize (opt: SerialOptions) {
    try {
      await this.com!.open(opt);
    } catch(error) {
      throw new Error('An error occurred while port initializing: '+error);
    }
  }

  public static async selectPort(): Promise <SerialPort> {
    try {
      return await navigator.serial.requestPort({ filters: []});
    } catch (e) {
      throw new Error('port is not selected');
    }
  }
}