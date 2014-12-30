<?
$version = array(
    "stable_min"=>array("name"=>"2.2.1 compressed","file"=>"Box2D_v2.2.1_min.js"),
    "stable_debug"=>array("name"=>"2.2.1 debug","file"=>"Box2D_v2.2.1_debug.js"),
    "latest_min"=>array("name"=>"2.3.1 compressed","file"=>"Box2D_v2.3.1_min.js"),
    "latest_debug"=>array("name"=>"2.3.1 debug","file"=>"Box2D_v2.3.1_debug.js"),


    );
if (isset($_GET["version"]) && isset($version[$_GET["version"]])){
    $current=$_GET["version"];
} else {
    $current="stable_min";
}
?>
<!doctype html>
<html>
    <head>
        <title>Box2D javascript (emscripten-box2djs) testbed</title>

        <script type="text/javascript" src="../../build/<?=$version[$current]["file"];?>"></script>
        <script type="text/javascript" src="../../helpers/embox2d-helpers.js"></script>
        <script type="text/javascript" src="../../helpers/embox2d-html5canvas-debugDraw.js"></script>
         <script>
            var Box2D;
            if (!Box2D) Box2D = (typeof Box2D !== 'undefined' ? Box2D : null) || Module;
            window.onload = function() {
                using(Box2D, "b2.+")
            };
        </script>
        
        <script type="text/javascript" src="stats.min.js"></script>
        <script type="text/javascript" src="loadrube.js"></script>
        <script type="text/javascript" src="testbed.js"></script>

         <script type="text/javascript" src="tests/jack-min.js"></script>
        <script type="text/javascript" src="tests/jackinthebox.js"></script>
        
        <script type="text/javascript" src="tests/jointTypes-min.js"></script>
        <script type="text/javascript" src="tests/jointTypes.js"></script>
        

        <script type="text/javascript" src="tests/rube-min.js"></script>
        <script type="text/javascript" src="tests/rube.js"></script>

        <script type="text/javascript" src="tests/arg-min.js"></script>
        <script type="text/javascript" src="tests/arg.js"></script>
        
        <script type="text/javascript" src="tests/dominotower-min.js"></script>
        <script type="text/javascript" src="tests/dominotower.js"></script>

        <style>
            #data {
                width:636px;
                padding:2px;
                background-color:#ddd;
                position:relative;
            }
            #stats {
                position: absolute;
                right:0;
                top:0;
            }

        </style>

    </head>
    <body>

        <div style="text-align:center">
            <br>
            Box2D javascript (<a href="https://github.com/kripken/box2d.js"><b>emscripten-box2djs</b></a>) testbed.<br>                        
           
            <br>
            <br>
            <div style="margin:auto;width:640px;padding:2px;border:1px solid #888;text-align:left">            
                <canvas id="canvas" width="640" height="480" tabindex='1'></canvas>
                <div style="" id="data">
                <div style="text-align:center">
                    <p>
                    Select test: <select id="testSelection" onchange="changeTest();">
                        <option value="arg">Argadnet</option>
                        <option value="dominotower">Domino tower</option>
                        <option value="jointTypes">Joint types</option>
                        <option value="jackinthebox">Jack-in-the-box</option>
                        <option value="rubegoldberg">Rube Goldberg thingy</option>
                    </select> 
                    </p>
                    <p>
                    <form action="<?=$_SERVER['PHP_SELF'];?>" method="get"> Select emscripten-box2djs version: 
                        
                        <select onchange="this.form.submit();" name="version">
                        <?
                        foreach ($version as $key=>$arr){
                            
                            echo "<option value=\"{$key}\"";

                            if ($key == $current){
                                echo " selected";
                            }

                            echo ">{$arr['name']}</option>";
                        }
                        ?>
                        
                       
                        </select>
                        </form>
                    </p>
                    <div style="height:6px"></div>
                    <div id="sceneinfo" style="width:500px;margin:auto;background-color:#eee;text-align:left">
                        Loading...
                    </div>
                    <div id="testcomments" style="width:500px;margin:auto;background-color:#eee;text-align:left">
                        
                    </div>
                    <div id="stats"></div>
                    <br>
                    <button id="reloadButton" onclick="resetScene();">Reset</button>
                    <button id="pauseButton" onclick="pause();">Pause</button>
                    <button id="stepButton" onclick="step();">Single step</button>
                    (Keyboard: R, P, S)<br>
                    Zoom
                    <button id="zoomInButton" onclick="zoomIn();">+</button>
                    <button id="zoomOutButton" onclick="zoomOut();">-</button>
                    (Keyboard: X, Z)<br>
                    Hold down Shift while moving the mouse to pan (Keyboard: arrow keys)<br>
                    You need to click on the canvas before using the keyboard.<br>
                </div>
                <br>
                    
                Debug draw flags:<br>
                <input id="drawShapesCheck" type="checkbox" onclick="updateWorldFromDebugDrawCheckboxes();">Shapes<br>
                <input id="drawJointsCheck" type="checkbox" onclick="updateWorldFromDebugDrawCheckboxes();">Joints<br>
                <input id="drawAABBsCheck" type="checkbox" onclick="updateWorldFromDebugDrawCheckboxes();">AABBs<br>
                <input id="drawTransformsCheck" type="checkbox" onclick="updateWorldFromDebugDrawCheckboxes();">Transforms<br>
                <br>
                
                <input id="showStatsCheck" type="checkbox" onclick="updateContinuousRefreshStatus();">Show stats<br>
                <span id="feedbackSpan"></span>
                
                <br>
                </div>
            </div>        
        </div>
        
    </body>
</html>

