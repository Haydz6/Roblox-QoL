function CreateSortDiscover(Title){
    const SortContainer = document.createElement("div")
    SortContainer.className = "game-sort-detail-container"

    const TitleElement = document.createElement("h1")
    TitleElement.innerText = Title

    const GameGrid = document.createElement("div")
    GameGrid.className = "game-grid"

    SortContainer.append(TitleElement, GameGrid)

    return [SortContainer, GameGrid, TitleElement]
}