# SmoothScroll.js

Watch the demo! 
https://codepen.io/liron42/full/bYXeKj/

A small lightwaight (2.26 KB) library to implement browser smooth scroll without jquary, and with easy settings

you can download it or use the rawgit cdn which serve the file directly from this repository:
```
<script src="https://cdn.rawgit.com/liron-navon/SmoothScroll/master/SmoothScroll.dist.min.js"></script>
```

It is very easy to setup by just calling:

```javascript
let smoothScroll = new SmoothScroll(); //setup smooth scroll
scroller.listenToAllInternalLinks(); // override all href links with internal id (#) to use smooth scroll
```

And in the html just use

```
<a href="#myInternalLinkId">go to some internal link smoothly</a>
```

Or just use it from your js code with any framework like so:

```javascript
smoothScroll.scrollToElement(document.getElementById('targetId')) // vanila
smoothScroll.scrollToElement(this.$refs.myRefName) // vue
smoothScroll.scrollToElement(this.myViewChild.nativeElement) // angular
```
In order to configure the smooth scroll you can pass an object to the constructor (this are the default settings also seen in the demo):

```javascript
let smoothScroll = new SmoothScroll({
        el:'html', // an html element to use as a scroll medium (for things like scrolling inside a div)
        scrollTime: 1000, // the time for each scroll in milliseconds (from current position to the target's position)
        targetHeightPercentageFromTop: 50; /* percentage from top for the element to be: 100 will make it scroll until the             element is at the bottom of the screen, and 50 will make it scroll until the element is at the center of the screen */
    });
```
