const FetchedCaches = {}
const SummaryCacheDisabled = true

function FetchCache(IdType, Type, Time){
    if (SummaryCacheDisabled) return

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
    if (SummaryCacheDisabled) return

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
    if (SummaryCacheDisabled) return
    
    const List = FetchCache(IdType, Type, Time).List

    List.sort(function(a, b){
        return new Date(b.created).getTime() - new Date(a.created).getTime()
    })
}

function AddToCache(IdType, Type, Time, Transcation){
    if (SummaryCacheDisabled) return

    const List = FetchCache(IdType, Type, Time)
    List.List.unshift(Transcation)
    List.IdMap[Transcation.id] = Transcation
}

function SaveCache(IdType, Type, Time){
    if (SummaryCacheDisabled) return

    const ExistingCache = FetchedCaches[Type]?.[Time]
    if (!ExistingCache) return

    window.localStorage.setItem(`robloxqol-summarycache-${IdType}+${Type}+${Time}`, JSON.stringify(ExistingCache.List))
}

function KillAllCaches(){
    const Types = ["users", "groups"]
    const Times = [1, 7, 30, 365]
    const Summaries = ["GroupPayout", "EngagementPayout", "Sale", "AffiliateSale"]

    for (let i = 0; i < Types.length; i++){
        const Type = Types[i]

        for (let o = 0; o < Times.length; o++){
            const Time = Times[o]

            for (let m = 0; m < Summaries.length; m++){
                const Summary = Summaries[m]

                window.localStorage.removeItem(`robloxqol-summarycache-${Type}+${Summary}+${86400*Time}`)
            }
        }
    }
}

function IsIdInCache(IdType, Type, Time, Id){
    if (SummaryCacheDisabled) return
    return FetchCache(IdType, Type, Time).IdMap[Id]
}