async function GetThumbnailForRobloxOutfit(OutfitId){
    const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", undefined, JSON.stringify([
        {
            format: null,
            requestId: `${OutfitId}:undefined:Outfit:150x150:null:regular`,
            size: "150x150",
            targetId: OutfitId,
            type: "Outfit"
        }
    ]))

    if (Success){
      const FirstResult = Result?.data[0]

      if (FirstResult){
        if (FirstResult.state === "Completed"){
          return FirstResult.imageUrl
        }
      }
    }

    return "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"
}

async function CreateNormalOutfitElement(Name, OutfitId){
    const [ItemCard, UpdateButton, RenameButton, DeleteButton, CancelButton, ItemCardThumbContainer, IconSettingsButton, ItemCardMenu, Thumbnail2DImage, ItemCardNameLinkTitle, IconSettingsButton_] = CreateOutfitElement(Name, await GetThumbnailForRobloxOutfit(OutfitId), OutfitId, true, false, true)

    let SettingsOpened = false

    function UpdateSettingsListVisibility(){
        ItemCardMenu.className = `item-card-menu ng-scope ng-isolate-scope${SettingsOpened && " active" || ""}`
    }
    
      ItemCardThumbContainer.addEventListener("click", async function(){
        const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v1/outfits/"+OutfitId+"/wear", "POST")

        if (Success){
          CreateAlert("Successfully wore costume", true)
        } else {
          CreateAlert("Failed to wear costume", false)
          return
        }

        RedrawCharacter()
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
            
            const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v1/outfits/"+OutfitId, "PATCH", undefined, JSON.stringify({name: Name}), true)

            if (Success){
                ItemCardNameLinkTitle.innerText = Name
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
    
          const [Success, Result] = await RequestFunc("https://avatar.roblox.com/v1/outfits/"+OutfitId+"/delete", "POST", undefined, undefined, true)

          if (Success){
            CreateAlert("Removed costume", true)
            ItemCard.remove()
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

          const [CurrentSuccess, CurrentOutfit] = await RequestFunc("https://avatar.roblox.com/v1/avatar", "GET")

          if (!CurrentSuccess){
            CreateAlert("Failed to fetch current avatar!", false)
            return
          }

          const AssetIds = []

          for (let i = 0; i < CurrentOutfit.assets; i++){
            AssetIds.push(CurrentOutfit.assets[i].id)
          }

          NewOutfit = {scale: CurrentOutfit.scales, playerAvatarType: CurrentOutfit.playerAvatarType, assetIds: AssetIds, outfitType: 0}

          const [UpdateSuccess, UpdateResult] = await RequestFunc("https://avatar.roblox.com/v1/outfits/"+OutfitId, "PATCH", undefined, JSON.stringify(NewOutfit), true)

          if (UpdateSuccess){
            CreateAlert("Updated costume", true)
          } else {
            CreateAlert(UpdateResult.Result, false)
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
    
      IconSettingsButton.addEventListener("click", function(){
        SettingsOpened = !SettingsOpened
        UpdateSettingsListVisibility()
      })
    
      CancelButton.addEventListener("click", function(){
        SettingsOpened = false
        UpdateSettingsListVisibility()
      })
    
      ItemCardsList.insertBefore(ItemCard, ItemCardsList.firstChild)
}