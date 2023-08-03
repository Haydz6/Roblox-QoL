let ExternalDiscordLoggingIn = false
let ExternalDiscordLoggedIn = false
let ExternalDiscordWS
let ExternalDiscordInfo

function UpdateExternalDiscordCookie(Cookie){
    if (ExternalDiscordLoggedIn){
        ExternalDiscordWS.send(JSON.stringify({Authentication: Cookie}))
    }
}

//This does not collect user data. This just connects to an external program to talk to discord for game presence as discord does not allow websocket connections at all,
//so an external program is used to convert the websocket to IPC which is what discord uses.
//Additionally this feature is off by default and shown by the IsFeatureEnabled function, will not try and sort of websocket connections by default

async function OpenExternalDiscord(Tries){
    if (!await IsFeatureEnabled("ExternalDiscordPresence") || ExternalDiscordLoggedIn || ExternalDiscordLoggingIn) return

    if (!Tries) Tries = 0
    ExternalDiscordWS = new WebSocket("ws://localhost:"+(9300+Tries)+"/presence")
    
    if (!ExternalDiscordWS){
        return
    }
    ExternalDiscordLoggingIn = true

    function Send(Payload){
        if (typeof(Payload) == "object"){
            ExternalDiscordWS.send(JSON.stringify(Payload))
        } else {
            ExternalDiscordWS.send(Payload)
        }
    }

    let PlaceId = 0
    let UniverseId = 0
    let JobId = ""
    let InGame = false
    let StartedPlaying = 0
    let LastJoinButtonState = await IsFeatureEnabled("DiscordPresenceJoin")

    let LastPresence

    async function UpdatePresence(){
        let JoinButtonEnabled = await IsFeatureEnabled("DiscordPresenceJoin")

        if (LastInGame != InGame || LastPlaceId != PlaceId || LastJobId != JobId || (LastPlaceId != 0 && JoinButtonEnabled != LastJoinButtonState)){
            LastJoinButtonState = JoinButtonEnabled
            if (!LastInGame || LastPlaceId == 0){
                JobId = LastJobId
                PlaceId = LastPlaceId
                UniverseId = LastUniverseId
                InGame = LastInGame

                Send({})
                return
            }

            const [Success, Result] = await GetUniverseInfo(LastUniverseId)
            if (!Success) return

            if (LastUniverseId != UniverseId) StartedPlaying = new Date().toISOString()
            JobId = LastJobId
            PlaceId = LastPlaceId
            UniverseId = LastUniverseId
            InGame = LastInGame

            const ThumbnailURL = await GetUniverseThumbnail(UniverseId)
            let GameName = Result.name
            const OwnerName = Result.creator.name
            const IsVerified = Result.creator.hasVerifiedBadge

            if (GameName.length < 2) {
                GameName = GameName+"\x2800\x2800\x2800" //Fix from github.com/pizzaboxer/bloxstrap/blob/main/Bloxstrap/Integrations/DiscordRichPresence.cs
            }

            const Buttons = [{Label: "View Game", Url: `https://www.roblox.com/games/${PlaceId}`}]
            if (JoinButtonEnabled){
                Buttons.unshift({Label: "Join", Url: `roblox://experiences/start?placeId=${PlaceId}&gameInstanceId=${JobId}`})
            }

            LastPresence = {
                Activity: {
                        Details: GameName,
                        Buttons: Buttons,
                        State: `by ${OwnerName}${IsVerified ? " ☑️" : ""}`,
                        LargeText: GameName,
                        LargeImage: ThumbnailURL,
                        SmallImage: "https://cdn.discordapp.com/app-assets/1105722413905346660/1105722508038115438.png",
                        SmallText: "Roblox",
                        Timestamps: {
                            Start: StartedPlaying
                        },
                    },
                PlaceId: PlaceId,
                JobId: JobId
            }

            Send(LastPresence)
        }
    }

    let PresenceIntervalId
    ExternalDiscordWS.onopen = function(){
        ExternalDiscordLoggedIn = true
        ExternalDiscordLoggingIn = false
        PresenceIntervalId = setInterval(UpdatePresence, 5*1000)
        ExternalDiscordWS.send(JSON.stringify({Authentication: ROBLOSECURITY}))
        CloseDiscord()
    }

    ExternalDiscordWS.onclose = function(err){
        if (PresenceIntervalId){
            clearInterval(PresenceIntervalId)
            PresenceIntervalId = null
        }

        ExternalDiscordLoggingIn = false
        ExternalDiscordLoggedIn = false
        ExternalDiscordWS = null
        ExternalDiscordInfo = null

        if (err.code === 1006 && Tries <= 4) return OpenExternalDiscord(Tries + 1)
    }

    ExternalDiscordWS.onmessage = function(Message){
        let Result
        try {
            Result = JSON.parse(Message.data)
        } catch {}

        console.log(Result)

        if (!Result?.Type) return //Heartbeat
        if (Result.Type == "Timestamp"){
            InGame = true
            PlaceId = Result.PlaceId
            UniverseId = Result.UniverseId
            JobId = Result.JobId
            StartedPlaying = new Date(Result.Timestamp).toISOString()
        } else if (Result.Type == "Authentication"){
            ExternalDiscordInfo = Result.User
            if (LastPresence) Send(LastPresence)
        }
    }
}

function CloseExternalDiscord(){
    if (ExternalDiscordWS) ExternalDiscordWS.close(1000)
}

OpenExternalDiscord()
setInterval(OpenExternalDiscord, 10*1000)

BindToOnMessage("GetExternalDiscordInfo", false, function(){
    if (ExternalDiscordInfo) return ExternalDiscordInfo
    return ExternalDiscordLoggedIn
})