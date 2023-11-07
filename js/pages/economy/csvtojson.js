function SalesOfGoodsCSVToJSON(CSV){
    const JSON = []
    //const Rows = CSV.split("\n")

    let Rows = []
    let Columns = []
    let Line = ""
    let IsEscaped = true
    
    for (let i = 0; i < CSV.length; i++){
        const Character = CSV.charAt(i)
        Line += Character

        if (Character == "\n"){
            Columns.push(Line.replace("\r", "").replace("\n", ""))
            Line = ""

            Rows.push(Columns)
            Columns = []
        }

        if (Character == '"') IsEscaped = !IsEscaped

        if (Character == "," && IsEscaped){
            Columns.push(Line.substring(0, Line.length-1))
            Line = ""
        }
    }

    for (let i = 1; i < Rows.length; i++){
        const Columns = Rows[i]
        JSON.push({HashId: Columns[0], UserId: parseInt(Columns[1]), Date: Columns[2], SaleLocation: Columns[3], SaleLocationId: Columns[4], UniverseId: parseInt(Columns[5]), Universe: Columns[6], AssetId: parseInt(Columns[7]), AssetName: Columns[8], AssetType: Columns[9], Pending: Columns[10] === "Held", Profit: parseInt(Columns[11]), Price: parseInt(Columns[12])})
    }

    return JSON
}

function CreateCSVUpload(){
    const Container = document.createElement("div")
    Container.className = "input-group-btn group-dropdown trade-list-dropdown open"
    Container.style = "width: 150px; display: contents; margin-right: 20px;"

    const Form = document.createElement("form")
    Form.style = "height: 30px;"

    const Label = document.createElement("label")
    Label.setAttribute("for", "uploadCSV")
    Label.className = "csv-upload-button"
    Label.innerText = "Upload CSV Instead"

    const Input = document.createElement("input")
    Input.style = "display: none;"
    Input.type = "file"
    Input.id = "uploadCSV"
    Input.name = "filename"
    Input.setAttribute("accept", ".csv")

    Form.append(Label, Input)
    Container.appendChild(Form)

    return [Container, Input, Label]
}

function InfoToString(Info){
    return Info.AssetType+"-"+Info.AssetId
}

async function AddPlaceIds(Places){
    const Chunks = []

    for (let i = 0; i < Places.length; i++){
        Chunks.push(Places[i])
    }

    while (true){
        const Chunk = []
        const Lookup = {}

        while (true){
            const Info = Chunks.pop()

            if (!Info) break
            if (Info.Type != "Place") continue

            if (!Lookup[Info.UniverseId]){
                Chunk.push(Info.UniverseId)
                Lookup[Info.UniverseId] = []
            }
            Lookup[Info.UniverseId].push(Info)

            if (Chunk.length >= 10) break
        }

        if (Chunk.length === 0) break

        const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${Chunk.join(",")}`, "GET", undefined, undefined, true)

        if (!Success) continue
        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            const Game = Data[i]
            
            const Universes = Lookup[Game.id]
            for (let o = 0; o < Universes.length; o++){
                Universes[o].Name = Game.name
                Universes[o].details.place.name = Game.name
                Universes[o].details.place.placeId = Game.rootPlaceId
            }
        }
    }
}

async function AddUsernames(Items){
    const Chunks = []

    for (let i = 0; i < Items.length; i++){
        Chunks.push(Items[i])
    }

    while (true){
        const Chunk = []
        const Lookup = {}

        while (true){
            const Info = Chunks.pop()

            if (!Info) break
            if (!Lookup[Info.agent.id]){
                Chunk.push(Info.agent.id)
                Lookup[Info.agent.id] = []
            }
            Lookup[Info.agent.id].push(Info)

            if (Chunk.length >= 200) break
        }

        if (Chunk.length === 0) break

        while (true){
            const [Success, Result, Response] = await RequestFunc(`https://users.roblox.com/v1/users`, "POST", undefined, JSON.stringify({userIds: Chunk, excludeBannedUsers: false}), true)

            if (!Success){
                if (Response.status == 429) {
                    await sleep(2000)
                    continue
                }
                break
            }
            const Data = Result.data

            for (let i = 0; i < Data.length; i++){
                const User = Data[i]
                const Users = Lookup[User.id]

                for (let o = 0; o < Users.length; o++){
                    Users[o].name = User.displayName
                    Users[o].trueName = User.name
                }
            }

            break
        }
    }
}

async function SalesOfGoodsCSV(CSV, Type){
    const JSON = SalesOfGoodsCSVToJSON(CSV)

    const Items = []
    //const ItemLookup = {}

    for (let i = 0; i < JSON.length; i++){
        const Info = JSON[i]
        
        //if (!ItemLookup[InfoToString(Info)]){
        const Item = {Type: Info.AssetType == "Game Pass" && "GamePass" || Info.AssetType == "Developer Product" && "DeveloperProduct" || Info.AssetType == "Private Server Product" && "Place" || "Asset", Name: Info.AssetName, UniverseId: Info.UniverseId, Robux: 0, Id: Info.AssetId, details: {place: {name: Info.Universe, placeId: 0, universeId: Info.UniverseId}}, currency: {amount: Info.Profit, type: "Robux"}, agent: {id: Info.UserId, type: "User", name: "Terminated User"}}
        Item.details.type = Item.Type
        Item.details.id = Item.Id
        Item.details.name = Item.Name

            //ItemLookup[InfoToString(Info)] = Item
        Items.push(Item)
        //}

        //ItemLookup[InfoToString(Info)].Robux += Info.Profit
    }

    if (Type == "User") await AddUsernames(Items)

    return Items
}