async function GetActivePrivateServersV2(Callback){
    let NextCursor = ""
    const ScannedPlaces = {}
    const ThumbnailLookup = {}

    const ScanQueue = []
    const CurrentScans = []
    let WaitForScan
    let ScanId

    const UserId = await GetUserId()

    async function CheckScanQueue(){
        if (CurrentScans.length < 2 && ScanQueue.length > 0){
            const Scan = ScanQueue.pop()

            const Id = ScanId
            ScanId++

            CurrentScans.push(Id)
            await Scan(Id)
            CurrentScans.splice(CurrentScans.indexOf(CurrentScans, Id), 1)
            CheckScanQueue()
        }

        if (WaitForScan) WaitForScan()
    }

    function AddToScanQueue(Function){
        ScanQueue.push(Function)
        CheckScanQueue()
    }

    while (NextCursor !== null){
        const [Success, Result, Response] = await RequestFunc(`https://www.roblox.com/users/inventory/list-json?assetTypeId=9&cursor=&itemsPerPage=100&pageNumber=${NextCursor}&placeTab=MyPrivateServers&userId=${UserId}`, "GET", undefined, undefined, true)
        if (Response?.status === 429){
            await sleep(3000)
            continue
        }
        if (!Success) return [false, "Failed to fetch private servers"]

        const Data = Result.Data
        const Items = Data.Items
        if (Data.length === 0) return [true]

        NextCursor = Data.nextPageCursor

        for (let i = 0; i < Items.length; i++){
            const PrivateServer = Items[i]
            const Universe = PrivateServer.Item.UniverseId
            const Place = PrivateServer.Item.AssetId

            if (ScannedPlaces[Universe]) continue
            ScannedPlaces[Universe] = true
            ThumbnailLookup[Universe] = PrivateServer.Thumbnail.Url

            let PrivateCursor = ""
            const OwnedServers = []

            AddToScanQueue(async function(){
                while (PrivateCursor !== null){
                    const [Success, Result, Response] = await RequestFunc(`https://games.roblox.com/v1/games/${Place}/private-servers?limit=100&sortOrder=Asc&cursor=${PrivateCursor}`, "GET", undefined, undefined, true)
                    if (Response?.status === 429){
                        await sleep(3000)
                        continue
                    }
                    if (!Success) break

                    const Servers = Result.data
                    for (let o = 0; o < Servers.length; o++){
                        const Server = Servers[o]
                        if (Server.owner.id != UserId) continue

                        OwnedServers.push(Server.vipServerId)
                    }

                    PrivateCursor = Result.nextPageCursor
                }

                if (OwnedServers.length > 0){
                    for (let o = 0; o < OwnedServers.length; o++){
                        const Server = OwnedServers[o]

                        const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/vip-servers/${Server}`, "GET", undefined, undefined, true)
                        if (!Success) continue

                        if (Result.subscription.active) Callback({Thumbnail: ThumbnailLookup[Result.game.id] || "", ServerName: Result.name, Id: Server, Price: Result.subscription.price})
                    }
                }
            })

        }

    }

    while (ScanQueue.length > 0 || CurrentScans.length > 0) await new Promise((resolve) => {
        WaitForScan = resolve
    })

    return [true]
}