import app from './src/app.js'
import ConnectDB from './src/config/database.js'

const PORT = process.env.PORT
ConnectDB()

app.listen(PORT, () => {
    console.log("App listenning on Port: ", PORT)
})

