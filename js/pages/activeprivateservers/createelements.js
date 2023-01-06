function CreateActivePrivateServersButton(){
    const List = document.createElement("li")
    List.setAttribute("ng-repeat", "subcategory in category.items")
    List.setAttribute("ui-sref", "subcategory({categoryName: $ctrl.makeUrlFriendly(category.name), subcategoryName: $ctrl.makeUrlFriendly(subcategory.name)})")
    List.setAttribute("ng-click", "$event.stopPropagation()")
    List.setAttribute("ng-class", "{'active': $ctrl.currentData.subcategory.name == subcategory.name}")
    List.className = "menu-secondary-option ng-scope"

    const ButtonRedirect = document.createElement("a")
    ButtonRedirect.href = "#!/private-servers/active-private-servers"
    ButtonRedirect.style = "position:absolute; width:100%; height:100%;"

    const ButtonSpan = document.createElement("span")
    ButtonSpan.className = "font-caption-header menu-text ng-binding"
    ButtonSpan.setAttribute("ng-bind", "subcategory.displayName")
    ButtonSpan.innerText = "Active Private Servers"

    List.appendChild(ButtonRedirect)
    List.appendChild(ButtonSpan)

    return [List, ButtonSpan]
}

function CreatePrivateServerCard(GameIcon, Name, OwnerName, OwnerId, Price, PlaceId){
    const Card = document.createElement("li")
    Card.setAttribute("ng-repeat", "item in $ctrl.assets")
    Card.setAttribute("ng-class", "{'place-item': $ctrl.currentData.category.categoryType === $ctrl.assetsConstants.types.place}")
    Card.className = "list-item item-card ng-scope"

    const ItemContainer = document.createElement("div")
    ItemContainer.className = "item-card-container"

    const CardItemLink = document.createElement("a")
    const href = `https://www.roblox.com/games/${PlaceId}/${Name}#!/game-instances`
    CardItemLink.setAttribute("ng-href", href)
    CardItemLink.href = href
    CardItemLink.className = "item-card-link"

    const ThumbContainer = document.createElement("div")
    ThumbContainer.className = "item-card-thumb-container"

    const Thumbnail2D = document.createElement("thumbnail-2d")
    Thumbnail2D.className = "item-card-thumb ng-isolate-scope"
    Thumbnail2D.setAttribute("thumbnail-type", "item.itemV2.thumbnail.type")
    Thumbnail2D.setAttribute("thumbnail-target-id", "item.itemV2.id")

    const ThumbnailSpan = document.createElement("span")
    ThumbnailSpan.setAttribute("ng-class", "$ctrl.getCssClasses()")
    ThumbnailSpan.className = "thumbnail-2d-container"
    ThumbnailSpan.setAttribute("thumbnail-type", "GameIcon")
    ThumbnailSpan.setAttribute("thumbnail-target-id", "0")
    ThumbnailSpan.style = "width:100%; height:100%;"

    const ThumbnailImage = document.createElement("img")
    ThumbnailImage.setAttribute("ng-if", "$ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled()")
    ThumbnailImage.setAttribute("ng-src", GameIcon)
    ThumbnailImage.setAttribute("thumbnail-error", "$ctrl.setThumbnailLoadFailed")
    ThumbnailImage.setAttribute("ng-class", "{'loading': $ctrl.thumbnailUrl && !isLoaded }")
    ThumbnailImage.className = "ng-scope ng-isolate-scope"
    ThumbnailImage.src = GameIcon

    ThumbnailSpan.appendChild(ThumbnailImage)
    Thumbnail2D.appendChild(ThumbnailSpan)
    ThumbContainer.appendChild(Thumbnail2D)

    const ItemCardName = document.createElement("div")
    ItemCardName.className = "item-card-name"
    ItemCardName.setAttribute("title", Name)

    const SpanServerName = document.createElement("span")
    SpanServerName.setAttribute("ng-bind", "item.Item.Name")
    SpanServerName.className = "ng-binding"
    SpanServerName.innerText = Name

    ItemCardName.appendChild(SpanServerName)

    CardItemLink.appendChild(ThumbContainer)
    CardItemLink.appendChild(ItemCardName)

    const CreatorNameDiv = document.createElement("div")
    CreatorNameDiv.setAttribute("ng-if", "$ctrl.showCreatorName")
    CreatorNameDiv.className = "text-overflow item-card-label ng-scope"

    const CreatorNameBySpan = document.createElement("span")
    CreatorNameBySpan.setAttribute("ng-bind", "'Label.OwnershipPreposition' | translate")
    CreatorNameBySpan.innerText = "By"

    const CreatorNameFakeButton = document.createElement("a")
    CreatorNameFakeButton.className = "creator-name text-overflow text-link ng-binding ng-hide"
    CreatorNameFakeButton.setAttribute("ng-hide", "$ctrl.currentData.isPrivateServerCategoryType")
    CreatorNameFakeButton.setAttribute("ng-bind", "item.Creator.nameForDisplay")

    const CreatorNameButton = document.createElement("a")
    CreatorNameButton.className = "creator-name text-overflow text-link ng-binding"
    CreatorNameButton.setAttribute("ng-href", `https://www.roblox.com/users/${OwnerId}/profile/`)
    CreatorNameButton.setAttribute("ng-show", "$ctrl.currentData.isPrivateServerCategoryType")
    CreatorNameButton.setAttribute("ng-bind", "item.PrivateServer.nameForDisplay")
    CreatorNameButton.href = `https://www.roblox.com/users/${OwnerId}/profile/`
    CreatorNameButton.innerText = ` @${OwnerName}`

    CreatorNameDiv.appendChild(CreatorNameBySpan)
    CreatorNameDiv.appendChild(CreatorNameFakeButton)
    CreatorNameDiv.appendChild(CreatorNameButton)

    const ItemCardPrice = document.createElement("div")
    ItemCardPrice.className = "text-overflow item-card-price"

    if (Price > 0 ){
        const RobuxIcon = document.createElement("span")
        RobuxIcon.className = "icon-robux-16x16 ng-scope"
        RobuxIcon.setAttribute("ng-if", "$ctrl.doesItemHavePrice(item)")
        ItemCardPrice.appendChild(RobuxIcon)
    }

    const TextRobuxTitle = document.createElement("span")
    TextRobuxTitle.className = "text-robux-tile ng-binding"
    TextRobuxTitle.setAttribute("ng-show", "$ctrl.doesItemHavePrice(item)")
    TextRobuxTitle.setAttribute("ng-bind", "$ctrl.getDisplayPrice(item) | abbreviate : 0")
    TextRobuxTitle.innerText = ` ${Price > 0 && Price || ""}`

    ItemCardPrice.appendChild(TextRobuxTitle)

    const TextLabel = document.createElement("span")
    TextLabel.className = `text-label${Price > 0 && "" || " ng-hide"}`
    TextLabel.setAttribute("ng-hide", "$ctrl.doesItemHavePrice(item)")

    const FreeLabel = document.createElement("span")
    FreeLabel.className = "text-overflow font-caption-body ng-binding ng-scope"
    FreeLabel.innerText = "Free"
    FreeLabel.setAttribute("ng-if", "item.Product.NoPriceText.length > 0")
    FreeLabel.setAttribute("ng-class", "{'text-robux-tile': item.Product.IsFree}")
    FreeLabel.setAttribute("ng-bind", "item.Product.NoPriceText")

    TextLabel.appendChild(FreeLabel)

    ItemCardPrice.appendChild(TextLabel)

    ItemContainer.appendChild(CardItemLink)
    ItemContainer.appendChild(CreatorNameDiv)
    ItemContainer.appendChild(ItemCardPrice)

    Card.appendChild(ItemContainer)

    return Card
}

function CreateLoadingParagraph(){
    const Paragraph = document.createElement("p")
    Paragraph.style = "display:none;"

    return Paragraph
}