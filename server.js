import app from './src/app.js'
import ConnectDB from './src/config/database.js'
import config from './src/config/config.js'
const PORT = config.PORT
ConnectDB()

app.listen(PORT, () => {
    console.log("App listenning on Port: ", PORT)
})

