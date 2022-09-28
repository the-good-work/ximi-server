# Access Tokens

When a node (doesn't matter if control, performer or output) tries to connect to the server, they need an access token. With the access token, the node can then perform their corresponding actions. A room name is required to create an access token as the token is always scoped to the room only.

## User flow

1. A `CONTROL` node creates room (names the room) and sends request to `ximi-server`. `ximi-server` now knows the room name to create, and can generate an access token scoped to this room.
2. Another `CONTROL` node or any `PERFORMER` node can then join the room. Because they are trying to join a particular room, they already know the room name. Therefore they can request for an access token with the room name. We will need an identifier for each of these nodes.

# Endpoints

## CONTROL

1. create room by entering room name
2. hit /createRoom with room name
3.
