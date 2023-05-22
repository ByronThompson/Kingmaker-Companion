using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using NuGet.Protocol;
using StackExchange.Redis;

namespace Kingmaker_Companion.Hubs; 

public interface IGameClient {
    Task SendMessage(string message);
    Task MapUpdate(string updateMessage);
}

public class GameHub : Hub<IGameClient> {
    private static readonly ConnectionMultiplexer redis = Globals.REDIS;

    private IGameRepository _repository;
    private readonly Random _random;
    
    public GameHub(IGameRepository repository, Random random) {
        _repository = repository;
        _random = random;
    }
    
    public async Task<string> GameConnect(string gameID) {
        if (gameID.ToLower() == "new") {
            
        }
        
        var game = _repository.Games.FirstOrDefault(g => g.GameId == gameID);
        if (game is null) {
            string? g = redis.GetDatabase().StringGet("game:" + gameID);
            if (g is null) {
                string k = newKingdom();
                game = new Game(Guid.NewGuid().ToString(), JObject.Parse(k)["kingdomId"].ToString());
            }
            else {
                game = Newtonsoft.Json.JsonConvert.DeserializeObject<Game>(g);
            }
            
            game.kingdom = JObject.Parse(redis.GetDatabase().StringGet("kingdom:" + game.KingdomId));
            _repository.Games.Add(game);
        }

        Player p = new Player();
        p.ConnectionId = Context.ConnectionId;
        game.ConnectPlayer(p);

        await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);

        Console.WriteLine(jsonMinify(game.kingdom.ToString()));
        return jsonMinify(game.kingdom.ToString());
    }

    public async Task MapUpdate(string message) {
        Game g = _repository.Games.FirstOrDefault(f => f.GetPlayer(Context.ConnectionId) is not null);
        if (g is null) {
            return;
        }

        await Clients.OthersInGroup(g.GameId).MapUpdate(message);

        JObject m = JObject.Parse(message);
        JArray h = (JArray) g.kingdom["saveHexes"];
        
        h[Int32.Parse(m["index"].ToString())][m["property"].ToString()] = m["newState"].ToString();

        string s = Regex.Replace(g.kingdom.ToString(), @"\s(?=([^""]*""[^""]*"")*[^""]*$)", string.Empty);
        redis.GetDatabase().StringSet("kingdom:" + g.KingdomId, s);

    }

    public override async Task OnDisconnectedAsync(Exception exception) { 
        Game g = _repository.Games.FirstOrDefault(g => g.GetPlayer(Context.ConnectionId) is not null);
        if (g is not null) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, g.GameId);
            g.DisconnectPlayer(Context.ConnectionId);
            Console.WriteLine("User disconected");

            if (g.Players.Count <= 0) {
                Console.WriteLine("All players disconected. Shutting down Game");
                Console.WriteLine(_repository.Games.Remove(g));
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private string newKingdom() {
        string k = redis.GetDatabase().StringGet("kingdom:default");
        JObject kingdom = JObject.Parse(k);
        string id = Guid.NewGuid().ToString();
        kingdom["kingdomId"] = id;
        redis.GetDatabase().StringSet("kingdom:" + id, kingdom.ToString());
        return kingdom.ToString();
    }

    private string jsonMinify(string json) {
        return Regex.Replace(json, @"\s(?=([^""]*""[^""]*"")*[^""]*$)", string.Empty);
    }
}