import app from './src/app.js'
import ConnectDB from './src/config/database.js'

ConnectDB()
PORT = process.env.PORT
app.listen(3000, () => {
    console.log("App Listening On Port: 3000")
})
