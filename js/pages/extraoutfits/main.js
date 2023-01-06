//let ROBLOSecurity = ""
let UserId = 0
let CSRFToken = ""
let CachedAuthKey = ""
let FetchingAuthKey = false

let FetchedAllExtraOutfits = false
let IsFetchingAllExtraOutfits = false

const WebserverURL = "https://haydz6.com/api/v4/outfits/"//"http://localhost:8192/api/v4/outfits/"

let CostumesList
let PreviousExtraOutfitButton
let ExtraOutfitsElements = []
let CurrentExtraOutfitsInfo = {}
let IsCustomesOpen = false
let CustomesOpenInt = 0

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude){
  if (!Headers){
    Headers = {}
  }

  if (URL.search("roblox.com") > -1) {
    Headers["x-csrf-token"] = CSRFToken
  } else if (URL.search(WebserverURL) > -1){
    if (URL.search("authenticate") == -1){
      Headers.Authentication = await GetAuthKey()
    }
  }

  try {
    let Response = await fetch(URL, {method: Method, headers: Headers, body: Body, credentials: CredientalsInclude && "include" || "omit"})
    const ResBody = await (Response).json()

    let NewCSRFToken = Response.headers.get("x-csrf-token")

    if (NewCSRFToken){
      CSRFToken = NewCSRFToken
    }

    if (!Response.ok && (ResBody?.message == "Token Validation Failed" || ResBody?.errors?.[0]?.message == "Token Validation Failed") || ResBody?.Result == "Invalid authentication!"){
      if (ResBody?.Result == "Invalid authentication!"){
        CachedAuthKey = ""
        window.localStorage.removeItem("ExtraOutfitsRobloxAuthKey")
        console.log("auth key invalid, getting a new one")
      }

      console.log("sending with csrf token")
      return await RequestFunc(URL, Method, Headers, Body, CredientalsInclude)
    }

    return [Response.ok, ResBody, Response]
  } catch (err) {
    console.log(err)
    return [false, {Success: false, Result: "???"}]
  }
}

//AUTHENTICATION
function GetCookieValueFromName(Cookies, CookieName){
  const parts = Cookies.split(`; ${CookieName}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function SetFavouriteGame(UniverseId, Favourited){
  return RequestFunc(`https://games.roblox.com/v1/games/${UniverseId}/favorites`, "POST", undefined, JSON.stringify({isFavorited: Favourited}), true)
}

async function GetAuthKey(){
  while (FetchingAuthKey){
    await sleep(100)
  }

  if (CachedAuthKey != ""){
    return CachedAuthKey
  }

  StoredKey = window.localStorage.getItem("ExtraOutfitsRobloxAuthKey")

  if (StoredKey){
    CachedAuthKey = StoredKey
    return CachedAuthKey
  }

  const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebserverURL+"authenticate/start", "POST", undefined, JSON.stringify({UserId: parseInt(UserId)}))

  if (!GetFavoriteSuccess){
    CreateAlert(FavoriteResult.Result, false)
    return CachedAuthKey
  }

  UniverseId = FavoriteResult.UniverseId

  const [FavouriteSuccess] = await SetFavouriteGame(UniverseId, true)

  if (!FavouriteSuccess){
    CreateAlert("Failed to verify with database!", false)
    return CachedAuthKey
  }

  const [ServerSuccess, ServerResult] = await RequestFunc(WebserverURL+"authenticate", "POST", undefined, JSON.stringify({UserId: parseInt(UserId)}))

  if (ServerSuccess){
    CachedAuthKey = ServerResult.Key
    window.localStorage.setItem("ExtraOutfitsRobloxAuthKey", CachedAuthKey)
  }

  new Promise(async function(){
    while (true){
      const [FavSuccess] = await SetFavouriteGame(UniverseId, false)

      if (FavSuccess) break
      await sleep(1000)
    }
  })

  FetchingAuthKey = false

  return CachedAuthKey
}
//

function IsCustomesListOpen(){
  return CostumesList.className == "tab-pane ng-scope active" && document.getElementsByClassName("btn-secondary-xs btn-float-right ng-binding ng-scope")[0] && document.querySelectorAll('[ng-click="createOutfitClicked()"]').length > 0
}

async function RedrawCharacter(){
  RedrawButton = await WaitForClass("toggle-three-dee btn-control btn-control-small ng-binding")
  RedrawButton.click()
  RedrawButton.click()
}

