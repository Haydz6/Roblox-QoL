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

async function CheckForNewMessages(){
    if (!await IsFeatureEnabled("InboxNotifications")) return
    await GetScannedInboxMessages()

    const [Success, Result] = await RequestFunc("https://privatemessages.roblox.com/v1/messages?pageNumber=0&pageSize=20&messageTab=Inbox", "GET", undefined, undefined, true)

    if (!Success) return

    const Collection = Result.collection
    let FirstMessage
    let TotalNewMessages = 0

    const AllowSystemMessages = await IsFeatureEnabled("SystemInboxNofitications")

    for (let i = 0; i < Collection.length; i++){
        const Message = Collection[i]
        if (ScannedInboxMessages.includes(Message.id)) continue
        ScannedInboxMessages.unshift(Message.id)
        if (Message.isRead || (!AllowSystemMessages && Message.isSystemMessage)) continue

        FirstMessage = Message
        TotalNewMessages ++
    }

    if (ScannedInboxMessages.length > 50){
        ScannedInboxMessages.length = 50
    }

    SaveScannedInboxMessages()

    if (!FirstMessage) return

    QueueNotification(null, {type: "basic",
    iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"),
    title: `Message from ${Message.sender.name}: ${Message.subject}` + TotalNewMessages > 1 ? ` and ${TotalNewMessages-1} others` : "",
    message: Message.body,
    eventTime: new Date(Message.created).getTime()})
}

setInterval(CheckForNewMessages, 60*1000)
CheckForNewMessages()