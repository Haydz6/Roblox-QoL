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

function CreateSectionSettingsToggable(Option, Title, Description, Enabled){
    const Section = document.createElement("div")
    Section.className = "section-content notifications-section"

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

    Section.appendChild(Slider)

    const TitleLabel = document.createElement("label")
    TitleLabel.setAttribute("for", `${Option}-toggle`)
    TitleLabel.className = "btn-toggle-label ng-binding"
    TitleLabel.innerText = Title

    Section.appendChild(TitleLabel)

    const Divider = document.createElement("div")
    Divider.className = "rbx-divider"

    Section.appendChild(Divider)

    const DescriptionDiv = document.createElement("div")
    Description.id = `${Option}-description`
    DescriptionDiv.className = "text-description ng-binding ng-scope"

    const DescriptionTextElement = document.createElement("text")
    DescriptionTextElement.innerText = Description

    DescriptionDiv.appendChild(DescriptionTextElement)

    Section.appendChild(DescriptionDiv)

    return Section
}

function CreateSectionTitle(Title){
    const H4 = document.createElement("h4")
    H4.innerText = Title

    return H4
}