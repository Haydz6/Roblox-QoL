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

function CreateItemField(Title, Value, URL){
    const Container = document.createElement("div")
    Container.className = "clearfix item-field-container"

    const CurrencyIcon = document.createElement("span")
    CurrencyIcon.className = "icon icon-rolimons-20x20"

    const ValueLabel = document.createElement("a")
    ValueLabel.className = "text-name item-genre wait-for-i18n-format-render"
    ValueLabel.id = "type-content"
    ValueLabel.innerText = Value
    ValueLabel.href = URL

    const TitleLabel = document.createElement("div")
    TitleLabel.className = "font-header-1 text-subheader text-label text-overflow field-label"
    TitleLabel.innerText = Title

    Container.append(TitleLabel, CurrencyIcon, ValueLabel)

    return [Container, TitleLabel, ValueLabel]
}

function CreateCategoryIcon(Name, URL){
    const Container = document.createElement("div")
    Container.className = "rolimons-category-icon"
    Container.style = "height: 24px;"

    const ImgElement = document.createElement("img")
    ImgElement.className = "rolimons-category-icon"
    ImgElement.style = "margin-left: 0px!important; height: 24px;"
    ImgElement.src = URL

    const Tooltip = document.createElement("span")
    Tooltip.className = "icon-tooltiptext"
    Tooltip.style = "display: none;"
    Tooltip.innerText = Name

    Container.addEventListener("mouseenter", function(){
        Tooltip.style = ""
    })

    Container.addEventListener("mouseleave", function(){
        Tooltip.style = "display: none;"
    })

    Container.append(ImgElement, Tooltip)

    return Container
}