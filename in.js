const express = require('express');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio'); // For parsing HTML

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fetch member page and serve it
app.get('/api/member', async (req, res) => {
    try {
        const phpsessid = '6d7c50762e18a47842c047b9db64d87c'; // Your session ID
        const tawkTime = '0'; // Your TawkConnectionTime
        const amemberNr = '227c675a1035df1e97aa9575794af116'; // Your amember_nr

        const response = await axios.get('https://noxtools.com/secure/member', {
            headers: {
                'Cookie': `PHPSESSID=${phpsessid}; TawkConnectionTime=${tawkTime}; amember_nr=${amemberNr}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);

        // Adjust links for CSS and JS files
        $('link').each(function() {
            const href = $(this).attr('href');
            if (href && !href.startsWith('http')) {
                $(this).attr('href', `https://noxtools.com${href}`);
            }
        });

        $('script').each(function() {
            const src = $(this).attr('src');
            if (src && !src.startsWith('http')) {
                $(this).attr('src', `https://noxtools.com${src}`);
            }
        });

        res.send($.html()); // Send the modified HTML to the client
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Logout endpoint remains the same
app.post('/api/logout', async (req, res) => {
    try {
        const phpsessid = '18cc8528bd139ee499953fb461dd0f22'; // Your session ID
        await axios.get('https://noxtools.com/secure/logout', {
            headers: {
                'Cookie': `PHPSESSID=${phpsessid}`,
            },
        });
        res.status(200).send('Logged out successfully');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send('Logout failed');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
