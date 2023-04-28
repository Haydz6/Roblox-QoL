let ScannedInboxMessages

async function GetScannedInboxMessages(){
    if (ScannedInboxMessages) return

    const SavedInbox = await LocalStorage.get("ScannedInboxMessages")
    if (SavedInbox) ScannedInboxMessages = JSON.parse(SavedInbox)
    else ScannedInboxMessages = []
}

function SaveScannedInboxMessages(){
    if (!ScannedInboxMessages) return
    LocalStorage.set("ScannedInboxMessages", JSON.stringify(ScannedInboxMessages))
}

async function GetHeadshotThumbnailFromUserId(UserId){
    const [Success, Result] = await RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${UserId}&size=420x420&format=Png&isCircular=false`, "GET", undefined, undefined, true)

    if (!Success) return "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
    return Result.data[0].imageUrl
}

async function CheckForNewMessages(){
    if (!await IsFeatureEnabled("InboxNotifications")) return
    await GetScannedInboxMessages()

    const [Success, Result] = await RequestFunc("https://privatemessages.roblox.com/v1/messages?pageNumber=0&pageSize=20&messageTab=Inbox", "GET", undefined, undefined, true)

    if (!Success) return

    const Collection = Result.collection
    let FirstMessage
    let TotalNewMessages = 0

    const IgnoreSystemMessages = await IsFeatureEnabled("IgnoreSystemInboxNofitications")

    for (let i = 0; i < Collection.length; i++){
        const Message = Collection[i]
        if (ScannedInboxMessages.includes(Message.id)) continue
        ScannedInboxMessages.unshift(Message.id)
        if (Message.isRead || (IgnoreSystemMessages && Message.isSystemMessage)) continue

        FirstMessage = Message
        TotalNewMessages ++
    }

    if (ScannedInboxMessages.length > 50){
        ScannedInboxMessages.length = 50
    }

    SaveScannedInboxMessages()

    if (!FirstMessage) return

    QueueNotifications(null, {type: "basic",
    iconUrl: await GetHeadshotThumbnailFromUserId(FirstMessage.sender.id),
    title: FirstMessage.subject,
    message: FirstMessage.body,
    eventTime: new Date(FirstMessage.created).getTime(),
    contextMessage: `From ${FirstMessage.sender.name}` + (TotalNewMessages > 1 ? ` (${TotalNewMessages} new messages)` : "")})
}

setInterval(CheckForNewMessages, 60*1000)
CheckForNewMessages()