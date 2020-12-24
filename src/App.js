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
console.log('BACKEND_URL', BACKEND_URL)
const minutes = 15;
const totalMilliseconds = minutes * 60000;

let timerStart;
let timerEnd;

let leaderboard = [];
let countryTable = [];

const leaderboardColumns = [{
  field: 'place',
  headerName: 'Place',
  sortAscending: true,
  initSort: true,
  width: 2
},
{
  field: 'name',
  headerName: 'Name',
  width: 6
},
{
  field: 'score',
  headerName: 'Score',
  width: 2
},
{
  field: 'secondsLeft',
  headerName: 'Seconds Remaining',
  width: 2
}
]

const countryTableColumns = [
  {
    field: 'country',
    headerName: 'Country',
    sortAscending: true,
    initSort: true,
    width: 2
  },
  {
    field: 'popularity',
    headerName: 'Popularity',
    width: 6,
  },
  {
    field: 'named',
    headerName: 'Named',
    width: 2
  }
]

function App() {
  const [inputText, setInputText] = useState("");
  const [countriesNamed, setCountriesNamed] = useState(0);
  const [gameState, setGameState] = useState("ready");
  const [millisecondsLeft, setMillisecondsLeft] = useState(totalMilliseconds);
  const [name, setName] = useState("");

  useEffect(() => {
    if (millisecondsLeft < 0) {
      onGameOver();
    } else if (gameState === "playing") {
      const tick = setInterval(function () {
        const newMillisecondsLeft = timerEnd.getTime() - new Date().getTime()
        setMillisecondsLeft(newMillisecondsLeft < 0 ? 0 : newMillisecondsLeft);
      }, 1000);
      return () => clearInterval(tick);
    }
  });

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
      currentNode.isCountryNode() && !namedCountriesArray[currentNode.id]) {
      namedCountriesArray[currentNode.id] = true; // mark country as named
      colorCountry(allCountries[currentNode.id].code);
      setInputText("");
      currentNode = countriesTrie;
      setCountriesNamed((prevValue) => {
        if (prevValue + 1 === allCountries.length) {
          onGameOver();
        }
        return prevValue + 1
      });
      return;
    } else {
      setInputText(input);
    }
  }

  function onGameStart() {
    setMillisecondsLeft(totalMilliseconds)
    timerStart = new Date();
    timerEnd = new Date(timerStart.getTime() + totalMilliseconds);
    setGameState("playing");
    setInputText("");
    namedCountriesArray = new Array(allCountries.length).fill(false)
    setCountriesNamed(0);
    clearColors();
  }

  function onGameOver() {
    const gameObject = {
      name: name,
      score: countriesNamed,
      secondsLeft: Math.floor(millisecondsLeft / 1000),
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

  function twoDigitSeconds(seconds) {
    return seconds < 10 ? `0${seconds}` : seconds;
  }

  return (<div className="App" >
    <header className="App-header" > {
      gameState === "playing" ? (<div>
        <p> {
          `${Math.floor(millisecondsLeft / 60000)}:${twoDigitSeconds(Math.floor(millisecondsLeft % 60000 / 1000))}`
        } </p> </div>
      ) : (<p > 15:00 </p>)
    } {
        gameState === "ready" ? (<p> Name all 197 countries before time runs out! </p>
        ) : (<p> {
          countriesNamed
        }
        /{allCountries.length} </p>
          )
      } <div> {
        gameState === "playing" ? (<input
          type="text"
          id="countryInput"
          value={
            inputText
          }
          onChange={
            onInputChange
          }
          style={
            {
              display: "inline-block"
            }
          }
        />
        ) : (<input
          type="text"
          id="nameInput"
          value={
            name
          }
          placeholder="Enter a name"
          onChange={
            (e) => setName(e.target.value)
          }
        />
          )
      } {
          gameState === "playing" ? (<button style={{ display: "inline-block" }} onClick={onGameOver}>Submit Game</button>)
            : (<button onClick={onGameStart}>Start Game!</button>)
        } </div>
      <div id="map"></div>
      {gameState === "gameover" &&
        (<div className="tableDiv"> {leaderboard} {countryTable} </div>)
      }
    </header>
  </div>
  );
}

export default App;