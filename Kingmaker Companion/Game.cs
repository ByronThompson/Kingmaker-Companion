using Microsoft.AspNetCore.SignalR;

namespace Kingmaker_Companion;

public class Game {
    public string GameId;
    public string KingdomId;
    public List<Player> Players = new List<Player>();

    public Game(string gameId, string kingdomId) {
        GameId = gameId;
        KingdomId = kingdomId;
    }

    public Player GetPlayer(string connectionId) {
        return Players.Find(p => p.ConnectionId == connectionId);
    }

    public void ConnectPlayer(Player p) {
        Console.WriteLine("Connected Player " + p.ConnectionId + " to game " + GameId);
        Players.Add(p);
    }

    public void DisconnectPlayer(string connectionId) {
        Player p = Players.Find(p => p.ConnectionId == connectionId);
        if (p is not null) {
            Players.Remove(p);
        }
    }
    
}

public class Player {
    public string ConnectionId { get; set; }
    public string Name { get; set; }
}