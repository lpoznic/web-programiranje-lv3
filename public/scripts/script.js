// Globalne varijable
let sviFilmovi = [];
let kosarica = [];

// Dohvati i parsiraj filmove
fetch('/data/filmovi.csv')
    .then(res => res.text())
    .then(csv => {
        const rezultat = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
        });

        sviFilmovi = rezultat.data.map(film => ({
            id: Number(film.ID),
            title: film.Naslov,
            year: Number(film.Godina),
            genre: film.Žanr,
            duration: Number(film.Trajanje),
            country: film.Država,
            rating: parseFloat(film.Ocjena)
        }));

        prikaziFilmove(sviFilmovi);
    })
    .catch(err => {
        console.error('Greška pri dohvatu filmova:', err);
    });

// Prikaz filmova u tablici
function prikaziFilmove(filmovi) {
    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = '';

    if (filmovi.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nema filmova za prikaz.</td></tr>';
        return;
    }

    for (const film of filmovi) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.title}</td>
            <td>${film.year}</td>
            <td>${film.genre}</td>
            <td>${film.duration} min</td>
            <td>${film.country}</td>
            <td>${film.rating.toFixed(1)}</td>
            <td><button class="dodaj-u-kosaricu" data-id="${film.id}">Dodaj</button></td>
        `;
        tbody.appendChild(row);
    }

    // Dodaj event listener za sve "Dodaj" gumbe
    document.querySelectorAll('.dodaj-u-kosaricu').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            const film = sviFilmovi.find(f => f.id === id);
            dodajUKosaricu(film);
        });
    });
}

// Filtriranje filmova
document.getElementById('primijeni-filtere').addEventListener('click', () => {
    const zanr = document.getElementById('filter-genre').value.trim();
    const godinaOd = parseInt(document.getElementById('filter-year').value) || 0;
    const drzava = document.getElementById('filter-country').value.trim();
    const minOcjena = parseFloat(document.getElementById('filter-rating').value);

    const filtrirani = sviFilmovi.filter(film => {
        const zanrOk = !zanr || film.genre.includes(zanr);
        const godinaOk = !godinaOd || film.year >= godinaOd;
        const drzavaOk = !drzava || film.country.includes(drzava);
        const ocjenaOk = film.rating >= minOcjena;
        return zanrOk && godinaOk && drzavaOk && ocjenaOk;
    });

    prikaziFilmove(filtrirani);
});

// Dinamičko ažuriranje prikaza slidera ocjene
document.getElementById('filter-rating').addEventListener('input', () => {
    document.getElementById('rating-value').textContent = document.getElementById('filter-rating').value;
});

// Dodavanje filma u košaricu
function dodajUKosaricu(film) {
    if (!kosarica.find(f => f.id === film.id)) {
        kosarica.push(film);
        osvjeziKosaricu();
    } else {
        alert('Film je već u košarici!');
    }
}

// Osvježi prikaz košarice
function osvjeziKosaricu() {
    const lista = document.getElementById('lista-kosarice');
    lista.innerHTML = '';

    kosarica.forEach((film, index) => {
        const li = document.createElement('li');
        li.textContent = `${film.title} (${film.year}) - ${film.genre}`;

        const btnUkloni = document.createElement('button');
        btnUkloni.textContent = 'Ukloni';
        btnUkloni.addEventListener('click', () => {
            kosarica.splice(index, 1);
            osvjeziKosaricu();
        });

        li.appendChild(btnUkloni);
        lista.appendChild(li);
    });
}

// Potvrdi košaricu
document.getElementById('potvrdi-kosaricu').addEventListener('click', () => {
    if (kosarica.length === 0) {
        alert('Košarica je prazna!');
    } else {
        alert(`Uspješno ste odabrali ${kosarica.length} filmova za gledanje!`);
        kosarica = [];
        osvjeziKosaricu();
    }
});
