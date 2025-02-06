const express = require('express');
const app = express();
const port = 3000;

app.get('/', () => {
    console.log('GET request');
});

app.listen(port, () => {
    console.log('App is running on port ' + port);
});

// app.listen(port, function () {})
