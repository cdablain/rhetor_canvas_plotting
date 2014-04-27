/*  author cad
 *  dependencies -
 *    jquery.js
 *    rht_lang.js
 *    rht_expressions.js
 *    rht_shuntingyard.js
 */

function RhtFuncPlotting(){
    var shuntingYard = new RhtShuntingYard();
    var canvas = document.getElementById( "canvas" );
    var context = canvas.getContext( "2d" );

    var defaultPxPerCell = 20;
    var pxPerCell = defaultPxPerCell;
    var minPxPerCell = 2;
    var maxPxPerCell = 960;
    var pxWidth = 400;
    var pxCenter = 200;
    var xPhase = 0;     // Separate pxPhase and cellPhase
    var yPhase = 0;

    var expressionCount = 0;

    this.colors = new function() {
        var current = 0;
        var dict =  ["#009", "#090", "#900", "#099", "#909", "#990"];
        this.readNext = function() {
            if( current >= dict.length ) { current = 1;
            } else { current++; }
            return dict[current-1];
        };
        this.colorAfter = function( color ) {
          var index = 0;
          for( var i=0; i<dict.length; i++ ) {
              if( dict[i] == color ) {
                  index = i;
              }
          }
          if( index==dict.length-1 ) {
              return dict[0];
          }else {
              return dict[index+1];
          }
        };
    };
    this.draw_point = function( x, y ) {
        context.fillStyle = "#222222";
        context.beginPath();
        context.arc( (Number( x )-xPhase/defaultPxPerCell)*pxPerCell+pxCenter,
                     (-Number( y )-yPhase/defaultPxPerCell)*+pxPerCell+pxCenter,
                     3, 0, Math.PI*2, true );
        context.closePath();
        context.fill();
    };

    var draw_axis = function( x, y ) {
        context.beginPath();
        context.moveTo( x, pxWidth );
        context.lineTo( x, 0 );
        context.moveTo( 0, y );
        context.lineTo( pxWidth, y );
        context.strokeStyle = "#333";
        context.stroke();
    };

    this.draw_grid = function( xZeroLoc, yZeroLoc ) {	// WHAT'S WITH THE GHOSTING?!...
        var xOrigin = pxCenter-xPhase*(pxPerCell/defaultPxPerCell);
        var yOrigin = pxCenter-yPhase*(pxPerCell/defaultPxPerCell);

        for( var x = xOrigin+pxPerCell; x < pxWidth; x += pxPerCell ) {
            context.moveTo( x, 0 );
            context.lineTo( x, pxWidth );
        }
        for( var x = xOrigin-pxPerCell; x > 0; x -= pxPerCell ) {
            context.moveTo( x, 0 );
            context.lineTo( x, pxWidth );
        }
        for( var y = yOrigin+pxPerCell; y < pxWidth; y += pxPerCell ) {
            context.moveTo( 0, y );
            context.lineTo( 600, y );
        }
        for( var y = yOrigin-pxPerCell; y > 0; y -= pxPerCell ) {
            context.moveTo( 0, y );
            context.lineTo( 600, y );
        }

        context.strokeStyle = "#ccc";
        context.stroke();
        draw_axis( pxCenter-xPhase*(pxPerCell/defaultPxPerCell), pxCenter-yPhase*(pxPerCell/defaultPxPerCell) );
    };

    var draw_sane_line = function( xOne, yOne, xTwo, yTwo, color ) {
        var x1 = xOne  + pxCenter; var x2 = xTwo  + pxCenter;
        var y1 = -yOne + pxCenter; var y2 = -yTwo + pxCenter;

        context.beginPath();
        context.moveTo( x1, y1 );
        context.lineTo( x2, y2 );

        context.strokeStyle = color;
        context.stroke();
    };

    this.draw_plot = function( f, color ) {
        var step= 1;
        var draw_step = function( x1, y1, x2, y2 ) {  draw_sane_line( x1, y1, x2, y2, color );};
        for( var x = -pxCenter+0; x<pxCenter; x+=step ) {
            var x1 = x;
            var y1 =  pxPerCell* f( x1/pxPerCell + (xPhase/30)) + yPhase*(pxPerCell/defaultPxPerCell);
            var x2 = x1 + step;
            var y2 = pxPerCell* f( x2/pxPerCell + (xPhase/30)) + yPhase*(pxPerCell/defaultPxPerCell);
            draw_step( x1, y1, x2, y2 );
        }
    };
    this.draw_interior_plot = function( f, color ) {
        var step = 1;
        var draw_interior_line = function( x1, y1 ) {
            draw_sane_line( x1, y1, x1, yPhase*(pxPerCell/defaultPxPerCell)+0.001, color ); };

        for( var x = -pxCenter+0; x<pxCenter; x+=step ) {
            var y = pxPerCell * f( x/pxPerCell + (xPhase/defaultPxPerCell)) + yPhase*(pxPerCell/defaultPxPerCell);
            draw_interior_line( x, y );
        }
    };
    var draw_exterior_plot_negative = function( f, color ) {
        var step = 1;
        var draw_exterior_line = function( x1, y1 ) { draw_sane_line( x1, 300, x1, y1, color ); };
        for( var x = -pxCenter+0.0001; x<pxCenter; x+=step ) {
            var y = pxPerCell * f( x/pxPerCell + (xPhase/30)) + yPhase*(pxPerCell/30);
            draw_exterior_line( x, y );
        }
    };
    var draw_exterior_plot_positive = function( f, color ) {
        var step = 1;
        var draw_exterior_line = function( x1, y1 ) { draw_sane_line( x1, -300, x1, y1, color ); };
        for( var x = -pxCenter+0.0001; x<pxCenter; x+=step ) {
            var y = pxPerCell * f( x/pxPerCell + (xPhase/30) ) + yPhase*(pxPerCell/30);
            draw_exterior_line( x, y );
        }
    };
    this.draw_exterior_plot = function( f, color ) {
        draw_exterior_plot_negative( f, color );
        draw_exterior_plot_positive( f, this.colors.colorAfter(color) ); // This isn't good enough
    };
    this.bury_function = function( expression, color, plotType, n ) {
        var numExpressions = $("#functionDict").children().size();

        var funcHtml =     "<div class='rhtStoredExpression'>"+expression+"</div>";
        var colorHtml =    "<div class='rhtStoredColor'>"+color+"</div>";
        var plotTypeHtml = "<div class='rhtPlotType'>"+plotType+"</div>";
        var remove =       "<button id='removeButton" + n + "' class='removeButton'>hide</button>";
        var storedLi =     "<li id='storedPlotData" + n + "'>"+ funcHtml + colorHtml + plotTypeHtml + remove +  "</li>";

        $("#functionDict").append( storedLi );
        $("#functionDict").children().last().css( 'color', color );
    };
    this.bury_point = function( x, y, label ) {
        var numPoints = $("#pointDict").children().size();
        var xHtml = "<span class='rhtStoredX'>" + x + "</span>";
        var yHtml = "<span class='rhtStoredY'>" + y + "</span>";
        var labelHtml = "<span class='rhtStoredPointLabel'>" + label + "</span>";
        var remove = "<button id='removePointButton" + numPoints + "' class='removeButton'>hide</button>";
        var storedLi = "<li id='storedPointData" + numPoints +"'>" +
            " ( "+ xHtml + ", " + yHtml + " )"+ labelHtml + "</li>";
        $("#pointDict").append( storedLi );
    };
    var disinter_point = function( i ) {
        return [$("#pointDict").children().eq(i).children().first().html(),
                $("#pointDict").children().eq(i).children().eq(1).html(),
                $("#pointDict").children().eq(i).children().eq(2).html() ];
    };
    var disinter_function = function ( i ) {
        return [$("#functionDict").children().eq(i).children().first().html(),
                $("#functionDict").children().eq(i).children().eq( 2 ).html() ,
                $("#functionDict").children().eq(i).children().eq( 1 ).html() ];
    };

    var read_point_history = function() {
        var points = [];
        for( var i = 0; i< $("#pointDict").children().size(); i++ ) { points[points.length] = disinter_point( i ); }
        return points;
    };
    this.read_function_history = function() {
        var functions = [];
        for( var i = 0; i< $("#functionDict").children().size(); i++ ) { functions[functions.length] = disinter_function( i ); }
        return functions;
    };
    this.init_plot_coordinates = function() {
        $("#xleft").html( -10 );
        $("#xright").html( 10 );
        $("#ytop").html( 10 );
        $("#ybottom").html( -10 );
    };

    this.draw_by_type = function ( type, func, color ) {
        if( type == "plain" ) {            this.draw_plot( func, color );
        } else if ( type == "interior") {  this.draw_interior_plot( func, color );
        } else {                           this.draw_exterior_plot( func, color );}
    };

    this.redraw_points = function() {
        var points = read_point_history();
        for( var i=0; i<points.length; i++ ) {
            this.draw_point( points[i][0], points[i][1] );
        }
    };

    this.redraw = function() {
        context.clearRect( 0, 0, pxWidth, pxWidth );
        this.draw_grid( xPhase, yPhase );  // Need to alter origins
        this.redraw_points();
        var mathStrings = this.read_function_history();
        for( var i=0; i<mathStrings.length; i++ ) {
            var func = shuntingYard.math_string_to_func( mathStrings[i][0] );
            var type = mathStrings[i][1];
            var color= mathStrings[i][2];

            this.draw_by_type( type, func, color );
        }
    };

    this.move_up = function() {
        yPhase -= defaultPxPerCell*(defaultPxPerCell/pxPerCell);
        $("#ytop").html( Number( $("#ytop").html() ) + defaultPxPerCell/pxPerCell );
        $("#ybottom").html( Number( $("#ybottom").html() ) + defaultPxPerCell/pxPerCell );
        this.redraw();
    };
    this.move_right = function() {
        xPhase += defaultPxPerCell*(defaultPxPerCell/pxPerCell);
        $("#xleft").html( Number( $("#xleft").html() ) + defaultPxPerCell/pxPerCell );
        $("#xright").html( Number( $("#xright").html() ) + defaultPxPerCell/pxPerCell );
        this.redraw();
    };
    this.move_down = function() {
        yPhase += defaultPxPerCell*(defaultPxPerCell/pxPerCell);
        $("#ytop").html( Number( $("#ytop").html() ) - defaultPxPerCell/pxPerCell );
        $("#ybottom").html( Number( $("#ybottom").html() ) - defaultPxPerCell/pxPerCell );
        this.redraw();
    };
    this.move_left = function() {
        xPhase -= defaultPxPerCell*(defaultPxPerCell/pxPerCell);
        $("#xleft").html( Number( $("#xleft").html() ) - defaultPxPerCell/pxPerCell );
        $("#xright").html( Number( $("#xright").html() ) - defaultPxPerCell/pxPerCell );
        this.redraw();
    };

    var updateZoomInCoordinateMore = function( ident ) {
        var widthInCells = pxWidth/pxPerCell;
        var newCoord = Number( $(ident).html() ) - widthInCells/2;
        $(ident).html( newCoord );
    };
    var updateZoomInCoordinateLess = function( ident ) {
        var widthInCells = pxWidth/pxPerCell;
        var newCoord = Number( $(ident).html() ) + widthInCells/2;
        $(ident).html( newCoord );
    };
    var updateZoomInCoordinates = function() {
        updateZoomInCoordinateMore( "#ytop" );
        updateZoomInCoordinateMore( "#xright" );
        updateZoomInCoordinateLess( "#ybottom" );
        updateZoomInCoordinateLess( "#xleft" );

    };
    this.zoom_in = function() {
        if( pxPerCell < maxPxPerCell ) {
            pxPerCell*=2;
            updateZoomInCoordinates();
            this.redraw();
        }
    };
    var updateZoomOutCoordinateMore = function( ident ) {
        var widthInCells = pxWidth/pxPerCell;
        var newCoord = Number( $(ident).html() ) + widthInCells/4;
        $(ident).html( newCoord );
    };
    var updateZoomOutCoordinateLess = function( ident ) {
        var widthInCells = pxWidth/pxPerCell;
        var newCoord = Number( $(ident).html() ) - widthInCells/4;
        $(ident).html( newCoord );
    };
    var updateZoomOutCoordinates = function() {
        updateZoomOutCoordinateMore( "#ytop" );
        updateZoomOutCoordinateLess( "#ybottom" );
        updateZoomOutCoordinateMore( "#xright" );
        updateZoomOutCoordinateLess( "#xleft" );
    };
    this.zoom_out = function() {
        if( pxPerCell > minPxPerCell ) {
            pxPerCell/=2;
            updateZoomOutCoordinates();
            this.redraw();
        }
    };
};

