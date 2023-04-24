const lerp = (start, end, speed) => start + (end - start) * speed

IsFeatureEnabled("ResizableChatBoxes").then(async function(Enabled){
    if (!Enabled) return

    const Dialogs = await WaitForId("dialogs")
    ChildAdded(Dialogs, true, async function(Dialog){
        ChildAdded(Dialog, true, async function(Container){
            const MainDialog = await WaitForClassPath(Container, "dialog-main")
            const ScrollChat = await WaitForClassPath(MainDialog, "rbx-scrollbar")
            const DialogHeader = await WaitForClassPath(MainDialog, "dialog-header")

            const DragElement = document.createElement("div")
            DragElement.style = "width: 10%; height: 50%; position: absolute;"
            DialogHeader.appendChild(DragElement)

            function IsCollapsed(){
                return Container.className.includes("collapsed")
            }
            function IsFocused(){
                return Container.className.includes("focused")
            }

            let LastWidth
            let LastHeight
            let LastCollapsed = IsCollapsed()
            let LastFocused = false

            new MutationObserver(function(Mutations){
                Mutations.forEach(function(Mutation){
                    if (Mutation.attributeName === "class"){
                        let Collapsed = IsCollapsed()
                        if (Collapsed != LastCollapsed){
                            LastCollapsed = Collapsed

                            if (Collapsed) {
                                DragElement.style.cursor = ""
                                Container.style.height = ""
                                Container.style.width = ""
                            } else {
                                if (LastHeight) Container.style.height = LastHeight
                                if (LastWidth) Container.style.width = LastWidth
                                DragElement.style.cursor = "nw-resize"
                            }
                        }

                        let Focused = IsFocused()
                        if (Focused != LastFocused){
                            LastFocused = Focused
                            Container.style["z-index"] = Focused ? 1061 : 1060
                        }
                    }
                })
            }).observe(Container, {attributes: true})

            DragElement.addEventListener("mousedown", function(e){
                if (IsCollapsed()) return

                let dragX = e.clientY
                let dragY = e.clientX

                e.preventDefault()

                window.onmousemove = function onMouseMove(e){
                    if (IsCollapsed()) return

                    LastHeight = Container.offsetHeight - (e.clientY - dragX) + "px"
                    LastWidth = Container.offsetWidth - (e.clientX - dragY) + "px"

                    Container.style.height = LastHeight
                    Container.style.width = LastWidth
                    ScrollChat.style.height = ScrollChat.offsetHeight - (e.clientY - dragX) + "px"

                    dragX = e.clientY
                    dragY = e.clientX
                }
            })

            window.onmouseup = function(){
                window.onmousemove = null
            }

            WaitForClassPath(MainDialog, "dialog-input-container").then(function(InputBox){
                InputBox.style.width = "100%"
                InputBox.style.position = "fixed"
                InputBox.style.bottom = "0px"
            })

            // WaitForClassPath(ScrollChat, "mCustomScrollBox", "mCSB_container").then(function(Scroller){
            //     let CurrentLerp = 0
            //     let LerpCount = 0

            //     function GetCurrentY(){
            //         return parseInt(Scroller.style.top.replaceAll("px", ""))
            //     }

            //     Scroller.addEventListener("wheel", function(e){
            //         e.stopImmediatePropagation()
            //         e.preventDefault()
                    
            //         const StartTime = Date.now()
            //         const StartY = GetCurrentY()
            //         const NewY = GetCurrentY() - e.deltaY * 2
            //         const Duration = 100

            //         //if (NewY < -940) return

            //         LerpCount++
            //         const LerpCountCache = LerpCount

            //         function Update(){
            //             const Elapsed = Date.now() - StartTime
            //             const Time = clamp(Elapsed / Duration, 0, 1)

            //             if (LerpCountCache != LerpCount) return

            //             CurrentLerp = lerp(StartY, NewY, Time)

            //             console.log(Time)
            //             Scroller.style.top = CurrentLerp+"px"

            //             if (Time < 1){
            //                 requestAnimationFrame(Update)
            //             }
            //         }

            //         requestAnimationFrame(Update)
            //     })
            // })
        })
    })
})