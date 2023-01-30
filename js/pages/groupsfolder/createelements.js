function CreateGroupTab(Title, Image){
    const Tab = document.createElement("groups-list-item")
    Tab.setAttribute("group", "group")
    Tab.className = "ng-isolate-scope"

    const Button = document.createElement("a")
    Button.className = "group-name-link"
    Button.title = Title
    
    Tab.appendChild(Button)

    const GroupCard = document.createElement("div")
    GroupCard.className = "menu-option-content group-card"

    Button.appendChild(GroupCard)

    const ThumbnailContainer = document.createElement("thumbnail-2d")
    ThumbnailContainer.className = "group-card-thumbnail ng-isolate-scope"
    GroupCard.appendChild(ThumbnailContainer)

    const ThumbnailSpan = document.createElement("span")
    ThumbnailSpan.className = "thumbnail-2d-container"
    ThumbnailContainer.appendChild(ThumbnailSpan)

    const ImageElement = document.createElement("img")
    ImageElement.className = "ng-scope ng-isolate-scope"
    ImageElement.src = Image
    ThumbnailSpan.appendChild(ImageElement)

    const TitleSpan = document.createElement("span")
    TitleSpan.className = "font-caption-header group-card-name text-overflow ng-binding"
    TitleSpan.innerText = Title
    GroupCard.appendChild(TitleSpan)

    return [Tab, Button, ImageElement, TitleSpan]
}

function CreateGroupFolder(Title){
    const Folder = document.createElement("li")
    Folder.className = "menu-option list-item ng-scope"
    Folder.style = "height: auto!important;"

    const [Tab, Button, ImageElement, TitleSpan] = CreateGroupTab(Title, "")

    const List = document.createElement("div")
    List.style = "width: 100%!important; height: auto!important; background-color: #212121!important;"

    return [Folder, List, Tab, Button, ImageElement, TitleSpan]
}