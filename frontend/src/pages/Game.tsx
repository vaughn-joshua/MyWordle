import { useEffect, useRef } from "react";

function Game() {
  const rowRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentColumnRef = useRef<number>(0);
  const currentRowRef = useRef<number>(0);
  const currentGuessRef = useRef<string>("");
  const currentWordRef = useRef<string>("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await getWordOfTheDay(); // wait for the word to load
      if (!hasLoadedRef.current) {
        reloadGuess(); // now answer is ready
        hasLoadedRef.current = true;
      }
    };

    init();

    window.addEventListener("keydown", handleKeyDown);

    localStorage.clear(); //reset for testing
  }, []);

  const reloadGuess = () => {
    const previousGuesses = JSON.parse(
      localStorage.getItem("guesses") || "[]"
    ) as string[];
    console.log(previousGuesses);

    for (let i = 0; i < previousGuesses.length; i++) {
      //populate frontend, rowRef
      const guess = previousGuesses[i];

      for (let j = 0; j < guess.length; j++) {
        rowRef.current[currentRowRef.current]?.children[
          currentColumnRef.current
        ]?.setAttribute("value", guess[j].toUpperCase());

        currentColumnRef.current = currentColumnRef.current + 1;
      }

      //check the guess
      checkGuess(guess);

      //add to currentRowRef
      currentGuessRef.current = "";
      currentColumnRef.current = 0;
      currentRowRef.current = currentRowRef.current + 1;
    }
  };

  const getWordOfTheDay = async (): Promise<void> => {
    try {
      console.log("Fetching word of the day...");
      const res = await fetch("http://localhost:3000/api/word-of-the-day");
      const word = await res.text();
      currentWordRef.current = word;
      console.log(currentWordRef.current);
    } catch (error) {
      console.error("Error fetching word of the day:", error);
    }
  };

  //   Handle key down event
  const handleKeyDown = (event: KeyboardEvent) => {
    // if letter and current column < 5
    if (/^[a-zA-Z]$/.test(event.key) && currentColumnRef.current < 5) {
      // set the value of the current cell
      rowRef.current[currentRowRef.current]?.children[
        currentColumnRef.current
      ]?.setAttribute("value", event.key.toUpperCase());

      // increment current column
      currentColumnRef.current = currentColumnRef.current + 1;

      // add to current guess
      currentGuessRef.current += event.key.toLowerCase();
    } else if (event.key === "Backspace" && currentColumnRef.current > 0) {
      // remove value of the current cell
      rowRef.current[currentRowRef.current]?.children[
        currentColumnRef.current
      ]?.setAttribute("value", "");

      // update current guess
      currentGuessRef.current = currentGuessRef.current.slice(0, -1);

      // decrease current column
      currentColumnRef.current = currentColumnRef.current - 1;
    } else if (event.key === "Enter") {
      // if current column is 5
      if (currentGuessRef.current.length === 5) {
        // proceed to check the guess
        console.log("Checking guess:", currentGuessRef.current);
        checkGuess(currentGuessRef.current);

        //store on localstorage
        const previousGuesses = JSON.parse(
          localStorage.getItem("guesses") || "[]"
        );
        previousGuesses.push(currentGuessRef.current);
        localStorage.setItem("guesses", JSON.stringify(previousGuesses));

        // reset for next row
        currentGuessRef.current = "";
        currentColumnRef.current = 0;
        currentRowRef.current = currentRowRef.current + 1;
      } else {
        alert("Need 5 letters");
      }
    }
  };

  const checkGuess = (guess: string) => {
    const answer = currentWordRef.current;
    const row = rowRef.current[currentRowRef.current];

    console.log("Answer:", answer);
    console.log("Guess:", guess);

    // Step 0: Make all gray first
    for (let i = 0; i < 5; i++) {
      row?.children[i]?.classList.remove("green", "yellow", "gray");
      row?.children[i]?.classList.add("gray");
    }

    // Step 1: Green letters (correct position)
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (guess[i] === answer[j]) {
          row?.children[i]?.classList.remove("gray");
          row?.children[i]?.classList.remove("yellow");
          row?.children[i]?.classList.add("green");
        } else if (guess[i] !== answer[i] && answer.includes(guess[i])) {
          row?.children[i]?.classList.remove("gray");
          row?.children[i]?.classList.add("yellow");
        }
      }
    }

    // // Step 2: Yellow letters (wrong position but exists)
    // for (let i = 0; i < 5; i++) {
    //   if (guess[i] !== answer[i] && answer.includes(guess[i])) {
    //     row?.children[i]?.classList.remove("gray");
    //     row?.children[i]?.classList.add("yellow");
    //   }
    // }

    if (guess === answer) {
      alert("Congratulations! You've guessed the word!");
      currentRowRef.current = 6; // End the game
      window.removeEventListener("keydown", handleKeyDown);
    }
  };

  /*
    every enter the guess is stored in the guess array

    DAPAT YUNG CURRENT ROW LANG PEDE MAG INPUT

    and when ENTER is pressed
        check if the guess is correct
        the current row is incremented by 1

    OKAY CHANGE APPROACH

    listen on keyboard

    change cell names, so when user enters easy to add value. (input only gonna be readonly)

    when enter clicked, check if 6 letters. then check if correct.


  */

  return (
    <>
      <h1>Game Page</h1>
      <div>
        <p>This is where the game will be played.</p>
      </div>
      {/* Game grid */}
      {Array.from({ length: 6 }).map((_, rowIndex: number) => (
        // Each row
        <div
          ref={(el) => {
            rowRef.current[rowIndex] = el;
          }}
          key={rowIndex}
          className="row"
        >
          {/* Each Column in the row */}
          {Array.from({ length: 5 }).map((_, colIndex: number) => (
            <input type="text" key={colIndex} className="cell" readOnly />
          ))}
        </div>
      ))}
      {/* fix the above, REFACTOR it */}
    </>
  );
}

export default Game;
