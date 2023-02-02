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
    
    const [Success, Data] = await RequestFunc(URL+UniverseIds, "GET", undefined, undefined, true)
  
    if (!Data) return
  
    const Lookup = {}
  
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
  
async function GetUniversesInfo(Universes){
    let URL = "https://games.roblox.com/v1/games?universeIds="
    let UniverseIds = ""
  
    for (let i = 0; i < Universes.length; i++){
      if (i > 0) {
        UniverseIds = `${UniverseIds}%2C`
      }
      UniverseIds = `${UniverseIds}${Universes[i]}`
    }
    
    const [Success, Data] = await RequestFunc(URL+UniverseIds, "GET", undefined, undefined, true)
  
    if (!Data) return
  
    //const Likes = await GetUniversesLikes(Universes)
    const Lookup = {}
  
    for (let i = 0; i < Data.length; i++){
      const Item = Data[i]
      Lookup[Item.id] = Item
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
  
    const [Success, Data] = await RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=100&pageNumber=${CurrentPage}&userId=${UserId}`, "GET", undefined, undefined, true)
  
    if (await ParsePage(Data)) {
      ReachedEnd = true
    }
  
    IsLoading = false
}

// async function BlockRobloxRequest(){
//   chrome.declarativeNetRequest.updateSessionRules({addRules: [
//     {
//       id: 1,
//       priority: 1,
//       action: {type: "block"},
//       condition: {
//         urlFilter: "https://apis.roblox.com/discovery-api/omni-recommendation",
//         resourceTypes: ["xmlhttprequest", "main_frame"]
//       }
//     }
//   ]})
// }

function IsFavouritesPage(){
  return window.location.href.split("#")[1] === "/sortName?sort=Favorites"
}

async function RunMain(){
  if (!IsFavouritesPage()) return

  while (!document.head) await sleep(100)

  const GameCarousel = await WaitForId("games-carousel-page")

  const [SortContainer, GameGrid] = CreateSortDiscover("Favorites")
  List = GameGrid
  GameCarousel.appendChild(SortContainer)

  GetPage()
  
  window.onscroll = function(){
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
       GetPage()
      }
  }
}

IsFeatureEnabled("FixFavouritesPage").then(function(Enabled){
  if (Enabled){
      RunMain()
  }
})