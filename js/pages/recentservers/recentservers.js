const RecentServers = {}
let FetchedRecentServers = false

function SaveRecentServers(){
    window.localStorage.setItem("robloxqol-recentservers", RecentServers)
}

function GetRecentServers(CurrentPlaceId){
    if (!FetchedRecentServers){
        const AllRecentServers = window.localStorage.getItem("robloxqol-recentservers")
        const CurrentTime = Math.floor((new Date()).now()/1000)

        for (const [PlaceId, Servers] of Object.entries(AllRecentServers)) {
            const NewServers = []

            for (let i = 0; i < Servers.length; i++){
                const Server = Servers[i]

                if (CurrentTime - Server.Created < 86400*7){
                    NewServers.push(Server)
                }
             }

            if (NewServers.length > 0) NewPlaces[PlaceId] = NewServers
        }

        FetchedRecentServers = true
        SaveRecentServers()
    }

    return RecentServers[CurrentPlaceId]
}