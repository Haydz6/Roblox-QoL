let PreviousCursor = ""
let CSRFToken = ""
let ReachedEnd = false
let IsFetching = false
let AmountLoaded = 0
const ActivePrivateServers = []

//GameIcon, Name, OwnerName, OwnerId, Price, PlaceId

function CreateDummyData(){
    return {
        Name: "a place",
        OwnerName: "Haydz6",
        OwnerId: 51787703,
        Price: Math.random() * 100,
        Thumbnail: "https://tr.rbxcdn.com/407c5baab2168cbdaa0a1ef82aac096f/48/48/AvatarHeadshot/Png",
        PlaceId: 8416011646,
        Id: Math.random() * 10000000
    }
}

async function RequestActivePrivateServers(){
    IsFetching = true

    // for (let i = 0; i < 200; i++){
    //     ActivePrivateServers.push(CreateDummyData())
    // }

    const [Success, Result] = await RequestFunc(`https://www.roblox.com/users/inventory/list-json?assetTypeId=9&cursor=&itemsPerPage=100&pageNumber=${PreviousCursor}&placeTab=MyPrivateServers&userId=${UserId}`, "GET", undefined, undefined, true)

    if (!Success) return false

    const Data = Result?.Data

     if (!Data) return false

    const Items = Data.Items

    if (Items.length === 0) {
        ReachedEnd = true
        return true
    }

    const ActiveServersByPlaceIds = {}
    PreviousCursor = Data.nextPageCursor

    if (!PreviousCursor){
        ReachedEnd = true
    }

    for (let i = 0; i < Items.length; i++){
        const Server = Items[i]
        const Item = Server.Item
        const PrivateServer = Server.PrivateServer
        const Product = Server.Product
        const Thumbnail = Server.Thumbnail

        //always false... if (!PrivateServer.CanJoin) continue

        if (!PrivateServer){
            continue
        }

        const FinalServer = {
            Name: Item.Name,
            OwnerName: PrivateServer.OwnerName,
            OwnerId: PrivateServer.OwnerId,
            Price: Product.PriceInRobux || 0,
            Thumbnail: Thumbnail.Url,
            PlaceId: Item.AssetId
        }

        if (!ActiveServersByPlaceIds[Item.AssetId]){
            ActiveServersByPlaceIds[Item.AssetId] = []
        }

        ActiveServersByPlaceIds[Item.AssetId].push(FinalServer)
    }

    let FinalServerIncrement = 0

    for (const [PlaceId, Servers] of Object.entries(ActiveServersByPlaceIds)) {
       const RobloxServers = []

        let NextCursor = ""

        while (true){
            const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/${PlaceId}/private-servers?limit=100&sortOrder=Asc`, "GET", undefined, undefined, true)

            if (!Success){
                await sleep(1000)
                continue
            }

            NextCursor = Result.nextPageCursor

            for (let o = 0; o < Result.data.length; o++){
                console.log(Result.data[o])
                RobloxServers.push(Result.data[o])
            }

            if (!NextCursor) break
            await sleep(200)
        }

        const FinalServers = []

        for (let o = 0; o < RobloxServers.length; o++){
            const RobloxServer = RobloxServers[o]

            for (let l = 0; l < Servers.length; l++){
                const Server = Servers[l]

                if (Server.Id) continue

                if (RobloxServer.name === Server.Name){
                    Server.Id = RobloxServer.vipServerId
                    FinalServers.push(Server)
                }
            }
        }

        for (let o = 0; o < FinalServers.length; o++){
            const Server = FinalServers[o]

            if (!Server.Id) continue

            while (true){
                const [Success, ServerInfo] = await RequestFunc(`https://games.roblox.com/v1/vip-servers/${Server.Id}`, "GET", undefined, undefined, true)

                if (!Success){
                    if (ServerInfo?.errors?.[0]?.code === 8){
                        console.log("private servers disabled for "+Server.PlaceId)
                        break
                    }

                    await sleep(1000)
                    continue
                }

                AmountLoaded ++
                FinalServerIncrement ++
                if (ServerInfo.subscription.active) ActivePrivateServers.push(Server)

                LoadingParagraph.innerText = `Found ${ActivePrivateServers.length} active out of ${AmountLoaded} private servers!`

                break
            }
        }
    }

    AmountLoaded += Data.Items.length
    AmountLoaded -= FinalServerIncrement
    LoadingParagraph.innerText = `Found ${ActivePrivateServers.length} active out of ${AmountLoaded} private servers!`

    return true
}

async function GetActivePrivateServers(Page){ //Max per page is 30
    if (!IsActivePrivateServersOpened){
        return
    }

    const ParagraphContainer = await WaitForClass("tab-content rbx-tab-content")
    ParagraphContainer.insertBefore(LoadingParagraph, ParagraphContainer.firstChild)
    LoadingParagraph.style = ""
    LoadingParagraph.innerText = `Loading`

    while (IsFetching){
        await sleep(100)
    }
    
    while (!ReachedEnd && ActivePrivateServers.length < Page * 30 && IsActivePrivateServersOpened){
        await RequestActivePrivateServers()
        await sleep(100)
    }

    IsFetching = false

    if (!IsActivePrivateServersOpened){
        return []
    }

    LoadingParagraph.style = "display:none;"

    const PageServers = []

    const Start = (Page * 30) - 30
    const End = Math.min(Page * 30, ActivePrivateServers.length)

    for (let i = Start; i < End; i++){
        PageServers.push(ActivePrivateServers[i])
    }

    return PageServers
}