const {
    createGame,
    joinRoom,
    drawCard,
    discardCard,
    updateState,
    closeGame,
} = require("../controllers/game");
const router = require("express").Router();

router
    .post("/create", createGame)
    .post("/join", joinRoom)
    .post("/draw", drawCard)
    .post("/update", updateState)
    .post("/discard", discardCard)
    .get("/close", closeGame);

module.exports = router;
