let SmoothScroll = class {

 /*
settingsObject:
el: scroll element selector
targetHeightPercentageFromTop: how high the target should be from the top
scrollElement: time for each scroll in milliseconds
calculation: wither time or fixed
stepSize: size of step when using fixed calculation method
*/
    constructor(prefs) {

        this.settings = {
            el: 'html',
            scrollTime: 1000,
            targetHeightPercentageFromTop: 0.5,
            calculation: 'time',
            stepSize: 1
        };

        if(prefs.targetHeightPercentageFromTop){
            this.settings.targetHeightPercentageFromTop = (Math.min(Math.max( prefs.targetHeightPercentageFromTop, 1), 100) / 100);
        }
        if(prefs.scrollTime){
            this.settings.scrollTime =   prefs.scrollTime;
        }
        if(prefs.stepSize){
            this.settings.stepSize =   prefs.stepSize;
        }
        if(prefs.calculation){
            this.settings.calculation = prefs.calculation;
        }

        const scrollElementSelector = prefs.el ? prefs.el : this.settings.el;
        this.scrollElement = document.querySelector(scrollElementSelector);

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

        let stepSize;

            if(this.settings.calculation === 'time'){
                stepSize = (scrollParams.stepDirection * totalNeededChange) / (60 * (this.settings.scrollTime / 1000));
            }else if(this.settings.calculation === 'fixed'){
                stepSize = scrollParams.stepDirection * this.settings.stepSize;
            }else {
                console.error(`invalid calculation method: ${this.settings.calculation}`);
                return;
            }



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
