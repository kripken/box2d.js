
var jackinthebox = function() {
    //constructor
}

jackinthebox.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 70;
    setViewCenterWorld( new Box2D.b2Vec2(0, 10.5), true );
}

jackinthebox.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created
    
    if ( loadSceneFromRUBE(jack_scene) ) //jack_scene is defined in jack-min.js
        console.log("RUBE scene loaded successfully.");
    else
        console.log("Failed to load RUBE scene");
        
    doAfterLoading();
    
}

jackinthebox.prototype.getComments = function(canvas, evt) {
    return "Created in R.U.B.E editor. Pull the latch to the side to open the box.";
}
