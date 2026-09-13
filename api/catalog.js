export default async function handler(req, res) {
    try {

        /*
         * Por enquanto, usamos um catálogo local.
         *
         * Depois vamos conectar aqui uma API musical
         * licenciada para streaming.
         */

        const catalog = [
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

        res.status(200).json(catalog);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Não foi possível carregar o catálogo."
        });

    }
}
