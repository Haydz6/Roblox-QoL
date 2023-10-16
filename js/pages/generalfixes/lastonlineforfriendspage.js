IsFeatureEnabled("FriendsPageLastOnline").then(async function(Enabled){
    if (!Enabled) return

    let Requests = []
    function GetLastOnline(UserId){
        return new Promise(async(resolve) => {
            Requests.push({resolve: resolve, id: UserId})
            if (Requests.length !== 1) return

            await sleep(100)
            const AllRequests = Requests
            Requests = []

            const UserIds = []
            const IdToResolve = {}
            for (let i = 0; i < AllRequests.length; i++){
                const Request = AllRequests[i]
                UserIds.push(Request.id)
                IdToResolve[Request.id] = Request.resolve
            }

            const [Success, Result] = await RequestFunc("https://presence.roblox.com/v1/presence/last-online", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: UserIds}), true)
            if (!Success){
                for (let i = 0; i < AllRequests.length; i++){
                    AllRequests[i].resolve()
                }
                return
            }

            const Data = Result.lastOnlineTimestamps
            for (let i = 0; i < Data.length; i++){
                const Presence = Data[i]
                IdToResolve[Presence.userId](Presence.lastOnline)
            }
        })
    }

    ChildAdded(await WaitForClass("rbx-tab-content"), true, async function(Tab){
        const List = await WaitForClassPath(Tab, "hlist")

        ChildAdded(List, true, async function(Card){
            function IsOnline(){
                const Statuses = Card.getElementsByClassName("avatar-status")
                return Statuses[0].children.length !== 0
            }

            if (IsOnline()) return

            const Labels = Card.getElementsByClassName("avatar-card-caption")[0].children[0].getElementsByClassName("avatar-card-label")
            const OfflineLabel = Labels[Labels.length-1]
            if (!OfflineLabel) return

            const Timestamp = await GetLastOnline(parseInt(Card.id))
            if (!Timestamp || IsOnline()) return

            const LastOnline = new Date(Timestamp)
            OfflineLabel.innerText += ` - ${SecondsToLengthSingle((Date.now()/1000) - (LastOnline.getTime()/1000)) + " ago"}`
        })
    })
})