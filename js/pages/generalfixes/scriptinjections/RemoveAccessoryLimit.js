async function RemoveAccessoryLimit(){
    const AssetTypes = [8, 41, 42, 43, 44, 45, 46, 47, 57, 58]
    const LayeredTypes = [64, 65, 66, 67, 68, 69, 70, 71, 72]

    let AvatarAccoutrementService
    while (true){
        AvatarAccoutrementService = Roblox?.AvatarAccoutrementService
        if (AvatarAccoutrementService) break
        await new Promise(r => setTimeout(r, 0))
    }

    const validateAdvancedAccessories = AvatarAccoutrementService.validateAdvancedAccessories
    AvatarAccoutrementService.validateAdvancedAccessories = function(...args){
        return validateAdvancedAccessories(args[0].filter(x => x.assetType !== 41))
    }

    const getAdvancedAccessoryLimit = AvatarAccoutrementService.getAdvancedAccessoryLimit
    AvatarAccoutrementService.getAdvancedAccessoryLimit = function(...args){
        if(AssetTypes.includes(+args[0]) || LayeredTypes.includes(+args[0])) {
            return
        }

        return getAdvancedAccessoryLimit(...args)
    }

    const addAssetToAvatar = AvatarAccoutrementService.addAssetToAvatar
    AvatarAccoutrementService.addAssetToAvatar = function(...args){
        const Result = addAssetToAvatar(...args)
        const Assets = [args[0], ...args[1]]

        let AccessoriesLeft = 10
        let LayeredLeft = 10

        function GetTypes(AssetType){
            const IsAccessory = AssetTypes.includes(AssetType)
            const IsLayered = LayeredTypes.includes(AssetType)
            const IsHackyLayered = IsLayered && AssetType === 41
            return [IsAccessory, IsLayered, IsHackyLayered]
        }

        function IsValid(Asset){
            const AssetType = Asset?.assetType?.id
            const [IsAccessory, IsLayered, IsHackyLayered] = GetTypes(AssetType)

            if (IsAccessory || IsHackyLayered){
                if (IsAccessory && AccessoriesLeft <= 0) return false
                if (IsHackyLayered && LayeredLeft <= 0) return false
                if (IsLayered) if (!Result.includes(Asset)) return false
                return true
            } else return Result.includes(Asset)
        }

        for (let i = 0; i < Assets.length; i++){
            const Asset = Assets[i]
            if (IsValid(Asset)){
                const AssetType = Asset?.assetType?.id
                const [IsAccessory, _, IsHackyLayered] = GetTypes(AssetType)
                if (IsAccessory) AccessoriesLeft --
                if (IsHackyLayered) AccessoriesLeft --
            } else Assets.splice(i--, 1)
        }

        return Assets
    }
}

RemoveAccessoryLimit()