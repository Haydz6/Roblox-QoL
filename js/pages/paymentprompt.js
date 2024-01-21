async function CreatePaymentModalV2(Footer){
    const Modal = document.createElement("div")
    Modal.id = "modal-dialog"
    Modal.className = "modal-dialog purchase-modal-prompt-roqol"

    let Features = ["Best Friends", "Custom Themes", "500 Extra Outfits", "Voice Chat Servers", "Pinned Games"]
    const [Success, Result] = await RequestFunc(WebServerEndpoints.Configuration+"paidfeatures", "GET")
    if (Success) Features = Result.Features

    let Price = Success ? Result.Price : "5"

    Modal.innerHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 272px; width: 400px; left: 50%; top: 50%; transform: translate(-50%, -50%);"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage protocolhandler-starting-modal simplemodal-data" data-modal-type="confirmation" style="display: block;">
    <div id="modal-dialog" class="modal-dialog">
    <div class="modal-content">
        <div class="modal-header">
            <button type="button" class="close top-right-close-button" data-dismiss="modal" style="">
                <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span>
            </button>
            <h5 class="modal-title">RoQoL Premium</h5>
        </div>

        <div class="modal-body">
            <div class="modal-top-body">
                <div class="modal-message"><p class="modal-message-label" style="
    /* color: white; */
">This feature is only available to RoQoL Premium subscribers!</p></div>
                <div class="modal-image-container roblox-item-image" data-image-size="medium" data-no-overlays="" data-no-click="">
                    <img class="modal-thumb" alt="generic image">
                </div>
                <div class="modal-checkbox checkbox" style="display: none;">
                    <input id="modal-checkbox-input" type="checkbox">
                    <label for="modal-checkbox-input"></label>
                </div>
            </div><h5 style="
    margin-top: 10px;
    margin-bottom: 5px;
">Subscribe to get benefits such as:</h5>
    
    <ul class="feature-list" style="
    margin-left: 20px;
    margin-bottom: 15px;
"></ul>
            <div class="modal-btns" style="
">
                
                <a id="price-confirm-btn" class="btn-growth-md btn-full-width" target="_blank" href="https://roqol.io/pages/pricing" style="
    margin:  0;
    width: calc(100% - 40px);
">Subscribe for ${Price}$</a>
            </div>
        </div>
        <div class="modal-footer text-footer" ${Footer ? "" : `style="display: none;"`}>${Footer || ""}</div>
    </div>
    </div>
    </div></div></div>`

    setTimeout(function(){
        const Content = Modal.getElementsByClassName("modal-content")[0]
        Content.style.opacity = 1
    }, 0)

    const List = Modal.getElementsByClassName("feature-list")[0]
    for (let i = 0; i < Features.length; i++){
        const Item = document.createElement("li")
        Item.style = "list-style-type: disc;"
        Item.innerText = Features[i]
        List.appendChild(Item)
    }

    return Modal
}

const RegionPaidFooter = `<a style="text-decoration: underline; margin-bottom: 4px; width: 100%; display: block; text-align: center;" class="font-header-2 text-lead" href="https://roqol.io/pages/faq#server-region-paid" target="_blank">Learn why region filter is now paid</a>`

async function CreatePaymentPrompt(Footer){
    const Backdrop = document.createElement("div")
    Backdrop.id = "simplemodal-overlay" 
    Backdrop.className = "simplemodal-overlay"
    Backdrop.style = "background-color: rgb(0, 0, 0); opacity: 0.8; height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 1041;"

    // const Modal = document.createElement("div")
    // Modal.id = "modal-dialog"
    // Modal.className = "modal-dialog"
    // Modal.innerHTML = `<div id="simplemodal-container" class="simplemodal-container" style="position: fixed; z-index: 1042; height: 272px; width: 400px; left: 50%; top: 50%; transform: translate(-50%, -50%);"><a class="modalCloseImg simplemodal-close" title="Close"></a><div tabindex="-1" class="simplemodal-wrap" style="height: 100%; outline: 0px; width: 100%; overflow: visible;"><div id="modal-confirmation" class="modal-confirmation noImage protocolhandler-starting-modal simplemodal-data" data-modal-type="confirmation" style="display: block;">
    // <div id="modal-dialog" class="modal-dialog">
    // <div class="modal-content">
    //     <div class="modal-header">
    //         <button type="button" class="close top-right-close-button" data-dismiss="modal" style="">
    //             <span aria-hidden="true"><span class="icon-close"></span></span><span class="sr-only">Close</span>
    //         </button>
    //         <h5 class="modal-title">This feature is paid</h5>
    //     </div>

    //     <div class="modal-body">
    //         <div class="modal-top-body">
    //             <div class="modal-message"><p class="modal-message-label">Would you like to go the pricing page?</p></div>
    //             <div class="modal-image-container roblox-item-image" data-image-size="medium" data-no-overlays="" data-no-click="">
    //                 <img class="modal-thumb" alt="generic image">
    //             </div>
    //             <div class="modal-checkbox checkbox" style="display: none;">
    //                 <input id="modal-checkbox-input" type="checkbox">
    //                 <label for="modal-checkbox-input"></label>
    //             </div>
    //         </div>
    //         <div class="modal-btns">
    //             <a id="price-decline-btn" class="btn-control-md">Close</a>
    //             <a id="price-confirm-btn" class="btn-primary-md" target="_blank" href="https://roqol.io/pages/pricing">Go</a>
    //         </div>
    //     </div>
    //     <div class="modal-footer text-footer" style="display: none;"></div>
    // </div>
    // </div>
    // </div></div></div>`
    const Modal = await CreatePaymentModalV2(Footer)
    document.body.append(Backdrop, Modal)

    function Close(){
        Modal.remove()
        Backdrop.remove()
    }

    //document.getElementById("price-decline-btn").addEventListener("click", Close)
    document.getElementById("price-confirm-btn").addEventListener("click", Close)
    Modal.getElementsByClassName("close")[0].addEventListener("click", Close)

    return [Modal, Backdrop]
}