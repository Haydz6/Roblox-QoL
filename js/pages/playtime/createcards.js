async function CreateGameCardsFromUniverseIds(Games, CardsContainer, CacheFetchInt, FetchInt, Fail, Spinner){
    if (!Spinner){
        Spinner = CreateSpinner()
        CardsContainer.appendChild(Spinner)
    }
    if (!CacheFetchInt) CacheFetchInt = 0 //Bypass change rule
    if (!FetchInt) FetchInt = [0]

    if (Games.length === 0){
        Spinner.remove()
        return
    }
    if (!Fail) Fail = function(Text){
        const FailedText = document.createElement("p")
        FailedText.innerText = Text
        CardsContainer.appendChild(FailedText)

        Spinner.remove()
    }

    const UniverseIds = []
    const UniverseIdToPlaytime = {}

    for (let i = 0; i < Games.length; i++){
        const Game = Games[i]
        if (typeof(Game) == "number"){
            UniverseIds.push(Game)
            continue
        }

        UniverseIds.push(Game.UniverseId)
        UniverseIdToPlaytime[Game.UniverseId] = Game.Playtime
    }

    // const Data = []
    // const CloneUniverseIds = UniverseIds.slice(0)

    // while (CloneUniverseIds.length > 0){
    //     const CallUniverseIds = []
    //     for (let i = 0; i < Math.min(CloneUniverseIds.length, 10); i++){
    //         CallUniverseIds.push(CloneUniverseIds.shift())
    //     }

    //     const [UniverseSuccess, Universes] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${CallUniverseIds.join(",")}`, "GET", undefined, undefined, true)
    //     if (FetchInt[0] !== CacheFetchInt) return

    //     if (!UniverseSuccess) {
    //         Fail("Failed to load games")
    //         return
    //     }
    //     Data.push(...Universes.data)
    // }

    const Cards = {}
    const Data = []

    const UniverseIdToVotePercent = {}
    const UniverseIdToImageElement = {}

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

            if (UniverseIdToVotePercent[Vote.id]) UniverseIdToVotePercent[Vote.id].innerText = LikeRatio && LikeRatio+"%" || "--"
            else UniverseIdToVotePercent[Vote.id] = LikeRatio && LikeRatio+"%" || "--"
        }
    }

    async function GetGameIcons(){
        const Batches = []
        const UniverseIdToTitle = {}

        for (let i = 0; i < UniverseIds.length; i++){
            const UniverseId = UniverseIds[i]
            //UniverseIdToTitle[Universe.id] = Universe.name

            Batches.push({
                requestId: UniverseId,
                targetId: UniverseId,
                type: "GameIcon",
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
            if (UniverseIdToImageElement[parseInt(Batch.requestId)]) UniverseIdToImageElement[parseInt(Batch.requestId)].src = Batch.imageUrl
            else UniverseIdToImageElement[parseInt(Batch.requestId)] = Batch.imageUrl
        }
    }

    GetGameIcons()
    GetRatings()

    await GetUniversesBatchToLiveCallback(UniverseIds, function(Universe){
        const [GameCard, GameImage, CardInfo, VotePercent] = CreateGameCard(Universe.name, `https://roblox.com/games/${Universe.rootPlaceId}`, Universe.playing)

        CardsContainer.appendChild(GameCard)

        if (UniverseIdToImageElement[Universe.id]){
            GameImage.parentElement.className = "thumbnail-2d-container game-card-thumb-container"
            GameImage.style = ""
            GameImage.title = Universe.name
            GameImage.alt = Universe.name
            GameImage.src = UniverseIdToImageElement[Universe.id]
        } else UniverseIdToImageElement[Universe.id] = GameImage

        if (UniverseIdToVotePercent[Universe.id]) VotePercent.innerText = UniverseIdToVotePercent[Universe.id]
        else UniverseIdToVotePercent[Universe.id] = VotePercent

        const PlaytimeCardInfo = document.createElement("div")
        PlaytimeCardInfo.className = "game-card-info"

        const PlaytimeIcon = document.createElement("span")
        PlaytimeIcon.className = "info-label icon-playing-counts-gray icon-playtime"

        const Playtime = UniverseIdToPlaytime[Universe.id]

        if (Playtime){
            const PlaytimeLabel = document.createElement("span")
            PlaytimeLabel.className = "info-label playing-counts-label"
            PlaytimeLabel.innerText = SecondsToLength(Playtime, true, true)

            PlaytimeCardInfo.append(PlaytimeIcon, PlaytimeLabel)
            CardInfo.parentElement.appendChild(PlaytimeCardInfo)
        }

        Cards[Universe.id] = GameCard
        Data.push(Universe)
    })

    Spinner.remove()

    // const Cards = {}

    // for (let i = 0; i < Data.length; i++){
    //     const Universe = Data[i]
    //     const [GameCard, GameImage, CardInfo, VotePercent] = CreateGameCard(Universe.name, `https://roblox.com/games/${Universe.rootPlaceId}`, Universe.playing)

    //     CardsContainer.appendChild(GameCard)

    //     UniverseIdToImageElement[Universe.id] = GameImage
    //     UniverseIdToVotePercent[Universe.id] = VotePercent

    //     const PlaytimeCardInfo = document.createElement("div")
    //     PlaytimeCardInfo.className = "game-card-info"

    //     const PlaytimeIcon = document.createElement("span")
    //     PlaytimeIcon.className = "info-label icon-playing-counts-gray icon-playtime"

    //     const Playtime = UniverseIdToPlaytime[Universe.id]

    //     if (Playtime){
    //         const PlaytimeLabel = document.createElement("span")
    //         PlaytimeLabel.className = "info-label playing-counts-label"
    //         PlaytimeLabel.innerText = SecondsToLength(Playtime, true, true)

    //         PlaytimeCardInfo.append(PlaytimeIcon, PlaytimeLabel)
    //         CardInfo.parentElement.appendChild(PlaytimeCardInfo)
    //     }

    //     Cards[Universe.id] = GameCard
    // }

    return Cards
}