async function LookForTrade(){
    const Params = (new URL(document.location)).searchParams
    const TradeId = Params.get("tradeid")

    if (!TradeId) return
    
    const Timeout = Date.now() + (5*1000)
    let TradeRow

    while (Timeout > Date.now() && !TradeRow){
        TradeRow = document.querySelectorAll(`div[tradeid="${TradeId}"][class^="trade-row"]`)[0]
        await sleep(20)
    }
    
    if (!TradeRow) return

    const Clicker = TradeRow.getElementsByClassName("trade-row-container click-detection")[0]
    if (Clicker) Clicker.click()
}

LookForTrade()