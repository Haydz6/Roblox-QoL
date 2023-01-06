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

    return ListButton
}