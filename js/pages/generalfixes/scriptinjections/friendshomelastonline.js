let PendingLastOnlineBatches = []

async function BatchGetLastOnline(UserId){
    return new Promise(async(resolve, reject) => {
        PendingLastOnlineBatches.push({UserId: UserId, resolve: resolve, reject: reject})

        if (PendingLastOnlineBatches.length === 1){
            await new Promise(r => setTimeout(r, 100))
            const Batch = PendingLastOnlineBatches
            PendingLastOnlineBatches = []

            const UserIds = []
            const UserIdToResolve = {}

            for (let i = 0; i < Batch.length; i++){
                const Request = Batch[i]
                
                if (!UserIdToResolve[Request.UserId]){
                    UserIds.push(Request.UserId)
                    UserIdToResolve[Request.UserId] = []
                }
                UserIdToResolve[Request.UserId].push(Request)
            }

            const Response = await fetch("https://presence.roblox.com/v1/presence/last-online", {method: "POST", headers: {"Content-Type": "application-json"}, body: JSON.stringify({userIds: UserIds}), credentials: "include"})
            const Success = Response.ok
            let Result

            if (Success){
                try {
                    Result = await Response.json()
                } catch {}
            }
            
            if (!Success) {
                for (const [_, Resolves] of Object.entries(object)) {
                    for (let i = 0; i < Resolves.length; i++){
                        Resolves[i].reject()
                    }
                }
                return
            }

            const Timestamps = Result.lastOnlineTimestamps
            for (let i = 0; i < Timestamps.length; i++){
                const User = Timestamps[i]
                const Resolves = UserIdToResolve[User.userId]
                for (let i = 0; i < Resolves.length; i++){
                    Resolves[i].resolve(User.lastOnline)
                }
            }
        }
    })
}

async function FriendsHomeLastOnline(){
    function SecondsToLengthSingle(Seconds){
        const d = Math.floor(Seconds / (3600*24))
        const h = Math.floor(Seconds % (3600*24) / 3600)
        const m = Math.floor(Seconds % 3600 / 60)
        const s = Math.floor(Seconds % 60)
      
        if (d > 0){
          return `${d} day${d == 1 ? "" : "s"}`
        } else if (h > 0){
          return `${h} hour${h == 1 ? "" : "s"}`
        } else if (m > 0){
          return `${m} minute${m == 1 ? "" : "s"}`
        }
      
        return `${s} second${s == 1 ? "" : "s"}`
      }

    function GetPlaceName(Child){
        const Existing = Child.getElementsByClassName("place-name")[0]
        if (Existing) return Existing

        const PlaceName = document.createElement("div")
        PlaceName.className = "text-overflow xsmall text-label place-name"
        Child.getElementsByClassName("friend-link")[0].appendChild(PlaceName)

        return PlaceName
    }

    const OfflineUsers = {}

    async function SetUserOffline(Presence){
        const UserId = Presence.userId || Presence.id
        OfflineUsers[UserId] = true

        const FriendItem = document.getElementById("people-"+UserId)
        if (!FriendItem) return

        const LastOnline = new Date(await BatchGetLastOnline(UserId))
        const PlaceName = GetPlaceName(FriendItem)

        while (OfflineUsers[UserId]){
            PlaceName.innerText = SecondsToLengthSingle((Date.now()/1000) - (LastOnline.getTime()/1000)) + " ago"
            await new Promise(r => setTimeout(r, 500))
        }
    }

    async function SetUserOnline(Presence){
        const UserId = Presence.userId || Presence.id
        delete OfflineUsers[UserId]
    }

    document.addEventListener("Roblox.Presence.Update", async function(Event){
        const Presence = Event.detail[0]
        if (Presence.userPresenceType === 0) SetUserOffline(Presence)
        else SetUserOnline(Presence)
    })

    let PeopleList
    while (true){
        PeopleList = document.querySelector('[ng-controller="peopleListContainerController"]')
        if (PeopleList) break
        await new Promise(r => setTimeout(r, 100))
    }

    const PeopleController = angular.element(PeopleList).scope()
    while (PeopleController.library?.numOfFriends === null) await new Promise(r => setTimeout(r, 100))

    for (const [_, User] of Object.entries(PeopleController.library.friendsDict)){
        if (User.presence.userPresenceType === 0) SetUserOffline(User)
        else SetUserOnline(User)
    }
}
FriendsHomeLastOnline()