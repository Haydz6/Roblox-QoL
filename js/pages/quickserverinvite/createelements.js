function CreateServerButton(Text){
    const Button = document.createElement("a")
    Button.className = "btn-full-width btn-control-xs create-server-link"
    Button.style = "width:25%; margin-left:4%; min-width: 50px; max-width: 25%;"
    Button.innerText = Text

    return Button
}

function CreateInviteBox(){
    const List = document.createElement("li")
    List.className = "max-players-list invite-server-box"

    const Title = document.createElement("p")
    Title.style = "text-align: center!important; width: 100%; height: 30%; font-weight: 650; font-size: unset;"
    Title.innerText = "Invite"

    const Input = document.createElement("input")
    Input.className = "form-control input-field new-input-field"
    Input.style = "margin-top: 5px; font-size: 12px; opacity: 1;"

    // const CopyImage = document.createElement("img")
    // CopyImage.src = chrome.runtime.getURL("img/copyinvite.png")
    // CopyImage.style = "width: 18px; height: 18px;"

    const CopiedToClipboard = document.createElement("p")
    CopiedToClipboard.className = "quick-invite-clipboard"
    CopiedToClipboard.style = "display: none;"

    List.appendChild(Title)
    List.appendChild(Input)
    List.appendChild(CopiedToClipboard)

    return [List, Input, CopiedToClipboard]
}