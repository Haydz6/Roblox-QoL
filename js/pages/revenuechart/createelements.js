function CreateContainer(HeaderText, Id){
    const Container = document.createElement("div")
    Container.id = Id

    const HeaderContainer = document.createElement("div")
    HeaderContainer.className = "container-header"

    const Title = document.createElement("h2")
    Title.className = "title-with-input ng-binding"
    Title.innerText = HeaderText

    HeaderContainer.appendChild(Title)
    Container.appendChild(HeaderContainer)

    const Body = document.createElement("div")
    Body.className = "section"

    Container.appendChild(Body)
    
    return [Container, Body]
}