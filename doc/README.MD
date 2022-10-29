
# Typing game

# Summary

This software is a multiplayer typing game. It consists of several components: an authorization server, a game instance management server, and a global/regional chat server. Possible to run any number of any component, that way implements horizontal scaling.

# Projects

`frontend` - client for `backend`

`backend` - responsible for authorization, managing text's scenarios, matchmaking.

`spawner` - `game instance`s manager. Launches game instances upon request from the authorization server.

`game instance` - a dedicated game server to which players connect to.

# Development environment

Each project runs in its own dev container. Some containers should be accessible to others so they configured to use `dev` network. To create a network `docker network create dev`
# Terms

# Authorization server (`backend`)

## Spawner choice strategy



# The relationship between `backend` and `spawner`

## Adding spawner

A freshly launched authorization server needs some initial setup. First of all, it required at least one spawner for properly functionating, it is the spawner that serves the game instances. To add a spawner, you should know its hostname and secret.

So, when trying to add a spawner, the authorization server tries to make a request **GET** `spawner_host/info`. And if the request was successful, then the spawner is added to the list of known spawners.

## Requesting game instance

When there are enough players for the game or the player tries to create a custom game, the authorization server makes a request **POST** `spawner_host/game/new_{quick|custom}` to create a game instance.

>Authorization server can use any of known spawners, spawner choosing strategy covered [here](#spawner-choice-strategy).

# Protocol between `client` and `game instance`
Socket.IO is used for communication. Immediately when connection has been established, the client must emit `auth` event with a signed JWT so called `player token`, which he had been obtained from the `backend`.

```
// C->S
{
    instanceId: string;
    playerId: string;
    nickname: string;
    iat: number;
    exp: number;
}
```

> If the server does not receive the `player token` within a certain period of time, the server will terminate the connection.

Next, the server will respond with a number with the following meaning:

0 - a player not verified and the server has terminated the connection\
1 - custom game\
2 - quick game

```js
// S->C
0 | 1 | 2
``` 

## Lobby protocol

If the server returned 1 in the previous step, the client enters the lobby state.

First, the client gets the state of the lobby by emitting `lobby_state` event.

```js
{
    ownerId: string;
    players: LobbyPlayer[];
    scenarios: Scenario[];
}
```

# Team building algorithm in a quick game

The main rule - seeks to assemble a team with the smallest elo spread. Better is form small team but with tight elo.

# One player - one game instance
## Connecting to an already created instance

At a player authorization phase, the game instance sends a request to assign the player to itself. If the player has no links to other instances, he is assigned to the current one. If the player is already associated with another instance, that instance disconnects the player.

## Requesting a new instance

When a player requests a game instance, `backend` first check if he already has link, if so request rejected. Else the backend mark his with reference to the game instance and next requests will be rejected while the reference exists. Game instance on finalization phase send an intention request to `backend` about that. Then all who were assotiated with this instance again may request a game instance, or connects to some else.

# Spawner api

**GET** `/info`

Get information about spawner. This endpoint is used by the `backend` for validation purposes.

## Request

### Headers
```
Authorization: Bearer <BackendToken>
```

## Response

If JWT signed by correct secret then status code set to 200, otherwise 401

### Body
```
{
    name: string,
    capacity: number, // Maximum game instances
}
```

**POST** `/game/new_custom`

Request a custom game instance from the spawner. Used by `backend`

## Request

### Headers
```
Authorization: Bearer <NewCustomGameToken>
```

```
}
    ownerId: string, // the player who can tune the game settings
    backendApi: string // for uploading game results
}
```

## Response

```
{
  instanceUrl: string;
}
```

**POST** `/game/new_quick`

Request an quick game instance from the spawner. Used by `backend`

## Request

### Headers
```
Authorization: Bearer <NewQuickGameToken>
```

```
{
    players: string[];
    scenarioId: string;
    backendApi: string;
}
```

## Response

```
{
    instanceUrl: string; // spawner.host/{instanceId}
}
```

**WS** `spawner.host/instanceId`

Connects player to the dedicated game instance. Used by `frontend`.



# User model

## Rights

**assign scope** - Add & remove rights for users.

**server maintainer** - Can change server settings

**edit scenario** - Add & edit texts.

**chat moderator** - Hide messages from other users. Mute users.

## Flags

**muted** (type: Date) - Possibility to send messages in general and game chat

**blocked** (type: Date) - Possibility to play game (create & join)
