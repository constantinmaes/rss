const axios = require('axios');
const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const cron = require('node-cron');
const { decode } = require('html-entities');

const mysql = require('mysql2/promise');
let connection;
const parser = new XMLParser();
const app = express();
const port = 3000;

// Utiliser pug
app.set('view engine', 'pug');

// 1. Récupérer le fichier XML
// 2. Parser le fichier XML
// 3. Afficher les données

async function routine() {
    const [data, fields] = await connection.execute('SELECT * FROM rss.flux');

    for (const element of data) {
        const xml = await axios.get(element.link);
        //res.send(xml.data);
        const parsed = parser.parse(xml.data);
        const title = parsed.rss.channel.title;
        const pubDate = parsed.rss.channel.pubDate;
        const articles = parsed.rss.channel.item;
        console.log('DONE', element.link, new Date());
        console.log(title, pubDate, articles.length);
        await saveArticles(articles, element.id);
    }
}

async function saveArticles(articles, fluxId) {
    for (const article of articles) {
        try {
            const [rows, fields] = await connection.execute(
                'SELECT * FROM rss.articles WHERE link = ?',
                [article.link]
            );
            if (rows.length > 0) {
                console.log('Article already exists');
                continue;
            }
            const correctDate = Date.parse(article.pubDate);
            const mysqlDate = new Date(correctDate)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            //console.log(new Date(correctDate).toISOString(), mysqlDate);
            await connection.execute(
                'INSERT INTO rss.articles (title , pubDate, link, flux_id) VALUES(?, ?, ?, ?)',
                [article.title, mysqlDate, article.link, fluxId]
            );
        } catch (e) {
            console.error('Error while inserting article', e);
            // break;
            continue;
        }
    }
}

app.get('/', async (req, res) => {
    console.log('GET request', new Date());
    const [articles, fields] = await connection.execute(
        'SELECT * FROM rss.articles ORDER BY pubDate DESC LIMIT 50'
    );
    res.render('index', { title: '', pubDate: '', articles });
});

app.get('/flux', async (req, res) => {
    const [flux, fields] = await connection.execute('SELECT * FROM rss.flux');
    // res.render('flux', { flux });
});

// /flux/:id
app.get('/flux/:id', async (req, res) => {
    const fluxId = req.params.id;
    const [articles, fields] = await connection.execute(
        'SELECT * FROM rss.articles WHERE flux_id = ? ORDER BY pubDate DESC LIMIT 50',
        [fluxId]
    );
    res.render('index', { title: '', pubDate: '', articles });
});

app.delete('/flux/:id', async (req, res) => {
    const fluxId = req.params.id;
    await connection.execute('DELETE FROM rss.articles WHERE flux_id = ?', [
        fluxId,
    ]);
    //res.send('OK');
});

app.listen(port, async () => {
    console.log('App is running on port ' + port);
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
    });
    await connection.execute('SELECT 1');
});

// node-cron

cron.schedule('*/10 * * * * *', () => {
    console.log('Cron job', new Date());
    routine();
});

// app.listen(port, function () {})
