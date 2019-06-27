
let _loadedImages = 0;
const _imageArray = new Array (
    'background.png',
    'blur.png',
    'cta.png',
    'fifthShadowText.png',
    'firstShadowText.png',
    'fourthShadowText.png',
    'logo.png',
    'phrase1.png',
    'phrase2.png',
    'phraseSeventh.png',
    'phraseSixth.png',
    'secondShadowText.png',
    'thirdShadowText.png',
);

// Scroll bar init elements.
const _isiControls = document.getElementById('isi-controls');
const _isiText = document.getElementById('js-content-move');
let _container = document.getElementById('js-container-moved');
let _scrollerBeingDragged = false;
let _scroller;
let _scrollerline;
let _arrowUp;
let _arrowDown;
let _normalizedPosition;
let _topPosition;
let _contentPosition = 0;
let _percentY;
let autoScroller;//Interval
let autoScrollSpeed = 160;
let scrollStep = 5;//Arrow click seek
let _textScrollHeight;

// Rect Values (0px: Top Value, 0px: Right Value, 0px: Bottom Value, 0px: Left Value).
// Arrays with starting values and ending values for transitions.
const x = ['rect(0px, 0px, 0px, 0px)', 'rect(0px, 0px, 0px, 0px)'];


this.addEventListener('DOMContentLoaded', preloadImages);

function preloadImages() {
    for (let i = 0; i < _imageArray.length; i++) {
        const _tempImage = new Image();
        _tempImage.addEventListener('load', trackProgress);
        _tempImage.src = _imageArray[i];
    }
}

function trackProgress(){
    _loadedImages++;
    if(_loadedImages == _imageArray.length) init();
}

function init(){
    const css = document.createElement( 'link' );
    css.setAttribute( 'rel', 'stylesheet' );
    css.setAttribute( 'type', 'text/css' );
    css.setAttribute( 'href', "style.css" );
    document.getElementsByTagName('head')[0].appendChild(css);

    css.addEventListener('load', initAnimations);

    //***** Start - Scroll creation and events registering.
    css.addEventListener('load', createScroll);
    //***** End
}

function initAnimations(){
    const _tlShowing = new TimelineMax();
    _tlShowing
    .set('.banner',{display: 'block'})

    // First text appears.
    // //////////
    .from('.first-catchphrase-opacity', 1, {opacity: ('0'), scale: ('0')})
    .addLabel('appearShadow')
    .from('.first-shadowText-opacity', 1, {top: ('150')}, 'appearShadow')
    .from('.second-shadowText-opacity', 1, {top: ('-100')}, 'appearShadow')
    .from('.third-shadowText-opacity', 1, {top: ('200')}, 'appearShadow')
    .from('.fourth-shadowText-opacity', 1, {top: ('200')}, 'appearShadow')
    .to([
        '.first-shadowText-opacity',
        '.second-shadowText-opacity',
        '.third-shadowText-opacity',
        '.fourth-shadowText-opacity'
    ], 15, {opacity: ('0')})
    .to('.first-catchphrase-opacity', 2, {opacity: ('0'), scale: ('0')}, '-=13')
    .from('.second-catchphrase-opacity', 1, {opacity: ('0'), scale: ('0')}, '-=12')
    .from('.small-letters-position', 1, {opacity: ('0'), left: ('-100')}, '-=11')

    .addLabel('boxMovement', '-=7.5')
    .to('.second-catchphrase-opacity', 1, {left: ('-250')}, 'boxMovement')
    .to('.small-letters-position', 1, {left: ('-250')}, 'boxMovement')

    .from('.third-catchphrase-opacity', 1, {x: ('300')}, 'boxMovement')
    .from('.logo-position', 1, {x: ('300')}, 'boxMovement')
    .from('.cta-action', 1, {x: ('300'), onComplete: actionsButton}, 'boxMovement');
    autoScroller = setInterval(autoScroll, autoScrollSpeed);
    // //////////
}

function actionsButton() {
    TweenMax.to(_btnExit, 1,{zIndex: ('100')})
    _btnExit.addEventListener('mouseover', () => {
        TweenMax.to('.blur-shadow', 1,{opacity: ('1')})
        TweenMax.to('.cta-action', 1, {x: ('15')})
    });

    _btnExit.addEventListener('mouseout', () => {
        TweenMax.to('.blur-shadow', 1,{opacity: ('0.5')})
        TweenMax.to('.cta-action', 1, {ease: Elastic.easeOut.config(1, 0.4), x: ('0')})
    });

    // const looperBanner = function() {
    //     location.reload();
    // }
    // setTimeout(looperBanner, 20000);
}


