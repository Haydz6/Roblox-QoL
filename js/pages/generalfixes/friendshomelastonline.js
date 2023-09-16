let PendingLastOnlineBatches = []

async function BatchGetLastOnline(UserId){
    return new Promise(async(resolve, reject) => {
        PendingLastOnlineBatches.push({UserId: UserId, resolve: resolve, reject: reject})

        if (PendingLastOnlineBatches.length === 1){
            await sleep(100)
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

            const [Success, Result] = await RequestFunc("https://presence.roblox.com/v1/presence/last-online", "POST", {"Content-Type": "application-json"}, JSON.stringify({userIds: UserIds}), true)
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

IsFeatureEnabled("FriendsHomeLastOnline").then(async function(Enabled){
    if (!Enabled) return

    const FriendsContainer = await WaitForClass("home-friends")
    const FriendsList = await WaitForClassPath(FriendsContainer, "people-list", "hlist")

    ChildAdded(FriendsList, true, async function(Child){
        if (Child.type === undefined) return //thanks js

        const UserId = parseInt(Child.getAttribute("rbx-user-id")) || parseInt(Child.id.replace("people-", ""))
        if (!UserId) return

        const AvatarContainer = Child.getElementsByClassName("avatar-container")[0]
        if (!AvatarContainer) return

        function GetPlaceName(){
            const Existing = Child.getElementsByClassName("place-name")[0]
            if (Existing) return Existing

            const PlaceName = document.createElement("div")
            PlaceName.className = "text-overflow xsmall text-label place-name"
            Child.getElementsByClassName("friend-link")[0].appendChild(PlaceName)

            return PlaceName
        }

        let IsOffline = false

        async function UpdateStatus(){
            const FriendStatus = Child.getElementsByClassName("avatar-status friend-status")[0]
            if (!FriendStatus.className.includes("icon")){ //Offline
                if (IsOffline) return
                IsOffline = true

                const LastOnline = new Date(await BatchGetLastOnline(UserId))
                const PlaceName = GetPlaceName()

                while (IsOffline){
                    PlaceName.innerText = SecondsToLengthSingle((Date.now()/1000) - (LastOnline.getTime()/1000)) + " ago"
                    await sleep(500)
                }
            } else {
                IsOffline = false
            }
        }

        // new MutationObserver(function(Mutations){
        //     Mutations.forEach(function(Mutation){
        //         if (Mutation.type === "attributes"){
        //             if (Mutation.attributeName == "class"){
        //                 UpdateStatus()
        //             }
        //         }
        //     })
        // }).observe(FriendStatus, {attributes: true})

        let FriendStatus
        ChildAdded(AvatarContainer, true, function(Child){
            if (Child.className.includes("avatar-status friend-status")){
                FriendStatus = Child
                UpdateStatus()
            }
        })
        ChildRemoved(AvatarContainer, function(Child){
            if (Child == FriendStatus){
                FriendStatus = null
                UpdateStatus()
            }
        })

        UpdateStatus()
    })
})