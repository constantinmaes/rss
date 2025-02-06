const axios = require('axios');
const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser();
const app = express();
const port = 3000;

// 1. Récupérer le fichier XML
// 2. Parser le fichier XML
// 3. Afficher les données

app.get('/', async (req, res) => {
    console.log('GET request', new Date());
    const xml = await axios.get(
        'https://rss.rtbf.be/article/rss/highlight_rtbf_info.xml?source=internal'
    );
    console.log('XML', xml.data);
    const parsed = parser.parse(xml.data);
    console.log('DONE', new Date());
    // res.send('Hello');
    res.status(200).json({
        rss: parsed,
    });
});

app.listen(port, () => {
    console.log('App is running on port ' + port);
});

// app.listen(port, function () {})
