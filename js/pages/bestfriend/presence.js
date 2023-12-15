const BestFriendPresenceScript = document.currentScript

function FetchFromPresenceHelper(UserIds){
    return new Promise(async(resolve) => {
        function OnEvent(e){
            document.removeEventListener("RobloxQoL.GetBestFriendsPresenceResponse", OnEvent)
            resolve(e?.detail)
        }

        document.addEventListener("RobloxQoL.GetBestFriendsPresenceResponse", OnEvent)

        while (!BestFriendPresenceScript.getAttribute("presencehelper-ready")) await new Promise(r => setTimeout(r, 50))
        document.dispatchEvent(new CustomEvent("RobloxQoL.GetBestFriendsPresence", {detail: UserIds}))
    })
}

function IsFeatureEnabled(Feature){
    return new Promise(async(resolve) => {
        function OnEvent(e){
            document.removeEventListener("RobloxQoL.IsFeatureEnabledResponse", OnEvent)
            resolve(e?.detail)
        }

        document.addEventListener("RobloxQoL.IsFeatureEnabledResponse", OnEvent)

        document.dispatchEvent(new CustomEvent("RobloxQoL.IsFeatureEnabled", {detail: Feature}))
    })
}

function SplitArrayIntoChunks(Array, chunkSize){
    const Chunks = []
  
    for (let i = 0; i < Array.length; i += chunkSize) {
        const chunk = Array.slice(i, i + chunkSize)
        Chunks.push(chunk)
    }
  
    return Chunks
  }

async function PopulateUniverse(Presences){
    const Chunks = SplitArrayIntoChunks(Presences, 10)
    while (Chunks.length > 0){
        const UniverseIds = []
        const Lookup = {}
        const Chunk = Chunks.pop()
        
        for (let i = 0; i < Chunk.length; i++){
            const Item = Chunk[i]
            UniverseIds.push(Item.universeId)
            
            if (!Lookup[Item.universeId]) Lookup[Item.universeId] = []
            Lookup[Item.universeId].push(Item)
        }

        try {
            const Response = await fetch(`https://games.roblox.com/v1/games?universeIds=${UniverseIds.join(",")}`)
            const JSON = await Response.json()

            const Data = JSON.data
            for (let i = 0; i < Data.length; i++){
                const Universe = Data[i]
                const Lookups = Lookup[Universe.id]
                
                for (let i = 0; i < Lookups.length; i++){
                    const Item = Lookups[i]
                    Item.rootPlaceId = Universe.rootPlaceId
                    Item.placeId = Universe.rootPlaceId
                    Item.lastLocation = Universe.name
                }
            }
        } catch {}
    }
}

