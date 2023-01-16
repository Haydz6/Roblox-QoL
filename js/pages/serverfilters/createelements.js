function CreateHeaderAndValueForHover(HoverElement, HeaderText, ValueText){
    const Header = document.createElement("div")
    Header.className = "text-info rbx-game-status rbx-game-server-status text-overflow"
    Header.style = "font-size: 12px; margin-bottom: 0px; margin-top: 10px; text-align: center; font-weight: bold;"

    const Value = document.createElement("div")
    Value.className = "text-info rbx-game-status rbx-game-server-status text-overflow"
    Value.style = "font-size: 12px; margin-bottom: 0px; margin-top: 10px; margin-top: 3px; text-align: center;"

    Header.innerText = HeaderText
    Value.innerText = ValueText

    HoverElement.appendChild(Header)
    HoverElement.appendChild(Value)
}

function CreateInfoDiv(){
    const HoverElement = document.createElement("li")
    HoverElement.className = "width: 150px; height: 150px; position:absolute; z-index: 5; background-color: #191919; bottom: 82px; display: block; border-radius: 12px;"

    return HoverElement
}

function CreateServerInfo(Element, Server){
    if (Element.getAttribute("has-region-set")) return

    Element.setAttribute("has-region-set", true)

    const RegionContainer = document.createElement("div")
    RegionContainer.className = "text-info rbx-game-status rbx-game-server-status text-overflow"
    RegionContainer.style = "font-size: 12px; margin-bottom: 0px; margin-top: 10px; overflow: visible; position: relative;"
    
    const RegionLabel = document.createElement("p")
    RegionLabel.style = "font-size: 12px; overflow: hidden; text-overflow: ellipsis;"
    RegionLabel.innerText = Server.Region

    const InfoList = Element.getElementsByTagName("div")[0].getElementsByTagName("div")[1]

    new Promise(async() => {
        while (true){
            let Span

            const children = InfoList.children
            for (let i = 0; i < children.length; i++){
                if (children[i].tagName.toLowerCase() === "span"){
                    Span = children[i]
                    break
                }
            }

            if (!Span){
                await sleep(50)
                continue
            }

            InfoList.insertBefore(RegionContainer, Span)
            break
        }
    })

    const HoverElement = document.createElement("li")

    function SetVisibility(Visible){
        HoverElement.style = `width: 150px; height: 150px; position:absolute; z-index: 5; background-color: #191919; bottom: 24px; display: block; border-radius: 12px;${!Visible && " display:none;" || ""}`
    }

    CreateHeaderAndValueForHover(HoverElement, "Server Region", Server.Region)
    CreateHeaderAndValueForHover(HoverElement, "Uptime", SecondsToLength((Date.now()/1000)-Server.CreatedTimestamp))
    CreateHeaderAndValueForHover(HoverElement, "Version Date", TimestampToDate(Server.Version, false))

    SetVisibility(false)

    let RegionLabelHovered = false
    let HoverElementHovered = false

    function UpdateVisiblity(){
        SetVisibility(RegionLabelHovered || HoverElementHovered)
    }

    RegionLabel.addEventListener("mouseenter", function(){
        RegionLabelHovered = true
        UpdateVisiblity()
    })

    RegionLabel.addEventListener("mouseleave", function(){
        RegionLabelHovered = false
        UpdateVisiblity()
    })

    HoverElement.addEventListener("mouseenter", function(){
        HoverElementHovered = true
        UpdateVisiblity()
    })

    HoverElement.addEventListener("mouseleave", function(){
        HoverElementHovered = false
        UpdateVisiblity()
    })

    RegionContainer.appendChild(RegionLabel)
    RegionContainer.appendChild(HoverElement)

    //Element.appendChild(RegionContainer)
}

function CreateFilterPlayerCountBox(){
    const Container = document.createElement("li")
    Container.className = "filter-list max-players-list"

    const Title = document.createElement("h3")
    Title.className = "server-list-header"
    Title.innerText = "Max Players"

    const Input = document.createElement("input")
    Input.className = "form-control input-field new-input-field"
    
    const Button = document.createElement("button")
    Button.className = "btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width filter-button"
    Button.innerText = "Go"

    Container.appendChild(Title)
    Container.appendChild(Input)
    Container.appendChild(Button)

    return [Container, Input, Button]
}

function CreateClearFiltersButton(){
    const FilterButton = document.createElement("a")
    FilterButton.className = "btn-more rbx-refresh refresh-link-icon clear-filter-link-icon btn-control-xs btn-min-width"
    FilterButton.style = "margin-left: 16px;"

    const Label = document.createElement("text")
    Label.innerText = "Clear"

    FilterButton.appendChild(Label)

    return FilterButton
}

function CreateFiltersButton(){
    const FilterButton = document.createElement("a")
    FilterButton.className = "btn-more rbx-refresh refresh-link-icon filter-link-icon btn-control-xs btn-min-width"

    const Label = document.createElement("text")
    Label.innerText = "Filters"

    FilterButton.appendChild(Label)

    return FilterButton
}

