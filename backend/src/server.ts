import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();
const PORT: number = 3000;

let corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  console.log("Received a request at /");
  res.send("Hello, World!");
});

let cachedDate: Date | null = null;
let cachedWord: string | null = null;

const isSameDate = (date: Date): boolean => {
  console.log("Comparing dates:", date, cachedDate);
  return (
    date.getDay() === cachedDate?.getDay() &&
    date.getMonth() === cachedDate?.getMonth() &&
    date.getFullYear() === cachedDate?.getFullYear()
  );
};

app.get(
  "/api/word-of-the-day",
  async (req: Request, res: Response): Promise<void> => {
    const date = new Date();

    if (isSameDate(date) && cachedWord) {
      res.send(cachedWord);
      return
    }

    const fetchRes = await fetch(
      "https://random-word-api.herokuapp.com/word?length=5"
    );

    const wordArray = (await fetchRes.json()) as string[];
    const word = wordArray[0];

    cachedDate = date;
    cachedWord = word;

    res.send(word);

    /*
    check if the word for today is already cached
    if yes, return the cached word
    if no, fetch a new word, cache it, and return it
    
    */
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
