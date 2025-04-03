import { useState } from "react";

const API_BASE = "https://cwmxi.onrender.com"; // Flask API URL

export default function DreamXIGame() {
  const [teams, setTeams] = useState(null);
  const [scores, setScores] = useState(null);

  const startGame = async () => {
    const response = await fetch(`${API_BASE}/start-game`);
    const data = await response.json();
    setTeams(data);
  };

  const simulateGame = async () => {
    const response = await fetch(`${API_BASE}/simulate-game`);
    const data = await response.json();
    setScores(data);
  };

  return (
    <div>
      <h1>Mini Dream XI</h1>
      <button onClick={startGame}>Start Game</button>
      <button onClick={simulateGame} disabled={!teams}>Simulate Game</button>

      {teams && (
        <div>
          <h2>Selected Teams</h2>
          <pre>{JSON.stringify(teams, null, 2)}</pre>
        </div>
      )}

      {scores && (
        <div>
          <h2>Game Results</h2>
          <p>Team 1: {scores.team1.total_points} points</p>
          <p>Team 2: {scores.team2.total_points} points</p>
          <p>Difference: {scores.difference}</p>
        </div>
      )}
    </div>
  );
}
