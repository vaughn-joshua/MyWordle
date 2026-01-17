import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    // Logic to start the game goes here
    console.log("Play button clicked!");
    navigate("/game");
  };

  return (
    <main>
      <h1>Welcome to MyWordle</h1>
      <p>
        Guess the hidden word in six tries. <br />
        Each guess brings you closer—think carefully and start strong.
      </p>
      <button onClick={handlePlayClick}>Play</button>
    </main>
  );
}

export default Home;
