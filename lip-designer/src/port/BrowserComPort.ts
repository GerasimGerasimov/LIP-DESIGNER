interface onDataBrowserCallBack {
  ():any;
}

export class BrowserComPort {

  public onData: onDataBrowserCallBack;
  public isComReadyToUse: boolean = false;
  private com: SerialPort | undefined = undefined;
  private activeReader: any = undefined;
  private activeWriter: any = undefined;
  private data: Array<number> = [];
  private ChunkEndTimer: any = undefined;
  private TimeOutTimer: any = undefined;
  //Close
  private promise:any = undefined;
  private promiseResolve: any = undefined;
  private promiseReject: any = undefined;

  
  constructor (com: SerialPort) {
    this.com = com;
    this.onData = this.onDataDefault;
  }

  public async close() {
    try {
      if (this.com) {
        if (this.activeReader !== undefined) {
          this.activeReader.cancel();
          await this.promise;
          console.log('flow is done');
        }
        if (this.activeWriter !== undefined) {
          this.activeWriter.cancel();
          this.activeWriter.releaseLock();
          await this.activeWriter.close();
        }
        await this.com.close();
        this.isComReadyToUse = false;
        console.log('port closed');
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async onDisconnect(event: any){
    console.log(event);
    //на этом этапе, ни порта ни его потоков read/write уже не существует 
    if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
    if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
    if (this.com) await this.com.close();
    this.com = undefined;
    this.isComReadyToUse = false;
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
    this.activeReader = reader;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) {
          if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
          if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
          await reader.releaseLock();
          console.log('done');
          this.promiseResolve();
          break;
        }
        if (value) {
          res.push(...value);
          if (this.ChunkEndTimer) clearTimeout(this.ChunkEndTimer);
          this.ChunkEndTimer = setTimeout(async () =>{
            if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
            clearTimeout(this.ChunkEndTimer);
            await reader.releaseLock();
            this.activeReader = undefined;
          }, 1);
        } else {
          clearTimeout(this.ChunkEndTimer);
          await reader.releaseLock();
          this.activeReader = undefined;
        }
      }
    } finally {
        await reader.releaseLock();
        this.activeReader = undefined;
        return res;
    }
  }

  public async sendMessage(uint8Array:Uint8Array): Promise<Array<number>> {
    console.log('--new respond--');
    const writer: WritableStreamDefaultWriter<Uint8Array> | undefined = this.com!.writable?.getWriter();
    this.activeWriter = writer;
    await writer!.write(uint8Array);
    writer!.releaseLock();
    this.activeWriter = undefined;
    if (this.TimeOutTimer) clearTimeout(this.TimeOutTimer);
    this.TimeOutTimer  = setTimeout(()=>{this.onTimeOut()}, 3000);
    this.data = await this.readRespond();
    console.log('MY DATA-ARRAY:',this.data);
    return this.data;
  }

  public async initialize (opt: SerialOptions) {
    try {
      await this.close();
      await this.com!.open(opt);
      this.com!.ondisconnect = (event) => {this.onDisconnect(event)};
      this.promise = new Promise((resolve, reject) => {
        this.promiseResolve = resolve;
        this.promiseReject = reject;
      });
      this.isComReadyToUse = false;
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