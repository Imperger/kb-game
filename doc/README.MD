
# Typing game

# Summary

This software is a multiplayer typing game. It consists of several components: an authorization server, a game instance management server, and a global/regional chat server. Possible to run any number of any component, that way implements horizontal scaling.

# Projects

`frontend` - client for `backend`

`backend` - authorization server. This component can request game instances from a `spawner` (game instance manager). Allows new users to register, log in already registered, stores all information about users.

`spawner` - `game instance`s manager. Launches game instances upon request from the authorization server.

`game instance` - A dedicated game server to which players connect to.

# Development environment

Each project runs in its own dev container. Some containers should be accessible to others so they configured to use `dev` network. To create a network `docker network create dev`
# Terms

# Authorization server (`backend`)

## Spawner choice strategy



# The relationship between `backend` and `spawner`

## Adding spawner

A freshly launched authorization server needs some initial setup. First of all, you need to add at least one spawner, it is the spawner that serves the game instances. To add a spawner, you should know its hostname and secret.

So, when trying to add a spawner, the authorization server tries to make a request **GET** `spawner_host/info`. And if the request was successful, then the spawner is added to the list of known spawners.

## Requesting game instance

When there are enough players for the game or the player tries to create a custom game, the authorization server makes a request **POST** `spawner_host/game/new_{quick|custom}` to create a game instance.

>Authorization server can use any of known spawners, spawner choosing strategy covered [here](#spawner-choice-strategy).

# Protocol between `client` and `game instance`

Immediately when connection has been established, the client must send a signed JWT, which he had been obtained from the `backend`.

```
// C->S
{
    instanceId: string,
    playerId: string,
    nickname: string,
    exp: number
    // Possible more info for avoiding additional request from instance to backend
}
```

Immediately after, the server will send uint8 with following meaning 

>0 - player not verified and the server has terminated the connection; 1 - custom game; 2 - quick game;

```js
// S->C
uint8
``` 

## Lobby protocol

If the server returned 1 in the previous step, the client enters the lobby state.

First the client gets the state of the lobby by calling rpc `lobby_state`.

```js
// Lobby state
{
    players: [ 
        { 
            id: string;
            nickname: string;
            slot: number;
        }
    ]
}
```

# One user - one game instance

At the user authorization phase, the game instance sends a request to assign the user to itself. If the user has no links to other instances, he is assigned to the current one. If the user is already associated with another instance, that instance disconnects the user.

When a user requests a game instance, `backend` first check if he already has link, if so request rejected. Else the backend mark his with reference to the game instance and next requests will be rejected while the reference exists. Game instance on finalization phase send an intention request to `backend` about that. Then all who were assotiated with this instance again may request a game instance, or connects to some else.

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
// NewCustomGame
}
    ownerId: string, // player id that has moderator access
    backendApi: string // for uploading game results
}
```

## Response

```
{
    instanceId: string;
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
// NewQuickGameToken
}
    ownerId: string, // player id that has moderator access
    backendApi: string // for uploading game results
    type: string, // 'FFA' or 'Teams'
    text: string // text content ??
}
```

## Response

```
{
    instanceId: string;
    instanceUrl: string;
}
```

**WS** `/game/{request}`

Connects player to the dedicated game instance. Used by `frontend`. The *request* part is a same field from body of **POST** `/game/new_{quick|custom}`



# User model

## Rights

**access manager** - Add & remove rights for users.

**server maintainer** - Can change server settings

**scenario maker** - Add & edit texts.

**chat moderator** - Hide messages from other users. Mute users.

## Flags

**muted** (type: Date) - Possibility to send messages in general and game chat

**blocked** (type: Date) - Possibility to play game (create & join)
