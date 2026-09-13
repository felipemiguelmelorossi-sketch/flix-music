/*
========================================
FLIX MUSIC — CONFIGURAÇÃO DA API
========================================
*/

const FLIX_MUSIC_API = {

    // API ativada
    enabled: true,

    // Endpoint principal do catálogo
    endpoint: "/api/catalog",

    // Tempo máximo de espera
    timeout: 10000,

    // Quantidade máxima de músicas
    maxResults: 100,

    // Cache do catálogo
    cache: {

        enabled: true,

        // 5 minutos
        duration: 5 * 60 * 1000

    },

    // Configurações de busca
    search: {

        enabled: true,

        searchByTitle: true,

        searchByArtist: true,

        searchByGenre: true

    },

    // Configurações do player
    player: {

        enabled: true,

        autoplay: false,

        preload: "metadata",

        volume: 1

    },

    // Fallback
    // Caso a API fique indisponível,
    // o catálogo local será utilizado.

    fallback: {

        enabled: true,

        useLocalCatalog: true

    }

};
