export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Método não permitido."
            });
        }

        const clientId = process.env.JAMENDO_CLIENT_ID;

        const query = String(req.query?.q || "").trim();

        // Até 600 músicas: 3 requisições de 200
        const requestedLimit = Math.min(
            Number(req.query?.limit) || 600,
            600
        );

        if (!clientId) {
            return res.status(200).json({
                success: true,
                source: "local",
                message: "JAMENDO_CLIENT_ID ainda não configurado.",
                catalog: getLocalCatalog()
            });
        }

        const pageSize = 200;

        const requests = [];

        for (
            let offset = 0;
            offset < requestedLimit;
            offset += pageSize
        ) {
            const currentLimit = Math.min(
                pageSize,
                requestedLimit - offset
            );

            const params = new URLSearchParams({
                client_id: clientId,
                format: "json",
                limit: String(currentLimit),
                offset: String(offset),
                include: "musicinfo",
                order: "relevance",
                audioformat: "mp32",
                imagesize: "300"
            });

            if (query) {
                params.set("search", query);
            }

            const url =
                `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`;

            requests.push(
                fetch(url)
                    .then(async response => {
                        if (!response.ok) {
                            throw new Error(
                                `Jamendo HTTP ${response.status}`
                            );
                        }

                        return response.json();
                    })
            );
        }

        const responses = await Promise.all(requests);

        let allTracks = [];

        for (const data of responses) {
            if (
                data &&
                Array.isArray(data.results)
            ) {
                allTracks.push(
                    ...data.results
                );
            }
        }

        // Remover possíveis músicas duplicadas
        const uniqueTracks = Array.from(
            new Map(
                allTracks.map(track => [
                    track.id,
                    track
                ])
            ).values()
        );

        // Transformar para o formato do Flix Music
        const catalog = uniqueTracks.map(track => ({
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

            audioUrl:
                track.audio ||
                "",

            duration:
                Number(track.duration) || 0,

            genre:
                getGenre(track),

            license:
                track.license_ccurl ||
                "",

            audioDownloadAllowed:
                Boolean(
                    track.audiodownload_allowed
                )
        }));

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
 * Pegar gênero
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
