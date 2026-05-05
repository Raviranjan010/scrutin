require('dotenv').config()
const app = require('./src/app')



app.listen(3000, () => {
    console.log('sever is running on : http://localhost:3000/')
})