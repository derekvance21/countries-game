// const Trie = require("./trie.js");
import Trie from "./trie.js";
const allCountries = require("../data/countries.json");

let countriesTrie = new Trie();
allCountries.forEach((country, index) => {
  countriesTrie.insert(country.name, index);
  if (country.alias) {
    countriesTrie.insert(country.alias, index);
  }
});

// module.exports = {
//   countriesTrie: countriesTrie,
//   allCountries: allCountries,
// };
export { countriesTrie, allCountries };
