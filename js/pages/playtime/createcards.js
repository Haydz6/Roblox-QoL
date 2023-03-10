async function CreateGameCardsFromPlaytime(Games, CardsContainer, CacheFetchInt, FetchInt, Fail, Spinner){
    if (Games.length === 0){
        Spinner.remove()
        return
    }

    const UniverseIds = []
    const UniverseIdToPlaytime = {}

    for (let i = 0; i < Games.length; i++){
        const Game = Games[i]
        UniverseIds.push(Game.UniverseId)
        UniverseIdToPlaytime[Game.UniverseId] = Game.Playtime
    }

    const [UniverseSuccess, Universes] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${UniverseIds.join(",")}`, "GET", undefined, undefined, true)
    if (FetchInt[0] !== CacheFetchInt) return

    if (!UniverseSuccess) {
        Fail("Failed to load games")
        return
    }
    Spinner.remove()

    const Data = Universes.data
    const UniverseIdToVotePercent = {}
    const UniverseIdToImageElement = {}

    for (let i = 0; i < Data.length; i++){
        const Universe = Data[i]
        const [GameCard, GameImage, CardInfo, VotePercent] = CreateGameCard(Universe.name, `https://roblox.com/games/${Universe.rootPlaceId}`, Universe.playing)

        CardsContainer.appendChild(GameCard)

        UniverseIdToImageElement[Universe.id] = GameImage
        UniverseIdToVotePercent[Universe.id] = VotePercent

        const PlaytimeCardInfo = document.createElement("div")
        PlaytimeCardInfo.className = "game-card-info"

        const PlaytimeIcon = document.createElement("span")
        PlaytimeIcon.className = "info-label icon-playing-counts-gray icon-playtime"

        const PlaytimeLabel = document.createElement("span")
        PlaytimeLabel.className = "info-label playing-counts-label"
        PlaytimeLabel.innerText = SecondsToLength(UniverseIdToPlaytime[Universe.id], true, true)

        PlaytimeCardInfo.append(PlaytimeIcon, PlaytimeLabel)
        CardInfo.parentElement.appendChild(PlaytimeCardInfo)
    }

    async function GetRatings(){
        const [VotesSuccess, Votes] = await RequestFunc(`https://games.roblox.com/v1/games/votes?universeIds=${UniverseIds.join(",")}`, "GET", undefined, undefined, true)
        if (FetchInt[0] !== CacheFetchInt || !VotesSuccess)  return

        const VoteData = Votes.data

        for (let i = 0; i < VoteData.length; i++){
            const Vote = VoteData[i]
            let LikeRatio = 0

            if (Vote.downVotes == 0){
                if (Vote.upVotes == 0) {
                    LikeRatio = null
                } else {
                    LikeRatio = 100
                }
            } else {
                LikeRatio = Math.floor((Vote.upVotes / (Vote.upVotes+Vote.downVotes))*100)
            }

            UniverseIdToVotePercent[Vote.id].innerText = LikeRatio && LikeRatio+"%" || "--"
        }
    }

    async function GetGameIcons(){
        const Batches = []
        const UniverseIdToTitle = {}

        for (let i = 0; i < Data.length; i++){
            const Universe = Data[i]
            UniverseIdToTitle[Universe.id] = Universe.name

            Batches.push({
                requestId: Universe.id,
                targetId: Universe.rootPlaceId,
                type: "PlaceIcon",
                size: "150x150",
                format: "Png",
                isCircular: false
            })
        }

        const [Success, Images] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", {["Content-Type"]: "application/json"}, JSON.stringify(Batches), true)

        for (const [UniverseId,Image] of Object.entries(UniverseIdToImageElement)){
            const Title = UniverseIdToTitle[UniverseId]

            Image.parentElement.className = "thumbnail-2d-container game-card-thumb-container"
            Image.style = ""
            Image.title = Title
            Image.alt = Title
        }

        if (FetchInt[0] !== CacheFetchInt || !Success) return

        const ImageData = Images.data

        for (let i = 0; i < ImageData.length; i++){
            const Batch = ImageData[i]
            UniverseIdToImageElement[parseInt(Batch.requestId)].src = Batch.imageUrl
        }
    }
    GetRatings()
    GetGameIcons()
}