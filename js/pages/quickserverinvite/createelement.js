function CreateServerButton(Text){
    const Button = document.createElement("a")
    Button.className = "btn-full-width btn-control-xs create-server-link"
    Button.style = "width:30%; margin-left:2%;"
    Button.innerText = Text

    return Button
}