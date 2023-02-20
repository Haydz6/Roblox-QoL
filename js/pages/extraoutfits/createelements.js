function CreateOutfitModalWindow(Title, Description, InputPlaceholder, LeftButtonText, RightButtonText){
    let OutfitDialog = document.createElement("div")
    OutfitDialog.className = "modal-dialog"
  
    let OutfitContent = document.createElement("div")
    OutfitContent.className = "modal-content"
  
    let OutfitContentScope = document.createElement("div")
    OutfitContentScope.className = "modal-content ng-scope"
  
    let OutfitHeader = document.createElement("div")
    OutfitHeader.className = "modal-header"
  
    let CloseButton = document.createElement("button")
    CloseButton.className = "close"
    CloseButton.type = "button"
    CloseButton.setAttribute("ng-click", "close()")
  
    let ButtonSpan = document.createElement("span")
    ButtonSpan.setAttribute("aria-hidden", true)
  
    let IconCloseSpan = document.createElement("span")
    IconCloseSpan.className = "icon-close"
  
    ButtonSpan.appendChild(IconCloseSpan)
    CloseButton.appendChild(ButtonSpan)
  
    let CloseButtonOddSpan = document.createElement("span")
    CloseButtonOddSpan.className = "sr-only ng-binding"
    CloseButtonOddSpan.innerText = "Close"
  
    CloseButton.appendChild(CloseButtonOddSpan)
  
    let HeadingText = document.createElement("h5")
    HeadingText.className = "ng-binding"
    HeadingText.innerText = Title
  
    OutfitHeader.appendChild(CloseButton)
    OutfitHeader.appendChild(HeadingText)
  
    let Form = document.createElement("form")
    Form.setAttribute("name", "nameForm")
    Form.className = "ng-pristine ng-invalid ng-invalid-required ng-valid-pattern"

    let CreateButton = document.createElement("button")
    CreateButton.setAttribute("ng-disabled", "nameForm.$invalid || nameForm.outfitName.$pristine")
    CreateButton.setAttribute("disabled", "disabled")
    CreateButton.id = "submit"
    CreateButton.type = "button"
    CreateButton.className = "btn-secondary-md btn-min-width ng-binding"
    CreateButton.innerText = LeftButtonText
  
    let FormBody
    let FormGroupInput

        FormBody = document.createElement("div")
        FormBody.className = "modal-body"
    
        let FormBodyDescription = document.createElement("p")
        FormBodyDescription.className = "font-caption-header text-description ng-binding"
        FormBodyDescription.innerText = Description
    
        let FormGroup = document.createElement("div")
        FormGroup.setAttribute("ng-class", "{'form-has-error': nameForm.outfitName.$invalid && !nameForm.outfitName.$pristine, 'form-has-feedback': nameForm.outfitName.$valid && !nameForm.outfitName.$pristine }")
        FormGroup.className = "form-group"
    
        if (InputPlaceholder){
            FormGroupInput = document.createElement("input")
            FormGroupInput.setAttribute("name", "outfitName")
            FormGroupInput.type = "text"
            FormGroupInput.setAttribute("focus-me", true)
            FormGroupInput.setAttribute("ng-model", "outfitName")
            FormGroupInput.setAttribute("ng-pattern", "^[A-Z0-9 ]+$")
            FormGroupInput.className = "form-control input-field ng-pristine ng-isolate-scope ng-empty ng-invalid ng-invalid-required ng-valid-pattern ng-touched"
            FormGroupInput.setAttribute("required", "")
            FormGroupInput.setAttribute("placeholder", InputPlaceholder)
            FormGroupInput.setAttribute("autocomplete", "off")

            FormGroupInput.addEventListener("keypress", function(e){
                if (e.code === "Enter"){
                    e.preventDefault()
                    CreateButton.click()
                    return
                }
            })

            let InvisibleFormGroupInput = document.createElement("p")
            InvisibleFormGroupInput.setAttribute("ng-class", "{'invisible': !nameForm.outfitName.$invalid || nameForm.outfitName.$pristine }")
            InvisibleFormGroupInput.className = "form-control-label ng-binding invisible"
            InvisibleFormGroupInput.innerText = "Name can contain letters, numbers, and spaces."
        
            //FormGroup.appendChild(FormGroupInput)
            FormGroup.appendChild(InvisibleFormGroupInput)
        }
    
        FormBody.appendChild(FormBodyDescription)
        if (InputPlaceholder) FormBody.appendChild(FormGroupInput)
  
    let ModalFooter = document.createElement("div")
    ModalFooter.className = "modal-footer"
  
    let CancelButton = document.createElement("button")
    //CancelButton.setAttribute("ng-click", "close()")
    CancelButton.className = "btn-control-md btn-min-width ng-binding"
    CancelButton.type = "button"
    CancelButton.innerText = RightButtonText
  
    ModalFooter.appendChild(CreateButton)
    ModalFooter.appendChild(CancelButton)
    
    if (FormBody) Form.appendChild(FormBody)
    Form.append(ModalFooter)
  
    OutfitContentScope.appendChild(OutfitHeader)
    OutfitContentScope.appendChild(Form)
  
    OutfitContent.appendChild(OutfitContentScope)
    OutfitDialog.appendChild(OutfitContent)
  
    let OutfitModalWindow = document.createElement("div")
    OutfitModalWindow.setAttribute("uib-modal-window", "modal-window")
    OutfitModalWindow.setAttribute("role", "dialog")
    OutfitModalWindow.setAttribute("index", "0")
    OutfitModalWindow.setAttribute("tabindex", "-1")
    OutfitModalWindow.setAttribute("uib-modal-animation-class", "fade")
    OutfitModalWindow.setAttribute("modal-in-class", "in")
    OutfitModalWindow.setAttribute("animate", "animate")
    OutfitModalWindow.setAttribute("ng-style", "{'z-index': 1050 + $$topModalIndex*10, display: 'block'}")
    OutfitModalWindow.className = "modal ng-scope ng-isolate-scope in"
    OutfitModalWindow.style = "z-index: 1050; display: block;"

    let OutfitModalBackdrop = document.createElement("div")
    OutfitModalBackdrop.setAttribute("uib-modal-backdrop", "modal-backdrop")
    OutfitModalBackdrop.setAttribute("ng-style", "{'z-index': 1040 + (index && 1 || 0) + index*10}")
    OutfitModalBackdrop.setAttribute("uib-modal-animation-class", "fade")
    OutfitModalBackdrop.setAttribute("modal-in-class", "in")
    OutfitModalBackdrop.setAttribute("data-bootstrap-modal-aria-hidden-count", "1")
    OutfitModalBackdrop.setAttribute("aria-hidden", "true")
    OutfitModalBackdrop.className = "modal-backdrop ng-scope in"
    OutfitModalBackdrop.style = "z-index: 1040;"
  
    OutfitModalWindow.appendChild(OutfitDialog)
    document.body.appendChild(OutfitModalWindow)
    document.body.appendChild(OutfitModalBackdrop)
  
    return [OutfitModalWindow, OutfitModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroupInput]
}

