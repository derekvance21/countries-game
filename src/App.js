import {
  useState
} from "react";
import "./App.css";
import {
  countriesTrie,
  allCountries
} from "./utils/loadCountries.js";
import getMap, {
  colorCountry,
  clearColors
} from "./components/map.js";
import Timer from "./components/timer.js";

let currentNode = countriesTrie;
let namedCountriesArray = new Array(allCountries.length).fill(0);

getMap();

function App() {
  const [inputText, setInputText] = useState("");
  const [countriesNamed, setCountriesNamed] = useState(0);
  const [gameState, setGameState] = useState("ready");

  function onInputChange(e) {
    const input = e.target.value;
    // backspace or insertion    
    if (input.slice(0, -1) !== inputText) {
      currentNode = countriesTrie.nodeAt(input);
    } else { // traverse
      const char = input.charAt(input.length - 1).toLowerCase();
      currentNode = currentNode ? currentNode.nextNode(char) : currentNode;
    }
    // currentNode is real and insertion or new character; thus also check if country named
    if (currentNode && (inputText.slice(0, -1) !== input || input.length !== inputText.length - 1) &&
      currentNode.isCountryNode() && namedCountriesArray[currentNode.id] === 0) {
      namedCountriesArray[currentNode.id] = 1; // mark country as named
      setCountriesNamed((prevValue) => prevValue + 1);
      colorCountry(allCountries[currentNode.id].code);
      setInputText("");
      if (countriesNamed === allCountries.length) {
        setGameState("gameover");
      }
      currentNode = countriesTrie;
      return;
    } else {
      setInputText(input);
    }
  }

  function onGameStart() {
    setGameState("playing");
    setInputText("");
    setCountriesNamed(0);
    clearColors();
  }

  function onGameOver() {
    setGameState("gameover");
  }

  return (
    <div className="App">
      <header className="App-header">
        {gameState === "playing" ? (
          <Timer onGameOver={onGameOver} />
        ) : (
          <p>15:00</p>
        )}
        {gameState === "ready" ? (
          <p>Name all 197 countries before time runs out!</p>
        ) : (
          <p>
            {countriesNamed}/{allCountries.length}
          </p>
        )}
        <div>
          {gameState === "playing" && (
            <input
              type="text"
              id="countryInput"
              value={inputText}
              onChange={onInputChange}
              style={{ display: "inline-block" }}
            ></input>
          )}
          {gameState === "playing" ? (
            <button style={{ display: "inline-block" }} onClick={onGameOver}>
              Give Up
            </button>
          ) : (
            <button onClick={onGameStart}>Start Game!</button>
          )}
        </div>
        <div id="map"></div>
        {gameState === "gameover" &&
          namedCountriesArray.map((value, index) => {
            return (
              <span key={index} style={{ color: value === 0 ? "red" : "lime" }}>
                {allCountries[index].name}
              </span>
            );
          })}
      </header>
    </div>
  );
}

export default App;
