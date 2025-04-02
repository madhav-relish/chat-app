import EventEmitter from "events";


export const eventEmitter = new EventEmitter();

export const Events = {
    SEND_MESSAGE: "SEND_MESSAGE",
    TYPING_START: "TYPING_START",
    TYPING_STOP: "TYPING_STOP"
}