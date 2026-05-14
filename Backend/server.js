require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 3000
// here the port running in server 3000

app.listen(PORT, () => {
    console.log(`server is running on: http://localhost:${PORT}/`)
})
