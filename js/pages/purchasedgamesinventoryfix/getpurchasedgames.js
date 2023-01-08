const PurchasedGames = []
const PurchasedGameIds = []
const CachedGamesIds = []
const CachedGamesId = {}

let FirstTranscationId
let LastCachedTranscation
let NextCursor = ""
let FetchedFromCache = false
let ReachedPurchasedGamesEnd = false

let IsFetchingPurchasedGames = false

let TotalTranscationsLoaded = 0
let PurchasedGamesLoaded = 0

async function FetchFromCache(){
    if (FetchedFromCache){
        return
    }

    FetchedFromCache = true

    const CachedGamesStr = window.localStorage.getItem("robloxqol-purchasedgames")

    if (!CachedGamesStr){
        return
    }

    const CachedInfo = JSON.parse(CachedGamesStr)
    const CachedGames = CachedInfo.Games
    LastCachedTranscation = CachedInfo.LastTranscation

    console.log(CachedGames)
    console.log(LastCachedTranscation)

    for (let i = 0; i < CachedGames.length; i++){
        CachedGamesIds.push(CachedGames[i])
        CachedGamesId[CachedGames[i]] = true
    }
}

function SaveCache(){
    if (!FetchedFromCache){
        return
    }

    window.localStorage.setItem("robloxqol-purchasedgames", JSON.stringify({Games: PurchasedGameIds, LastTranscation: LastCachedTranscation}))
}

function UpdatePurchasedGamesParagraph(){
    LoadingParagraph.innerText = `Found ${PurchasedGamesLoaded} purchased games out of ${TotalTranscationsLoaded} transcations!${!LastCachedTranscation && "\n(The first time loading will take a bit)" || ""}`
}

async function GetGameInfosFromAssetIds(AllAssets){
    const NewGames = []
    
    const Chunks = SplitArrayIntoChunks(AllAssets, 35)

    for (let i = 0; i < Chunks.length; i++){
        const Chunk = Chunks[i]
        let GamesString = ""

        for (let i = 0; i < Chunk.length; i++){
            if (GamesString != ""){
                GamesString = GamesString + "&"
            }

            GamesString = GamesString + "placeIds="+Chunk[i]
        }

        while (true){
            const [GamesSuccess, GamesResult] = await RequestFunc("https://games.roblox.com/v1/games/multiget-place-details?"+GamesString, "GET", undefined, undefined, true)

            if (!GamesSuccess){
                await sleep(1000)
                continue
            }

            for (let i = 0; i < GamesResult.length; i++){
                const Game = GamesResult[i]
                const GameInfo = {
                    PlaceId: Game.placeId,
                    Name: Game.name,
                    OwnerName: Game.builder,
                    OwnerId: Game.builderId,
                    Price: Game.price
                }

                PurchasedGames.push(GameInfo)
                NewGames.push(GameInfo)
                PurchasedGameIds.push(Game.placeId)

                PurchasedGamesLoaded++
            }

            break
        }

        UpdatePurchasedGamesParagraph()
    }

    return NewGames
}

async function RequestPurchasedGames(){
    await FetchFromCache()

    const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v2/users/51787703/transactions?cursor=${NextCursor}&limit=100&transactionType=Purchase`, "GET", undefined, undefined, true)

    if (!Success){
        return
    }

    if (NextCursor === ""){
        FirstTranscationId = Result.data[0]?.id || LastCachedTranscation
    }

    NextCursor = Result.nextPageCursor

    if (!NextCursor){
        ReachedPurchasedGamesEnd = true
    }

    const Data = Result.data

    const AllAssets = []
    let HitIdCache = false

    for (let i = 0; i < Data.length; i++){
        const Transcation = Data[i]

        if (Transcation.id === LastCachedTranscation){
            HitIdCache = true
            break
        }

        if (Transcation.transactionType === "Purchase" && Transcation.details.type === "Asset"){
            AllAssets.push(Transcation.details.id)
        }

        TotalTranscationsLoaded++
    }
    UpdatePurchasedGamesParagraph()

    if (AllAssets.length === 0 && !HitIdCache){
        return
    }

    let NewGames = []

    if (AllAssets.length > 0){
        NewGames = await GetGameInfosFromAssetIds(AllAssets)
    }

    if (HitIdCache){
        ReachedPurchasedGamesEnd = true

        console.log("hit id cache")
        console.log(CachedGamesIds)

        const NewGames2 = await GetGameInfosFromAssetIds(CachedGamesIds)

        for (let i = 0; i < NewGames2.length; i++){
            NewGames.push(NewGames2[i])
        }
    }

    if (ReachedPurchasedGamesEnd){
        LastCachedTranscation = FirstTranscationId
        SaveCache()
    }

    await GetImagesForGames(NewGames)
}

function SplitArrayIntoChunks(Array, chunkSize){
    const Chunks = []

    for (let i = 0; i < Array.length; i += chunkSize) {
        const chunk = Array.slice(i, i + chunkSize)
        Chunks.push(chunk)
    }

    return Chunks
}

async function GetImagesForGames(Games){
    let Requests = ""
    const GameLookup = {}

    for (let i = 0; i < Games.length; i++){
        const Game = Games[i]

        if (Game.Image) continue

        if (Requests != ""){
            Requests = Requests + ","
        }

        Requests = Requests + Game.PlaceId

        GameLookup[Game.PlaceId] = Game
    }

    if (Requests.length == 0){
        return
    }

    const [Success, Result] = await RequestFunc(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${Requests}&returnPolicy=0&size=150x150&format=Png&isCircular=false`, "GET", undefined, undefined, true)

    if (!Success){
        for (let i = 0; i < Games.length; i++){
            Games[i].Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const ImageInfo = Data[i]

        if (ImageInfo.state === "Completed"){
            GameLookup[ImageInfo.targetId].Image = ImageInfo.imageUrl
        } else {
            GameLookup[ImageInfo.targetId].Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
        }
    }
}

async function GetPurchasedGames(Page){ //Max per page is 30
    if (!IsPurchasedGamesOpened){
        return
    }

    const ParagraphContainer = await WaitForClass("tab-content rbx-tab-content")
    ParagraphContainer.insertBefore(LoadingParagraph, ParagraphContainer.firstChild)
    LoadingParagraph.style = ""
    LoadingParagraph.innerText = `Loading`

    while (IsFetchingPurchasedGames){
        await sleep(100)
    }
    
    IsFetchingPurchasedGames = true
    while (!ReachedPurchasedGamesEnd && IsPurchasedGamesOpened){
        await RequestPurchasedGames()
        await sleep(100)
    }
    IsFetchingPurchasedGames = false

    if (!IsPurchasedGamesOpened){
        return []
    }

    LoadingParagraph.style = "display:none;"

    const PageServers = []

    const Start = (Page * 30) - 30
    const End = Math.min(Page * 30, PurchasedGames.length)

    for (let i = Start; i < End; i++){
        PageServers.push(PurchasedGames[i])
    }

    return PageServers
}