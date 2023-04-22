let KnownSessions
let IPFailedSessions = {}
const SessionButtonNotifications = {}
const UsedNotificationIds = {}
const QueuedNotifications = []
let IsCheckingQueuedNotifications = false

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

async function QueueNotifications(Id, Notification, TTS){
    if (ManifestVersion == 2) delete Notification.buttons
    if (!chrome.tts) TTS = undefined
    //Firefox does not support buttons nor TTS

    QueuedNotifications.push({Id: Id, Notification: Notification, TTS: TTS})

    if (!IsCheckingQueuedNotifications){
        IsCheckingQueuedNotifications = true

        while (QueuedNotifications.length > 0){
            const Queue = QueuedNotifications.splice(0, 1)[0]
            chrome.notifications.create(Queue.Id, Queue.Notification)
            if (Queue.TTS) chrome.tts.speak(Queue.TTS)

            await sleep(3000)
        }

        IsCheckingQueuedNotifications = false
    }
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

async function GetLocationFromSession(Session){
    const ShowStateAndCountryOnly = await IsFeatureEnabled("ShowStateAndCountryOnNewSessionOnly")

    let Location = ""
    if (Session.location?.city && !ShowStateAndCountryOnly){
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

function GetBrowserFromSession(Session){
    const Agent = Session.agent
    const Type = Agent?.type

    if (Agent?.value){
        return Agent?.value
    }

    if (Type == "Browser"){
        return "Unknown Browser"
    } else if (Type == "App"){
        return "Roblox App"
    } else if (Type == "Studio"){
        return "Roblox Studio"
    }
    
    return Type || "Unknown Browser"
}

async function LogoutSession(Session, TTS, LogoutCurrent){
    let Success, Result, Response

    if (!LogoutCurrent) [Success, Result, Response] = await RequestFunc("https://apis.roblox.com/token-metadata-service/v1/logout", "POST", {["Content-Type"]: "application/json"}, JSON.stringify({token: Session.token}), true, false)
    else [Success, Result, Response] = await RequestFunc("https://auth.roblox.com/v2/logout", "POST", undefined, undefined, true)

    if (!Success && !LogoutCurrent){
        if (Response?.status == 400 && Result?.errors?.[0]?.message == "attempting to invalidate current token"){
            LogoutSession(Session, TTS, true)
            return
        }
    }

    const ShowIP = await IsFeatureEnabled("ShowIPOnNewSession")

    const Title = Success && `Logged out of${LogoutCurrent && " current" || ""} session` || `Failed to log out of${LogoutCurrent && " current" || ""} session`
    let Message = `${Success && "Logged" || "Failed to log"} out of${LogoutCurrent && " current" || ""} session at ${await GetLocationFromSession(Session)}\nRunning ${GetBrowserFromSession(Session)} on ${Session.agent?.os || "Unknown OS"}`
    if (!Success) Message += `\n${Response?.status || "Unknown"} ${Response?.statusText || "Unknown"}`

    //chrome.notifications.create(null, {type: "basic", iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"), title: Title, message: Message, contextMessage: `IP: ${Session.lastAccessedIp || "Unknown"}`, eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)})

    // if (TTS){
    //     chrome.tts.speak(Message.replace("\n", ". "))
    // }

    QueueNotifications(null, {type: "basic",
    iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"),
    title: Title,
    message: Message,
    contextMessage: ShowIP && `IP: ${Session.lastAccessedIp || "Unknown"}` || "IP: HIDDEN (SETTINGS)",
    eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)}, TTS && Message.replace("\n", ". "))
}

async function FetchCurrentIP(){
    const [Success, Result] = await RequestFunc("https://api.ipify.org/?format=json", "GET")
    return Success && Result.ip
}

async function CheckForNewSessions(){
    const Enabled = await IsFeatureEnabled("NewLoginNotifier2")
    if (!Enabled) return

    const IsFirstScan = await GetSavedKnownSessions()

    const [Success, Result] = await RequestFunc("https://apis.roblox.com/token-metadata-service/v1/sessions?nextCursor=&desiredLimit=500", "GET", null, null, true)

    if (!Success) return

    const NewSessions = []
    const NewKnownSessions = {}

    const Sessions = Result.sessions
    let CurrentIP = await FetchCurrentIP() //We should be getting current IP from external web request to get true device ip
    //We should also ignore isCurrentSession as that will not help when a user gets their cookie stolen instead
    //Decided not to ignore isCurrentSession UNLESS it is a strict disallow check. If strict disallow is on, it will check ALL sessions and if own session does not match own IP, it logs it out which invalidates our cookie.
    //Add failsafe incase we cannot get current ip.

    for (let i = 0; i < Sessions.length; i++){
        const Session = Sessions[i]
        if (!KnownSessions[Session.token] && !Session.isCurrentSession){
            if (!Session.isCurrentSession) NewSessions.push(Session)
        }
        NewKnownSessions[Session.token] = true

        //if (Session.isCurrentSession) CurrentIP = Session.lastAccessedIp
    }
    
    if (CurrentIP){
        IPFailedSessions = {}
    }

    KnownSessions = NewKnownSessions
    SaveKnownSessions()

    const StrictlyDisallowOtherIPs = await IsFeatureEnabled("StrictlyDisallowOtherIPs")
    if (StrictlyDisallowOtherIPs && CurrentIP){
        for (let i = 0; i < Sessions.length; i++){
            const Session = Sessions[i]
            const SameIP = CurrentIP == Session.lastAccessedIp

            if (!SameIP) LogoutSession(Session, true)
        }
    }

    if (!IsFirstScan && NewSessions.length > 0){
        const DisallowOtherIPs = await IsFeatureEnabled("DisallowOtherIPs")
        const IgnoreSessionsFromSameIP = await IsFeatureEnabled("IgnoreSessionsFromSameIP")
        const TTSEnabled = await IsFeatureEnabled("NewLoginNotifierTTS2")
        const ShowIP = await IsFeatureEnabled("ShowIPOnNewSession")
        
        for (let i = 0; i < NewSessions.length; i++){
            const Session = NewSessions[i]
            const SameIP = CurrentIP && CurrentIP == Session.lastAccessedIp

            if (SameIP && IgnoreSessionsFromSameIP){
                continue
            }

            let ShouldNotify = IPFailedSessions[Session.token] != true
            if (!SameIP && DisallowOtherIPs){
                if (CurrentIP){
                    LogoutSession(Session, true)
                    continue
                } else {
                    delete KnownSessions[Session.token]
                    IPFailedSessions[Session.token] = true
                    SaveKnownSessions()
                }
            }
            if (!ShouldNotify) continue

            const Location = await GetLocationFromSession(Session)

            const NotificationId = GenerateNotificationId(50)
            const Buttons = [{title: "Logout"}]
            SessionButtonNotifications[NotificationId] = {session: Session, buttons: Buttons}

            //chrome.notifications.create(NotificationId, {type: "basic", buttons: Buttons, iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"), title: "New Login for Roblox", message: `A new login has been detected at ${Location}\nRunning ${GetBrowserFromSession(Session)} on ${Session.agent?.os || "Unknown OS"}`, contextMessage: `IP: ${Session.lastAccessedIp || "Unknown"}`, eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)})
            //if (TTSEnabled) chrome.tts.speak(`A new roblox login has been detected at ${Location}. Running ${GetBrowserFromSession(Session)} on ${Session.agent?.os || "Unknown OS"}`)
            QueueNotifications(NotificationId,
                {type: "basic",
                buttons: Buttons,
                iconUrl:
                chrome.runtime.getURL("img/icons/icon128x128.png"),
                title: "New Login for Roblox",
                message: `A new login has been detected at ${Location}\nRunning ${GetBrowserFromSession(Session)} on ${Session.agent?.os || "Unknown OS"}`,
                contextMessage: ShowIP && `IP: ${Session.lastAccessedIp || "Unknown"}` || "IP: HIDDEN (SETTINGS)",
                eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)},
                TTSEnabled && `A new roblox login has been detected at ${Location}. Running ${GetBrowserFromSession(Session)} on ${Session.agent?.os || "Unknown OS"}`)
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