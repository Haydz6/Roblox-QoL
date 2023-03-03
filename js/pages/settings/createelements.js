function CreateSettingNavigationButton(Text, href){
    const ListButton = document.createElement("li")
    ListButton.className = "menu-option ng-scope"
    ListButton.setAttribute("ng-repeat", "tab in accountsTabs")
    ListButton.setAttribute("ng-class", "{'active': currentData.activeTab == tab.name}")

    const Button = document.createElement("a")
    Button.className = "menu-option-content"
    Button.setAttribute("ui-sref", "qol-settings")
    Button.href = href

    const Span = document.createElement("span")
    Span.className = "font-caption-header ng-binding"
    Span.setAttribute("ng-bind", "tab.label")
    Span.innerText = Text

    Button.appendChild(Span)
    ListButton.appendChild(Button)

    return [ListButton, Button, Span]
}

function CreateSectionSettingsTemplate(Option, Title, Description){
    const Section = document.createElement("div")
    Section.className = "section-content notifications-section"

    const TitleLabel = document.createElement("label")
    //TitleLabel.setAttribute("for", `${Option}-toggle`)
    TitleLabel.className = "btn-toggle-label ng-binding"
    TitleLabel.innerText = Title

    Section.appendChild(TitleLabel)

    if (Description !== ""){
        const Divider = document.createElement("div")
        Divider.className = "rbx-divider"

        const DescriptionDiv = document.createElement("div")
        Description.id = `${Option}-description`
        DescriptionDiv.className = "text-description ng-binding ng-scope"

        const DescriptionTextElement = document.createElement("text")
        DescriptionTextElement.innerText = Description

        DescriptionDiv.appendChild(DescriptionTextElement)

        Section.append(Divider, DescriptionDiv)
    }

    return Section
}

function CreateSectionSettingsToggable(Option, Title, Description, Enabled){
    const Section = CreateSectionSettingsTemplate(Option, Title, Description)

    const Slider = document.createElement("button")
    Slider.id = `${Option}-toggle`
    Slider.className = `btn-toggle receiver-destination-type-toggle ${Enabled && "on" || "off"}`
    Slider.setAttribute("role", "switch")

    Slider.addEventListener("click", function(){
        Enabled = !Enabled
        Slider.className = `btn-toggle receiver-destination-type-toggle ${Enabled && "on" || "off"}`
        SetFeatureEnabled(Option, Enabled)
    })
    
    const ToggleFlip = document.createElement("span")
    ToggleFlip.className = "toggle-flip"

    const ToggleOn = document.createElement("span")
    ToggleOn.className = "toggle-on"
    ToggleOn.id = "toggle-on"

    const ToggleOff = document.createElement("span")
    ToggleOff.className = "toggle-off"
    ToggleOff.id = "toggle-off"

    Slider.appendChild(ToggleFlip)
    Slider.appendChild(ToggleOn)
    Slider.appendChild(ToggleOff)

    Section.insertBefore(Slider, Section.firstChild)

    return Section
}

function CreateSectionSettingsInputBox(Option, Title, Description, Placeholder, Value, Middleman){
    const Section = CreateSectionSettingsTemplate(Option, Title, Description)

    const Input = document.createElement("input")
    Input.className = "form-control input-field new-input-field"
    Input.placeholder = Placeholder
    Input.maxLength = 4
    Input.autocomplete = false
    Input.autocapitalize = false
    Input.spellcheck = false
    Input.placeholder = Placeholder
    Input.style = "width: 80px; float: right; height: 33px;"
    Input.value = Value

    async function FocusLost(){
        const Result = Middleman(Option, await IsFeatureEnabled(Option), Input.value)
        if (Result){
            Input.value = Result
        }
    }

    Input.addEventListener("focusout", FocusLost)
    FocusLost()

    Section.insertBefore(Input, Section.firstChild)

    return Section
}

function CreateSectionSettingsDropdown(Option, Title, Description, Options, Value, Update){
    const Section = CreateSectionSettingsTemplate(Option, Title, Description)

    const Dropdown = document.createElement("div")
    Dropdown.style = "max-width: 250px; float: right; margin-top: -5px;"
    
    const Selections = document.createElement("select")
    Selections.className = "input-field select-option rbx-select"

    for (let i = 0; i < Options.length; i++){
        const Option = document.createElement("option")
        Option.text = Options[i]
        Selections.add(Option)

        if (Options[i] == Value){
            Selections.selectedIndex = i
        }
    }

    Selections.addEventListener("change", function(){
        Update(Selections.value)
    })

    const DownArrow = document.createElement("span")
    DownArrow.className = "icon-arrow icon-down-16x16"

    Dropdown.append(Selections, DownArrow)
    Section.insertBefore(Dropdown, Section.firstChild)

    return Section
}