function CreateButton(Text){
  let Button = document.createElement("button")
    Button.setAttribute("ng-type", "button")
    Button.className = "btn-secondary-xs btn-float-right ng-binding ng-scope"
    Button.innerText = Text || "Create Extra Outfit"
    Button.style = "margin-right:130px"
  
    CostumesList.getElementsByTagName("div")[0].appendChild(Button)
  
    return Button
}

function CreateItemCardMenuButton(ButtonName){
    let ItemCardMenuButton = document.createElement("button")
    ItemCardMenuButton.setAttribute("ng-repeat", "option in outfitMenuOptions")
    ItemCardMenuButton.setAttribute("ng-click", "onItemMenuButtonClicked($event,item,option)")
    ItemCardMenuButton.type = "button"
    ItemCardMenuButton.className = "btn-secondary-xs ng-binding ng-scope"
    ItemCardMenuButton.innerText = ButtonName

    return ItemCardMenuButton
}

function CreateOutfitElement(OutfitName, OutfitImageURL, OutfitId, HideCloudIcon, DoesNotHasId, IsNotExtra){
    let ItemCard = document.createElement("li")
    ItemCard.setAttribute("ng-repeat", "item in items")
    ItemCard.setAttribute("ng-class", "{'five-column' : !avatarLibrary.metaData.isCategoryReorgEnabled, 'six-column' : avatarLibrary.metaData.isCategoryReorgEnabled}")
    ItemCard.className = "list-item item-card ng-scope six-column"

    if (DoesNotHasId){
        ItemCard.setAttribute("no-id", true)
    }

    let AvatarItemCard = document.createElement("div")
    
    let ItemCardContainer = document.createElement("div")
    ItemCardContainer.className = "item-card-container remove-panel outfit-card"
    ItemCardContainer.setAttribute("ng-disabled", "avatarCallLimiter.itemCardsDisabled")
    ItemCardContainer.setAttribute("ng-class", "{'outfit-card':item.type === 'Outfit', 'locked-card':avatarCallLimiter.itemCardsDisabled}")

    let ItemCardLink = document.createElement("div")
    ItemCardLink.className = "item-card-link"
    
    let ItemCardThumbContainer = document.createElement("a")
    ItemCardThumbContainer.setAttribute("href", "")
    ItemCardThumbContainer.setAttribute("ng-class", "{'text-secondary':avatarCallLimiter.itemCardsDisabled}")
    ItemCardThumbContainer.setAttribute("data-item-name", OutfitName)
    ItemCardThumbContainer.className = "item-card-thumb-container"

    let Thumbnail2D = document.createElement("thumbnail-2d")
    Thumbnail2D.setAttribute("ng-class", "{'shimmer':avatarCallLimiter.itemCardsDisabled}")
    Thumbnail2D.setAttribute("thumbnail-target-id", "item.id")
    Thumbnail2D.setAttribute("thumbnail-type", "item.thumbnailType")
    Thumbnail2D.className = "item-card-thumb ng-isolate-scope"

    let Thumbnail2DContainer = document.createElement("span")
    Thumbnail2DContainer.className = "thumbnail-2d-container"
    Thumbnail2DContainer.setAttribute("ng-class", "$ctrl.getCssClasses()")
    Thumbnail2DContainer.setAttribute("thumbnail-type", "Outfit")
    Thumbnail2DContainer.setAttribute("thumbnail-target-id", OutfitId)

    let Thumbnail2DImage = document.createElement("img")
    Thumbnail2DImage.setAttribute("ng-if", "$ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled()")
    Thumbnail2DImage.setAttribute("ng-src", OutfitImageURL)
    Thumbnail2DImage.setAttribute("thumbnail-error", "$ctrl.setThumbnailLoadFailed")
    Thumbnail2DImage.setAttribute("ng-class", "{'loading': $ctrl.thumbnailUrl && !isLoaded }")
    Thumbnail2DImage.className = "ng-scope ng-isolate-scope"
    Thumbnail2DImage.src = OutfitImageURL

    let IsExtraIcon
    if (!HideCloudIcon){
        IsExtraIcon = document.createElement("img")
        IsExtraIcon.src = chrome.runtime.getURL("img/extraoutfits/cloudicon.png")
        IsExtraIcon.style = "position:absolute;right:4px;bottom:4px; height:20px; width: 20px;"
    }

    let ItemRestrictionIcon = document.createElement("span")
    ItemRestrictionIcon.setAttribute("ng-show", "item.itemRestrictionIcon")
    ItemRestrictionIcon.setAttribute("ng-class", "item.itemRestrictionIcon")
    ItemRestrictionIcon.className = "restriction-icon ng-hide"

    Thumbnail2DContainer.appendChild(Thumbnail2DImage)

    if (IsExtraIcon) Thumbnail2DContainer.appendChild(IsExtraIcon)
    Thumbnail2D.appendChild(Thumbnail2DContainer)

    ItemCardThumbContainer.appendChild(Thumbnail2D)
    ItemCardThumbContainer.appendChild(ItemRestrictionIcon)

    let ItemCardCaption = document.createElement("div")
    ItemCardCaption.className = "item-card-caption"
    
    let ItemCardEquipped = document.createElement("div")
    ItemCardEquipped.setAttribute("ng-show", "item.selected && isAssetTypeSelectionEnabled(item.assetType.name)")
    ItemCardEquipped.setAttribute("data-item-status", "equipped")
    ItemCardEquipped.className = "item-card-equipped ng-hide"

    let ItemCardEquippedLabel = document.createElement("div")
    ItemCardEquippedLabel.className = "item-card-equipped-label"

    let IconCheckSelection = document.createElement("div")
    IconCheckSelection.className = "icon-check-selection"

    ItemCardEquipped.appendChild(ItemCardEquippedLabel)
    ItemCardEquipped.appendChild(IconCheckSelection)

    let ItemCardMenu = document.createElement("div")
    ItemCardMenu.setAttribute("ng-if", "item.type === 'Outfit'")
    ItemCardMenu.setAttribute("ng-class", "{active:item.active}")
    ItemCardMenu.setAttribute("blur-target", "blur-target")
    ItemCardMenu.className = "item-card-menu ng-scope ng-isolate-scope"

    let UpdateButton = CreateItemCardMenuButton("Update")
    let RenameButton = CreateItemCardMenuButton("Rename")
    let DeleteButton = CreateItemCardMenuButton("Delete")
    let CancelButton = CreateItemCardMenuButton("Cancel")

    ItemCardMenu.appendChild(UpdateButton)
    ItemCardMenu.appendChild(RenameButton)
    ItemCardMenu.appendChild(DeleteButton)
    ItemCardMenu.appendChild(CancelButton)

    let ItemCardNameLink = document.createElement("a")
    ItemCardNameLink.className = "item-card-name-link"

    let ItemCardNameLinkTitle = document.createElement("div")
    ItemCardNameLinkTitle.title = OutfitName
    ItemCardNameLinkTitle.className = "text-overflow item-card-name ng-binding"
    ItemCardNameLinkTitle.innerText = OutfitName

    ItemCardNameLink.appendChild(ItemCardNameLinkTitle)

    let IconSettingsButton = document.createElement("span")
    IconSettingsButton.setAttribute("ng-if", "item.type === 'Outfit' && item.isEditable === true")
    IconSettingsButton.setAttribute("ng-click", "openOutfitMenu(item)")
    IconSettingsButton.className = "icon-settings-16x16 edit-outfit ng-scope"
    IconSettingsButton.setAttribute("data-item-name", OutfitName)

    ItemCardCaption.appendChild(ItemCardEquipped)
    ItemCardCaption.appendChild(ItemCardMenu)
    ItemCardCaption.appendChild(ItemCardNameLink)
    ItemCardCaption.appendChild(IconSettingsButton)

    ItemCardLink.appendChild(ItemCardThumbContainer)

    ItemCardContainer.appendChild(ItemCardLink)
    ItemCardContainer.appendChild(ItemCardCaption)

    AvatarItemCard.appendChild(ItemCardContainer)
    ItemCard.appendChild(AvatarItemCard)

    if (!IsNotExtra) ItemCard.setAttribute("outfit-type", "Extra")
    ExtraOutfitsElements.push(ItemCard)

    return [ItemCard, UpdateButton, RenameButton, DeleteButton, CancelButton, ItemCardThumbContainer, IconSettingsButton, ItemCardMenu, Thumbnail2DImage, ItemCardNameLinkTitle, IconSettingsButton]
}

function GetOutfitTypeFromElement(Element){
    // for (let i = 0; i < ExtraOutfitsElements.length; i++){
    //     if (ExtraOutfitsElements[i] == Element) {
    //         return "Extra"
    //     }
    // }
    
    // return "Roblox"

    return Element.getAttribute("outfit-type") != "Extra" && "Roblox" || "Extra"
}

async function CreateAlert(Text, Success){
    let AlertSystemFeedback = document.createElement("div")
    AlertSystemFeedback.className = "alert-system-feedback"

    let TextHolder = document.createElement("div")
    TextHolder.className = `alert alert-${Success && "success" || "warning"} ng-binding on`
    TextHolder.innerText = Text
    
    AlertSystemFeedback.appendChild(TextHolder)

    try {
        (await WaitForClass("alert-context ng-binding")).parentNode.parentNode.appendChild(AlertSystemFeedback)
    } catch {}

    await sleep(3000)

    AlertSystemFeedback.remove()
}