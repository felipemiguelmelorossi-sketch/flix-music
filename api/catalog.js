export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Método não permitido."
            });
        }

        const clientId = process.env.JAMENDO_CLIENT_ID;

        const query = String(
            req.query?.q || ""
        ).trim();

        const requestedLimit = Math.min(
            Number(req.query?.limit) || 100,
            600
        );

        if (!clientId) {
            return res.status(200).json({
                success: true,
                source: "local",
                message:
                    "JAMENDO_CLIENT_ID ainda não configurado.",
                catalog: []
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

            const params = new URLSearchParams();

            params.set(
                "client_id",
                clientId
            );

            params.set(
                "format",
                "json"
            );

            params.set(
                "limit",
                String(currentLimit)
            );

            params.set(
                "offset",
                String(offset)
            );

            params.set(
                "include",
                "musicinfo"
            );

            params.set(
                "order",
                "relevance"
            );

            /*
             * MP3.
             * O Jamendo retorna a URL de reprodução
             * no campo "audio".
             */
            params.set(
                "audioformat",
                "mp32"
            );

            params.set(
                "imagesize",
                "300"
            );

            if (query) {
                params.set(
                    "search",
                    query
                );
            }

            const url =
                `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`;

            requests.push(
                fetch(url)
                    .then(async response => {
                        if (!response.ok) {
                            const text =
                                await response.text();

                            throw new Error(
                                `Jamendo HTTP ${response.status}: ${text}`
                            );
                        }

                        return response.json();
                    })
            );
        }

        const responses =
            await Promise.all(requests);

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

        /*
         * Só mantém músicas que realmente
         * possuem URL de áudio.
         */
        allTracks =
            allTracks.filter(track => {
                return (
                    track &&
                    track.audio
                );
            });

        /*
         * Remove duplicadas.
         */
        const uniqueTracks =
            Array.from(
                new Map(
                    allTracks.map(track => [
                        track.id,
                        track
                    ])
                ).values()
            );

        /*
         * Converte para o formato
         * usado pelo Flix Music.
         */
        const catalog =
            uniqueTracks.map(track => ({
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
                    Number(
                        track.duration
                    ) || 0,

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
                error?.message ||
                "Não foi possível carregar o catálogo."
        });
    }
}


/*
 * Pegar gênero
 */
function getGenre(track) {

    if (
        track?.musicinfo &&
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
