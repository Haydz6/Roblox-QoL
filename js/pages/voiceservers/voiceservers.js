function CreateVoiceServer(PlaceId, Server){
    function CreateHeadshot(User){
        const Span = document.createElement("span")
        Span.className = "avatar avatar-headshot-md player-avatar"
        Span.innerHTML = `<span class="thumbnail-2d-container avatar-card-image"><img class="headshot-img"></span>`

        const Headshot = Span.getElementsByClassName("headshot-img")[0]

        if (typeof(User) === "string") Headshot.src = User
        else {
            Headshot.src = User.Token

            // const Mic = document.createElement("img")
            // Mic.src = chrome.runtime.getURL("/img/microphone.svg")
            // Mic.style = "width: 40%; height: 40%; position: absolute; right: 0; bottom: 0;"

            // if (User.IsMuted){
            //     Mic.style.filter = "invert(33%) sepia(77%) saturate(1610%) hue-rotate(331deg) brightness(107%) contrast(94%)"
            // } else {
            //     Mic.style.filter = "invert(38%) sepia(94%) saturate(1052%) hue-rotate(129deg) brightness(98%) contrast(101%)"
            // }

            Span.getElementsByClassName("thumbnail-2d-container")[0].style.backgroundColor = User.IsMuted ? "#f74a54" : "#2cb848"

            //Span.children[0].appendChild(Mic)
        }

        return Span
    }

    const Container = document.createElement("li")
    Container.className = "rbx-game-server-item col-md-3 col-sm-4 col-xs-6"
    Container.innerHTML = `<div class="card-item" style="min-height: 200px !important;"><div class="player-thumbnails-container"></div><div class="rbx-game-server-details game-server-details"><div class="text-info rbx-game-status rbx-game-server-status text-overflow">${Server.VoicePlayers} voice user${Server.VoicePlayers > 1 ? "s" : ""}<br>${parseInt(Server.Players)} of ${parseInt(Server.MaxPlayers)} people max</div><div class="server-player-count-gauge border"><div class="gauge-inner-bar border" style="width: ${(Server.Players/Server.MaxPlayers)*100}%;"></div></div><span data-placeid="${parseInt(PlaceId)}"><button type="button" class="btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width">Join</button></span></div></div></div>`

    Container.setAttribute("placeid", PlaceId)
    Container.setAttribute("jobid", Server.JobId)

    Container.getElementsByClassName("rbx-game-server-join")[0].setAttribute("onclick", `Roblox.GameLauncher.joinGameInstance(parseInt("${PlaceId}",10), "${Server.JobId}")`)

    const ThumbnailContainer = Container.getElementsByClassName("player-thumbnails-container")[0]

    function CreateHeadshots(Array){
        for (let i = 0; i < Array.length; i++){
            ThumbnailContainer.appendChild(CreateHeadshot(Array[i]))
        }
    }

    CreateHeadshots(Server.VoiceTokens)
    CreateHeadshots(Server.Tokens)
    if (Server.Players > 6){
        const Span = document.createElement("span")
        Span.className = "avatar avatar-headshot-md player-avatar hidden-players-placeholder"
        Span.innerText = `${Server.Players-5}+`
        ThumbnailContainer.appendChild(Span)
    }

    AddServerRegion(Container)

    return Container
}

async function UniverseHasVoiceChat(UniverseId){
    const [Success, Settings] = await RequestFunc(`https://voice.roblox.com/v1/settings/universe/${UniverseId}`, "GET", undefined, undefined, true)
    if (!Success) return false
    return Settings.isUniverseEnabledForVoice
}

setTimeout(function(){
    IsFeatureEnabled("VoiceChatServers").then(async function(Enabled){
        if (!Enabled) return
        if (!await UniverseHasVoiceChat(await GetUniverseIdFromGamePage())) return

        const [Container, List, NoServers, NoServersMessage] = CreateRecentServersList("Voice Chat Servers", "voice")
        const FriendsList = await WaitForId("rbx-friends-running-games")
        FriendsList.parentElement.insertBefore(Container, FriendsList)

        const Spinner = document.createElement("span")
        Spinner.className = "spinner spinner-default"
        List.appendChild(Spinner)

        const PlaceId = await GetPlaceIdFromGamePage()
        const UniverseId = await GetUniverseIdFromGamePage()
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Voice+"servers/"+UniverseId)

        Spinner.remove()

        if (!Success){
            NoServersMessage.innerText = Result?.Result || Result.status
            NoServers.style.display = ""
            return
        }

        if (Result.length == 0){
            NoServers.style.display = ""
            return
        }

        for (let i = 0; i < Result.length; i++){
            List.appendChild(CreateVoiceServer(PlaceId, Result[i]))
        }
    })
}, 0)