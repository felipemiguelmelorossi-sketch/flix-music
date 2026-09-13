export default async function handler(req, res) {
    try {
        // Permitir apenas GET
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Método não permitido."
            });
        }

        // Client ID do Jamendo
        const clientId = process.env.JAMENDO_CLIENT_ID;

        // Pesquisa enviada pela URL
        const query = String(req.query?.q || "").trim();

        // Quantidade de músicas
        const limit = Math.min(
            Number(req.query?.limit) || 20,
            100
        );

        /*
         * Se a variável do Jamendo não estiver configurada,
         * usamos o catálogo local.
         */
        if (!clientId) {
            return res.status(200).json({
                success: true,
                source: "local",
                message: "JAMENDO_CLIENT_ID ainda não configurado.",
                catalog: getLocalCatalog()
            });
        }

        // Parâmetros da API do Jamendo
        const params = new URLSearchParams({
            client_id: clientId,
            format: "json",
            limit: String(limit),
            include: "musicinfo",
            order: "relevance"
        });

        // Pesquisa por música, artista ou termo
        if (query) {
            params.set("search", query);
        }

        // URL da API
        const url =
            `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`;

        // Buscar músicas
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Jamendo HTTP ${response.status}`
            );
        }

        const data = await response.json();

        // Validar resposta
        if (
            !data ||
            !Array.isArray(data.results)
        ) {
            throw new Error(
                "Resposta inválida da API musical."
            );
        }

        // Transformar músicas do Jamendo
        const catalog = data.results.map(track => ({
            id:
                `jamendo-${track.id}`,

            title:
                track.name ||
                "Música sem título",

            artist:
                track.artist_name ||
                "Artista desconhecido",

            cover:
                track.image ||
                track.album_image ||
                "",

            /*
             * URL real de reprodução da música
             */
            audioUrl:
                track.audio ||
                "",

            duration:
                Number(track.duration) || 0,

            genre:
                getGenre(track),

            /*
             * Informações de licença
             */
            license:
                track.license_ccurl ||
                "",

            /*
             * Indica se o download é permitido
             */
            audioDownloadAllowed:
                Boolean(
                    track.audiodownload_allowed
                )
        }));

        // Resposta final
        return res.status(200).json({
            success: true,
            source: "jamendo",
            count: catalog.length,
            catalog
        });

    } catch (error) {

        console.error(
            "FLIX MUSIC API ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Não foi possível carregar o catálogo."
        });
    }
}


/*
 * Pegar gênero da música
 */
function getGenre(track) {

    if (
        track.musicinfo &&
        Array.isArray(
            track.musicinfo.tags?.genres
        )
    ) {
        return (
            track.musicinfo.tags.genres[0] ||
            "Outros"
        );
    }

    return "Outros";
}


/*
 * Catálogo de emergência
 * usado caso o Jamendo não esteja configurado
 */
function getLocalCatalog() {

    return [

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
        }

    ];
}
