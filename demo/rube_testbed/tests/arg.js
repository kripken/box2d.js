
var arg = function() {
    //constructor
}

arg.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 11;
    setViewCenterWorld( new Box2D.b2Vec2(0, 10), true );
}

arg.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created

    if ( loadSceneFromRUBE(argScene) ) //jack_scene is defined in jack-min.js
        console.log("RUBE scene loaded successfully.");
    else
        console.log("Failed to load RUBE scene");

    doAfterLoading();

}

arg.prototype.getComments = function(canvas, evt) {
    return "Created in R.U.B.E editor.";
}
