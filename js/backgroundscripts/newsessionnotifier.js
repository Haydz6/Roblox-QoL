let KnownSessions
const SessionButtonNotifications = {}
const UsedNotificationIds = {}

function GenerateNotificationId(Length){
    let Id = ""

    while (true){
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        const charactersLength = characters.length
        let counter = 0

        while (counter < Length) {
            Id += characters.charAt(Math.floor(Math.random() * charactersLength))
            counter += 1
        }

        if (!UsedNotificationIds[Id]) break
        Id = ""
    }

    return Id
}

async function GetSavedKnownSessions(){
    if (KnownSessions) return

    const SavedSessions = await LocalStorage.get("KnownSessions")
    if (SavedSessions){
        KnownSessions = JSON.parse(SavedSessions)
        return false
    } else {
        KnownSessions = {}
        return true
    }
}

function SaveKnownSessions(){
    LocalStorage.set("KnownSessions", JSON.stringify(KnownSessions))
}

function GetLocationFromSession(Session){
    let Location = ""
    if (Session.location?.city){
        Location = Session.location.city
    }
    if (Session.location?.subdivision){
        if (Location != "") Location += ", "
        Location += Session.location.subdivision
    }
    if (Session.location?.country){
        if (Location != "") Location += ", "
        Location += Session.location.country
    }
    if (Location == ""){
        Location = "Unknown Location"
    }
    return Location
}

async function LogoutSession(Session, TTS){
    const [Success, Result] = await RequestFunc("https://apis.roblox.com/token-metadata-service/v1/logout", "POST", {["Content-Type"]: "application/json"}, JSON.stringify({token: Session.token}), true, true)
    const Title = Success && "Logged out of session" || "Failed to log out of session"
    let Message = `${Success && "Logged" || "Failed to log"} out of session at ${GetLocationFromSession(Session)}\nRunning ${Session.agent?.value || "Unknown Browser"} on ${Session.agent?.os || "Unknown OS"}`
    if (!Success) Message += `\n${Result.status} ${Result.statusText}`

    chrome.notifications.create(null, {type: "basic", iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"), title: Title, message: Message, contextMessage: `IP: ${Session.lastAccessedIp || "Unknown"}`, eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)})

    if (TTS){
        chrome.tts.speak(Message.replace("\n", ". "))
    }
}

async function CheckForNewSessions(){
    const Enabled = await IsFeatureEnabled("NewLoginNotifier")
    if (!Enabled) return

    const IsFirstScan = await GetSavedKnownSessions()

    const [Success, Result] = await RequestFunc("https://apis.roblox.com/token-metadata-service/v1/sessions?nextCursor=&desiredLimit=500", "GET", null, null, true)

    if (!Success) return

    const NewSessions = []
    const NewKnownSessions = {}

    const Sessions = Result.sessions
    let CurrentIP

    for (let i = 0; i < Sessions.length; i++){
        const Session = Sessions[i]
        if (!KnownSessions[Session.token] && !Session.isCurrentSession){
            if (!Session.isCurrentSession) NewSessions.push(Session)
        }
        NewKnownSessions[Session.token] = true

        if (Session.isCurrentSession) CurrentIP = Session.lastAccessedIp
    }

    KnownSessions = NewKnownSessions
    SaveKnownSessions()
    if (!IsFirstScan && NewSessions.length > 0){
        const DisallowOtherIPs = await IsFeatureEnabled("DisallowOtherIPs")
        const TTSEnabled = await IsFeatureEnabled("NewLoginNotifierTTS")
        
        for (let i = 0; i < NewSessions.length; i++){
            const Session = NewSessions[i]

            if (DisallowOtherIPs){
                if (!CurrentIP || CurrentIP != Session.lastAccessedIp){
                    LogoutSession(Session, true)
                    await sleep(500)
                    continue
                }
            }

            const Location = GetLocationFromSession(Session)

            const NotificationId = GenerateNotificationId(50)
            const Buttons = [{title: "Logout"}]
            SessionButtonNotifications[NotificationId] = {session: Session, buttons: Buttons}

            chrome.notifications.create(NotificationId, {type: "basic", buttons: Buttons, iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"), title: "New Login for Roblox", message: `A new login has been detected at ${Location}\nRunning ${Session.agent?.value || "Unknown Browser"} on ${Session.agent?.os || "Unknown OS"}`, contextMessage: `IP: ${Session.lastAccessedIp || "Unknown"}`, eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)})
            if (TTSEnabled) chrome.tts.speak(`A new roblox login has been detected at ${Location}. Running ${Session.agent?.value || "Unknown Browser"} on ${Session.agent?.os || "Unknown OS"}`)
            
            await sleep(3000)
        }
    }
}

chrome.notifications.onButtonClicked.addListener(async function(NotificationId, ButtonIndex){
    const Notification = SessionButtonNotifications[NotificationId]
    if (!Notification) return

    const Button = Notification.buttons[ButtonIndex]
    if (Button.title === "Logout"){
        LogoutSession(Notification.session)
    }
})

chrome.notifications.onClicked.addListener(function(NotificationId){
    const Notification = SessionButtonNotifications[NotificationId]
    if (!Notification) return

    chrome.tabs.create({url: "https://www.roblox.com/my/account#!/security"})
})

chrome.notifications.onClosed.addListener(function(NotificationId, byUser){
    if (byUser){
        delete SessionButtonNotifications[NotificationId]
        delete TradeNotifications[NotificationId]
        delete UsedNotificationIds[NotificationId]
    }
})

CheckForNewSessions()
setInterval(CheckForNewSessions, 5*1000)