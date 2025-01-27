export class Log{
    private static instance: Log;
    readonly debugStyle: string = 'color: #20C20E; font-weight: bold;';
    readonly errorStyle: string = 'color: #ED4337; font-weight: bold;';

    private constructor() {
    }

    public static Log(): Log{
        if(Log.instance){
            return Log.instance;
        }else{
            Log.instance = new Log();
            return Log.instance;
        }
    }

    log(sender: string, message: string): void{
        console.log(`${sender} | ${message}`)
    }

    debug(sender: string, message: string): void{
        if(window.Settings.getSetting('debugMode')){
            //Log.instance.log(`DEBUG | ${sender}`, message)
            console.log(`%cDEBUG | ${sender} | ${message}`, this.debugStyle)
        }
    }

    error(sender: string, message: string): void{
        console.log(`%cERROR | ${sender} | ${message}`, this.errorStyle)

    }

    warn(sender: string, message: string): void{
        console.warn(`${sender} | ${message}`)
    }
}