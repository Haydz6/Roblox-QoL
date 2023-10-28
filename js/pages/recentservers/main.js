async function GetHeadshotsFromUserIds(UserIds){
    const [Success, Result] = await RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserIds.join(",")}&size=150x150&format=Png&isCircular=true`, "GET", undefined, undefined, true)

    if (!Success) return [false]

    const UserIdToHeadshot = {}
    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        UserIdToHeadshot[Info.targetId] = Info.imageUrl
    }

    return [true, UserIdToHeadshot]
}

async function CreateRecentServers(){
    const [Container, List, NoServers] = CreateRecentServersList()

    const FriendsList = await WaitForId("rbx-friends-running-games")
    FriendsList.parentElement.insertBefore(Container, FriendsList)

    const CurrentPlaceId = await GetPlaceIdFromGamePage()
    const RecentServers = await GetRecentServers(CurrentPlaceId)

    const UserIdToImageElements = {}
    const UserIds = []
    const Promises = []

    const ServerBoxSort = []
    let AnyServersExist = false

    for (const [JobId, Server] of Object.entries(RecentServers)){
        Promises.push(new Promise(async(resolve) => {
            const [Success, Alive] = await IsRobloxServerAlive(CurrentPlaceId, Server.Id)

            if (Success && !Alive){
                chrome.runtime.sendMessage({type: "recentserverexpired", placeId: CurrentPlaceId, jobId: Server.Id})
                resolve()
                return
            }

            AnyServersExist = true

            const [ServerBox, Image] = CreateRecentServerBox(CurrentPlaceId, Server.Id, Server.UserId, Server.LastPlayed)
            ServerBoxSort.push({Element: ServerBox, LastPlayed: Server.LastPlayed})

            if (!UserIdToImageElements[Server.UserId]){
                UserIdToImageElements[Server.UserId] = []
            }

            UserIdToImageElements[Server.UserId].push(Image)
            
            if (!UserIds.includes(Server.UserId)){
                UserIds.push(Server.UserId)
            }

            resolve()
        }))
    }

    await Promise.all(Promises)

    if (!AnyServersExist){
        List.style = "display: none;"
        NoServers.style = ""
        return
    }

    ServerBoxSort.sort(function(a, b){
        return b.LastPlayed - a.LastPlayed
    })

    for (let i = 0; i < ServerBoxSort.length; i++){
        List.appendChild(ServerBoxSort[i].Element)
    }

    if (UserIds.length === 0) return

    const [Success, UserIdToHeadshot] = await GetHeadshotsFromUserIds(UserIds)

    for (let i = 0; i < UserIds.length; i++){
        const UserId = UserIds[i]
        const ImageElements = UserIdToImageElements[UserId]

        for (let o = 0; o < ImageElements.length; o++){
            ImageElements[o].src = Success && UserIdToHeadshot[UserId] || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
        }
    }
}

IsFeatureEnabled("RecentServers").then(async function(Enabled){
    if (!Enabled) return
    setTimeout(CreateRecentServers, 0)
})