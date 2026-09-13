/*
========================================
FLIX MUSIC — CATÁLOGO
========================================

Este arquivo controla o catálogo de músicas.

Por enquanto usamos músicas de demonstração.
Depois podemos substituir a fonte por uma API
musical licenciada sem precisar refazer o site.

Formato esperado de cada música:

{
    id: "1",
    title: "Nome da música",
    artist: "Nome do artista",
    cover: "URL da capa",
    audioUrl: "URL do áudio",
    duration: 200,
    genre: "Pop"
}
*/

const FLIX_MUSIC_CATALOG = [

    {
        id: "flix-001",
        title: "Midnight Drive",
        artist: "Flix Sounds",
        cover: "",
        audioUrl: "",
        duration: 214,
        genre: "Electronic"
    },

    {
        id: "flix-002",
        title: "After Hours",
        artist: "Nova",
        cover: "",
        audioUrl: "",
        duration: 198,
        genre: "Pop"
    },

    {
        id: "flix-003",
        title: "Nightfall",
        artist: "Veyro",
        cover: "",
        audioUrl: "",
        duration: 221,
        genre: "Electronic"
    },

    {
        id: "flix-004",
        title: "Ocean Lights",
        artist: "Luma",
        cover: "",
        audioUrl: "",
        duration: 205,
        genre: "Chill"
    },

    {
        id: "flix-005",
        title: "Golden Hour",
        artist: "Milo",
        cover: "",
        audioUrl: "",
        duration: 190,
        genre: "Pop"
    },

    {
        id: "flix-006",
        title: "Echoes",
        artist: "Aria",
        cover: "",
        audioUrl: "",
        duration: 230,
        genre: "Alternative"
    },

    {
        id: "flix-007",
        title: "Green Lights",
        artist: "Kairo",
        cover: "",
        audioUrl: "",
        duration: 201,
        genre: "Electronic"
    },

    {
        id: "flix-008",
        title: "Red Sky",
        artist: "Riven",
        cover: "",
        audioUrl: "",
        duration: 215,
        genre: "Rock"
    },

    {
        id: "flix-009",
        title: "Pulse",
        artist: "Nero",
        cover: "",
        audioUrl: "",
        duration: 185,
        genre: "Electronic"
    },

    {
        id: "flix-010",
        title: "Parallel",
        artist: "Mira",
        cover: "",
        audioUrl: "",
        duration: 207,
        genre: "Pop"
    }

];


/*
========================================
CONFIGURAÇÃO DA API
========================================

Quando tivermos um fornecedor de catálogo
musical licenciado, podemos colocar aqui
o endereço do nosso backend.

IMPORTANTE:

Não coloque aqui uma API KEY secreta.

Chaves privadas devem ficar no servidor,
por exemplo em uma função /api do Vercel.
*/

const FLIX_MUSIC_API = {

    enabled: false,

    endpoint: "/api/catalog",

    timeout: 10000

};


/*
========================================
PEGAR CATÁLOGO LOCAL
========================================
*/

function getLocalCatalog(){

    return [...FLIX_MUSIC_CATALOG];

}


/*
========================================
BUSCAR CATÁLOGO DA API
========================================
*/

async function getCatalogFromAPI(){

    if(!FLIX_MUSIC_API.enabled){

        return getLocalCatalog();

    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            FLIX_MUSIC_API.timeout
        );

    try{

        const response =
            await fetch(
                FLIX_MUSIC_API.endpoint,
                {
                    method:"GET",
                    headers:{
                        "Accept":"application/json"
                    },
                    signal:controller.signal
                }
            );

        if(!response.ok){

            throw new Error(
                "Erro ao carregar catálogo."
            );

        }

        const data =
            await response.json();

        if(!Array.isArray(data)){

            throw new Error(
                "Formato de catálogo inválido."
            );

        }

        return normalizeCatalog(data);

    }catch(error){

        console.warn(
            "API indisponível. Usando catálogo local.",
            error
        );

        return getLocalCatalog();

    }finally{

        clearTimeout(timeout);

    }

}


/*
========================================
NORMALIZAR CATÁLOGO
========================================

Isso permite que o Flix Music receba
formatos diferentes de uma API e converta
tudo para o padrão do nosso site.
*/

function normalizeCatalog(data){

    return data.map((song,index) => {

        return {

            id:
                song.id ||
                `api-${index + 1}`,

            title:
                song.title ||
                song.name ||
                "Música sem título",

            artist:
                song.artist ||
                song.artistName ||
                "Artista desconhecido",

            cover:
                song.cover ||
                song.coverUrl ||
                song.image ||
                "",

            audioUrl:
                song.audioUrl ||
                song.audio ||
                song.streamUrl ||
                "",

            duration:
                Number(song.duration) || 0,

            genre:
                song.genre ||
                "Outros"

        };

    });

}


/*
========================================
BUSCAR MÚSICAS
========================================
*/

async function searchCatalog(query){

    const catalog =
        await getCatalogFromAPI();

    const text =
        String(query || "")
        .toLowerCase()
        .trim();

    if(!text){

        return catalog;

    }

    return catalog.filter(song => {

        const title =
            song.title.toLowerCase();

        const artist =
            song.artist.toLowerCase();

        const genre =
            song.genre.toLowerCase();

        return (
            title.includes(text) ||
            artist.includes(text) ||
            genre.includes(text)
        );

    });

}


/*
========================================
PEGAR MÚSICA PELO ID
========================================
*/

async function getSongById(id){

    const catalog =
        await getCatalogFromAPI();

    return catalog.find(
        song => song.id === id
    ) || null;

}


/*
========================================
PEGAR MÚSICAS POR GÊNERO
========================================
*/

async function getSongsByGenre(genre){

    const catalog =
        await getCatalogFromAPI();

    return catalog.filter(
        song =>
            song.genre.toLowerCase() ===
            genre.toLowerCase()
    );

}


/*
========================================
PEGAR ARTISTAS
========================================
*/

async function getArtists(){

    const catalog =
        await getCatalogFromAPI();

    const artists = [];

    catalog.forEach(song => {

        if(!artists.includes(song.artist)){

            artists.push(song.artist);

        }

    });

    return artists;

}


/*
========================================
EXPORTAÇÃO
========================================

Permite usar o catálogo em outros arquivos
quando o projeto crescer.
*/

window.FlixMusicCatalog = {

    getAll:
        getCatalogFromAPI,

    search:
        searchCatalog,

    getById:
        getSongById,

    getByGenre:
        getSongsByGenre,

    getArtists:
        getArtists

};
