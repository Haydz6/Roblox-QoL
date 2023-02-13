let FetchedAllExtraOutfits = false
let IsFetchingAllExtraOutfits = false

let CostumesList
let PreviousExtraOutfitButton
let ExtraOutfitsElements = []
let CurrentExtraOutfitsInfo = {}
let IsCustomesOpen = false
let CustomesOpenInt = 0

// function FixOutfitGaps(){
//   const children = ItemCardsList.children
//   for (let i = 0; i < children.length; i++){
//     ItemCardsList.appendChild(children[i])
//   }
// }

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

  return await RequestFunc(WebServerEndpoints.Outfits+"save", "POST", {"Content-Type": "application/json"}, JSON.stringify({Name: Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
}

function GetOutfitIdAndImageFromOutfitCard(OutfitCard){
  SpanThumbnailContainer = OutfitCard.getElementsByTagName("div")[0].getElementsByClassName("item-card-container remove-panel outfit-card")[0].getElementsByClassName("item-card-link")[0].getElementsByClassName("item-card-thumb-container")[0].getElementsByClassName("item-card-thumb ng-isolate-scope")[0].getElementsByClassName("thumbnail-2d-container")[0]

  OutfitId = SpanThumbnailContainer.getAttribute("thumbnail-target-id")
  ImageURL = SpanThumbnailContainer.getElementsByClassName("ng-scope ng-isolate-scope")[0].src

  return [OutfitId, ImageURL]
}

async function GetExtraOutfits(){
  const [Success, Outfits] = await RequestFunc(WebServerEndpoints.Outfits, "GET")

  if (!Success) {
    CreateAlert(Outfits.Result, false)
    return [false, Outfits]
  }

  return [true, Outfits]
}

async function GetExtraOutfit(Id){
  const [Success, OutfitInfo] = await RequestFunc(WebServerEndpoints.Outfits+"wear/"+Id, "GET")

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
        const [Success, Result] = await RequestFunc(WebServerEndpoints.Outfits+"rename", "PATCH", undefined, JSON.stringify({Id: ExtraOutfit.Id, Name: Name}))

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

      const [Success, Result] = await RequestFunc(WebServerEndpoints.Outfits+"delete/"+ExtraOutfit.Id, "DELETE")

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
  
      const [SaveSuccess, SaveResult] = await RequestFunc(WebServerEndpoints.Outfits+"update", "PUT", {"Content-Type": "application/json"}, JSON.stringify({Id: ExtraOutfit.Id, Name: ExtraOutfit.Name, Outfit: CurrentOutfit, Image: SuccessImage && ImageUrl || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
    
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

    Input.focus()
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

  // await sleep(2000)
  // FixOutfitGaps()
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

IsFeatureEnabled("ExtraOutfits").then(async function(Enabled){
  if (!Enabled) return

  CostumesList = await WaitForId("costumes")

  CustomesObserver.observe(CostumesList, {attributes: true})
  CustomesObserver.observe(CostumesList.getElementsByTagName("div")[0], {childList: true})

  StartConversion()
})