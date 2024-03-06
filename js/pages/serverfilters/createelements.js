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

    return [Header, Value]
}

function CreateInfoDiv(){
    const HoverElement = document.createElement("li")
    //HoverElement.className = "width: 150px; height: 150px; position :absolute; z-index: 5; background-color: #191919; bottom: 82px; display: block; border-radius: 12px; box-shadow: 0 0 8px 0 rgba(0,0,0,.3);"

    return HoverElement
}

function CreateServerInfo(Element, Server){
    // if (Element.getAttribute("has-region")) return

    const OldServerRegion = Element.getElementsByClassName("text-info rbx-game-status rbx-game-server-status text-overflow server-info")[0]
	if (OldServerRegion) OldServerRegion.remove()

    Element.setAttribute("has-region", true)

    const RegionContainer = document.createElement("div")
    RegionContainer.className = "text-info rbx-game-status rbx-game-server-status text-overflow server-info"
    RegionContainer.style = "font-size: 12px; margin-bottom: 0px; margin-top: 10px; overflow: visible; position: relative;"
    
    const RegionLabel = document.createElement("p")
    RegionLabel.style = "font-size: 12px; overflow: hidden; text-overflow: ellipsis;"
    RegionLabel.innerText = Server.Region

    const HoverElement = document.createElement("li")
    HoverElement.className = "server-info-hover"

    const IsRORSL = Element.classList.contains("rorsl-server")

    if (IsRORSL){
        const Details = Element.getElementsByClassName("rbx-game-server-details")[0] || Element.getElementsByClassName("rbx-game-server-details'")[0]
        if (Details){
            HoverElement.style.right = "26px"
            Details.insertBefore(RegionContainer, Details.children[Details.children.length-1])
        }
    } else {
        const InfoList = Element.getElementsByTagName("div")[0]?.getElementsByTagName("div")[1]

        if (InfoList){
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
        }
    }

    function SetVisibility(Visible){
        HoverElement.style.display = Visible ? "" : "none"
    }

    CreateHeaderAndValueForHover(HoverElement, "Server Region", Server.Region)
    const [_, UptimeLabel] = CreateHeaderAndValueForHover(HoverElement, "Uptime", SecondsToLength((Date.now()/1000)-Server.CreatedTimestamp))
    CreateHeaderAndValueForHover(HoverElement, "Version Date", Server.Version === 0 && "Unknown" || TimestampToDate(Server.Version, false))

    SetVisibility(false)

    let RegionLabelHovered = false
    let HoverElementHovered = false

    async function UpdateVisiblity(){
        SetVisibility(RegionLabelHovered || HoverElementHovered)

        while (RegionLabelHovered || HoverElementHovered){
            UptimeLabel.innerText = SecondsToLength((Date.now()/1000)-Server.CreatedTimestamp)
            await sleep(250)
        }
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

    const CardItem = Element.getElementsByClassName("card-item")[0]
    if (CardItem) CardItem.style.minHeight = "252px"

    //Element.appendChild(RegionContainer)
    return RegionContainer
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
    const Button = document.createElement("button")
    Button.className = "btn-full-width btn-control-xs rbx-game-server-join game-server-join-btn btn-primary-md btn-min-width filter-button"
    Button.innerText = Text

    return Button
}

async function CreateServerBox(Server, PlaceId){
    const ServerItem = document.createElement("li")
    ServerItem.className = "rbx-game-server-item col-md-3 col-sm-4 col-xs-6"
    ServerItem.setAttribute("placeid", PlaceId)
    ServerItem.setAttribute("jobid", Server.id)
    ServerItem.setAttribute("qol-checked", true)

    ServerItem.setAttribute("data-placeid", PlaceId) //ROPRO INVITE SUPPORT
    ServerItem.setAttribute("data-gameid", Server.id) //ROPRO INVITE SUPPORT

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
        let UserInServer = false

        for (let i = 0; i < Players.length; i++){
            if (Players[i].id == await GetUserId()){
                UserInServer = true
                break
            }
        }

        const Deduct = UserInServer && 1 || 0

        if (Players.length > Deduct) {

            FriendsInServerContainer = document.createElement("div")
            FriendsInServerContainer.className = "text friends-in-server-label"

            const FriendsInServerLabel = document.createElement("text")

            FriendsInServerLabel.innerText = `Friend${Players.length > 1 + Deduct && "s" || ""} in this server: `
            FriendsInServerContainer.appendChild(FriendsInServerLabel)

            let TrueIteration = 0

            for (let i = 0; i < Players.length; i++){
                const Player = Players[i]
                TokenToUserId[Player.playerToken] = Player.id

                if (Player.id == await GetUserId()){
                    TrueIteration++
                    continue
                }

                if (TrueIteration > 0 && TrueIteration < 2){
                    const CommaElement = document.createElement("text")
                    CommaElement.innerText = ", "
                    FriendsInServerContainer.appendChild(CommaElement)
                }

                if (TrueIteration < 2){
                    const FriendNameElement = document.createElement("a")
                    FriendNameElement.className = "text-name"
                    FriendNameElement.href = `https://www.roblox.com/users/${Player.id}/profile`
                    FriendNameElement.innerText = Player.displayName

                    FriendsInServerContainer.appendChild(FriendNameElement)
                } else if (TrueIteration === 2) {
                    const EndElement = document.createElement("text")
                    EndElement.innerText = `, and ${Players.length - 2 - Deduct} other${Players.length - 2 > 1 + Deduct && "s" || ""}`
                    FriendsInServerContainer.appendChild(EndElement)
                }

                TrueIteration++
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