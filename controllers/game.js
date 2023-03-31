const { StatusCodes } = require("http-status-codes");
const GameModel = require("../models/game");
const PlayerModel = require("../models/player");
const randomId = require("random-id");
const splitCards = require("../utility/script");
const socketIO = require("socket.io");

const io = socketIO(process.env.SOCKET_PORT, {
    cors: {
        origin: [process.env.CLIENT_SOCKET_URL],
    },
});
var socket_io;
io.on("connection", (socket) => {
    socket.on("joinRoom", (payload) => {
        console.log("room joined", payload.id);
        socket.join(payload?.id);
        ExportSocket = socket;
    });
    socket_io = socket;
});

const createGame = async (req, res) => {
    let { roomID } = req.body;
    if (!roomID) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide roomID" });
    }
    const game = await GameModel.findOne({ roomID });
    if (game) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "room id already exists." });
    }
    const ID = randomId(4, "0");
    // check for player id exists or not
    const player = await PlayerModel.create({
        ID,
        cards: splitCards.givenCards,
    });
    if (!player) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Error while creating Player" });
    }

    const newGame = await GameModel.create({
        roomID,
        player: [player.ID],
        openCard: splitCards.openCard,
        drawDeck: splitCards.drawDeck,
        turn: player.ID,
    });
    console.log(player.ID, player._doc.ID);
    return res.status(StatusCodes.CREATED).json({
        msg: "Pleayer created Successfully",
        givenCards: player.cards,
        drawDeck: splitCards.drawDeck,
        openCard: splitCards.openCard,
        roomID,
        ID: player.ID,
        turn: newGame.turn,
    });
};

const joinRoom = async (req, res) => {
    let { roomID } = req.body;
    if (!roomID) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide roomID" });
    }
    const ID = randomId(4, "0");
    // check for player id exists or not
    const game = await GameModel.findOne({ roomID });
    if (!game) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Room dosen't exist" });
    }
    if (game.player.length >= 4) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Game already has enough players" });
    }

    let cards = [...game.drawDeck];
    if (cards.length < 6) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "No cards in draw deck. Please join a new Game" });
    }
    let givenCards = cards.splice(0, 5);
    let player = await PlayerModel.create({ ID, cards: givenCards });
    game.player.push(player.ID);
    game.drawDeck = cards;
    await game.save();
    return res.status(StatusCodes.OK).json({
        msg: "Success fully added a player",
        givenCards: player._doc.cards,
        openCard: game.openCard,
        drawDeck: cards,
        ID,
        roomID,
        turn: game.turn,
    });
};

const drawCard = async (req, res) => {
    const { roomID, ID } = req.body;
    if (!roomID || !ID) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide the required data" });
    }
    const game = await GameModel.findOne({ roomID });
    if (!game) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Game not found. Please create a new one" });
    }
    let card = game.drawDeck.pop();
    // turn increment
    let ind = game.player.indexOf(game.turn);
    game.turn = game.player[(ind + 1) % game.player.length];
    await game.save();
    const player = await PlayerModel.findOne({ ID });
    if (!player) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Player not found." });
    }
    player.cards.push(card);
    await player.save();
    return res.status(StatusCodes.OK).json({
        msg: "Card drawn successfully",
    });
};

const discardCard = async (req, res) => {
    const { roomID, ID, card } = req.body;
    if (!roomID || !ID || !card) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide the required data" });
    }
    const game = await GameModel.findOne({ roomID });
    if (!game) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Game not found. Please create a new one" });
    }
    const player = await PlayerModel.findOne({ ID });
    if (!player) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Player not found." });
    }
    let prev = player.cards.length;
    player.cards = player.cards.filter((c) => {
        if (c.suit !== card.suit || c.value !== card.value) {
            return true;
        } else {
            return false;
        }
    });
    let curr = player.cards.length;
    if (prev === curr) {
        return res
            .status(StatusCodes.NOT_ACCEPTABLE)
            .json({ msg: "Card not fpund in Player " });
    }
    game.openCard = card;
    let ind = game.player.indexOf(game.turn);
    if (card.value === "A") {
        game.turn = game.player[(ind + 2) % game.player.length];
    } else if (card.value === "Q") {
        game.turn = game.player[(ind + 3) % game.player.length];
    } else if (card.value === "J") {
        game.turn = game.player[(ind + 5) % game.player.length];
    } else if (card.value === "K") {
        let len = game.player.length;
        game.turn = game.player[(ind + len - 1) % game.player.length];
    } else {
        game.turn = game.player[(ind + 1) % game.player.length];
    }
    await game.save();
    await player.save();
    // socket_io.to(roomID).emit("updateState", { event: "Draw", roomID, ID });
    return res.status(StatusCodes.OK).json({
        msg: "Card discarded succssfully",
    });
};

const updateState = async (req, res) => {
    const { roomID, ID } = req.body;
    if (!roomID || !ID) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide the required data" });
    }
    const game = await GameModel.findOne({ roomID });
    if (!game) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Game not found. Please create a new one" });
    }
    const player = await PlayerModel.findOne({ ID });
    if (!player) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ msg: "Player not found." });
    }
    return res.status(StatusCodes.OK).json({
        msg: "Successfully fetched data",
        givenCards: player.cards,
        openCard: game.openCard,
        drawDeck: game.drawDeck,
        ID,
        roomID,
        turn: game.turn,
    });
};

const closeGame = async (req, res) => {
    const { roomID, ID } = req.body;
    if (!roomID || !ID) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: "Please provide the required data" });
    }
    const player = await PlayerModel.findOneAndDelete({ ID });
    const game = await GameModel.findOneAndDelete({ roomID });
    return res
        .status(StatusCodes.OK)
        .json({ msg: "Game over, create a new room" });
};

module.exports = {
    createGame,
    joinRoom,
    drawCard,
    discardCard,
    updateState,
    closeGame,
};