function CreateSuccessDialog(Title, Description, Buttons){
    const ModalWindow = document.createElement("div")
    ModalWindow.setAttribute("uib-modal-window", "modal-window")
    ModalWindow.className = "modal modal-modern ng-scope ng-isolate-scope in"
    ModalWindow.setAttribute("role", "dialog")
    ModalWindow.setAttribute("index", "0")
    ModalWindow.setAttribute("animate", "animate")
    ModalWindow.setAttribute("tabindex", "-1")
    ModalWindow.setAttribute("uib-modal-animation-class", "fade")
    ModalWindow.setAttribute("modal-in-class", "in")
    ModalWindow.style = "z-index: 1050; display: block;"

    const TrueModalDialog = document.createElement("div")
    TrueModalDialog.className = "modal-dialog "

    const ModalDialog = document.createElement("div")
    ModalDialog.className = "modal-content"

    ModalWindow.appendChild(TrueModalDialog)
    TrueModalDialog.appendChild(ModalDialog)

    const InnerModalDialog = document.createElement("div")
    InnerModalDialog.className = "ng-scope"

    ModalDialog.appendChild(InnerModalDialog)

    const ModalHeader = document.createElement("div")
    ModalHeader.className = "modal-header"

    const CloseButtonDiv = document.createElement("div")
    CloseButtonDiv.className = "modal-modern-header-button"

    const CloseButton = document.createElement("button")
    CloseButton.type = "button"
    CloseButton.className = "close"

    const CloseButtonSpan1 = document.createElement("span")
    CloseButtonSpan1.setAttribute("aria-hidden", "true")

    const CloseButtonSpan2 = document.createElement("span")
    CloseButtonSpan2.className = "icon-close"

    CloseButtonSpan1.appendChild(CloseButtonSpan2)
    CloseButton.appendChild(CloseButtonSpan1)
    CloseButtonDiv.appendChild(CloseButton)

    ModalHeader.appendChild(CloseButtonDiv)

    const ModalTitle = document.createElement("div")
    ModalTitle.className = "modal-title"

    const TitleH5 = document.createElement("h5")
    const TitleSpan = document.createElement("span")
    TitleSpan.className = "ng-binding"
    TitleSpan.innerText = Title

    TitleH5.appendChild(TitleSpan)
    ModalTitle.appendChild(TitleH5)
    ModalHeader.appendChild(ModalTitle)

    const ModalBody = document.createElement("div")
    ModalBody.className = "modal-body"

    const DescriptionSpan = document.createElement("span")
    DescriptionSpan.className = "ng-binding"
    DescriptionSpan.innerText = Description

    ModalBody.appendChild(DescriptionSpan)

    const ModalButtons = document.createElement("div")
    ModalButtons.className = "modal-buttons"

    const AllButtons = []

    for (let i = 0; i < Buttons.length; i++){
        const Button = document.createElement("button")
        Button.className = "modal-button btn-secondary-md ng-binding ng-isolate-scope"
        Button.type = "button"
        Button.setAttribute("focus-me", "true")
        Button.innerText = Buttons[i]
        ModalButtons.appendChild(Button)
        AllButtons.push(Button)
    }

    InnerModalDialog.appendChild(ModalHeader)
    InnerModalDialog.appendChild(ModalBody)
    InnerModalDialog.appendChild(ModalButtons)

    const Backdrop = document.createElement("div")
    Backdrop.setAttribute("uib-modal-backdrop", "modal-backdrop")
    Backdrop.className = "modal-backdrop ng-scope in"
    Backdrop.style = "z-index: 1040;"
    Backdrop.setAttribute("aria-hidden", "true")
    Backdrop.setAttribute("data-bootstrap-modal-aria-hidden-count", "1")
    Backdrop.setAttribute("modal-in-class", "in")
    Backdrop.setAttribute("uib-modal-animation-class", "fade")

    return [ModalWindow, Backdrop, AllButtons, CloseButton]
}

function CreateSectionButtonSetting(Name, ButtonText){
    const Section = document.createElement("div")
    Section.className = "section-content settings-security-setting-container"

    const sm = document.createElement("div")
    sm.className = "col-sm-12"

    const FormGroup = document.createElement("div")
    FormGroup.className = "form-group account-security-settings-container"

    const Label = document.createElement("span")
    Label.className = "security-settings-text ng-binding"
    Label.innerText = Name

    const Button = document.createElement("button")
    Button.id = ButtonText
    Button.className = "btn-control-sm acct-settings-btn ng-binding"
    Button.innerText = ButtonText

    FormGroup.appendChild(Label)
    FormGroup.appendChild(Button)

    sm.appendChild(FormGroup)
    Section.appendChild(sm)

    return [Section, Button]
}

function CreateSectionTitle(Title){
    const H4 = document.createElement("h4")
    H4.innerText = Title

    return H4
}