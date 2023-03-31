const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
    suit: {
        type: String,
        enum: ["♠️", "♣️", "❤", "♦️"],
        required: [true, "Please enter a suit"],
    },
    value: {
        type: String,
        enum: [
            "A",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
        ],
        required: [true, "Please enter a value"],
    },
});
const GameSchema = new mongoose.Schema({
    roomID: {
        type: String,
        required: [true, "Please enter a room Id"],
        match: /^\d{4}$/,
    },
    player: {
        type: Array,
    },
    openCard: {
        suit: {
            type: String,
            enum: ["♠️", "♣️", "❤", "♦️"],
            required: [true, "Please enter a suit"],
        },
        value: {
            type: String,
            enum: [
                "A",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "J",
                "Q",
                "K",
            ],
            required: [true, "Please enter a value"],
        },
    },
    turn: {
        type: Number,
        default: 0,
    },
    drawDeck: [CardSchema],
});

const model = mongoose.model("Game", GameSchema);
module.exports = model;
