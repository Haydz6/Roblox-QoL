async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                   

    // hash the message
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

let LastVoiceServerUpdate = 0

async function FindVoiceServer(PlaceId, JobId, ScanTime){
    let Cursor = ""
    let Scans = 0
    let Duration = Date.now()

    while (true){
        const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/${PlaceId}/servers/0?limit=100&cursor=${Cursor}`, "GET", undefined, undefined, true)
        if (!Success) return

        for (let i = 0; i < Result.data.length; i++){
            const Server = Result.data[i]
            if (Server.id === JobId){
                return Server
            }
        }

        Cursor = Result.nextPageCursor
        Scans++
        if (!Cursor || Scans >= 50 || (Date.now()-Duration)/1000 >= ScanTime) return
    }
}

async function UniverseHasVoiceChat(UniverseId){
    const [Success, Settings] = await RequestFunc(`https://voice.roblox.com/v1/settings/universe/${UniverseId}`, "GET", undefined, undefined, true)
    if (!Success) return false
    return Settings.isUniverseEnabledForVoice
}

async function UpdateVoiceServer(UserId, AuthKey, UniverseId, RootPlaceId, PlaceId, JobId){
    if (!await IsFeatureEnabled("VoiceChatServerAnalytics")) return
    if (!UniverseId || !RootPlaceId || !PlaceId || !JobId || RootPlaceId !== PlaceId) return
    if (Date.now()/1000 - LastVoiceServerUpdate < 60) return
    LastVoiceServerUpdate = Date.now()/1000

    if (!await UniverseHasVoiceChat(UniverseId)) return

    const [GameSuccess, GameInfo] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${UniverseId}`, "GET", undefined, undefined, true)
    if (!GameSuccess) return

    const [Success, Settings] = await RequestFunc("https://voice.roblox.com/v1/settings", "GET", undefined, undefined, true)
    if (!Success) return
    if (UserId !== await GetCurrentUserId()) return
    if (!Settings.isVoiceEnabled || Settings.isBanned) return

    const ChannelId = `game_${UniverseId}_${PlaceId}_${JobId}_default`
    let InfoSuccess, Info

    [InfoSuccess, Info] = await RequestFunc(`https://voice.roblox.com/v1/calls/${ChannelId}/users`, "GET", undefined, undefined, true)
    if (!InfoSuccess) return

    const VoiceUsers = []
    for (let i = 0; i < Info.publishers.length; i++){
        const User = Info.publishers[i]
        VoiceUsers.push({UserId: User.userId, IsMuted: User.isMuted})
    }

    VoiceUsers.push({UserId: UserId, IsMuted: Info.ownState ? Info.ownState.isMuted : true})

    const ServerInformation = {Users: VoiceUsers, Players: VoiceUsers.length, Tokens: [], MaxPlayers: GameInfo.maxPlayers || -1, Timestamp: Date.now()}

    //const LookupStart = Date.now()
    const Server = await FindVoiceServer(PlaceId, JobId, 50)
    if (Server){
        ServerInformation.Tokens = Server.playerTokens
        ServerInformation.Players = Server.playing
        ServerInformation.MaxPlayers = Server.maxPlayers
    }

    RequestFunc(WebServerEndpoints.Voice+"server/"+ChannelId, "POST", {"Content-Type": "application/json", Authentication: AuthKey}, JSON.stringify(ServerInformation), false, true).then(function(){
        LastVoiceServerUpdate = Date.now()/1000
    })
}