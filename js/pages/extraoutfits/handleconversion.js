//const NoIdElementToOutfitInfo = {}

async function ConvertOutfitToExtra(OutfitId, Image){
    const [Success, Outfit] = await RequestFunc(`https://avatar.roblox.com/v1/outfits/${OutfitId}/details`, "GET", undefined, undefined, true)
  
    if (!Success){
      CreateAlert("Failed to convert outfit!", false)
      return [false, Outfit, false]
    }
  
    const ExtraOutfit = {scales: Outfit.scale, bodyColors: Outfit.bodyColors, playerAvatarType: Outfit.playerAvatarType, assets: Outfit.assets, emotes: [], defaultShirtApplied: false, defaultPantsApplied: false}
    
    const [ExtraSuccess, NewExtraOutfit] = await RequestFunc(WebserverURL+"save", "POST", {"Content-Type": "application/json"}, JSON.stringify({Name: Outfit.name, Outfit: ExtraOutfit, Image: Image || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
    let DeleteSuccess = false

    if (ExtraSuccess){
        const [DeleteSuccess2] = await RequestFunc(`https://avatar.roblox.com/v1/outfits/${OutfitId}/delete`, "POST", undefined, undefined, true)
        DeleteSuccess = DeleteSuccess2

        if (!DeleteSuccess){
            CreateAlert("Failed to delete old outfit!", false)
        }
    } else {
        CreateAlert("Failed to convert outfit!", false)
        return [false, NewExtraOutfit, false]
    }

    return [ExtraSuccess, NewExtraOutfit, DeleteSuccess]
}

async function ConvertNoIdOutfitToExtra(Element){
    //const Outfit = NoIdElementToOutfitInfo[Element]
    const ExtraOutfit = {scales: Outfit.scale, bodyColors: Outfit.bodyColors, playerAvatarType: Outfit.playerAvatarType, assets: Outfit.assets, emotes: [], defaultShirtApplied: false, defaultPantsApplied: false}
    
    const [ExtraSuccess, NewExtraOutfit] = await RequestFunc(WebserverURL+"save", "POST", {"Content-Type": "application/json"}, JSON.stringify({Name: Outfit.name, Outfit: ExtraOutfit, Image: Image || "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png"}))
    let DeleteSuccess = false

    if (ExtraSuccess){
        const [DeleteSuccess2] = await RequestFunc(`https://avatar.roblox.com/v1/outfits/${OutfitId}/delete`, "POST", undefined, undefined, true)
        DeleteSuccess = DeleteSuccess2

        if (!DeleteSuccess){
            CreateAlert("Failed to delete old outfit!", false)
        }
    } else {
        CreateAlert("Failed to convert outfit!", false)
        return [false, NewExtraOutfit, false]
    }

    return [ExtraSuccess, NewExtraOutfit, DeleteSuccess]
}

async function ConvertExtraToOutfit(ExtraId){
    const [GetSuccess, ExtraOutfit] = await GetExtraOutfit(ExtraId)

    if (!GetSuccess){
        CreateAlert(ExtraOutfit.Result, false)
        return [false, ExtraOutfit, false]
    }

    const OutfitName = CurrentExtraOutfitsInfo[ExtraId].Name
    const Outfit = {name: OutfitName, bodyColors: ExtraOutfit.bodyColors, assetIds: ExtraOutfit.assets, scale: ExtraOutfit.scales, playerAvatarType: ExtraOutfit.rigType, outfitType: 0}
    const [CreateOutfitSuccess, CreateOutfitResult] = await RequestFunc("https://avatar.roblox.com/v1/outfits/create", "POST", undefined, JSON.stringify(Outfit), true)

    if (!CreateOutfitSuccess){
        CreateAlert(CreateOutfitResult.Result, false)
        return [false, CreateOutfitResult, false]
    }

    const [DeleteSuccess, DeleteResult] = await RequestFunc(WebserverURL+"delete/"+ExtraId, "DELETE")
    
    if (!DeleteSuccess){
        CreateAlert(DeleteResult.Result, false)
    }

    return [CreateOutfitSuccess, CreateOutfitResult, DeleteSuccess, OutfitName, Outfit]
}

async function NewOutfitElementAdded(OutfitElement){
    await sleep(1000)

    OutfitElement.style = "padding-left:0px; padding-right:0px;"

    const OutfitType = GetOutfitTypeFromElement(OutfitElement)
    const SettingsElement = OutfitElement.getElementsByTagName("div")[0].getElementsByClassName("item-card-container remove-panel outfit-card")[0].getElementsByClassName("item-card-caption")[0].getElementsByClassName("item-card-menu ng-scope ng-isolate-scope")[0]

    const ConvertButton = CreateItemCardMenuButton("Convert")

    ConvertButton.addEventListener("click", async function(){
        [ModalWindow, Backdrop, CloseButton, CancelButton, FinalConvertButton, Input] = CreateOutfitModalWindow(`Convert Costume to ${OutfitType == "Extra" && "Roblox" || "Extra"}`, `Your costume will be converted to ${OutfitType == "Extra" && "a normal outfit." || "an extra outfit."}`, undefined, "Convert", "Cancel")
    
        CancelButton.addEventListener("click", function(){
            ModalWindow.remove()
            Backdrop.remove()
        })

        CloseButton.addEventListener("click", function(){
            ModalWindow.remove()
            Backdrop.remove()
        })

        FinalConvertButton.addEventListener("click", async function(){
            ModalWindow.remove()
            Backdrop.remove()
            
            const OutfitType = GetOutfitTypeFromElement(OutfitElement)
            const [OutfitId, ImageUrl] = await GetOutfitIdAndImageFromOutfitCard(OutfitElement)

            if (OutfitType == "Roblox"){
                let Success, NewOutfitInfo, DeleteSuccess

                if (OutfitElement.getAttribute("no-id")){
                    [Success, NewOutfitInfo, DeleteSuccess] = await ConvertNoIdOutfitToExtra(OutfitElement)
                } else {
                    [Success, NewOutfitInfo, DeleteSuccess] = await ConvertOutfitToExtra(OutfitId, ImageUrl)
                }

                if (Success){
                    CreateAlert("Converted outfit to extra", true)
                    CreateExtraOutfitButton(NewOutfitInfo)
                    CurrentExtraOutfitsInfo[NewOutfitInfo.Id] = NewOutfitInfo

                    if (DeleteSuccess){
                        OutfitElement.remove()
                    }
                }
            } else if (OutfitType == "Extra"){
                const [Success, NewOutfitInfo, DeleteSuccess, OutfitName, Outfit] = await ConvertExtraToOutfit(OutfitId)

                if (Success){
                    CreateAlert("Converted outfit to roblox", true)

                    const [OutfitSuccess, AllOutfits] = await RequestFunc("https://avatar.roblox.com/v1/users/"+UserId+"/outfits?page=1&itemsPerPage=1&isEditable=true")

                    if (OutfitSuccess){
                        CreateNormalOutfitElement(OutfitName, AllOutfits.data[0].id)
                    } else {
                        CreateAlert("Failed to display outfit on list", false)
                    }

                    if (DeleteSuccess){
                        CurrentExtraOutfitsInfo[OutfitId] = null
                        OutfitElement.remove()
                    }
                }
            }
        })

        FinalConvertButton.setAttribute("enabled", "enabled")
        FinalConvertButton.removeAttribute("disabled")
    })

    SettingsElement.style = "padding-top:10px"

    SettingsElement.insertBefore(ConvertButton, SettingsElement.lastChild)
}

const NewOutfitElementObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(function(mutation) {
      if (mutation.type === "childList") {
        const NewNodes = mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            const NewNode = NewNodes[i]
            if (NewNode.className === "list-item item-card ng-scope six-column" && NewNode.getAttribute("ng-class") === "{'five-column' : !avatarLibrary.metaData.isCategoryReorgEnabled, 'six-column' : avatarLibrary.metaData.isCategoryReorgEnabled}") {
                console.log("new")
                NewOutfitElementAdded(NewNode)
            }
        }
      }
    })
  })

async function StartConversion(){
    let ScrollCostumesList = CostumesList.getElementsByTagName("div")[1].getElementsByTagName("div")[0].getElementsByTagName("ul")[0]

    NewOutfitElementObserver.observe(ScrollCostumesList, {childList: true})
}