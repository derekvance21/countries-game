const Trie = require("./trie.js");
const countries = require("../data/countries.json");

let countriesTrie = new Trie();

countries.forEach((country, index) => {
  countriesTrie.insert(country.name, index);
  if (country.alias) {
    countriesTrie.insert(country.alias, index);
  }
});

module.exports = {
  countriesTrie: countriesTrie,
  allCountries: countries,
};