IsFeatureEnabled("BestFriendPresenceV2").then(function(Enabled){
    if (!Enabled || !window.location.href.includes("www.roblox.com")) return

    var _XMLHttpRequest = XMLHttpRequest;
    XMLHttpRequest = function() {
        var xhr = new _XMLHttpRequest();

        // augment/wrap/modify here
        var _open = xhr.open;
        xhr.open = function(_, url) {
            if (url === "https://presence.roblox.com/v1/presence/users"){
                
                var _send = xhr.send
                xhr.send = function(){

                    var _onreadystatechange = xhr.onreadystatechange
                    xhr.onreadystatechange = async function(e){
                        if (xhr.status == 200 && xhr.readyState == 4){
                            var Body
                            try {Body = JSON.parse(xhr.responseText)} catch {}
                            if (Body){

                                //ok
                                const Users = []
                                const Presences = Body.userPresences
                                const UserIdToPresence = {}
                                
                                for (let i = 0; i < Presences.length; i++){
                                    const Presence = Presences[i]
                                    if (Presence.userPresenceType !== 2 || Presence.universeId) continue

                                    UserIdToPresence[Presence.userId] = Presence
                                    Users.push(Presence.userId)
                                }

                                //my goodness this code is terrible but is the only way to efficiently query the database.

                                if (Users.length > 0){
                                    
                                    const Populate = []
                                    if (Users.length === 1){

                                        try {
                                            const Response = await FetchFromPresenceHelper(Users)
                                            if (Response && Response.ok){
                                                const BestFriendPresence = Response.json

                                                if (BestFriendPresence.UniverseId){
                                                    const Presence = UserIdToPresence[Users[0]]

                                                    Presence.universeId = BestFriendPresence.UniverseId
                                                    Presence.gameId = BestFriendPresence.JobId
                                                    Populate.push(Presence)
                                                }
                                            }
                                        } catch (error) {console.log(error)}

                                    } else {

                                        try {
                                            const Response = await FetchFromPresenceHelper(Users)
                                            if (Response && Response.ok){
                                                const BestFriendsPresence = Response.json

                                                for (let i = 0; i < BestFriendsPresence.length; i++){
                                                    const BestFriendPresence = BestFriendsPresence[i]
                                                    const Presence = UserIdToPresence[BestFriendPresence.UserId]

                                                    Presence.universeId = BestFriendPresence.UniverseId
                                                    Presence.gameId = BestFriendPresence.JobId
                                                    Populate.push(Presence)
                                                }
                                            }
                                        } catch (error) {console.log(error)}
                                    }

                                    if (Populate.length > 0) await PopulateUniverse(Populate)

                                    try {
                                        Object.defineProperties(this, {
                                            responseText: {writable: true, configurable: true, value: JSON.stringify(Body)},
                                            response: {writable: true, configurable: true, value: Body}
                                        })
                                    } catch (error) {console.log(error)}
                                }
                            }
                        }

                        if (_onreadystatechange) return _onreadystatechange.apply(this, arguments)
                    }

                    return _send.apply(this, arguments)
                }

            }

            return _open.apply(this, arguments);
        }

        return xhr;
    }

    //intercept fetch too
    const _fetch = fetch
    window.fetch = async function(...args){
        const response = await _fetch(...args)
        if (response.url !== "https://presence.roblox.com/v1/presence/users" || !response.ok) return response

        const Body = await response.clone().json()

        const Users = []
        const Presences = Body.userPresences
        const UserIdToPresence = {}
        
        for (let i = 0; i < Presences.length; i++){
            const Presence = Presences[i]
            if (Presence.userPresenceType !== 2 || Presence.universeId) continue

            UserIdToPresence[Presence.userId] = Presence
            Users.push(Presence.userId)
        }

        //my goodness this code is terrible but is the only way to efficiently query the database.

        if (Users.length > 0){
            
            const Populate = []
            if (Users.length === 1){

                try {
                    const Response = await FetchFromPresenceHelper(Users)
                    if (Response && Response.ok){
                        const BestFriendPresence = Response.json

                        if (BestFriendPresence.UniverseId){
                            const Presence = UserIdToPresence[Users[0]]

                            Presence.universeId = BestFriendPresence.UniverseId
                            Presence.gameId = BestFriendPresence.JobId
                            Populate.push(Presence)
                        }
                    }
                } catch (error) {console.log(error)}

            } else {

                try {
                    const Response = await FetchFromPresenceHelper(Users)
                    if (Response && Response.ok){
                        const BestFriendsPresence = Response.json

                        for (let i = 0; i < BestFriendsPresence.length; i++){
                            const BestFriendPresence = BestFriendsPresence[i]
                            const Presence = UserIdToPresence[BestFriendPresence.UserId]

                            Presence.universeId = BestFriendPresence.UniverseId
                            Presence.gameId = BestFriendPresence.JobId
                            Populate.push(Presence)
                        }
                    }
                } catch (error) {console.log(error)}
            }

            if (Populate.length > 0) await PopulateUniverse(Populate)

            return new Response(JSON.stringify(Body), {status: response.status, statusText: response.statusText, headers: response.headers})
        }

        return response
    }
})