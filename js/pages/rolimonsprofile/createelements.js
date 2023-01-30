function CreateTopHeader(Title, Value, href){
    const List = document.createElement("li")

    const TitleLabel = document.createElement("div")
    TitleLabel.className = "text-label font-caption-header ng-binding"
    TitleLabel.innerText = Title

    const Button = document.createElement("a")
    Button.className = "text-name"
    Button.href = href

    const Count = document.createElement("span")
    Count.className = "font-header-2 ng-binding"
    Count.innerText = Value
    
    List.appendChild(TitleLabel)
    
    Button.appendChild(Count)
    List.appendChild(Button)

    return [List, Count]
}