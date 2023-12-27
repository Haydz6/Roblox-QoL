let LastFriendRequestSent
let IsTryingSave = 0

async function SaveLastFriendRequestSent(AuthKey){
    IsTryingSave++
    const Cache = IsTryingSave

    while (Cache === IsTryingSave){
        const [Success] = await RequestFunc(WebServerEndpoints.Friends+"requests", "POST", {"Content-Type": "application/json", AuthKey: AuthKey}, JSON.stringify({Timestamp: LastFriendRequestSent}))
        if (Success) break
        await sleep(5000)
    }
}

async function CheckForNewFriendRequests(){
    if (!await IsFeatureEnabled("FriendRequestNotifications") || !chrome.notifications?.create) return
    
    const AuthKey = await GetAuthKey()
    if (!AuthKey) return

    if (!LastFriendRequestSent){
        const [Success, Body] = await RequestFunc(WebServerEndpoints.Friends+"requests", "GET", {Authentication: AuthKey})
        if (!Success) return
        LastFriendRequestSent = Body.Timestamp
    }

    const [Success, Body] = await RequestFunc("https://friends.roblox.com/v1/my/friends/requests?limit=25&sortOrder=Desc", "GET", null, null, true)
    if (!Success) return

    const Data = Body.data
    const NewRequests = []

    let LatestRequest

    for (let i = 0; i < Data.length; i++){
        const Request = Data[i]
        const Time = Math.floor((new Date(Request.friendRequest.sentAt)).getTime()/1000)

        if (Time > LastFriendRequestSent){
            NewRequests.push(Request)
            if (!LatestRequest || Time > LatestRequest) LatestRequest = Time
        }
    }

    if (NewRequests.length === 0) return
    LastFriendRequestSent = Math.floor(LatestRequest) + 1

    SaveLastFriendRequestSent(AuthKey)

    let NotificationMessage
    const FirstRequest = NewRequests[0]

    if (NewRequests.length > 1){
        NotificationMessage = `${FirstRequest.name} and ${NewRequests.length-1} other${NewRequests.length > 2 ? "s" : ""} sent you a friend request!`
    } else {
        NotificationMessage = `${FirstRequest.name} sent you a friend request!`
    }

    chrome.notifications.create(null, {type: "basic", priority: 2, eventTime: LastFriendRequestSent*1000, iconUrl: await GetHeadshotBlobFromUserId(FirstRequest.id), title: "New friend request", message: NotificationMessage})
}

setInterval(CheckForNewFriendRequests, 60*1000)
CheckForNewFriendRequests()