function CreateFilterList(){
    const List = document.createElement("li")
    List.style = "display:none;"
    List.className = "filter-list"

    return List
}

function CreateFilterButton(Text){
    const Button = document.createElement("a")
    Button.className = "btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width filter-button"
    Button.innerText = Text

    return Button
}

function CreateServerBox(Server, PlaceId){
    const ServerItem = document.createElement("li")
    ServerItem.className = "rbx-game-server-item col-md-3 col-sm-4 col-xs-6"
    ServerItem.setAttribute("placeid", PlaceId)
    ServerItem.setAttribute("jobid", Server.id)
    ServerItem.setAttribute("full-list", true)

    const CardItem = document.createElement("div")
    CardItem.className = "card-item"
    //CardItem.style.border = "1px solid #17e84b"

    const PlayerThumbnailsContainer = document.createElement("div")
    PlayerThumbnailsContainer.className = "player-thumbnails-container"

    CardItem.appendChild(PlayerThumbnailsContainer)

    let FriendsInServerContainer

    if (Server.ImageUrls){
        const TokenToUserId = {}

        const Players = Server.players

        if (Players.length > 0) {
            FriendsInServerContainer = document.createElement("div")
            FriendsInServerContainer.className = "text friends-in-server-label"

            const FriendsInServerLabel = document.createElement("text")

            FriendsInServerLabel.innerText = `Friend${Players.length > 1 && "s" || ""} in this server: `
            FriendsInServerContainer.appendChild(FriendsInServerLabel)

            for (let i = 0; i < Players.length; i++){
                const Player = Players[i]
                TokenToUserId[Player.playerToken] = Player.id

                if (i > 0){
                    const CommaElement = document.createElement("text")
                    CommaElement.innerText = ", "
                    FriendsInServerContainer.appendChild(CommaElement)
                }

                if (i < 2){
                    const FriendNameElement = document.createElement("a")
                    FriendNameElement.className = "text-name"
                    FriendNameElement.href = `https://www.roblox.com/users/${Player.id}/profile`
                    FriendNameElement.innerText = Player.displayName

                    FriendsInServerContainer.appendChild(FriendNameElement)
                } else if (i === 2) {
                    const EndElement = document.createElement("text")
                    EndElement.innerText = `, and ${Players.length - 2} other${Players.length - 2 > 1 && "s" || ""}`
                    FriendsInServerContainer.appendChild(EndElement)
                }
            }
        }

        for (let i = 0; i < Server.ImageUrls.length; i++){
            const Info = Server.ImageUrls[i]
            const ImageUrl = Info.imageUrl
            const Token = Info.token
            const Id = TokenToUserId[Token]

            const HeadshotItem = document.createElement(Id && "a" || "span")
            HeadshotItem.className = "avatar avatar-headshot-md player-avatar"

            if (Id) HeadshotItem.href = `https://www.roblox.com/users/${Id}/profile`

            const ThumbnailContainer = document.createElement("span")
            ThumbnailContainer.className = "thumbnail-2d-container avatar-card-image"

            const Image = document.createElement("img")
            Image.src = ImageUrl

            ThumbnailContainer.appendChild(Image)
            HeadshotItem.appendChild(ThumbnailContainer)

            if (Id && i > 0){
                PlayerThumbnailsContainer.insertBefore(HeadshotItem, PlayerThumbnailsContainer.firstChild)
            } else {
                PlayerThumbnailsContainer.appendChild(HeadshotItem)
            }
        }

        if (Server.playing >= 6){
            const Placeholder = document.createElement("span")
            Placeholder.className = "avatar avatar-headshot-md player-avatar hidden-players-placeholder"
            Placeholder.innerText = `+${Server.playing-5}`

            PlayerThumbnailsContainer.appendChild(Placeholder)
        }
    }

    const ServerDetailsItem = document.createElement("div")
    ServerDetailsItem.className = "rbx-game-server-details game-server-details"

    const PlayerCountItem = document.createElement("div")
    PlayerCountItem.className = "text-info rbx-game-status rbx-game-server-status text-overflow"
    PlayerCountItem.textContent = `${Server.playing || 0} of ${Server.maxPlayers} people max`
    ServerDetailsItem.appendChild(PlayerCountItem)

    const PlayerCountBar = document.createElement("div")
    PlayerCountBar.className = "server-player-count-gauge border"

    const InnerPlayerCountBar = document.createElement("div")
    InnerPlayerCountBar.className = "gauge-inner-bar border"
    InnerPlayerCountBar.style.width = `${((Server.playing || 0) / Server.maxPlayers)*100}%`
    PlayerCountBar.appendChild(InnerPlayerCountBar)

    ServerDetailsItem.appendChild(PlayerCountBar)

    if (FriendsInServerContainer) ServerDetailsItem.appendChild(FriendsInServerContainer)

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

    if (Server.Region){
        CreateServerInfo(ServerItem, Server)
    }

    JoinButton.setAttribute("onclick", `Roblox.GameLauncher.joinGameInstance(parseInt("${PlaceId}",10), "${Server.id}")`)

    return ServerItem
}