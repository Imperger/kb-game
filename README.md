# Typing game

![integration tests](https://github.com/Imperger/kb-game/actions/workflows/integration-test.yml/badge.svg)
[![codecov](https://codecov.io/gh/Imperger/kb-game/branch/master/graph/badge.svg?token=7RZYOF5A7E)](https://codecov.io/gh/Imperger/kb-game)

# Projects

`frontend` - client for `backend`

`backend` - responsible for authorization, matchmaking, storing and retrieving players statistics and replays. Requests game instances from a `spawner` (game instance manager).

`spawner` - `game instance` manager. Launches game instances upon request from the `backend`.

`game instance` - A dedicated instance where the game takes place.


![](./doc/assets/arch.png)
