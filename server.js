const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Putanje
const publicFolder = path.join(__dirname, 'public');
const imagesFolder = path.join(publicFolder, 'images');
const dataFolder = path.join(publicFolder, 'data'); // Dodano za CSV!

// Postavljanje EJS enginea za galeriju
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Posluži sve statičke datoteke (HTML, CSS, JS, slike)
app.use(express.static(publicFolder));

// Poseban endpoint za dohvat CSV-a ili JSON-a (data folder)
app.use('/data', express.static(dataFolder));

// Rukovanje GET zahtjevom za galeriju
app.get('/galerija', (req, res) => {
    fs.readdir(imagesFolder, (err, files) => {
        if (err) {
            console.error('Greška kod čitanja mape slika:', err);
            return res.status(500).send('Greška pri učitavanju galerije');
        }

        const thumbnails = files.filter(file => /_thumb\.jpg$/.test(file));

        const images = thumbnails.map(thumb => {
            const large = thumb.replace('_thumb', '_large');
            if (files.includes(large)) {
                return {
                    thumbnail: `/images/${thumb}`,
                    url: `/images/${large}`,
                    title: thumb.replace('_thumb.jpg', '')
                };
            }
        }).filter(image => image);

        res.render('galerija', { images });
    });
});

// Pokretanje servera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
