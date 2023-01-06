async function GetButtonCategoryFromHref(CategoriesList, Href){
    const children = CategoriesList.children

    for (let i = 0; i < children.length; i++){
        const child = children[i]
        const ClickElement = child.getElementsByClassName("menu-option-content")[0]

        if (ClickElement && ClickElement.href.search(Href) > -1){
            return child
        }
    }
}