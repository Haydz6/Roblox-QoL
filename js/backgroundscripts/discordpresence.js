let DiscordToken
let DiscordInfo
let DiscordLoggedIn = false
let DiscordWS

async function GetDiscordToken(){
    if (DiscordToken) return DiscordToken

    DiscordToken = await LocalStorage.get("DiscordToken")
    return DiscordToken
}

async function CloseDiscord(){
    if (DiscordWS){
        await DiscordWS.close(1000)
        DiscordWS = null
    }
}

async function GetPlaceInfo(PlaceId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${PlaceId}`, "GET", null, null, true)

    if (!Success) return [false]
    return [true, Result[0]]
}

async function GetUniverseInfo(UniverseId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${UniverseId}`, "GET", null, null, true)

    if (!Success) return [false]
    return [true, Result.data[0]]
}

async function GetUniverseThumbnail(UniverseId){
    const [Success, Result] = await RequestFunc(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${UniverseId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`, "GET", null, null, true)
    if (!Success) return "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/512/512/Image/Png"
    return Result.data[0]?.imageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/512/512/Image/Png"
}

async function ImageUrlToExternalDiscord(ImageUrl){
    const [Success, Result] = await RequestFunc("https://canary.discord.com/api/v9/applications/1105722413905346660/external-assets", "POST", {"Content-Type": "application/json", "Authorization": DiscordToken}, JSON.stringify({urls: [ImageUrl]}))

    if (!Success) return "1105722509627772958"
    return "mp:"+Result[0].external_asset_path
}

function HasPermissionsForDiscord(){
    return new Promise((resolve) => {
        chrome.permissions.contains({origins: ["https://www.discord.com/"]}, function(Result){
            resolve(Result)
        })
    })
}

async function OpenDiscord(Resume){
    if (!await IsFeatureEnabled("DiscordPresence") || !await HasPermissionsForDiscord() || ExternalDiscordLoggedIn || (!Resume && (DiscordLoggedIn || !await GetDiscordToken()))) return

    const ws = new WebSocket(Resume?.url || "wss://gateway.discord.gg/?v=10&encoding=json")
    DiscordWS = ws

    function Send(Payload){
        if (typeof(Payload) == "object"){
            ws.send(JSON.stringify(Payload))
        } else {
            ws.send(Payload)
        }
    }

    async function Login(){
        Send({
            "op": 2,
            "d": {
              "token": DiscordToken,
              "properties": {
                "os": "Windows",
                "browser": "Discord Client"
              },
            }
        })
    }

    let PlaceId = 0
    let UniverseId = 0
    let JobId = ""
    let InGame = false
    let StartedPlaying = 0
    let LastJoinButtonState = await IsFeatureEnabled("DiscordPresenceJoin")

    async function UpdatePresence(){
        let JoinButtonEnabled = await IsFeatureEnabled("DiscordPresenceJoin")

        if (LastPlaceId != PlaceId || LastJobId != JobId || (LastPlaceId != 0 && JoinButtonEnabled != LastJoinButtonState)){
            LastJoinButtonState = JoinButtonEnabled
            if (!LastInGame || LastPlaceId == 0){
                JobId = LastJobId
                PlaceId = LastPlaceId
                UniverseId = LastUniverseId
                InGame = LastInGame

                Send({
                    "op": 3,
                    "d": {
                        "since": StartedPlaying,
                        "activities": [],
                        "status": "online",
                        "afk": false
                    }
                })
                return
            }

            const [Success, Result] = await GetUniverseInfo(LastUniverseId)
            if (!Success) return

            if (LastUniverseId != UniverseId) StartedPlaying = Date.now()
            JobId = LastJobId
            PlaceId = LastPlaceId
            UniverseId = LastUniverseId
            InGame = LastInGame

            const ThumbnailURL = await ImageUrlToExternalDiscord(await GetUniverseThumbnail(UniverseId))
            let GameName = Result.name
            const OwnerName = Result.creator.name
            const IsVerified = Result.creator.hasVerifiedBadge

            if (GameName.length < 2) {
                GameName = GameName+"\x2800\x2800\x2800" //Fix from github.com/pizzaboxer/bloxstrap/blob/main/Bloxstrap/Integrations/DiscordRichPresence.cs
            }

            const Buttons = ["View Game"]
            const ButtonUrls = [`https://www.roblox.com/games/${PlaceId}`]
            if (JoinButtonEnabled){
                Buttons.unshift("Join")
                ButtonUrls.unshift(`roblox://experiences/start?placeId=${PlaceId}&gameInstanceId=${JobId}`)
            }

            Send({
                "op": 3,
                "d": {
                    "since": StartedPlaying,
                    "activities": [{
                        "name": "Roblox",
                        "type": 0,
                        "instance": true,
                        "created_at": StartedPlaying,
                        "application_id": "1105722413905346660",
                        "details": GameName,
                        "buttons": Buttons,
                        "metadata": {"button_urls": ButtonUrls},
                        "state": `by ${OwnerName}${IsVerified ? " ☑️" : ""}`,
                        "assets": {
                                    "large_text": GameName,
                                    "large_image": ThumbnailURL,
                                    "small_image": "1105722508038115438",
                                    "small_text": "Roblox"
                                },
                        "timestamps": {
                            "start": StartedPlaying
                        },
                    }],
                    "status": "online",
                    "afk": false
                }
            })
        }
    }

    let HeartbeatId
    let HeartbeatTimeoutId
    let UpdatePresenceId
    let LastSequence
    let ShouldReconnect = false
    let SessionId
    let ResumeGatewayURL
    let SelfClose = false

    function Heartbeat(){
        Send({"op": 1, "d": LastSequence})
    }

    function Close(){
        SelfClose = true
        ws.close(1000)
    }

    ws.onmessage = async function(Message){
        const Result = JSON.parse(Message.data)
        if (Result.op == 0 && Result.t == "READY"){
            ResumeGatewayURL = Result.d.resume_gateway_url
            SessionId = Result.d.session_id

            const User = Result.d.user
            DiscordInfo = {Id: User.id, Avatar: User.avatar, Name: User.username, Discriminator: User.discriminator}
        } else if (Result.op == 9 && Result.d == false){
            Close()
        } else if (Result.op == 10){
            HeartbeatTimeoutId = setTimeout(function(){
                if (!HeartbeatTimeoutId) return

                HeartbeatId = setInterval(Heartbeat, Result.d.heartbeat_interval)
                Heartbeat()
            }, Result.d.heartbeat_interval * Math.random())
        } else if (Result.op == 1){
            Heartbeat()
        } else if (Result.op == 7 || (Result.op == 9 && Result.d == true)){
            ShouldReconnect = true
        }
        if (Result.s) LastSequence = Result.s
    }

    ws.onopen = async function(){
        if (Resume){
            Send({
                op: 6,
                d: {
                    token: Resume.token,
                    session_id: Resume.session_id,
                    seq: Resume.seq
                }
            })
        }

        DiscordLoggedIn = true
        await Login()

        UpdatePresenceId = setInterval(UpdatePresence, 5*1000)
    }

    const ReconnectCodes = [4000, 4001, 4002, 4003, 4005, 4007, 4008, 4009]
    ws.onclose = async function(event){
        DiscordInfo = null
        if (UpdatePresenceId){
            clearInterval(UpdatePresenceId)
            UpdatePresenceId = null
        }
        if (HeartbeatTimeoutId){
            clearTimeout(HeartbeatTimeoutId)
            HeartbeatTimeoutId = null
        }
        if (HeartbeatId){
            clearInterval(HeartbeatId)
            HeartbeatId = null
        }
        if (!SelfClose && (ShouldReconnect || !event.code || ReconnectCodes.includes(event.code))){
            await sleep(1000)
            OpenDiscord({url: ResumeGatewayURL, token: DiscordToken, session_id: SessionId, seq: LastSequence})
            return
        }

        await sleep(1000*10)
        DiscordLoggedIn = false
        OpenDiscord()
    }
}

BindToOnMessage("DiscordPresenceNewTab", false, function(){
    chrome.tabs.create({url: chrome.runtime.getURL("html/discordpresencerequest.html")})
})

BindToOnMessage("DiscordPresencePermitted", true, function(){
    return HasPermissionsForDiscord()
})

BindToOnMessage("NewDiscordToken", false, function(Result){
    if (Result.token != DiscordToken){
        DiscordToken = Result.token
        DiscordInfo = null
        LocalStorage.set("DiscordToken", DiscordToken)

        CloseDiscord().then(async function(){
            await sleep(1000*2)
            OpenDiscord()
        })
    }
})

BindToOnMessage("GetDiscordInfo", false, function(){
    if (DiscordInfo) return DiscordInfo
    if (ExternalDiscordLoggedIn) return false
})

setTimeout(OpenDiscord, 1000)