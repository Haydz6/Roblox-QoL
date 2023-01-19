function CreateAssetButton(URL){
    const Button = document.createElement("a")
    Button.className = "rbx-menu-item item-context-menu btn-generic-more-sm asset-button"

    if (URL){
        const Image = document.createElement("img")
        Image.style = "width: 100%; height:100%;"
        Image.src = URL
        
        Button.appendChild(Image)
    }

    return Button
}