function RhtFunctionPlottingEvents() {
    var shuntingYard = new RhtShuntingYard();
    var plotting = new RhtFuncPlotting();
    var validator = new RhtMathExpressionValidator();

    //  validate point input
    this.on_load = function() { plotting.draw_grid( 0, 0 ); plotting.init_plot_coordinates(); };

    var plotCommand = function( plotType ) {
        var mathString = $("#function").val();

        if( validator.is_expression_well_formed( mathString ) ) {
            $("#rhtExpressionFeedback").html( "" );
            var func = shuntingYard.math_string_to_func( mathString );
            var color = plotting.colors.readNext();
            plotting.bury_function( mathString, color, plotType, $("#functionDict").children().size()  );
            var n = $("#functionDict").children().size();
            $("#removeButton" +(n-1) ).live('click', function() {
                                                $("#storedPlotData" + (n-1)).remove();
                                                plotting.redraw();
                                            });
            plotting.draw_by_type( plotType, func, color );
            $("#function").val('');
        } else {
            $("#rhtExpressionFeedback").html( "expression doesn't seem to be well formed" );
        }
    };

    $("#functionPlotButton").click( function() { plotCommand("plain"); });
    $("#plotInteriorButton").click( function() { plotCommand("interior"); });
    $("#plotExteriorButton").click( function() { plotCommand("exterior"); plotting.colors.readNext(); });

    $("#moveUpButton").click( function() { plotting.move_up(); });
    $("#moveRightButton").click( function() { plotting.move_right(); });
    $("#moveDownButton").click( function() { plotting.move_down(); });
    $("#moveLeftButton").click( function() { plotting.move_left(); });

    $("#zoomInButton").click( function() { plotting.zoom_in(); });
    $("#zoomOutButton").click( function() { plotting.zoom_out(); });

    var validate_point_spec = function( x, y, label ) {
    };
    $("#rhtDisplayPointButton").click( function() {
        var x = $('#toLabelX').val();
        var y = $('#toLabelY').val();
        var label = $("#rhtPointLabelInput").val();
        plotting.draw_point( x, y );
        plotting.bury_point( x, y, label );

        $('#toLabelX').val('');	$('#toLabelY').val('');	$("#rhtPointLabelInput").val('');
    });

    var toggle_fade = function( id ) {
        if( $(id).is(':hidden') ) { $(id).fadeIn('very slow');
        }else{ $(id).fadeOut('very slow'); }
    };
    $("#plotNavigation").hide();
    $("#rhtToggleNavigationControls").click( function() {
        toggle_fade("#plotNavigation");
    });
    $("#rhtPointEditing").hide();
    $("#rhtTogglePointEditing").click( function() {
        toggle_fade("#rhtPointEditing");
    });

    $("#functionDict").hide();
    $("#rhtToggleFunctionHistory").click( function() {
        toggle_fade("#functionDict");
    });
    $("#pointDict").hide();
    $("#rhtTogglePointHistory").click( function() {
        toggle_fade("#pointDict");
    });
    $('#function').keyup(  function( e ) {
        if( (e.which && e.which == 13) || (e.keyCode && e.keyCode == 13) ) {
            plotCommand("plain");
     }});

    this.get_plotting = function( ){ return plotting; };
}
