function CreateRecentServersList(){
    const Container = document.createElement("div")
    Container.id = "rbx-recent-running-games"
    Container.className = "stack server-list-section"

    const ContainerHeader = document.createElement("div")
    ContainerHeader.className = "container-header"
    ContainerHeader.style = "cursor: pointer;"

    const Minimize = document.createElement("span")
    Minimize.className = "icon-up-16x16"
    Minimize.style = "margin-left: 3px;"

    const ServerList = document.createElement("ul")
    ServerList.className = "card-list rbx-friends-game-server-item-container"
    ServerList.id = "rbx-recent-game-server-item-container"

    let Opened = true
    ContainerHeader.addEventListener("click", function(){
        Opened = !Opened
        Minimize.className = `icon-${Opened ? "up" : "down"}-16x16`
        ServerList.style.display = Opened ? "" : "none"
    })

    Container.appendChild(ContainerHeader)

    const ServerListContainerHeader = document.createElement("div")
    ServerListContainerHeader.className = "server-list-container-header"

    ContainerHeader.appendChild(ServerListContainerHeader)

    const Header = document.createElement("h2")
    Header.className = "server-list-header"
    Header.innerText = "Recent Servers"

    ServerListContainerHeader.append(Header, Minimize)

    //////

    const NoServersContent = document.createElement("div")
    NoServersContent.className = "section-content-off empty-game-instances-container"
    NoServersContent.style = "display: none;"

    Container.appendChild(NoServersContent)

    const NoServersMessage = document.createElement("p")
    NoServersMessage.className = "no-servers-message"
    NoServersMessage.innerText = "No Servers Found."

    NoServersContent.appendChild(NoServersMessage)

    Container.appendChild(ServerList)

    return [Container, ServerList, NoServersContent]
}

function CreateRecentServerBox(PlaceId, JobId, ServerUserId, LastPlayed){
    const ServerItem = document.createElement("li")
    ServerItem.className = "rbx-game-server-item col-md-3 col-sm-4 col-xs-6"
    ServerItem.setAttribute("placeid", PlaceId)
    ServerItem.setAttribute("jobid", JobId)

    ServerItem.setAttribute("data-placeid", PlaceId) //ROPRO INVITE SUPPORT
    ServerItem.setAttribute("data-gameid", JobId) //ROPRO INVITE SUPPORT

    const CardItem = document.createElement("div")
    CardItem.className = "card-item"
    CardItem.style = "min-height: 200px!important;"
    //CardItem.style.border = "1px solid #17e84b"

    const PlayerThumbnailsContainer = document.createElement("div")
    PlayerThumbnailsContainer.className = "player-thumbnails-container"

    CardItem.appendChild(PlayerThumbnailsContainer)

    const HeadshotItem = document.createElement("a")
    HeadshotItem.className = "avatar avatar-headshot-md player-avatar"
    HeadshotItem.href = `https://www.roblox.com/users/${ServerUserId}/profile`

    const ThumbnailContainer = document.createElement("span")
    ThumbnailContainer.className = "thumbnail-2d-container avatar-card-image"

    const Image = document.createElement("img")

    ThumbnailContainer.appendChild(Image)
    HeadshotItem.appendChild(ThumbnailContainer)
    PlayerThumbnailsContainer.appendChild(HeadshotItem)

    const ServerDetailsItem = document.createElement("div")
    ServerDetailsItem.className = "rbx-game-server-details game-server-details"

    const PlayerCountItem = document.createElement("div")
    PlayerCountItem.className = "text-info rbx-game-status rbx-game-server-status text-overflow"
    PlayerCountItem.textContent = `Last played ${SecondsToLength((Date.now()/1000)-LastPlayed, true)} ago`
    PlayerCountItem.style = "height: auto!important; overflow: visible!important; white-space: break-spaces!important;"
    ServerDetailsItem.appendChild(PlayerCountItem)

    const JoinButtonContainer = document.createElement("span")
    JoinButtonContainer.setAttribute("placeid", PlaceId)

    const JoinButton = document.createElement("button")
    JoinButton.type = "button"
    JoinButton.className = "btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width"
    JoinButton.textContent = "Join"
    JoinButtonContainer.appendChild(JoinButton)

    ServerDetailsItem.appendChild(JoinButtonContainer)

    CardItem.appendChild(ServerDetailsItem)

    ServerItem.appendChild(CardItem)

    // if (Server.Region){
    //     CreateServerInfo(ServerItem, Server)
    // }
    AddServerRegion(ServerItem)

    JoinButton.setAttribute("onclick", `Roblox.GameLauncher.joinGameInstance(parseInt("${PlaceId}",10), "${JobId}")`)

    return [ServerItem, Image]
}