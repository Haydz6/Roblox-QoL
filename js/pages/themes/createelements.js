function CreateThemeSection(){
    const Section = document.createElement("div")
    Section.className = "section profile-themes"

    const SectionContent = document.createElement("div")
    SectionContent.className = "section-content profile-themes-content ng-scope"
    SectionContent.style = "background-color: rgb(57, 59, 61);"

    Section.appendChild(SectionContent)

    return [Section, SectionContent]
}

function CreateScroller(Direction){
    const Scroller = document.createElement("div")
    Scroller.className = "scroller next"
    Scroller.style = "left: 0px;"

    const Arrow = document.createElement("div")
    Arrow.className = "arrow"

    const Image = document.createElement("span")
    Image.className = `icon-games-carousel-${Direction}`

    Arrow.appendChild(Image)
    Scroller.appendChild(Arrow)

    return Scroller
}

function CreateThemeList(){
    const ListContainer = document.createElement("div")
    ListContainer.className = "theme-list"

    const LeftScroller = CreateScroller("left")
    const RightScroller = CreateScroller("right")

    const OuterList = document.createElement("div")
    OuterList.className = "list-container"

    const List = document.createElement("li")
    List.className = "list"

    const LoadingSpinner = document.createElement("div")
    LoadingSpinner.className = "spinner spinner-default"
    LoadingSpinner.style = "top: 45%; position: absolute;"

    OuterList.append(LoadingSpinner, List)
    ListContainer.append(LeftScroller, OuterList, RightScroller)

    let CurrentPosition = 0
    let Loaded = false

    function SetImages(Images){
        for (let i = 0; i < Images.length; i++){
            const Name = Images[i]

            const ImageContainer = document.createElement("a")
            ImageContainer.className = "preview"
            
            const ImageElement = document.createElement("img")

            RequestFunc(`${WebServerEndpoints.ThemesImg}previews/${Name}`, "GET", undefined, undefined, false, true).then(async function([Success, _, Response]){
                if (!Success){
                    ImageElement.src = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
                    return
                }
                
                const Data = await Response.blob()
                let DataURL = await new Promise(resolve => {
                    let reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(Data);
                  });
                
                ImageElement.src = DataURL//`data:image/${Name.split(".")[1]};base64,${Data}`//`data:image/${Name.split(".")[1]};base64,${btoa(unescape(encodeURIComponent(Data)))}`
            })

            ImageContainer.appendChild(ImageElement)

            List.appendChild(ImageContainer)

            ImageContainer.addEventListener("click", function(){
                console.log(Name)
            })
        }

        Loaded = true
        CurrentPosition = 0
        LoadingSpinner.remove()
    }

    function Scroll(){
        if (!Loaded) return

        List.style.left = `${CurrentPosition * 1000}px`
    }

    LeftScroller.addEventListener("click", function(){
        CurrentPosition ++
        Scroll()
    })

    RightScroller.addEventListener("click", function(){
        CurrentPosition --
        Scroll()
    })

    return [ListContainer, SetImages]
}