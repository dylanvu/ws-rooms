import { WebSocket } from 'ws';
import crypto from "crypto";

type Room = WSRMSocket[];

export class WSRoomManager {

    // attributes

    /**
     * All sockets in total, managed by the manager
     */
    server: Room = [];
    /**
     * specific rooms that the manager has knowledge of
     */
    rooms: Record<string, Room> = {};


    // methods
    /**
     * assigns a random UUID
     * @returns uuid
     */
    static assignId(): string {
        return crypto.randomUUID();
    }

    /**
     * join the socket room manager
     * @param socket websocket object to be managed
     * @returns 
     */
    add(socket: WebSocket): WSRMSocket {
        // create the socket object
        let newSocket = new WSRMSocket(socket);
        // join the list of everything
        this.server.push(newSocket);

        // return the socket object
        return newSocket;
    }

    /**
     * remove socket from manager
     * remember to call this on socket close events, else there will be a memory leak/issues!
     * @param socket 
     */
    remove(socket: WSRMSocket) {
        // quit all rooms
        this.kickSocketFromRoom(socket)
        // remove the object from the server list
        this.server.splice(this.server.findIndex(item => item.id === socket.id), 1);
    }

    /**
     * broadcast to all sockets in the manager
     * @param {string} data string to broadcast to all sockets in the manager
     */
    broadcast(data: string) {
        for (const client of this.server) {
            client.ws.send(data);
        }
    }


    /**
     * add a socket to a room. If the room does not exist, it gets created
     * @param socket socket object to add
     * @param roomId room id to join or to create
     */
    addSocketToRoom(socket: WSRMSocket, roomId: string) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].push(socket);
        } else {
            this.rooms[roomId] = [socket];
        }
    }

    /**
     * leave the socket's current room
     * @param socket socket object to leave the room
     */
    kickSocketFromRoom(socket: WSRMSocket) {
        // figure out what room this client lives in, and removes it
        for (const [_, room] of Object.entries(this.rooms)) {
            if (room.some(socketInRoom => socketInRoom.id === socket.id)) {
                // remove it
                room.splice(room.findIndex(item => item.id === socket.id), 1);
            }
        }
    }

    /**
     * emit to all clients in a room
     * @param roomId room id to emit to
     * @param data what string data to send to every client
     * @param socket optional. If this is defined, this socket will not receive the message
     */
    emitToRoom(roomId: string, data: string, socket?: WSRMSocket) {
        // get the room
        const room = this.rooms[roomId];
        if (room) {
            for (const client of room) {
                if (socket && client.id === socket.id) {
                    client.ws.send(data);
                } else {
                    client.ws.send(data);
                }
            }
        } else {
            // do nothing
            console.error(`${roomId} does not exist!`);
        }

    }

    // TODO: broadcast only to a specific user ID

    // TODO: return all rooms

    // TODO: list all client ids in a specified rooms
}

/**
 * ws wrapper kind of, with an ID and the ws object
 */
export class WSRMSocket {
    constructor(nws: WebSocket, nid?: string,) {
        this.ws = nws;
        this.id = nid ?? WSRoomManager.assignId();
    }

    /**
     * The UUID of the socket
     */
    public id: string;

    /**
     * the websocket object of the object. Is literally the ws package socket.
     */
    public ws: WebSocket;
}