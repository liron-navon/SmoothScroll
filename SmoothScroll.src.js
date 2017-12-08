let SmoothScroll = class {

    /*
    settingsObject:
el: scroll element selector
targetHeightPercentageFromTop: how high the target should be from the top
scrollElement: time for each scroll in milliseconds
*/
    constructor(prefs) {

        const DefaultPrefs = {
            el: 'html',
            scrollTime: 1000,
            targetHeightPercentageFromTop: 50
        };

        const heightPercentageFromTop = prefs.targetHeightPercentageFromTop ? prefs.targetHeightPercentageFromTop : DefaultPrefs.targetHeightPercentageFromTop;
        const scrollElementSelector = prefs.el ? prefs.el : DefaultPrefs.el;

        this.scrollElement = document.querySelector(scrollElementSelector);

        if(!prefs.scrollTime){
            prefs.scrollTime = DefaultPrefs.scrollTime;
        }

        this.settings = {
            scrollTime: prefs.scrollTime,
            //calculate the height percentage from the top of the browser window and clamp it to a value between 1 and 100
            targetHeightPercentageFromTop : (Math.min(Math.max(heightPercentageFromTop, 1), 100) / 100)
        }
    }

    /*
    Scroll to a given element
     */
    scrollToElement(targetElement ,onScrollEnded) {

        let buffer = this.scrollElement.scrollTop;
        if (this.intervalId) {
            clearInterval(this.intervalId); //clear the last interval if one is defined
        }

        const scrollParams = this.getScrollParamenters(targetElement);
        const targetPosition = scrollParams.targetPosition;
        const totalNeededChange = Math.abs(this.scrollElement.scrollTop - targetPosition);

        let stepSize = (scrollParams.stepDirection * totalNeededChange) / (60 * (this.settings.scrollTime / 1000));

        let checkCondition = () => {
            if (stepSize < 0) {
                return this.scrollElement.scrollTop <= targetPosition;
            } else if (stepSize > 0) {
                return this.scrollElement.scrollTop >= targetPosition;
            } else {
                return true;
            }
        };

        this.intervalId = setInterval(() => {

            buffer += stepSize;
            this.scrollElement.scrollTop = buffer;

            if (checkCondition() // if hit the scroll point
                || (this.scrollElement.scrollTop + (Math.abs(stepSize) * 5)) < Math.abs(buffer)) { // if we fall behind the buffer by 5 steps or more
                clearInterval(this.intervalId);
                if(onScrollEnded){
                    onScrollEnded(targetElement);
                }
            }
        }, 16.6666667) // 60 fps
    }

    /*
    Produce an object containing the direction we need to scroll in (up => -1 , down => 1, none => 0)
    and the position we need to get to
    */
    getScrollParamenters(to) {

        const bodyRect = document.body.getBoundingClientRect();
        const elementRect = to.getBoundingClientRect();

        let offset = elementRect.top - bodyRect.top;

        offset = offset - (window.innerHeight * this.settings.targetHeightPercentageFromTop);

        //determine if we need to scroll up or down
        let change = 0;
        if (this.scrollElement.scrollTop > offset) {
            change = -1;
        } else if (this.scrollElement.scrollTop < offset) {
            change = 1;
        }

        return {
            stepDirection: change,
            targetPosition: Math.round(offset)
        }
    }

    /*
    override all href links with internal id (#) to use smooth scroll
     */
    listenToAllInternalLinks(onScrollEnded , onScrollStart) {
        let allInternalLinks = [];
        allInternalLinks.push(...document.querySelectorAll("[href^='#']"));

        if (!allInternalLinks) {
            return;
        }

        allInternalLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();

                let href = event.target.href;

                if (!href) {

                    for (let i = 0; i < 3; i++) {
                        href = event.target.parentElement.href;
                        if (href) {
                            break;
                        }
                    }

                    if (!href) {
                        return;
                    }
                }

                const elementId = href.substring(href.lastIndexOf('#') + 1);

                if (!elementId) {
                    return;
                }

                const targetElement = document.getElementById(elementId);

                if (!targetElement) {
                    return;
                }

                if(onScrollStart){
                    onScrollStart(targetElement , event)
                }

                this.scrollToElement(targetElement , onScrollEnded);

            });
        })
    }

};
