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
        if (done) {
          console.log('break');
          break;
        }
        if (value) {
          res.push(...value);
          console.log('chunk:',value);
          if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
          this.ChunkEndTimer = setTimeout(async () =>{
            if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
            clearTimeout(this.ChunkEndTimer);
            console.log('--values:', res);
            await reader.releaseLock();
          }, 10);
        } else {
          clearTimeout(this.ChunkEndTimer);
          console.log('value is undefined:', res);
        }
      }
    } finally {
      reader.releaseLock();
      console.log('releaseLock:');
      return res;
    }
  }

  public async sendMessage(uint8Array:Uint8Array): Promise<Array<number>> {
    this.data = [];
    console.log('--new respond--');
    const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.com!.writable?.getWriter();
    await writer!.write(uint8Array);
    writer!.releaseLock();
    this.TimeOutTimer  = setTimeout(()=>{this.onTimeOut()}, 3000);
    this.data = await this.readRespond();
    console.log('MY DATA:',this.data);
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