//***** Scrolling functions *****//
function createScroll(hasArrows, hasScroller){//***** Scrolling function - Creation(init)
    hasArrows = typeof hasArrows !== 'undefined' ? hasArrows: true;
    hasScroller = typeof hasScroller !== 'undefined' ? hasScroller: true;
    if (hasArrows){
        _arrowUp= document.createElement("div");
        _arrowUp.id = 'arrowUp';
        _arrowUp.className = 'retina';
        _isiControls.appendChild(_arrowUp);
    }

    if (hasScroller){
        _scrollerline= document.createElement("div");
        _scrollerline.className = hasArrows? 'isiLineWithArrows': 'isiLineNoArrows';
        _isiControls.appendChild(_scrollerline);

        _scroller = document.createElement("div");
        _scroller.className = 'scroller';
        _scrollerline.appendChild(_scroller);
    }

    if (hasArrows){
        _arrowDown= document.createElement("div");
        _arrowDown.id = 'arrowDown';
        _arrowDown.className = 'retina';
        _isiControls.appendChild(_arrowDown);
    }

//Listeners    
    if (hasScroller){
        _isiText.addEventListener('scroll',moveScroller);

        _scroller.addEventListener('mousedown',startDrag);
        _scrollerline.addEventListener('click', seekTo);

        window.addEventListener('mousemove',scrollBarScroll);
    }
    
    if (hasArrows){
        _arrowUp.addEventListener('mousedown', scrollUp);
        _arrowDown.addEventListener('mousedown', scrollDown);
        _arrowUp.addEventListener('mouseup', scrollStop);
        _arrowDown.addEventListener('mouseup', scrollStop);
        
    }
    
    _isiText.addEventListener('wheel', isiWheel);
    window.addEventListener('mouseup',stopDrag);
    
}

function seekTo(evt){//***** Scrolling function - Seeks to an specific point
    var normalPosition = (evt.clientY - _isiControls.offsetParent.offsetTop - _scrollerline.offsetTop) / _scrollerline.clientHeight;
    _textScrollHeight = _isiText.scrollHeight - _container.offsetHeight;//gets the text height(offset) to scroll
    _isiText.scrollTop = normalPosition * _textScrollHeight;
    clearInterval(autoScroller);    
}

function startDrag(evt) {//***** Scrolling function - Starts dragging when holds scroller button
    _normalizedPosition = evt.clientY - _scrollerline.scrollTop;
    _contentPosition = _isiText.scrollTop;
    _scrollerBeingDragged = true;
    clearInterval(autoScroller);
}

function stopDrag(evt) {//***** Scrolling function - Stops dragging when releases scroller button
    if (typeof buttonPress != 'undefined' && buttonPress)
    clearInterval(buttonPress);    
    _scrollerBeingDragged = false;
}

function scrollBarScroll(evt) {//***** Scrolling function - Moves text up/down
        evt.preventDefault();
    if (_scrollerBeingDragged === true) {
        var mouseDifferential = evt.clientY - _normalizedPosition;
        var scrollEquivalent = mouseDifferential * (_isiText.scrollHeight / _scrollerline.clientHeight);
        _isiText.scrollTop = _contentPosition + scrollEquivalent;
    }
}

function moveScroller(evt) {//***** Scrolling function - Moves scroller button up/down
    evt.preventDefault();
    _textScrollHeight = _isiText.scrollHeight - _container.offsetHeight;//gets the text height(offset) to scroll
    var remainOffsetHieght = _textScrollHeight - _isiText.scrollTop;//when scrolling, it gets the remaining height(top offset)
    var percentHeigh = 1 - remainOffsetHieght/_textScrollHeight;//transform to a percentage
    _scroller.style.top = Math.abs((_scrollerline.offsetHeight -_scroller.offsetHeight) * percentHeigh) + 'px';//To equivalent scroller line height
}

function autoScroll(){//***** Scrolling function - Autoscrolls text velocity must be and integer
        _isiText.scrollTop+=1;
}

function isiWheel(evt){//***** Scrolling function - Clears autoscroll interval when mouse wheel scrolling
    clearInterval(autoScroller);
}

function scrollUp(){//***** Scrolling function - Sets text a step up
    console.log("up");
    clearInterval(autoScroller);
    buttonPress = setInterval(function(){_isiText.scrollTop-=scrollStep}, 100);
}

function scrollDown(){//***** Scrolling function - Sets text a step down
    console.log("down")
    clearInterval(autoScroller);
    buttonPress = setInterval(function(){_isiText.scrollTop+=scrollStep}, 100);
}

function scrollStop(){//***** Scrolling function - Clears buttons interval
    clearInterval(buttonPress);
}