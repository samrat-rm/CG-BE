const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    ID: {
        type: Number,
        match: /^\d{4}$/,
    },
    cards: {
        type: Array,
    },
});

const model = mongoose.model("player", PlayerSchema);
module.exports = model;
