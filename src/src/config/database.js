import mongoose from "mongoose";
import config from "./config.js";

async function ConnectDB() {
    await mongoose.connect(config.MONGO_URI)
    console.log("Connected successfully to DB")
}

export default ConnectDB
