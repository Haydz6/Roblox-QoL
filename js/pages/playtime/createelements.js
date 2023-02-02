function CreateDropdownList(Default){
    const DropdownContainer = document.createElement("div")
    DropdownContainer.style = "width: 150px; display: inline-table; float: right; margin-right: 20px; top: -10px;"

    const List = document.createElement("ul")
    List.setAttribute("data-toggle", "dropdown-menu")
    List.className = "dropdown-menu"
    List.role = "menu"

    const DropdownButton = document.createElement("button")
    DropdownButton.className = "input-dropdown-btn"
    DropdownButton.setAttribute("data-toggle", "dropdown")
    DropdownButton.ariaExpanded = false

    const ButtonLabel = document.createElement("span")
    ButtonLabel.className = "rbx-selection-label ng-binding"
    ButtonLabel.title = Default
    ButtonLabel.innerText = Default

    const DropdownIcon = document.createElement("span")
    DropdownIcon.className = "icon-down-16x16"

    DropdownButton.append(ButtonLabel, DropdownIcon)
    DropdownContainer.append(DropdownButton, List)

    let Visible = false
    function UpdateVisibility(){
        DropdownButton.ariaExpanded = Visible
        DropdownContainer.className = `input-group-btn group-dropdown trade-list-dropdown ${Visible && "open" || ""}`
    }
    UpdateVisibility()

    function Close(){
        Visible = false
        UpdateVisibility()
    }

    DropdownButton.addEventListener("click", function(event){
        Visible = !Visible
        UpdateVisibility()
        event.stopPropagation()
    })

    document.body.addEventListener("click", Close)

    return [DropdownContainer, List, ButtonLabel, Close]
}

function CreateDropdownButton(Name){
    const ButtonContainer = document.createElement("li")
    ButtonContainer.className = "ng-scope"

    const Button = document.createElement("a")
    const Label = document.createElement("span")
    Label.className = "ng-scope"
    Label.innerText = Name

    Button.appendChild(Label)
    ButtonContainer.appendChild(Button)

    return [ButtonContainer, Button]
}

function CreateContainerHeader(Title, href){
    const ContainerHeader = document.createElement("div")
    ContainerHeader.className = "container-header"
    
    const Header = document.createElement("h2")
    const HeaderButton = document.createElement("a")
    HeaderButton.innerText = Title

    Header.appendChild(HeaderButton)

    const SeeAllButton = document.createElement("a")
    SeeAllButton.className = "btn-secondary-xs see-all-link-icon btn-more"
    SeeAllButton.innerText = "See All"
    SeeAllButton.href = href

    ContainerHeader.append(Header, SeeAllButton)

    return [ContainerHeader, SeeAllButton]
}

function CreateGameCarousel(){
    const GameCarousel = document.createElement("div")
    GameCarousel.className = "game-carousel"

    return GameCarousel
}

function CreateGameCard(Title, href, Players){
    const Container = document.createElement("div")
    Container.className = "grid-item-container game-card-container"

    const Button = document.createElement("a")
    Button.className = "game-card-link"
    Button.href = href

    const ThumbnailSpan = document.createElement("span")
    ThumbnailSpan.className = "thumbnail-2d-container game-card-thumb-container shimmer"

    const Image = document.createElement("img")
    Image.style = "display: none;"

    ThumbnailSpan.appendChild(Image)

    const CardTitle = document.createElement("div")
    CardTitle.className = "game-card-name game-name-title"
    CardTitle.title = Title
    CardTitle.innerText = Title

    const CardInfo = document.createElement("div")
    CardInfo.className = "game-card-info"

    const VoteIcon = document.createElement("span")
    VoteIcon.className = "info-label icon-votes-gray"

    const VotePercent = document.createElement("span")
    VotePercent.className = "info-label vote-percentage-label"
    VotePercent.innerText = "--"

    const PlayingIcon = document.createElement("span")
    PlayingIcon.className = "info-label icon-playing-counts-gray"

    const PlayingCount = document.createElement("span")
    PlayingCount.className = "info-label playing-counts-label"
    PlayingCount.innerText = AbbreviateNumber(Players, 1, true)

    CardInfo.append(VoteIcon, VotePercent, PlayingIcon, PlayingCount)

    Button.append(ThumbnailSpan, CardTitle, CardInfo)
    Container.appendChild(Button)

    return [Container, Image, CardInfo, VotePercent]
}

function CreateSpinner(){
    const LoadingSpinner = document.createElement("div")
    LoadingSpinner.className = "spinner spinner-default"

    return LoadingSpinner
}

function CreateLoadMoreButton(){
    const Button = document.createElement("button")
    Button.type = "button"
    Button.className = "rbx-running-games-load-more btn-control-md btn-full-width"
    Button.innerText = "Load More"

    return Button
}

function CreateGamePlaytime(){
    const Container = document.createElement("div")
    Container.className = "game-creator"
    Container.style = "height: 17px;"

    const Image = document.createElement("img")
    Image.style = "background-image:none; margin:-6px; margin-top:0px; margin-bottom:0.5px; transform:scale(0.4); border:none; margin-left:-8px; margin-right:-5px; margin-top:-0.6px; height: 33px; width: 33px;"
    Image.src = "chrome-extension://adbacgifemdbhdkfppmeilbgppmhaobf/images/timer_dark.svg"
    Image.className = "info-label icon-pastname"

    const Name = document.createElement("span")
    Name.className = "text-label"
    Name.style = "font-size: 14px; font-weight: 500;"
    Name.innerText = "Played"

    const Value = document.createElement("a")
    Value.className = "text-name text-overflow"
    Value.style = "font-size: 14px; font-weight: 500;"
    Value.innerText = "..."
    Value.href = "https://roblox.com/discover#/sortName?sort=Playtime"

    Container.append(Image, Name, Value)

    return [Container, Value]
}