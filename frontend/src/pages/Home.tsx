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
      <h1>Wordle</h1>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Asperiores
        aliquam necessitatibus aut, minus dolorum iusto culpa ipsa unde
        praesentium quia debitis totam dicta exercitationem sequi sint sunt
        quis. Fugiat, perspiciatis!
      </p>
      <button onClick={handlePlayClick}>Play</button>
    </main>
  );
}

export default Home;
