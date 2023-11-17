let ReachedEnd = false
let IsLoading = false
let CurrentPage = 0

let List
  
function Convert110pxTo150pxImageURL(URL){
    return URL.replace("110/110", "150/150")
}
  
async function GetUniversesLikes(Universes){
    let URL = "https://games.roblox.com/v1/games/votes?universeIds="
    let UniverseIds = ""
  
    for (let i = 0; i < Universes.length; i++){
      if (i > 0) {
        UniverseIds = `${UniverseIds}%2C`
      }
      UniverseIds = `${UniverseIds}${Universes[i]}`
    }
    
    const [Success, Result] = await RequestFunc(URL+UniverseIds, "GET", undefined, undefined, true)
  
    if (!Success) return
  
    const Lookup = {}
    const Data = Result.data
  
    for (let i = 0; i < Data.length; i++){
      const Item = Data[i]
      Lookup[Item.id] = Item
  
      if (Item.downVotes == 0){
        if (Item.upVotes == 0) {
          Item.LikeRatio = 0
          continue
        }
  
        Item.LikeRatio = 100
        continue
      }
  
      Item.LikeRatio = Math.floor((Item.upVotes / (Item.upVotes+Item.downVotes))*100)
    }
  
    return Lookup
}
  
async function GetUniversesInfo(RawUniverses){
    let URL = "https://games.roblox.com/v1/games?universeIds="
    const Universes = RawUniverses.slice(0)
    const Lookup = {}

    while (Universes.length > 0){
      let UniverseIds = ""
    
      for (let i = 0; i < Math.min(Universes.length, 10); i++){
        if (i > 0) {
          UniverseIds = `${UniverseIds}%2C`
        }
        UniverseIds = `${UniverseIds}${Universes.pop()}`
      }
      
      const [Success, Result] = await RequestFunc(URL+UniverseIds, "GET", undefined, undefined, true)
      if (!Success) continue
    
      const Data = Result.data
    
      for (let i = 0; i < Data.length; i++){
        const Item = Data[i]
        Lookup[Item.id] = Item
      }
    }
  
    return Lookup
}
  
async function ParsePage(Page){
    const Data = Page?.Data
    const Items = Data?.Items
  
    if (!Items) {
      return true
    }
  
    if (Items.length == 0){
      return true
    }
  
    const Universes = []
  
    for (let i = 0; i < Items.length; i++){
      Universes.push(Items[i].Item.UniverseId)
    }
  
    const LikesCallbackLookup = {}
    const PlayerCountCallbackLookup = {}
  
    for (let i = 0; i < Items.length; i++){
      const Item = Items[i]
      const Place = Item.Item
  
      const [Card, LikesCallback, PlayerCountCallback] = CreateItemContainer(Place.Name, Place.AbsoluteUrl, Convert110pxTo150pxImageURL(Item.Thumbnail.Url), Place.AssetId.toString())
      List.appendChild(Card)

      LikesCallbackLookup[Place.UniverseId] = LikesCallback
      PlayerCountCallbackLookup[Place.UniverseId] = PlayerCountCallback
    }
  
    GetUniversesInfo(Universes).then(function(UniversesInfo){
      for (const [UniverseId, Info] of Object.entries(UniversesInfo)){
        if (Info){
          PlayerCountCallbackLookup[UniverseId](Info?.playing)
        }
      }
    })
  
    GetUniversesLikes(Universes).then(function(AllLikes){
      for (const [UniverseId, Likes] of Object.entries(AllLikes)){
        if (Likes){
          LikesCallbackLookup[UniverseId](Likes.LikeRatio)
        }
      }
    })
}
  
async function GetPage(){
  if (ReachedEnd || IsLoading) return
  
  IsLoading = true
  CurrentPage += 1
  
  const [Success, Data] = await RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=100&pageNumber=${CurrentPage}&userId=${await GetUserId()}`, "GET", undefined, undefined, true)

  if (await ParsePage(Data)) {
    ReachedEnd = true
  }
  
  IsLoading = false
}

function IsFavouritesPage(){
  return window.location.href.split("#")[1] === "/sortName?sort=Favorites"
}

IsFeatureEnabled("FixFavouritesPage").then(async function(Enabled){
  if (!Enabled) return

  if (!IsFavouritesPage()) return

  const GameCarousel = await WaitForId("games-carousel-page")

  const [SortContainer, GameGrid] = CreateSortDiscover("Favorites")
  List = GameGrid

  ChildRemoved(GameCarousel, function(Child){
    if (Child === SortContainer) {
      GameCarousel.appendChild(SortContainer)
    }
  })

  GameCarousel.appendChild(SortContainer)

  GetPage()

  function OnScroll(){
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      GetPage()
    }
  }
  
  window.onscroll = OnScroll
  OnScroll()
})