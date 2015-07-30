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
$(window).on("touchstart", function(ev) {
    Mouse.lx = e.pageX;
    Mouse.ly = e.pageY;
});
$(window).on("touchmove", function(ev) {
    Mouse.px = e.pageX;
    Mouse.py = e.pageY;
});
$(window).on("touchend", function(ev) {
    Mouse.lx = e.pageX - Mouse.lx;
    Mouse.ly = e.pageY - Mouse.ly;
    Mouse.update();
});
