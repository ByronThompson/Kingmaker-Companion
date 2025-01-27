export class Hooks{
    static #MessageName = 'KC - Hooks'
    /**
     * A mapping of events with registered functions
     * @private
     */
    static #events: HooksList = {}

    /**
     * A mapping of functions by their assigned ID
     * @private
     */
    static #ids: Map<number, HookedFunction> = new Map();

    /**
     * An incrementing counter for assigning IDs
     * @private
     */
    static #id = 1;

    static get events() {
        return this.#events;
    }

    /**
     * Register a callback function to be triggered when the hook is called
     * @param hook  The hook event name
     * @param fn    The callback function to be called when the hook occurs
     * @param once  Should this only trigger once (Default false)
     * @return      The hooked function's ID
     */
    static on(hook: string, fn: Function, once = false): number{
        window.Print.debug(this.#MessageName, `Registered callback for ${hook} hook`)
        const id = this.#id++;
        if(!(hook in this.#events)){
            Object.defineProperty(this.#events, hook, {value: [], writable: false});
        }

        const entry = {hook, id, fn, once};
        this.#events[hook].push(entry);
        this.#ids.set(id, entry);
        return id;
    }

    /**
     * Register a callback function to be triggered the next time the hook is called.
     * The callback function will only be called one time. An Alias for Hooks.on with once = true
     * @param hook  The hook event name
     * @param fn    The callback function to be called when the hook occurs
     * @return      The hooked function's ID
     */
    static once(hook: string, fn: Function): number{
        return this.on(hook, fn, true);
    }

    /**
     * Unregister a callback function from a particular event
     * @param hook  The hook event name
     * @param fn    The function, or the ID of the function that should be removed
     */
    static off(hook: string, fn: Function | number){
        let entry;

        if(typeof fn === "number"){
            const id = fn;
            entry = this.#ids.get(id);
            if(!entry) return;
            this.#ids.delete(id);
        }

        else {
            const event: HookedFunction[] = this.#events[hook];
            const entry = event.find((h: HookedFunction) => h.fn === fn);
            if (!entry) return;
            this.#ids.delete(entry.id);
        }

        window.Print.debug(this.#MessageName, `Unregistered callback for ${hook} hook`);
    }

    /**
     * Call all functions registered to a hook in the order they were registered.
     * Hooks called this way will always trigger every callback
     * @param hook  The hook event name
     * @param args  Arguments to be passed to the hooked functions
     */
    static callAll(hook: string, ...args: any[]): boolean{
        window.Print.debug(this.#MessageName, `Calling hook [${hook}] with args: ${args}`);

        if(!(hook in this.#events)) return true;

        for(const entry of Array.from(this.#events[hook])){
            this.#call(entry, args);
        }

        return true;
    }

    /**
     * Call all functions registered to a hook in the order they were registered.
     * Hooks called this way will execute until one of the callbacks returns false.
     *
     * Functions which return false indicate that the original event has been handled
     * and no further functions should be called
     * @param hook  The hook event name
     * @param args  Arguments to be passed to the hooked functions
     */
    static call(hook: string, ...args: any[]): boolean{
        window.Print.debug(this.#MessageName, `Calling hook [${hook}] with args: ${args}`)

        if(!(hook in this.#events)) return true;

        for(const entry of Array.from(this.#events[hook])){
            let callAdditional = this.#call(entry, args);
            if(callAdditional === false) return false;
        }

        return  true;
    }

    /**
     * Executes a hooked function and possibly unregisters it
     * @param entry Hooked Function entry
     * @param args  Arguments to be passed to the hooked functions
     * @private
     */
    static #call(entry: HookedFunction, args: any[]){
        const {hook, id, fn, once} = entry;

        if(once) this.off(hook, id);

        try{
            return entry.fn(...args)
        }catch(err){
            const msg = `Error thrown in function '${fn?.name}' when calling hook '${hook}'`;
            window.Print.warn(this.#MessageName, msg)
            if(hook !== "error") this.onError("Hooks.#call", err, {msg, log: "error"})
        }
    }

    /**
     * Notify subscribers that an Error has occurred
     * @param location  The function where the error was caught
     * @param error     The error
     * @param msg       A message to prefix the resulting error
     * @param notify    the level at which to create a notification for the user (If at all)
     * @param log       The level at which to log the error to the console (If at all)
     * @param data      Additional data to pass to subscribers
     */
    static onError(location: string, error: any, {msg="", notify=null, log=null, ...data}: ErrorOptions={}) {
        if ( !(error instanceof Error) ) return;
        if ( msg ) error.message = `${msg}. ${error.message}`;
        if ( log ) console[log]?.(error);

        Hooks.callAll("error", location, error, data);
    }
}

type HookedFunction = {
    hook: string,
    id: number,
    fn: Function,
    once: boolean
}

type HooksList = {
    [hookName: string]: HookedFunction[]
}

type ErrorOptions = {
    msg?: string;
    notify?: any;
    log?: 'log' | 'warn' | 'error' | 'info' | 'debug' | null | undefined;
    [key: string]: any; // This allows additional properties
};

