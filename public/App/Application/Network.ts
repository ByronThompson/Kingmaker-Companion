import {io, Socket} from 'socket.io-client';

export class NetworkManager{
    private static instance: NetworkManager;
    readonly messageName: string = "KC - Network Manager";
    private socket!: Socket;

    private constructor() {
        //TODO: Actually do network stuff
    }

    public static async NetworkManager(): Promise<NetworkManager>{
        if(NetworkManager.instance){
            return(NetworkManager.instance);
        }else{
            NetworkManager.instance = new NetworkManager();
            await NetworkManager.instance.initialize();

            // Notify that the network manager is ready
            window.Print.log(NetworkManager.instance.messageName, "Network Manager Ready");
            return(NetworkManager.instance)
        }
    }

    async initialize(){
        window.Print.debug(this.messageName, "Attempting to establish socket connection...")
        try {// Wait until the socket is connected
            this.socket = await this.connectSocket('http://localhost:3000')
            window.GameData = await this.joinGame('game123')
        }catch(err){
            console.error("Failed to establish socket connection:", err);
        }

    }

    private connectSocket(url: string): Promise<Socket> {
        return new Promise((resolve, reject) => {
            const socket = io(url);

            socket.on('connect', () => {
                window.Print.debug(this.messageName,`Successfully established socket connection with ID: ${socket.id}`);

                // Join a game room
                const gameId = 'game123';  // This would be dynamic in a real application
                //socket.emit('joinGame', gameId);

                // Send a message to the game room
                socket.emit('gameMessage', { gameId: gameId, message: 'Player has joined!' });

                // Listen for messages from the game room
                socket.on('gameMessage', (message: string) => {
                    window.Print.debug(this.messageName, `Message from game ${gameId}: ${message}`);
                });
                resolve(socket);
            });

            // When disconnected
            socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });

            socket.on('connect_error', (err: Error) => {
                console.error('Connection error:', err);
                reject(err);
            });
        });
    }

    private async joinGame(gameID: string): Promise<string>{
        window.Print.debug(this.messageName, `Attempting to join game with ID: ${gameID}`)
            try{
                const GameData = await this.sendMessageWithResponse('joinGame', gameID)
                if (typeof GameData === 'string') {
                    window.Print.debug(this.messageName, "Successfully joined game")
                    return(GameData);
                } else {
                    window.Print.error(this.messageName, `Error experienced while joining game: Server responded with unexpected data type. Expected: [string] - Received: [${typeof GameData}]`)
                    return("err");
                }
            }catch (err){
                window.Print.error(this.messageName, 'Error experienced while joining game:')
                console.error(err)
                return("err");
            }

    }

    private sendMessageWithResponse(ev: string, message: string, TIMEOUT = 5000): Promise<any>{
        return new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
                reject(new Error(`Socket response timed out after ${TIMEOUT/1000} seconds.\nSocket Event Type: ${ev} | Message: ${message}`));
            }, TIMEOUT);

            this.socket.emit(ev, message, (response: any) => {
                if (response) {
                    clearTimeout(timeout);
                    resolve(response)
                } else {
                    reject(new Error('No response received'))
                }
            });
        })

    }

    //Loads a 5MB image and then discards it
    //Only exists because without it the background image fails when blobbed
    //I don't know why, it just works
    async primeAssets() {
        const placeholderUrl = './images/Stolen-Lands-Paper.jpg'; // 1x1 pixel GIF
        const response = await fetch(placeholderUrl);
        const placeholderBlob = await response.blob();  // Blob the placeholder image
    }
}