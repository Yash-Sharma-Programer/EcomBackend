import app from './app.js'
import ConnectDB from './src/config/database.js'
import config from './src/config/config.js'

const PORT = config.PORT

// Connect to MongoDB once; Vercel reuses the warm function instance between
// invocations, so this only really runs cold-start to cold-start.
ConnectDB().catch(err => console.error("DB connection error:", err.message))

// Only call app.listen() when running locally / on a traditional Node host.
// On Vercel, @vercel/node imports this file and calls the exported app
// directly as a request handler — it does NOT run app.listen(), so doing so
// here would be harmless but exporting `app` is what actually matters.
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log("App listening on Port:", PORT)
    })
}

export default app

