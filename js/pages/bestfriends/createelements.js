function CreateHomeFriendProfileInteractionItem(){
    const InteractionItem = document.createElement("li")
    InteractionItem.className = "interaction-item"
    
    const Icon = document.createElement("span")
    Icon.className = "icon icon-viewdetails"

    const Label = document.createElement("span")
    Label.className = "label ng-binding"
    Label.innerText = "..."

    InteractionItem.appendChild(Icon)
    InteractionItem.appendChild(Label)

    return [InteractionItem, Label]
}