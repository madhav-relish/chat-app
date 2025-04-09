import EventEmitter from "events";

// Set max listeners to avoid memory leak warnings
const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export const eventEmitter = emitter;

// Add debug logging for event emission
const originalEmit = eventEmitter.emit;
eventEmitter.emit = function(event, ...args) {
    console.log(`Event emitted: ${event}`, args[0]);
    return originalEmit.apply(this, [event, ...args]);
};

export const Events = {
    SEND_MESSAGE: "SEND_MESSAGE",
    TYPING_START: "TYPING_START",
    TYPING_STOP: "TYPING_STOP"
}