function IsInputValid(Input, Text){
  return new RegExp(Input.getAttribute("ng-pattern"), "i").test(Text)
}

async function GetCurrentOutfit(){
  return await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET", undefined, undefined, true)
}

async function GetAvatarImage(){
  const [Success, Images] = await RequestFunc(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${UserId}&size=150x150&format=Png&isCircular=false`, "GET")

  if (!Success){
    return [Success, Images]
  }

  return [true, Images.data[0].imageUrl]
}

async function SaveCurrentOutfit(Name){
  const [SuccessOutfit, CurrentOutfit] = await GetCurrentOutfit()

  if (!SuccessOutfit) {
    CreateAlert(CurrentOutfit.Result, false)
    return [SuccessOutfit, CurrentOutfit]
  }

  const [SuccessImage, ImageUrl] = await GetAvatarImage()

  return await RequestFunc(WebserverURL+"save", "POST", {"Content-Type": "application/json"}, JSON.stringify({Name: Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
}

function GetOutfitIdAndImageFromOutfitCard(OutfitCard){
  SpanThumbnailContainer = OutfitCard.getElementsByTagName("div")[0].getElementsByClassName("item-card-container remove-panel outfit-card")[0].getElementsByClassName("item-card-link")[0].getElementsByClassName("item-card-thumb-container")[0].getElementsByClassName("item-card-thumb ng-isolate-scope")[0].getElementsByClassName("thumbnail-2d-container")[0]

  OutfitId = SpanThumbnailContainer.getAttribute("thumbnail-target-id")
  ImageURL = SpanThumbnailContainer.getElementsByClassName("ng-scope ng-isolate-scope")[0].src

  return [OutfitId, ImageURL]
}

async function GetExtraOutfits(){
  const [Success, Outfits] = await RequestFunc(WebserverURL, "GET")

  if (!Success) {
    CreateAlert(Outfits.Result, false)
    return [false, Outfits]
  }

  return [true, Outfits]
}

async function GetExtraOutfit(Id){
  const [Success, OutfitInfo] = await RequestFunc(WebserverURL+"wear/"+Id, "GET")

  return [Success, OutfitInfo]
}

async function WearExtraOutfit(Id){
  const [Success, OutfitInfo] = await GetExtraOutfit(Id)

  if (!Success) {
    CreateAlert(OutfitInfo.Result, false)
    return [false, OutfitInfo]
  }

  AllPromises = []

  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-body-colors", "POST", {"Content-Type": "application/json"}, JSON.stringify(OutfitInfo.bodyColors), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", "POST", {"Content-Type": "application/json"}, JSON.stringify({playerAvatarType: OutfitInfo.rigType}), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-scales", "POST", {"Content-Type": "application/json"}, JSON.stringify(OutfitInfo.scales), true))
  AllPromises.push(RequestFunc("https://avatar.roblox.com/v1/avatar/set-wearing-assets", "POST", {"Content-Type": "application/json"}, JSON.stringify({assetIds: OutfitInfo.assets}), true))

  // for (let i = 1; i <= 8; i++){
  //   EmoteId = OutfitInfo.emotes[i]

  //   if (EmoteId) {
  //     AllPromises.push(RequestFunc(`https://avatar.roblox.com/v1/emotes/${EmoteId}/${i}`, "POST", {"Content-Type": "application/json"}, JSON.stringify({}), true))
  //   }
  // }

  await Promise.all(AllPromises)

  CreateAlert("Successfully wore costume", true)

  RedrawCharacter()
}

function CreateExtraOutfitButton(ExtraOutfit){
  if (ExtraOutfit.Id == 0) {
    return
  }

  const [OutfitElement, UpdateButton, RenameButton, DeleteButton, CancelButton, ItemCardThumbContainer, SettingsButton, SettingsList, Thumbnail2DImage, ItemCardNameLinkTitle, IconSettingsButton] = CreateOutfitElement(ExtraOutfit.Name, ExtraOutfit.Image, ExtraOutfit.Id)

  let SettingsOpened = false

  function UpdateSettingsListVisibility(){
    SettingsList.className = `item-card-menu ng-scope ng-isolate-scope${SettingsOpened && " active" || ""}`
  }

  ItemCardThumbContainer.addEventListener("click", function(){
    WearExtraOutfit(ExtraOutfit.Id)
  })

  RenameButton.addEventListener("click", function(){
    const [ModalWindow, Backdrop, CloseButton, CancelButton, RenameButton, Input] = CreateOutfitModalWindow("Rename Costume", "Choose a new name for your costume.", "Name your costume", "Rename", "Cancel")

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    RenameButton.addEventListener("click", async function(){
      SettingsOpened = false
      UpdateSettingsListVisibility()

      let Name = Input.value

      if (IsInputValid(Input, Name)) {
        ModalWindow.remove()
        Backdrop.remove()
        const [Success, Result] = await RequestFunc(WebserverURL+"rename", "PATCH", undefined, JSON.stringify({Id: ExtraOutfit.Id, Name: Name}))

        if (Success){
          ItemCardNameLinkTitle.innerText = Name
          ItemCardThumbContainer.setAttribute("data-item-name", Name)
          IconSettingsButton.setAttribute("data-item-name", Name)
          CreateAlert("Renamed costume", true)
        } else {
          CreateAlert(Result.Result, false)
        }
      }
    })

    Input.addEventListener('input', function() {
      let Bool = IsInputValid(Input, Input.value) && "enabled" || "disabled"
      let Status = Bool && "enabled" || "disabled"
      let OppositeStatus = !Bool && "enabled" || "disabled"

      RenameButton.setAttribute(Status, Status)
      RenameButton.removeAttribute(OppositeStatus)
    })
  })

  DeleteButton.addEventListener("click", async function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()

    const [ModalWindow, Backdrop, CloseButton, CancelButton, DeleteButton, Input] = CreateOutfitModalWindow("Delete Costume", "Are you sure you want to delete this costume?", undefined, "Delete", "Cancel")

    DeleteButton.addEventListener("click", async function(){
      ModalWindow.remove()
      Backdrop.remove()

      const [Success, Result] = await RequestFunc(WebserverURL+"delete/"+ExtraOutfit.Id, "DELETE")

      if (Success){
        OutfitElement.remove()
        CreateAlert("Removed costume", true)
        CurrentExtraOutfitsInfo[ExtraOutfit.Id] = null
      } else {
        CreateAlert(Result.Result, false)
      }
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    DeleteButton.setAttribute("enabled", "enabled")
    DeleteButton.removeAttribute("disabled")
  })

  UpdateButton.addEventListener("click", async function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()

    const [ModalWindow, Backdrop, CloseButton, CancelButton, UpdateButton, Input] = CreateOutfitModalWindow("Update Costume", "Do you want to update this costume? This will overwrite the costume with your avatar's current appearance.", undefined, "Update", "Cancel")

    UpdateButton.addEventListener("click", async function(){
      ModalWindow.remove()
      Backdrop.remove()

      const [SuccessOutfit, CurrentOutfit] = await GetCurrentOutfit()

      if (!SuccessOutfit) {
        return [SuccessOutfit, CurrentOutfit]
      }
  
      const [SuccessImage, ImageUrl] = await GetAvatarImage()
  
      const [SaveSuccess, SaveResult] = await RequestFunc(WebserverURL+"update", "PUT", {"Content-Type": "application/json"}, JSON.stringify({Id: ExtraOutfit.Id, Name: ExtraOutfit.Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
    
      if (SaveSuccess){
        Thumbnail2DImage.setAttribute("ng-src", SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png")
        Thumbnail2DImage.src = SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
        CreateAlert("Updated costume", true)
      } else {
        CreateAlert(SaveResult.Result, false)
      }
    })

    CancelButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    CloseButton.addEventListener("click", function(){
      ModalWindow.remove()
      Backdrop.remove()
    })

    UpdateButton.setAttribute("enabled", "enabled")
    UpdateButton.removeAttribute("disabled")
  })

  SettingsButton.addEventListener("click", function(){
    SettingsOpened = !SettingsOpened
    UpdateSettingsListVisibility()
  })

  CancelButton.addEventListener("click", function(){
    SettingsOpened = false
    UpdateSettingsListVisibility()
  })

  ItemCardsList.insertBefore(OutfitElement, ItemCardsList.firstChild)
}


async function CustomesOpened(){
  CustomesOpenInt ++

  PreviousExtraOutfitButton = CreateButton()

  PreviousExtraOutfitButton.addEventListener("click", function(){
    [ModalWindow, Backdrop, CloseButton, CancelButton, CreateOutfitButton, Input] = CreateOutfitModalWindow("Create Extra Costume", "A costume will be created from your avatar's current appearance.", "Name your costume", "Create", "Cancel")

    function RemoveOutfitModalWindow(){
      ModalWindow.remove()
      Backdrop.remove()
    }

    CloseButton.addEventListener("click", RemoveOutfitModalWindow)
    CancelButton.addEventListener("click", RemoveOutfitModalWindow)

    CreateOutfitButton.addEventListener("click", async function(){
      RemoveOutfitModalWindow()
      
      let Name = Input.value

      if (IsInputValid(Input, Name)) {
        const [Success, Result] = await SaveCurrentOutfit(Name)

        if (Success){
          CurrentExtraOutfitsInfo[Result.Id] = Result
          CreateExtraOutfitButton(Result)
        }
      }
    })

    Input.addEventListener('input', function() {
      let Bool = IsInputValid(Input, Input.value) && "enabled" || "disabled"
      let Status = Bool && "enabled" || "disabled"
      let OppositeStatus = !Bool && "enabled" || "disabled"

      CreateOutfitButton.setAttribute(Status, Status)
      CreateOutfitButton.removeAttribute(OppositeStatus)
    })
  })

  // CreateButton("Convert All Outfits").addEventListener("click", async function(){
  //   const [ModalWindow, Backdrop, CloseButton, CancelButton, ConvertButton, Input] = CreateOutfitModalWindow("Convert all costumes", "Do you want to convert all your costumes to extras?", undefined, "Convert", "Cancel")
  
  //   CloseButton.addEventListener("click", function(){
  //     ModalWindow.remove()
  //     Backdrop.remove()
  //   })

  //   CancelButton.addEventListener("click", function(){
  //     ModalWindow.remove()
  //     Backdrop.remove()
  //   })

  //   ConvertButton.addEventListener("click", async function(){
  //     ModalWindow.remove()
  //     Backdrop.remove()

  //     for (let i = 0; i < ItemCardsList)
  //   })
  // })

  console.log("waiting for item-cards")
  ItemCardsList = CostumesList.getElementsByTagName("div")[1].getElementsByTagName("div")[0].getElementsByTagName("ul")[0]
  console.log("got")

  CacheCustomesOpenInt = CustomesOpenInt

  const [Success, ExtraOutfits] = await GetExtraOutfits()

  if (!Success || CacheCustomesOpenInt != CustomesOpenInt){
    return
  }

  for (let i = 0; i < ExtraOutfits.length; i++){
    const ExtraOutfit = ExtraOutfits[i]
    CurrentExtraOutfitsInfo[ExtraOutfit.Id] = ExtraOutfit

    CreateExtraOutfitButton(ExtraOutfit)
  }
}

const CustomesObserver = new MutationObserver(function(mutationList, observer){
  mutationList.forEach(function(mutation) {
    if ((mutation.type === "attributes" && mutation.attributeName === "class") || mutation.type === "childList") {
      let PreviousIsCustomesOpen = IsCustomesOpen
      IsCustomesOpen = IsCustomesListOpen()

      if (PreviousIsCustomesOpen === IsCustomesOpen) return

      if (IsCustomesOpen) CustomesOpened()
      else {
        if (PreviousExtraOutfitButton){
          PreviousExtraOutfitButton.remove()
          PreviousExtraOutfitButton = null
        }

        for (let i = 0; i < ExtraOutfitsElements.length; i++){
          ExtraOutfitsElements[i].remove()
        }
        ExtraOutfitsElements = []
      }
    }
  })
})

// function GetRobloCookie(){
//   chrome.runtime.onMessage.addListener(function(request, sender, callback) {
//     if (request.type === "roblosecurity"){
//       ROBLOSecurity = request.value
//     }
//   })
// }

async function RunMain(){
  CostumesList = await WaitForId("costumes")

  CustomesObserver.observe(CostumesList, {attributes: true})
  CustomesObserver.observe(CostumesList.getElementsByTagName("div")[0], {childList: true})

  //GetRobloCookie()

  while (!document.head){
    await sleep(100)
  }

  UserId = document.head.querySelector("[name~=user-data][data-userid]").getAttribute("data-userid")
  StartConversion()

  console.log("extra outfits ready")
}


if (IsFeatureEnabled("ExtraOutfits")){
  RunMain()
}