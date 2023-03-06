function CreateTradeDropdownOption(Name){
    const Option = document.createElement("li")
    Option.id = Name
    Option.className = "ng-scope"

    const Button = document.createElement("a")
    const Label = document.createElement("span")

    Label.className = "ng-binding"
    Label.innerText = Name

    Button.appendChild(Label)
    Option.appendChild(Button)

    return Option
}

function CreateTradeDropdown(){
    const Dropdown = document.createElement("ul")
    Dropdown.className = "dropdown-menu dropdown-trades-options"
    Dropdown.style = "display: none; max-height: 300px;"

    return Dropdown
}

function CreateSlider(Min, Max){
    const Slider = document.createElement("input")
    Slider.type = "range"
    Slider.className = "slider trade-option"
    
    if (Min) Slider.setAttribute("min", Min)
    if (Max) Slider.setAttribute("max", Max)

    return Slider
}

function CreateConfirmModalDropdown(Text){
    const Button = document.createElement("button")
    Button.className = "confirm-modal-dropdown-button"
    Button.type = "button"

    const Title = document.createElement("span")
    Title.className = "rbx-selection-label ng-binding"
    Title.title = Text || "Inbound"
    Title.innerText = Text || "Inbound"

    const Icon = document.createElement("span")
    Icon.className = "icon-down-16x16"

    Button.append(Title, Icon)
    
    const Dropdown = document.createElement("ul")
    Dropdown.className = "dropdown-menu confirm-modal-dropdown"
    Dropdown.style = "display: none;"

    return [Button, Dropdown, Title]
}

function CreateConfirmModal(Title, Description, LeftButtonText, RightButtonText){
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
  
    let FormBody = document.createElement("div")
    FormBody.className = "modal-body"
    
    let FormBodyDescription = document.createElement("p")
    FormBodyDescription.className = "font-caption-header text-description ng-binding"
    FormBodyDescription.innerText = Description
    
    let FormGroup = document.createElement("div")
    FormGroup.setAttribute("ng-class", "{'form-has-error': nameForm.outfitName.$invalid && !nameForm.outfitName.$pristine, 'form-has-feedback': nameForm.outfitName.$valid && !nameForm.outfitName.$pristine }")
    FormGroup.className = "form-group"
    
    FormBody.appendChild(FormBodyDescription)
  
    let ModalFooter = document.createElement("div")
    ModalFooter.className = "modal-footer"
  
    let CreateButton = document.createElement("button")
    // CreateButton.setAttribute("ng-disabled", "nameForm.$invalid || nameForm.outfitName.$pristine")
    // CreateButton.setAttribute("disabled", "disabled")
    CreateButton.id = "submit"
    CreateButton.type = "button"
    CreateButton.className = "btn-secondary-md btn-min-width ng-binding"
    CreateButton.style = "margin-left: 10px;"
    CreateButton.innerText = RightButtonText
  
    let CancelButton = document.createElement("button")
    //CancelButton.setAttribute("ng-click", "close()")
    CancelButton.className = "btn-control-md btn-min-width ng-binding"
    CancelButton.type = "button"
    CancelButton.innerText = LeftButtonText
    
    ModalFooter.appendChild(CancelButton)
    ModalFooter.appendChild(CreateButton)
    
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
  
    return [OutfitModalWindow, OutfitModalBackdrop, CloseButton, CancelButton, CreateButton, FormGroup, FormBodyDescription, FormBody, HeadingText, Form]
}

function CreateValueCardLabel(ClassOverride){
    const ValueDiv = document.createElement("div")
    ValueDiv.className = ClassOverride || "text-overflow item-card-price"

    const CurrencyIcon = document.createElement("span")
    CurrencyIcon.className = "icon icon-rolimons-20x20"

    const CurrencyLabel = document.createElement("span")
    CurrencyLabel.className = "text-robux ng-binding"
    CurrencyLabel.innerText = "..."
    ValueDiv.append(CurrencyIcon, CurrencyLabel)

    return [ValueDiv, CurrencyLabel]
}

function CreateRobuxLineLabel(Title, Value){
    const RobuxLine = document.createElement("div")
    RobuxLine.className = "robux-line"
    RobuxLine.style = "margin-top: -6px;"

    const TitleLabel = document.createElement("span")
    TitleLabel.className = "text-lead ng-binding"
    TitleLabel.innerText = Title

    const LineAmount = document.createElement("span")
    LineAmount.className = "robux-line-amount"

    const CurrencyIcon = document.createElement("span")
    CurrencyIcon.className = "icon icon-rolimons-20x20"

    const ValueLabel = document.createElement("span")
    ValueLabel.className = "text-robux-lg robux-line-value ng-binding"
    ValueLabel.innerText = Value

    LineAmount.append(CurrencyIcon, ValueLabel)
    RobuxLine.append(TitleLabel, LineAmount)

    return [RobuxLine, ValueLabel]
}

function CreateLinkIcon(URL){
    const LinkButton = document.createElement("a")
    LinkButton.className = "link-icon"
    LinkButton.href = URL

    const LinkImage = document.createElement("img")
    LinkImage.src = chrome.runtime.getURL("img/trades/link.svg")

    LinkButton.appendChild(LinkImage)
    return LinkButton
}

function CreateGainList(){
    const List = document.createElement("li")
    List.className = "gain-summaries"

    return List
}

function CreateGain(Net, Price, Percentage, CurrencyClass, RequiresLaterUpdate){
    const List = document.createElement("li")
    List.className = "gain-summary"

    const PriceBox = document.createElement("div")
    PriceBox.className = "box"
    PriceBox.style = `background-color: ${Net >= 0 && "#4f7b58" || "#ab3130"};`

    const PriceIcon = document.createElement("span")
    PriceIcon.className = CurrencyClass

    const PriceLabel = document.createElement("p")
    PriceLabel.innerText = Price

    PriceBox.append(PriceIcon, PriceLabel)
    List.appendChild(PriceBox)

    let PercentBox
    let PercentLabel
    if (Percentage){
        PercentBox = document.createElement("div")
        PercentBox.className = "box"
        PercentBox.style = `background-color: ${Net >= 0 && "#4f7b58" || "#ab3130"};`

        PercentLabel = document.createElement("p")
        PercentLabel.innerText = Percentage

        PercentBox.appendChild(PercentLabel)
        List.appendChild(PercentBox)
    }

    if (!RequiresLaterUpdate) return List
    else {
        return [List, function(Net, Price, Percentage){
            PriceBox.style = `background-color: ${Net >= 0 && "#4f7b58" || "#ab3130"};`
            PriceLabel.innerText = Price

            if (PercentBox){
                PercentBox.style = `background-color: ${Net >= 0 && "#4f7b58" || "#ab3130"};`
                PercentLabel.innerText = Percentage
            }
        }]
    }
}

function CreateCategoriesCardLabel(){
    const ValueDiv = document.createElement("div")
    ValueDiv.className = "text-overflow item-card-price"
    ValueDiv.style = "display: flex;"

    return ValueDiv
}