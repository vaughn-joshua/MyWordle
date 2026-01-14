"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
let corsOptions = {
    origin: ["http://localhost:5173"],
};
app.use((0, cors_1.default)(corsOptions));
app.get("/", (req, res) => {
    console.log("Received a request at /");
    res.send("Hello, World!");
});
let cachedDate = null;
let cachedWord = null;
const isSameDate = (date) => {
    console.log("Comparing dates:", date, cachedDate);
    return (date.getDay() === cachedDate?.getDay() &&
        date.getMonth() === cachedDate?.getMonth() &&
        date.getFullYear() === cachedDate?.getFullYear());
};
app.get("/api/is-word/:word", async (req, res) => {
    console.log("checking word");
    const word = req.params.word;
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const result = await response.json();
    console.log("result", result);
    console.log(response.ok);
    res.json({ valid: response.ok });
});
app.get("/api/word-of-the-day", async (req, res) => {
    const date = new Date();
    if (isSameDate(date) && cachedWord) {
        res.send(cachedWord);
        return;
    }
    const fetchRes = await fetch("https://random-word-api.herokuapp.com/word?length=5");
    const wordArray = (await fetchRes.json());
    const word = wordArray[0];
    cachedDate = date;
    cachedWord = word;
    res.send(word);
    /*
    check if the word for today is already cached
    if yes, return the cached word
    if no, fetch a new word, cache it, and return it
    
    */
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
