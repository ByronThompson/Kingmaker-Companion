namespace Kingmaker_Companion; 

public interface IGameRepository {
    List<Game> Games { get; }
        
}

public class GameRepository : IGameRepository {
    public List<Game> Games { get; } = new List<Game>();
}