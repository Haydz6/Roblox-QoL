function UpdateOutfitSearchCard(Card, Keyword){
    if (Card.nodeType !== Node.ELEMENT_NODE) return

    const OutfitName = Card.getElementsByClassName("text-overflow item-card-name ng-binding")[0]
    Card.style.display = !OutfitName.innerText.toLowerCase().includes(Keyword.toLowerCase()) && "none" || ""
}

function OutfitSearch(ItemCards, Keyword){
    const children = ItemCards.children
    for (let i = 0; i < children.length; i++){
        UpdateOutfitSearchCard(children[i], Keyword)
    }
}

function AddOutfitSearchBar(){
    const Searchbar = document.createElement("input")
    Searchbar.className = "form-control input-field"
    Searchbar.type = "text"
    Searchbar.placeholder = "Search"

    return Searchbar
}

IsFeatureEnabled("OutfitSearchbar").then(async function(Enabled){
    if (!Enabled) return

    const OutfitsContainer = await FindFromAttribute("ng-controller", "outfitsController")
    const ItemCards = await WaitForClassPath(OutfitsContainer, "hlist item-cards-stackable")

    const Searchbar = AddOutfitSearchBar()
    OutfitsContainer.insertBefore(Searchbar, OutfitsContainer.children[1])

    Searchbar.addEventListener("input", function(){
        OutfitSearch(ItemCards, Searchbar.value)
    })

    ChildAdded(ItemCards, true, function(Card){
        UpdateOutfitSearchCard(Card, Searchbar.value)
    })
})