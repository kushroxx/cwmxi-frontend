import { useState, useEffect } from "react";

const API_BASE = "https://cwmxi.onrender.com"; // Flask API URL

export default function DreamXIGame() {
  const [teams, setTeams] = useState(null);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null); // State for match details
  const [teamSquads, setTeamSquads] = useState([]); // State for team squads
  const [selectedPlayers, setSelectedPlayers] = useState({}); // State for selected players

  // Fetch today's match details
  useEffect(() => {
    const fetchTodaysMatch = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/todays-match`);
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

  // Fetch squad information for a team
  const getTeamSquad = async (teamName) => {
    try {
      const response = await fetch(`${API_BASE}/get_team_squad`, {
        method: "POST", // Change to POST request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ squad_name: teamName }), // Pass squad_name in the request body
      });

      if (!response.ok) throw new Error(`Failed to fetch squad for ${teamName}`);

      const data = await response.json();
      return data.squad; // Return squad data for the team
    } catch (err) {
      console.error(`Error fetching squad for ${teamName}:`, err);
      return null; // Return null if an error occurs
    }
  };

  // Start the game and fetch squad data for both teams
  const startGame = async () => {
    setLoading(true);
    setError(null);
    setTeamSquads([]); // Reset previous team squads

    try {
      // Fetch squad for both teams dynamically based on matchDetails
      const team1Squad = await getTeamSquad(matchDetails.teams[0]);
      const team2Squad = await getTeamSquad(matchDetails.teams[1]);

      // Sort the squads based on roles (e.g., Allrounder, Batsman, Bowler)
      const sortByRole = (squad) => {
        return squad.sort((a, b) => {
          // You can modify the role order as per your preference
          const roleOrder = ['Batsman', 'Bowler', 'Allrounder', 'Wicketkeeper'];
          return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
        });
      };

      // Update the state with the fetched and sorted squad data
      setTeamSquads([
        { team: matchDetails.teams[0], squad: sortByRole(team1Squad) },
        { team: matchDetails.teams[1], squad: sortByRole(team2Squad) },
      ]);

      console.log(`${matchDetails.teams[0]} Squad:`, team1Squad);
      console.log(`${matchDetails.teams[1]} Squad:`, team2Squad);
    } catch (err) {
      console.error("Error starting the game:", err);
      setError("An error occurred while fetching team squads.");
    } finally {
      setLoading(false);
    }
  };

  // Handle player selection
  const handlePlayerSelection = (player, team) => {
    setSelectedPlayers((prevSelectedPlayers) => {
      const newSelection = [...(prevSelectedPlayers[team] || [])];
      if (newSelection.includes(player)) {
        // Remove the player if already selected
        const updatedSelection = newSelection.filter((selectedPlayer) => selectedPlayer !== player);
        return { ...prevSelectedPlayers, [team]: updatedSelection };
      } else {
        // Add the player if not already selected
        if (newSelection.length < 6) {
          newSelection.push(player);
        }
        return { ...prevSelectedPlayers, [team]: newSelection };
      }
    });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Cricket Royale</h1>
      <h2>A 2 Player 6vs6 battle royale</h2>
      
      <button onClick={startGame} disabled={loading}>
        {loading ? "Starting Game..." : "Start Game"}
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

      {/* Display Team Squads in Table */}
      {teamSquads.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Select Players for {matchDetails.teams[0]} and {matchDetails.teams[1]}</h2>

          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            {teamSquads.map((teamData, index) => (
              <div key={index} style={{ width: "45%" }}>
                <h3>{teamData.team} Squad</h3>
                <table border="1" style={{ margin: "0 auto", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Country</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.squad.map((player, index) => (
                      <tr key={index}>
                        <td>{player.name}</td>
                        <td>{player.role}</td>
                        <td>{player.country}</td>
                        <td>
                          <button
                            onClick={() => handlePlayerSelection(player, teamData.team)}
                            disabled={selectedPlayers[teamData.team]?.length >= 6 && !selectedPlayers[teamData.team]?.includes(player)}
                          >
                            {selectedPlayers[teamData.team]?.includes(player) ? "Selected" : "Select"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Display 3x3 Grid for Selected Players */}
          <div style={{ marginTop: "30px" }}>
            <h3>Selected Players</h3>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              {["kkr", "srh"].map((team, index) => (
                <div key={index} style={{ width: "45%" }}>
                  <h4>{team === "kkr" ? matchDetails.teams[0] : matchDetails.teams[1]}'s Selected Squad</h4>
                  <table border="1" style={{ margin: "0 auto", width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlayers[team]?.map((player, index) => (
                        <tr key={index}>
                          <td>{player.name}</td>
                          <td>{player.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
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
