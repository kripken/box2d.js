
var jointTypes = function() {
    //constructor
}

jointTypes.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 45;
    setViewCenterWorld( new Box2D.b2Vec2(1.392, 3.206), true );
}

jointTypes.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created
    
    if ( loadSceneFromRUBE(joints_scene) ) //joints_scene is defined in jointTypes-min.js
        console.log("RUBE scene loaded successfully.");
    else
        console.log("Failed to load RUBE scene");
        
    doAfterLoading();
    
}

jointTypes.prototype.getComments = function(canvas, evt) {
    return "Created in R.U.B.E editor, demonstrates supported joint types.";
}
