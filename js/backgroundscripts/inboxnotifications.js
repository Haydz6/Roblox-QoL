let ScannedInboxMessages

async function GetScannedInboxMessages(){
    if (ScannedInboxMessages) return

    const SavedInbox = await LocalStorage.get("ScannedInboxMessages")
    if (SavedInbox) ScannedInboxMessages = JSON.parse(SavedInbox)
    else ScannedInboxMessages = []

    return SavedInbox == null
}

function SaveScannedInboxMessages(){
    if (!ScannedInboxMessages) return
    LocalStorage.set("ScannedInboxMessages", JSON.stringify(ScannedInboxMessages))
}

async function CheckForNewMessages(){
    if (!await IsFeatureEnabled("InboxNotifications")) return
    const FirstLoad = await GetScannedInboxMessages()

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

    if (!FirstMessage || FirstLoad) return

    QueueNotifications(null, {type: "basic",
    iconUrl: await GetHeadshotBlobFromUserId(FirstMessage.sender.id),
    title: FirstMessage.subject,
    message: FirstMessage.body,
    eventTime: new Date(FirstMessage.created).getTime(),
    contextMessage: `Message from ${FirstMessage.sender.name}` + (TotalNewMessages > 1 ? ` (${TotalNewMessages}${TotalNewMessages >= 20 ? "+" : ""} new messages)` : "")})
}

setInterval(CheckForNewMessages, 60*1000)
CheckForNewMessages()