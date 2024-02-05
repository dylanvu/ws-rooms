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

        // attach listeners
        socket.on("close", () => {
            // when leaving, quit the manager
            this.remove(newSocket);
        })

        // return the socket object
        return newSocket;
    }

    /**
     * remove socket from jurisdiction 
     * @param socket 
     */
    remove(socket: WSRMSocket) {
        // TODO: quit all rooms, then remove ID from server client list
        // quit all rooms
        this.kickSocketFromRoom(socket)
        // remove the ID from the server list
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
        // TODO: figure out what room this client lives in, and removes it.
        // TODO: scale this up to where a socket can be in multiple rooms?
    }

    /**
     * emit to all clients in a room
     * @param roomId room id to emit to
     * @param data what string data to send to every client
     * @param socket optional. If this is defined, this socket will not receive the message
     */
    emitToRoom(roomId: string, data: string, socket?: WSRMSocket) {

    }

    // TODO: broadcast only to a specific user ID

    // TODO: get all room ids

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