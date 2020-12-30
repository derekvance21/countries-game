import {
  useState,
  useEffect
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
import SortableTable from "./components/table.js";
require("dotenv").config();

let currentNode = countriesTrie;
let namedCountriesArray = new Array(allCountries.length).fill(false);

getMap();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/';
const minutes = 15;
const totalMilliseconds = minutes * 60000;

let timerStart;
let timerEnd;

let leaderboard = [];
let countryTable = [];

function secondsToTime(seconds) {
  return `${Math.floor(seconds / 60)}:${twoDigitSeconds(seconds % 60)}`
}

function twoDigitSeconds(seconds) {
  return seconds < 10 ? `0${seconds}` : seconds;
}

const leaderboardColumns = [{
  field: 'place',
  headerName: 'Place',
  sortAscending: true,
  initSort: true,
},
{
  field: 'name',
  headerName: 'Name',
  sortAscending: true,
},
{
  field: 'score',
  headerName: 'Score',
},
{
  field: 'secondsLeft',
  headerName: 'Time Remaining',
  transformer: (secondsLeft) => secondsToTime(secondsLeft),
}
]

const countryTableColumns = [
  {
    field: 'country',
    headerName: 'Country',
    sortAscending: true,
    initSort: true,
  },
  {
    field: 'popularity',
    headerName: 'Popularity',
  },
  {
    field: 'named',
    headerName: 'Named',
  }
]

function App() {
  const [inputText, setInputText] = useState("");
  const [countriesNamed, setCountriesNamed] = useState(0);
  const [gameState, setGameState] = useState("ready");
  const [millisecondsLeft, setMillisecondsLeft] = useState(totalMilliseconds);
  const [name, setName] = useState("");

  useEffect(() => {
    if (gameState === "playing") {
      if (millisecondsLeft <= 0) {
        onGameOver();
      } else if (countriesNamed === allCountries.length) {
        onGameOver();
      } else {
        const tick = setInterval(function () {
          setMillisecondsLeft(timerEnd.getTime() - new Date().getTime());
        }, 1000);
        return () => clearInterval(tick);
      }
    }
  });

  function onInputChange(e) {
    const input = e.target.value;
    // insertion or backspace
    if (input.slice(0, -1) !== inputText) {
      currentNode = countriesTrie.nodeAt(input);
    } else { // traverse
      const char = input.charAt(input.length - 1).toLowerCase();
      currentNode = currentNode ? currentNode.nextNode(char) : currentNode;
    }
    // currentNode is real and insertion or new character; thus also check if country named
    if (currentNode && (inputText.slice(0, -1) !== input || input.length !== inputText.length - 1) &&
      currentNode.isCountryNode() && !namedCountriesArray[currentNode.id]) {
      namedCountriesArray[currentNode.id] = true; // mark country as named
      colorCountry(allCountries[currentNode.id].code);
      setInputText("");
      currentNode = countriesTrie;
      setCountriesNamed((prevValue) => (prevValue + 1));
    } else {
      setInputText(input);
    }
  }

  function onGameStart() {
    if (name) {
      setMillisecondsLeft(totalMilliseconds)
      timerStart = new Date();
      timerEnd = new Date(timerStart.getTime() + totalMilliseconds);
      setGameState("playing");
      setInputText("");
      namedCountriesArray = new Array(allCountries.length).fill(false)
      setCountriesNamed(0);
      clearColors();
    }
  }

  function onGameOver() {
    const endMillisecondsLeft = timerEnd.getTime() - new Date().getTime()
    const secondsLeft = Math.floor(endMillisecondsLeft / 1000)
    const gameObject = {
      name: name,
      score: countriesNamed,
      secondsLeft: secondsLeft < 0 ? 0 : secondsLeft,
      namedCountryCodes: namedCountriesArray.map((isNamed, index) => isNamed && allCountries[index].code).filter(code => code)
    }
    setGameState("loading");
    fetch(BACKEND_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameObject)
    })
      .then(response => response.json())
      .then(responseJSON => {
        console.log(responseJSON)
        const {topTen, countryCounts, totalGames} = responseJSON
        leaderboard = <SortableTable 
          id="leaderboard-table"
          rows={
            topTen.map((game, index) => ({
              ...game,
              place: index + 1,
              color: game.activeGame ? 'lime' : 'inherit'
            }))
          }
          columns={leaderboardColumns}
          title="Top Ten High Scores"
        />
        countryTable = <SortableTable 
          id="country-table"
          rows={namedCountriesArray.map((isNamed, countryIndex) => {
            return {
              country: allCountries[countryIndex].name,
              popularity: `${Math.floor(100 * countryCounts[allCountries[countryIndex].code] / totalGames)}%`,
              color: isNamed ? 'lime' : '#ff4646',
              named: isNamed ? 'Yes' : 'No'
            }
          })}
          columns={countryTableColumns}
          title="All Countries"
        />

        setGameState("gameover");
      })
      .catch(error => console.log(error))
  }

  return (
    <div className="App">
      <div>
        <p> {`${Math.floor(millisecondsLeft / 60000)}:${twoDigitSeconds(Math.floor(millisecondsLeft % 60000 / 1000))}`}</p>
      </div>
      {gameState === "ready" ? (
        <p> Name all 197 countries before time runs out! </p>
        ) : (
        <p> {`${name}: ${countriesNamed}/${allCountries.length}`}</p>
        )
      } 
      <div>
        {gameState === "playing" ? (
          <input
            type="text"
            id="countryInput"
            value={inputText}
            onChange={onInputChange}
          style={{display: "inline-block"}}
        />
        ) : (
          <input
            type="text"
            id="nameInput"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        )
        }
        {gameState === "playing" ? (
          <button style={{ display: "inline-block" }} onClick={onGameOver}>Submit Game</button>
          ) : (
          <button placeholder="Name" onClick={onGameStart}>Start Game!</button>)
        } 
      </div>
      <div id="map"></div>
      {gameState === "gameover" &&
        (<div className="tableDiv"> {leaderboard} {countryTable} </div>)
      }
    </div>
  );
}

export default App;