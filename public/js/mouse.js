var Mouse = new Object();
Mouse.lx = 0;
Mouse.ly = 0;
Mouse.px = 0;
Mouse.py = 0;

Mouse.update = function(){
}

 
$(document).mousedown(function(e){
    Mouse.lx = e.pageX;
    Mouse.ly = e.pageY;
});
$(document).mousemove(function(e){
    Mouse.px = e.pageX;
    Mouse.py = e.pageY;
});
$(document).mouseup(function(e){
    Mouse.lx = e.pageX - Mouse.lx;
    Mouse.ly = e.pageY - Mouse.ly;
    Mouse.update();
});
/*
document.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    Mouse.lx = touch.pageX;
    Mouse.ly = touch.pageY;
});
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    Mouse.px = touch.pageX;
    Mouse.py = touch.pageY;
});
document.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    Mouse.lx = touch.pageX - Mouse.lx;
    Mouse.ly = touch.pageY - Mouse.ly;
    Mouse.update();
});
*/
$(document).swipe( {
    swipeLeft: function(event, direction, distance, duration, fingerCount){
        Mouse.lx = -distance;
    }
    swipeRight: function(event, direction, distance, duration, fingerCount){
        Mouse.lx = distance;
    }
    swipeUp: function(event, direction, distance, duration, fingerCount){
        Mouse.ly = -distance;
    }
    swipeDown: function(event, direction, distance, duration, fingerCount){
        Mouse.ly = distance;
    }
});
