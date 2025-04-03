import { useState, useEffect } from "react";

const API_BASE = "https://cwmxi.onrender.com"; // Flask API URL

export default function DreamXIGame() {
  const [teams, setTeams] = useState(null);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null); // State for match details

  // Fetch today's match details
  useEffect(() => {
    const fetchTodaysMatch = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('${API_BASE}/todays-match');
        if (!response.ok) throw new Error("Failed to fetch today's match");

        const data = await response.json();
        console.log("Today's Match Data:", data);
        setMatchDetails(data[0]); // Assuming the data is in the format [ { teams: [], venue: "" } ]
      } catch (err) {
        console.error("Error fetching match details:", err);
        setError("An error occurred while fetching today's match.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysMatch();
  }, []); // Empty dependency array to run only once on mount

  // Start the game
  const startGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/start-game`);
      if (!response.ok) throw new Error("Failed to start the game");

      const data = await response.json();
      console.log("Teams Data:", data);
      setTeams(data);
    } catch (err) {
      console.error("Error starting game:", err);
      setError("An error occurred while starting the game.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate the game
  const simulateGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/simulate-game`);
      if (!response.ok) throw new Error("Failed to simulate the game");

      const data = await response.json();
      setScores(data);
    } catch (err) {
      console.error("Error simulating game:", err);
      setError("An error occurred while simulating the game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Mini Dream XI</h1>
      
      <button onClick={startGame} disabled={loading}>
        {loading ? "Starting Game..." : "Start Game"}
      </button>

      <button
        onClick={simulateGame}
        disabled={!teams || loading}
        style={{ marginLeft: "10px" }}
      >
        {loading ? "Simulating..." : "Simulate Game"}
      </button>

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      {/* Display Today's Match and Venue */}
      {matchDetails ? (
        <div style={{ marginTop: "20px" }}>
          <h2>Today's Match</h2>
          <p><strong>{matchDetails.teams[0]}</strong> vs <strong>{matchDetails.teams[1]}</strong></p>
          <p><strong>Venue:</strong> {matchDetails.venue}</p>
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <p>Loading today's match...</p>
        </div>
      )}

      {teams && (
        <div style={{ marginTop: "20px" }}>
          <h2>Selected Teams</h2>
          <div>
            <h3>{teams.team1.name}</h3>
            <ul>
              {teams.team1.players.map((player, index) => (
                <li key={index}>{player.name} - {player.role}</li>
              ))}
            </ul>
            <h3>{teams.team2.name}</h3>
            <ul>
              {teams.team2.players.map((player, index) => (
                <li key={index}>{player.name} - {player.role}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {scores && (
        <div style={{ marginTop: "20px" }}>
          <h2>Game Results</h2>
          <p>
            <strong>{teams.team1.name}:</strong> {scores.team1.total_points} points
          </p>
          <p>
            <strong>{teams.team2.name}:</strong> {scores.team2.total_points} points
          </p>
          <p>
            <strong>Difference:</strong> {scores.difference}
          </p>
        </div>
      )}
    </div>
  );
}
