let KnownSessions

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

async function CheckForNewSessions(){
    const Enabled = await IsFeatureEnabled("NewLoginNotifier")
    if (!Enabled) return

    const IsFirstScan = await GetSavedKnownSessions()

    const [Success, Result] = await RequestFunc("https://apis.roblox.com/token-metadata-service/v1/sessions?nextCursor=&desiredLimit=500", "GET", null, null, true)

    if (!Success) return

    const NewSessions = []
    const NewKnownSessions = {}

    const Sessions = Result.sessions
    for (let i = 0; i < Sessions.length; i++){
        const Session = Sessions[i]
        if (!KnownSessions[Session.token]){
            if (!Session.isCurrentSession) NewSessions.push(Session)
        }
        NewKnownSessions[Session.token] = true
    }

    KnownSessions = NewKnownSessions
    SaveKnownSessions()
    if (!IsFirstScan && NewSessions.length > 0){
        const TTSEnabled = await IsFeatureEnabled("NewLoginNotifierTTS")

        for (let i = 0; i < NewSessions.length; i++){
            const Session = NewSessions[i]
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

            chrome.notifications.create(null, {type: "basic", iconUrl: chrome.runtime.getURL("img/icons/icon128x128.png"), title: "New Login for Roblox", message: `A new login has been detected at ${Location}\nRunning ${Session.agent?.value || "Unknown Browser"} on ${Session.agent?.os || "Unknown OS"}`, contextMessage: `IP: ${Session.lastAccessedIp || "Unknown"}`, eventTime: Session.lastAccessedTimestampEpochMilliseconds && parseInt(Session.lastAccessedTimestampEpochMilliseconds)})
            if (TTSEnabled) chrome.tts.speak(`A new roblox login has been detected at ${Location}. Running ${Session.agent?.value || "Unknown Browser"} on ${Session.agent?.os || "Unknown OS"}`)
            
            await sleep(3000)
        }
    }
}

CheckForNewSessions()
setInterval(CheckForNewSessions, 10*1000)