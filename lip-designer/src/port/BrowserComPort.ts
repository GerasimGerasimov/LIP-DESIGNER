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


  public async close() {
    if (this.com) {
      const reader = this.com!.readable!.getReader();
      if (reader) {
        try {
          await reader.releaseLock();
          await reader.cancel();
        } catch(e) {
          console.log(e);
        }
      }
      const writer = this.com!.writable?.getWriter();
      if (writer) await writer.close();
      await this.com.close();
      this.com = undefined;
    }
  }

  private async onDisconnect(event: any){
    console.log(event);
    if (this.com) await this.com.close();
    this.com = undefined;//на этом этапе, ни порта ни его потоков read/write уже не существует 
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
      this.com!.ondisconnect = (event) => {this.onDisconnect(event)};
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