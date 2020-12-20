# Notes

## Backend Leaderboard API

* Each submitted game is represented by a list of all codes of the countries named. (i.e. ["USA", "GBR", "MEX", ...])
* Document in database dedicated to aggregating all games
    - Includes number of games, as well as array of all countries with their counts named in games
    - Thus, percentages for all countries can be calculated very quickly, to be sent to client
* Document in database dedicated to top ten
* On game submission, backend fetches top ten from database, determines if new game is top ten, if so, inserts game in top ten, sends object to client, then submits put/patch to database top ten
* Need some way to not let anonymous post requests to backend. Somehow restrict request origin to countries-game url
    - ^ This is actually not really possible ^