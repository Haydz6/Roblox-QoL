async function GetCurrentGame(){
    const [Success, Result] = await RequestFunc("https://presence.roblox.com/v1/presence/users", "POST", undefined, JSON.stringify({userIds: [await GetCurrentUserId()]}), true)
    
    if (!Success){
        return [false]
    }

    const Presences = Result.userPresences
    if (Presences.length === 0){
        return [false]
    }

    return [true, Presences[0]]
}

let AllRecentServers

let LastRecentServerSuccess = Date.now()
let LastPlaceId = 0
let LastUniverseId = 0
let LastJobId = ""
let LastInGame = false
let LastInStudio = false

let UpdateInt = 3

async function GetUniverseIdFromPlaceId(PlaceId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${PlaceId}`, "GET", undefined, undefined, true)

    if (!Success){
        return 0
    }

    return Result?.[0]?.universeId || 0
}

async function UpdateRecentServer(){
    const [Success, Presence] = await GetCurrentGame()
    await GetAllRecentServers()

    UpdateInt++

    if (!Success){
        if (LastPlaceId === 0) return

        let Servers = AllRecentServers[LastPlaceId]

        if (!Servers){
            Servers = {}
            AllRecentServers[LastPlaceId] = Servers
        }

        Servers[LastJobId] = {LastPlayed: Math.floor(Date.now()/1000), UserId: UserId, Id: LastJobId}
        SaveRecentServers()

        LastRecentServerSuccess = Date.now()
        LastPlaceId = 0
        LastUniverseId = 0
        LastJobId = ""
        return
    }

    if (UpdateInt >= 3){
        UpdateInt = 0
        const InGame = Presence.userPresenceType === 2
        const InStudio = Presence.userPresenceType === 3
        let UniverseId = Presence.universeId

        if ((InGame || InStudio) && !UniverseId){
            UniverseId = await GetUniverseIdFromPlaceId(Presence.placeId)
        }

        //if (InGame !== LastInGame || InStudio !== LastInStudio || UniverseId !== LastUniverseId) RequestFunc(WebServerEndpoints.Playtime+"update", "POST", {["Content-Type"]: "application/json"}, JSON.stringify({InGame: InGame, InStudio: InStudio, UniverseId: UniverseId || 0}))
        RequestFunc(WebServerEndpoints.Playtime+"update", "POST", {["Content-Type"]: "application/json"}, JSON.stringify({InGame: InGame, InStudio: InStudio, UniverseId: UniverseId || 0}))
    }

    LastRecentServerSuccess = Date.now()
    LastInGame = Presence.userPresenceType === 2
    LastInStudio = Presence.userPresenceType === 3

    //Check if player has left server
    if (Presence.userPresenceType !== 2 && LastPlaceId !== 0){
        let Servers = AllRecentServers[LastPlaceId]

        if (!Servers){
            Servers = {}
            AllRecentServers[LastPlaceId] = Servers
        }

        Servers[LastJobId] = {LastPlayed: Math.floor(Date.now()/1000), UserId: UserId, Id: LastJobId}
        SaveRecentServers()

        LastJobId = ""
        LastPlaceId = 0
        LastUniverseId = 0

        return
    }

    //Check if player is in a server
    if (Presence.userPresenceType === 2){
        let Servers = AllRecentServers[Presence.placeId]

        if (!Servers){
            Servers = {}
            AllRecentServers[LastPlaceId] = Servers
        }

        Servers[Presence.gameId] = {LastPlayed: Math.floor(Date.now()/1000), UserId: UserId, Id: LastJobId}

        if (LastUniverseId !== Presence.universeId){
            new Promise(async() => {
                RequestFunc(WebServerEndpoints.Playtime+"continue/set", "POST", null, JSON.stringify({UniverseId: Presence.universeId}))
            })
        }

        LastJobId = Presence.gameId
        LastPlaceId = Presence.placeId
        LastUniverseId = Presence.universeId

        SaveRecentServers()
    }
}

function SaveRecentServers(){
    LocalStorage.set("recentservers", JSON.stringify(AllRecentServers))
}

async function GetAllRecentServers(){
    if (!AllRecentServers){
        AllRecentServers = await LocalStorage.get("recentservers")

        if (AllRecentServers){
            AllRecentServers = JSON.parse(AllRecentServers)
        } else {
            AllRecentServers = {}
        }
    }

    return AllRecentServers
}

async function GetRecentServers(CurrentPlaceId){
    await GetAllRecentServers()
    const CurrentTime = Math.floor(Date.now()/1000)

    let Updated = false

    for (const [PlaceId, Servers] of Object.entries(AllRecentServers)) {
        let TotalServers = 0
        let DeletedServers = 0

        for (const [JobId, Server] of Object.entries(Servers)){
            TotalServers++
            if (CurrentTime - Server.LastPlayed >= 86400*7){
                DeletedServers++

                Updated = true
                delete Servers[JobId]
            }
        }

        if (TotalServers === DeletedServers){
            delete AllRecentServers[PlaceId]
            Updated = true
            continue
        }

        if (TotalServers-DeletedServers > 4) {
            const SortedServers = []

            for (const [JobId, Server] of Object.entries(Servers)){
                SortedServers.push({JobId: JobId, LastPlayed: Server.LastPlayed})
            }

            SortedServers.sort(function(a, b){
                return a.LastPlayed - b.LastPlayed
            })

            while (TotalServers-DeletedServers > 4){
                const Server = SortedServers.splice(0, 1)[0]
                delete Servers[Server.JobId]
                DeletedServers++
            }

            Updated = true
        }
    }

    if (Updated) SaveRecentServers()

    return AllRecentServers[CurrentPlaceId] || {}
}

BindToOnMessage("getrecentservers", true, function(Request){
    return GetRecentServers(Request.placeId)
})

BindToOnMessage("recentserverexpired", false, async function(Request){
    await GetAllRecentServers()

    const Servers = AllRecentServers[Request.placeId]
    if (!Servers) return

    delete Servers[Request.jobId]
    SaveRecentServers()
})

if (ManifestVersion < 3){
    chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
        const RequestHeaders = details.requestHeaders

        for (let i = 0; i < RequestHeaders.length; i++){
            const Header = RequestHeaders[i]

            if (Header.name === "User-Agent"){
                Header.value = "Roblox/WinInet"
                break
            }
        }

        return {requestHeaders: details.requestHeaders}
    }, {urls: ["https://gamejoin.roblox.com/v1/join-game-instance"]}, ["requestHeaders"]);
}

UpdateRecentServer()
setInterval(UpdateRecentServer, 10*1000)