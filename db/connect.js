const mongoose = require("mongoose");

const connectDB = async (url) => {
    return await mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("Database connected"))
        .catch((err) =>
            console.log(err.message || "Database connection error ")
        );
};

module.exports = connectDB(process.env.DATABASE_URL);
