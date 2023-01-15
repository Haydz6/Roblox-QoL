async function AddNamesToHistory(AllHistory){
    const IdsToFetch = []
    const IdToHistory = {}

    for (let i = 0; i < AllHistory.length; i++){
        const History = AllHistory[i]

        if (History.Name) continue

        IdsToFetch.push(History.Id)
        IdToHistory[History.Id] = History
    }

    if (IdsToFetch.length === 0) return

    const [Success, Result] = await RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: IdsToFetch, excludeBannedUsers: false}))

    if (!Success){
        for (const [Id, History] of Object.entries(IdToHistory)) {
            History.Name = "???"
            History.DisplayName = "???"
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        const History = IdToHistory[Info.id]

        History.Name = Info.name
        History.DisplayName = Info.displayName
        History.Verified = Info.hasVerifiedBadge

        delete IdToHistory[Info.id]
    }

    for (const [Id, History] of Object.entries(IdToHistory)) {
        History.DisplayName = "Terminated"
        History.Name = Id
    }
}

async function AddImagesToHistory(AllHistory){
    const Requests = []
    const IdToHistory = {}

    for (let i = 0; i < AllHistory.length; i++){
        const History = AllHistory[i]

        if (History.Image) continue

        IdToHistory[History.Id] = History

        Requests.push({
            requestId: History.Id,
            targetId: History.Id,
            type: 2,
            size: "150x150",
            format: "Png",
            isCircular: true
        })
    }

    if (Requests.length === 0) return

    const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", {"Content-Type": "application/json"}, JSON.stringify(Requests), true)

    if (!Success){
        for (const [Id, History] of Object.entries(IdToHistory)) {
            History.Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        const History = IdToHistory[Info.targetId]

        if (Info.state === "Completed") History.Image = Info.imageUrl
        else History.Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
    }
}

function CanUpdateHistory(){
    const LastTime = window.localStorage.getItem("robloxqol-lasthistoryupdate")
    const CurrentTime = Math.floor(Date.now()/1000)

    if (LastTime && CurrentTime-parseInt(LastTime) < 60){
        return false
    }

    window.localStorage.setItem("robloxqol-lasthistoryupdate", CurrentTime)
    return true
}

function CreateNotification(Friends, NewFriends, LostFriends){
    const Friend = Friends[0]
    let Message = `${Friend.Name} ${Friend.Type === "Lost" && "un" || ""}friended you!`

    if (Friends.length > 1){
        if (NewFriends > 0){
            Message = `${Message}\n${NewFriends} other friend(s) also friended you!`
        }
        if (LostFriends > 0){
            Message = `${Message}\n${NewFriends} other friend(s) also unfriended you!`
        }
    }

    chrome.runtime.sendMessage({type: "notification", notification: {
        type: "basic",
        iconUrl: Friend.Image,
        title: "Roblox",
        message: Message,
    }})
}

async function UpdateHistory(){
    if (!CanUpdateHistory()) return

    const [Success, Result] = await RequestFunc(`https://friends.roblox.com/v1/users/${UserId}/friends`, "GET", undefined, undefined, true)

    if (!Success) return

    const Friends = []
    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        Friends.push(Data[i].id)
    }

    const [UpdateSuccess, UpdateResult] = await RequestFunc(WebServerEndpoints.History+"update", "POST", undefined, JSON.stringify(Friends))

    if (!UpdateSuccess || !IsFeatureEnabled("FriendNotifications")) return

    const AllFriends = []
    let LostFriends = 0
    let NewFriends = 0

    for (let i = 0; i < UpdateResult.LostFriends.length; i++){
        LostFriends++
        AllFriends.push({Id: UpdateResult.LostFriends[i], Type: "Lost"})
    }

    for (let i = 0; i < UpdateResult.NewFriends.length; i++){
        NewFriends++
        AllFriends.push({Id: UpdateResult.NewFriends[i], Type: "New"})
    }

    if (AllFriends.length === 0) return

    await Promise.all([AddNamesToHistory(AllFriends), AddImagesToHistory(AllFriends)])

    CreateNotification(AllFriends, NewFriends, LostFriends)
}

async function Main(){
    while (!UserId) await sleep(100)

    UpdateHistory()
    setInterval(UpdateHistory, 60*1000)
}

Main()