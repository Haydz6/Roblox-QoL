async function Main(){
    const [Container, List, NoServers] = CreateRecentServersList()

    const FriendsList = await WaitForId("rbx-friends-running-games")
    FriendsList.parentElement.insertBefore(Container, FriendsList)

    const RecentServers = await GetRecentServers()

    if (RecentServers.length === 0){
        List.style = "display: none;"
        NoServers.style = ""
        return
    }

    const CurrentPlaceId = await GetPlaceIdFromGamePage()
    const Servers = GetRecentServers(CurrentPlaceId)

    for (let i = 0; i < Servers.length; i++){
        new Promise(async() => {
            const [Success, Alive] = await IsRobloxServerAlive(PlaceId, Server.Id)

            if (Success && !Alive) return

            const Server = Servers[i]
            const [ServerBox, Image] = CreateRecentServerBox(CurrentPlaceId, Server.Id, Server.UserId, Server.LastPlayed)

            List.appendChild(ServerBox)
        })
    }
}

IsFeatureEnabled("RecentServers").then(function(Enabled){
    if (Enabled){
        Main()
    }
})