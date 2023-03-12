const FetchedCaches = {}

function FetchCache(IdType, Type, Time){
    const ExistingCache = FetchedCaches[Type]?.[Time]
    if (ExistingCache) return ExistingCache

    const Cache = window.localStorage.getItem(`robloxqol-summarycache-${IdType}+${Type}+${Time}`)
    let NewCache = {IdMap: {}}

    if (Cache){
        NewCache.List = JSON.parse(Cache)
    } else {
        NewCache.List = []
    }

    for (let i = 0; i < NewCache.List.length; i++){
        const Transaction = NewCache.List[i]
        NewCache.IdMap[Transaction.id] = Transaction
    }

    if (!FetchedCaches[Type]) FetchedCaches[Type] = {}
    FetchedCaches[Type][Time] = NewCache

    return NewCache
}

function TrimCache(IdType, Type, Time){
    const List = FetchCache(IdType, Type, Time).List
    const CurrentTime = (new Date().getTime())/1000

    for (let i = 0; i < List.length; i++){
        const Transaction = List[i]

        const CurrentDate = new Date(Transaction.created)
        if (CurrentDate.getTime()/1000 <= CurrentTime-Time){
            List.splice(i)
            return
        }
    }
}

function SortCache(IdType, Type, Time){
    const List = FetchCache(IdType, Type, Time).List

    List.sort(function(a, b){
        return new Date(b.created).getTime() - new Date(a.created).getTime()
    })
}

function AddToCache(IdType, Type, Time, Transcation){
    const List = FetchCache(IdType, Type, Time)
    List.List.unshift(Transcation)
    List.IdMap[Transcation.id] = Transcation
}

function SaveCache(IdType, Type, Time){
    const ExistingCache = FetchedCaches[Type]?.[Time]
    if (!ExistingCache) return

    window.localStorage.setItem(`robloxqol-summarycache-${IdType}+${Type}+${Time}`, JSON.stringify(ExistingCache.List))
}

function IsIdInCache(IdType, Type, Time, Id){
    return FetchCache(IdType, Type, Time).IdMap[Id]
}