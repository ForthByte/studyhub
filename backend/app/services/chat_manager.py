import json
from uuid import UUID

from fastapi import WebSocket


class ConnectionManager:
    """
    manages active WebSocket connections for all chat channels.
    maintains a mapping of channel_id -> list of active WebSocket connections
    so messages can be broadcast to all users currently viewing a channel.
    """

    def __init__(self):
        # maps channel_id (str) to a list of active WebSocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel_id: str) -> None:
        """
        accept a new WebSocket connection and register it under the given channel.
        :param websocket: the incoming WebSocket connection.
        :param channel_id: the channel the user is connecting to.
        """
        await websocket.accept()

        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []

        self.active_connections[channel_id].append(websocket)

    def disconnect(self, websocket: WebSocket, channel_id: str) -> None:
        """
        remove a WebSocket connection from the channel's connection list.
        called when a user closes the tab, navigates away, or disconnects.
        :param websocket: the WebSocket connection to remove.
        :param channel_id: the channel the user was connected to.
        """
        if channel_id in self.active_connections:
            self.active_connections[channel_id].remove(websocket)

            # clean up the channel entry if no connections remain
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]

    async def broadcast(self, message: dict, channel_id: str) -> None:
        """
        broadcast a message to all active connections in a channel.
        silently skips any connections that fail to receive the message.
        :param message: the message payload to broadcast as JSON.
        :param channel_id: the channel to broadcast to.
        """
        if channel_id not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[channel_id]:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                # mark failed connections for cleanup
                disconnected.append(connection)

        # remove any connections that failed during broadcast
        for connection in disconnected:
            self.active_connections[channel_id].remove(connection)

    async def send_personal(self, message: dict, websocket: WebSocket) -> None:
        """
        send a message to a single WebSocket connection.
        used for sending confirmation or error messages back to the sender only.
        :param message: the message payload to send as JSON.
        :param websocket: the specific connection to send to.
        """
        await websocket.send_text(json.dumps(message))

    def get_connection_count(self, channel_id: str) -> int:
        """
        return the number of active connections in a channel.
        used for presence indicators showing how many users are online.
        :param channel_id: the channel to check.
        :return: number of active WebSocket connections.
        """
        return len(self.active_connections.get(channel_id, []))


# singleton instance — shared across the entire application lifetime.
# all routers import this instance to access the same connection pool.
manager = ConnectionManager()