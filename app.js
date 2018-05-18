const express = require('express')
const app = express()

app.use(express.static('public'))

app.listen(3100, () => console.log('Example app listening on port 3100!'))
