const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {HttpsProxyAgent} = require('https-proxy-agent');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy settings
const proxyUrl = 'http://mflbldce:mvrkp30hptsm@206.41.172.74:6634';
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// Session Management Variables
const phpsessid = '6d7c50762e18a47842c047b9db64d87c'; // Your session ID
const tawkTime = '0'; // Your TawkConnectionTime
const amemberNr = '227c675a1035df1e97aa9575794af116'; // Your amember_nr

// Middleware to fetch the member page
app.get('/api/member', async (req, res) => {
    try {
        const response = await axios.get('https://noxtools.com/secure/member', {
            httpsAgent: proxyAgent,
            headers: {
                'Cookie': `PHPSESSID=${phpsessid}; TawkConnectionTime=${tawkTime}; amember_nr=${amemberNr}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);

        // Adjust links for CSS and JS files
        $('link').each(function () {
            const href = $(this).attr('href');
            if (href && !href.startsWith('http')) {
                $(this).attr('href', `https://noxtools.com${href}`);
            }
        });

        $('script').each(function () {
            const src = $(this).attr('src');
            if (src && !src.startsWith('http')) {
                $(this).attr('src', `https://noxtools.com${src}`);
            }
        });

        res.send($.html());
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
