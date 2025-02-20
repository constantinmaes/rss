const axios = require('axios');
const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const cron = require('node-cron');

const parser = new XMLParser();
const app = express();
const port = 3000;

// Utiliser pug
app.set('view engine', 'pug');

// 1. Récupérer le fichier XML
// 2. Parser le fichier XML
// 3. Afficher les données

async function routine() {
    const xml = await axios.get(
        'https://rss.rtbf.be/article/rss/highlight_rtbf_info.xml?source=internal'
    );
    const parsed = parser.parse(xml.data);
    const title = parsed.rss.channel.title;
    const pubDate = parsed.rss.channel.pubDate;
    const articles = parsed.rss.channel.item;
    console.log('DONE', new Date());
    console.log(title, pubDate, articles.length);
}

app.get('/', async (req, res) => {
    console.log('GET request', new Date());

    // res.send('Hello');
    /*res.status(200).json({
        title,
        pubDate,
        articles,
    });*/
    res.render('index', { title, pubDate, articles });
});

app.listen(port, () => {
    console.log('App is running on port ' + port);
});

// node-cron

cron.schedule('*/10 * * * * *', () => {
    console.log('Cron job', new Date());
    routine();
});

// app.listen(port, function () {})
