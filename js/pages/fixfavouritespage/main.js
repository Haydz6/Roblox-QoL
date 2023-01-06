let UserId

let ReachedEnd = false
let IsLoading = false
let CurrentPage = 0

let List

async function RequestFunc(URL, Method){
    return await (await fetch(URL, {method: Method})).json()
}
  
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
  
    const Data = (await RequestFunc(URL+UniverseIds, "GET"))?.data
  
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
  
    const Data = (await RequestFunc(URL+UniverseIds, "GET"))?.data
  
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
  
      const [LikesCallback, PlayerCountCallback] = CreateItemContainer(Place.Name, Place.AbsoluteUrl, Convert110pxTo150pxImageURL(Item.Thumbnail.Url), Place.AssetId.toString())
  
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
  
    const Data = await RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=100&pageNumber=${CurrentPage}&userId=${UserId}`)
  
    if (await ParsePage(Data)) {
      ReachedEnd = true
    }
  
    IsLoading = false
}

async function RunMain(){
    while (!document.head) await sleep(100)

    UserId = document.head.querySelector("[name~=user-data][data-userid]").getAttribute("data-userid")

    List = await WaitForClass("game-grid")

    await WaitForClass("grid-item-container game-card-container")
  
    List.replaceChildren()
    GetPage()
  
    window.onscroll = function(){
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        GetPage()
        }
    }
}

if (IsFeatureEnabled("FixFavouritesPage")){
    RunMain()
}