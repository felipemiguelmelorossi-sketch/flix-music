/*
========================================
FLIX MUSIC — CATÁLOGO
========================================
*/

const FLIX_MUSIC_API = {
    enabled: true,
    endpoint: "/api/catalog",
    timeout: 20000
};


/*
========================================
CACHE
========================================
*/

let flixMusicCatalogCache = null;


/*
========================================
CATÁLOGO LOCAL DE EMERGÊNCIA
========================================
*/

const FLIX_MUSIC_CATALOG = [];


/*
========================================
CATÁLOGO LOCAL
========================================
*/

function getLocalCatalog() {
    return [...FLIX_MUSIC_CATALOG];
}


/*
========================================
NORMALIZAR MÚSICA
========================================
*/

function normalizeSong(song, index) {

    return {
        id:
            song.id ||
            `song-${index + 1}`,

        title:
            String(
                song.title ||
                song.name ||
                "Música sem título"
            ),

        artist:
            String(
                song.artist ||
                song.artistName ||
                song.artist_name ||
                "Artista desconhecido"
            ),

        cover:
            song.cover ||
            song.coverUrl ||
            song.image ||
            song.album_image ||
            "",

        audioUrl:
            song.audioUrl ||
            song.audio ||
            song.streamUrl ||
            "",

        duration:
            Number(song.duration) || 0,

        genre:
            String(
                song.genre ||
                "Outros"
            ),

        license:
            song.license ||
            song.license_ccurl ||
            "",

        audioDownloadAllowed:
            Boolean(
                song.audioDownloadAllowed ??
                song.audiodownload_allowed
            )
    };
}


/*
========================================
NORMALIZAR CATÁLOGO
========================================
*/

function normalizeCatalog(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map(normalizeSong)
        .filter(song => {
            return (
                song.audioUrl &&
                song.title
            );
        });
}


/*
========================================
BUSCAR CATÁLOGO DA API
========================================
*/

async function getCatalogFromAPI(
    refresh = false
) {

    if (
        flixMusicCatalogCache &&
        !refresh
    ) {
        return flixMusicCatalogCache;
    }

    if (!FLIX_MUSIC_API.enabled) {

        flixMusicCatalogCache =
            getLocalCatalog();

        return flixMusicCatalogCache;
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            FLIX_MUSIC_API.timeout
        );

    try {

        const response =
            await fetch(
                `${FLIX_MUSIC_API.endpoint}?limit=600`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    signal:
                        controller.signal,

                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `API HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        /*
         * O /api/catalog retorna:
         *
         * {
         *   success: true,
         *   catalog: [...]
         * }
         */

        let songs = [];

        if (
            data &&
            Array.isArray(data.catalog)
        ) {

            songs =
                normalizeCatalog(
                    data.catalog
                );

        } else if (
            Array.isArray(data)
        ) {

            songs =
                normalizeCatalog(data);

        } else {

            throw new Error(
                "Formato de catálogo inválido."
            );
        }

        /*
         * Se a API respondeu sem músicas,
         * não substituímos por músicas falsas.
         */

        if (songs.length === 0) {

            console.warn(
                "A API respondeu, mas não encontrou músicas."
            );

            flixMusicCatalogCache = [];

            return [];
        }

        flixMusicCatalogCache =
            songs;

        console.log(
            `FLIX MUSIC: ${songs.length} músicas carregadas.`
        );

        return songs;

    } catch (error) {

        console.error(
            "Erro ao carregar catálogo:",
            error
        );

        /*
         * Se já temos cache, mantém o cache.
         */

        if (flixMusicCatalogCache) {
            return flixMusicCatalogCache;
        }

        return getLocalCatalog();

    } finally {

        clearTimeout(timeout);

    }
}


/*
========================================
GET ALL
========================================
*/

async function getAll(
    refresh = false
) {

    return getCatalogFromAPI(
        refresh
    );
}


/*
========================================
PESQUISA
========================================
*/

async function searchCatalog(query) {

    const catalog =
        await getCatalogFromAPI();

    const text =
        String(query || "")
            .toLowerCase()
            .trim();

    if (!text) {
        return catalog;
    }

    return catalog.filter(song => {

        const title =
            song.title
                .toLowerCase();

        const artist =
            song.artist
                .toLowerCase();

        const genre =
            song.genre
                .toLowerCase();

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

async function getSongById(id) {

    const catalog =
        await getCatalogFromAPI();

    return (
        catalog.find(
            song =>
                String(song.id) ===
                String(id)
        ) || null
    );
}


/*
========================================
PEGAR MÚSICAS POR GÊNERO
========================================
*/

async function getSongsByGenre(
    genre
) {

    const catalog =
        await getCatalogFromAPI();

    const text =
        String(genre || "")
            .toLowerCase()
            .trim();

    return catalog.filter(song =>
        song.genre
            .toLowerCase()
            .includes(text)
    );
}


/*
========================================
PEGAR ARTISTAS
========================================
*/

async function getArtists() {

    const catalog =
        await getCatalogFromAPI();

    const artistMap =
        new Map();

    catalog.forEach(song => {

        if (!song.artist) {
            return;
        }

        if (
            !artistMap.has(
                song.artist
            )
        ) {

            artistMap.set(
                song.artist,
                {
                    name:
                        song.artist,

                    cover:
                        song.cover ||
                        "",

                    songs: []
                }
            );
        }

        artistMap
            .get(song.artist)
            .songs
            .push(song);
    });

    return Array.from(
        artistMap.values()
    );
}


/*
========================================
RECOMENDADAS
========================================
*/

async function getRecommended() {

    const catalog =
        await getCatalogFromAPI();

    return catalog.slice(
        0,
        Math.min(
            12,
            catalog.length
        )
    );
}


/*
========================================
MAIS OUVIDAS
========================================
*/

async function getMostPlayed() {

    const catalog =
        await getCatalogFromAPI();

    /*
     * Como o Jamendo não fornece
     * a quantidade de plays que
     * queremos usar no site,
     * usamos uma seleção diferente
     * do catálogo.
     */

    return catalog.slice(
        12,
        Math.min(
            24,
            catalog.length
        )
    );
}


/*
========================================
ATUALIZAR CACHE
========================================
*/

async function refreshCatalog() {

    flixMusicCatalogCache =
        null;

    return getCatalogFromAPI(
        true
    );
}


/*
========================================
EXPORTAÇÃO
========================================
*/

window.FlixMusicCatalog = {

    getAll,

    refresh:
        refreshCatalog,

    search:
        searchCatalog,

    getById:
        getSongById,

    getByGenre:
        getSongsByGenre,

    getArtists,

    getRecommended,

    getMostPlayed
};


/*
========================================
DEBUG
========================================
*/

console.log(
    "Flix Music Catalog carregado."
);
