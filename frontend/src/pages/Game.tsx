import { useEffect, useRef } from "react";

function Game() {
  type WordLetters = Record<string, { count: number }>;

  const rowRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentColumnRef = useRef<number>(0);
  const currentRowRef = useRef<number>(0);
  const currentGuessRef = useRef<string>("");
  const currentWordRef = useRef<string>("");
  const wordObjRef = useRef<WordLetters>({});
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      await getWordOfTheDay(); // wait for the word to load
      if (!hasLoadedRef.current) {
        BuildWordObject();
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

  const isWord = async (word: string): Promise<boolean> => {
    try {
      console.log("Checking for word...");
      const res = await fetch(`http://localhost:3000/api/is-word/${word}`);
      const data = await res.json();
      return data.valid;
    } catch (error) {
      console.log("Error checking for word:", error);
      return false;
    }
  };

  const BuildWordObject = async () => {
    const word = currentWordRef.current;

    for (const char of word) {
      if (wordObjRef.current[char]) {
        wordObjRef.current[char].count += 1;
      } else {
        wordObjRef.current[char] = { count: 1 };
      }
    }

    console.log(wordObjRef.current);
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

  const handleKeyDown = (event: KeyboardEvent) => {
    handleKeyInput(event.key);
  };

  //   Handle key down event
  const handleKeyInput = async (key: string) => {
    // if letter and current column < 5
    if (/^[a-zA-Z]$/.test(key) && currentColumnRef.current < 5) {
      // set the value of the current cell
      rowRef.current[currentRowRef.current]?.children[
        currentColumnRef.current
      ]?.setAttribute("value", key.toUpperCase());

      // increment current column
      currentColumnRef.current = currentColumnRef.current + 1;

      // add to current guess
      currentGuessRef.current += key.toLowerCase();
    } else if (key === "Backspace" && currentColumnRef.current > 0) {
      // remove value of the current cell
      rowRef.current[currentRowRef.current]?.children[
        currentColumnRef.current
      ]?.setAttribute("value", "");

      // update current guess
      currentGuessRef.current = currentGuessRef.current.slice(0, -1);

      // decrease current column
      currentColumnRef.current = currentColumnRef.current - 1;
    } else if (key === "Enter") {
      const isItWord = await isWord(currentGuessRef.current);
      console.log("isItWord", isItWord);

      if (!isItWord && currentGuessRef.current.length === 5) {
        alert(`${currentGuessRef.current.toUpperCase()} is not a word`);

        //make separate part of clearing guess
        for (let i = 0; i < 5; i++) {
          rowRef.current[currentRowRef.current]?.children[i]?.setAttribute(
            "value",
            ""
          );
        }
        currentGuessRef.current = "";
        currentColumnRef.current = 0;
      }
      // if current column is 5
      else if (currentGuessRef.current.length != 5) {
        alert("Need 5 letters");
      } else {
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
      }
    }
  };

  const checkGuess = async (guess: string) => {
    const answer = currentWordRef.current;
    const answerLetters = wordObjRef.current;
    const row = rowRef.current[currentRowRef.current];

    const processed = Array(5).fill(false); // tracks greens

    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) {
        const keyElement = document.getElementById(guess[i].toUpperCase());
        keyElement?.classList.add("green");

        row?.children[i]?.classList.add("green");

        console.log(`${answer[i]} subtracting 1`);

        answerLetters[answer[i]].count += -1;
        processed[i] = true; // mark as green

        console.log(answerLetters);

        console.log(processed);
      }
    }

    // Step 2: Yellow letters
    for (let i = 0; i < 5; i++) {
      if (!processed[i] && answerLetters[guess[i]]?.count > 0) {
        const keyElement = document.getElementById(guess[i].toUpperCase());
        keyElement?.classList.remove("gray");
        keyElement?.classList.add("yellow");

        row?.children[i]?.classList.remove("gray");
        row?.children[i]?.classList.add("yellow");

        answerLetters[guess[i]].count -= 1; // consume the letter
      } else if (!processed[i]) {
        // gray letters
        const keyElement = document.getElementById(guess[i].toUpperCase());
        keyElement?.classList.add("gray");

        row?.children[i]?.classList.add("gray");
      }
    }

    if (guess === answer) {
      window.removeEventListener("keydown", handleKeyDown);
      currentRowRef.current = 6; // End the game
      alert("Congratulations! You've guessed the word!");
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

      {/* keyboard */}
      <div className="keyboard">
        <br />
        <div className="keyboard-row">
          <div className="key" id="Q" onClick={() => handleKeyInput("Q")}>
            Q
          </div>
          <div className="key" id="W" onClick={() => handleKeyInput("W")}>
            W
          </div>
          <div className="key" id="E" onClick={() => handleKeyInput("E")}>
            E
          </div>
          <div className="key" id="R" onClick={() => handleKeyInput("R")}>
            R
          </div>
          <div className="key" id="T" onClick={() => handleKeyInput("T")}>
            T
          </div>
          <div className="key" id="Y" onClick={() => handleKeyInput("Y")}>
            Y
          </div>
          <div className="key" id="U" onClick={() => handleKeyInput("U")}>
            U
          </div>
          <div className="key" id="I" onClick={() => handleKeyInput("I")}>
            I
          </div>
          <div className="key" id="O" onClick={() => handleKeyInput("O")}>
            O
          </div>
          <div className="key" id="P" onClick={() => handleKeyInput("P")}>
            P
          </div>
        </div>
        <div className="keyboard-row">
          <div className="key" id="A" onClick={() => handleKeyInput("A")}>
            A
          </div>
          <div className="key" id="S" onClick={() => handleKeyInput("S")}>
            S
          </div>
          <div className="key" id="D" onClick={() => handleKeyInput("D")}>
            D
          </div>
          <div className="key" id="F" onClick={() => handleKeyInput("F")}>
            F
          </div>
          <div className="key" id="G" onClick={() => handleKeyInput("G")}>
            G
          </div>
          <div className="key" id="H" onClick={() => handleKeyInput("H")}>
            H
          </div>
          <div className="key" id="J" onClick={() => handleKeyInput("J")}>
            J
          </div>
          <div className="key" id="K" onClick={() => handleKeyInput("K")}>
            K
          </div>
          <div className="key" id="L" onClick={() => handleKeyInput("L")}>
            L
          </div>
        </div>
        <div className="keyboard-row">
          <div className="key" id="Z" onClick={() => handleKeyInput("Z")}>
            Z
          </div>
          <div className="key" id="X" onClick={() => handleKeyInput("X")}>
            X
          </div>
          <div className="key" id="C" onClick={() => handleKeyInput("C")}>
            C
          </div>
          <div className="key" id="V" onClick={() => handleKeyInput("V")}>
            V
          </div>
          <div className="key" id="B" onClick={() => handleKeyInput("B")}>
            B
          </div>
          <div className="key" id="N" onClick={() => handleKeyInput("N")}>
            N
          </div>
          <div className="key" id="M" onClick={() => handleKeyInput("M")}>
            M
          </div>
        </div>
      </div>
    </>
  );
}

export default Game;
