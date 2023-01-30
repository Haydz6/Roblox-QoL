function CreateMututalHeader(TargetId){
    const List = document.createElement("li")

    const Title = document.createElement("div")
    Title.className = "text-label font-caption-header ng-binding"
    Title.innerText = "Mutuals"

    const Button = document.createElement("a")
    Button.className = "text-name"
    Button.href = `https://www.roblox.com/users/${TargetId}/friends#!/friends?tab=mutuals`

    const Count = document.createElement("span")
    Count.className = "font-header-2 ng-binding"
    
    List.appendChild(Title)
    
    Button.appendChild(Count)
    List.appendChild(Button)

    return [List, Count]
}