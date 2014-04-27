module( " subArray " );

test( "subArray()", function() {
    var a = [0, 1, 2, 3, 4, 5];
    var first = 0;
    var last = 2;
    var subA = subArray( a, first, last );

    equals( subA.length, last-first );
    ok( true, subA[first] == a[first] );
    ok( true, subA[last] == a[last] );

    first = 2;
    last = 4;
    subA = subArray( a, first, last );

    ok( true, subA.length == last-first );
    ok( true, subA[first] == a[last-first] );
    ok( true, subA[subA.length] == a[last] );

    subA = subArray( a, 0, 10 );
    ok( true, subA.length == a.length );
    ok( true, subA[first] == a[first] );
    ok( true, subA[subA.length] == a[a.length] );
});

module( " map " );
/* utitily funcs */
var adder = function( n ) {
    return function( a ) {
        return a+n;
    };
};
var multer = function( n ) {
    return function( a ) {
        return a*n;
    };
};
var sum2 = function( x, y ) {
    return x+y;
};
var sum3 = function( x, y, z ) {
    return x+y+z;
};
var generateRandArray = function( len ) {
    var a = [];
    for( var i=0; i<len; i++ ) {
        a[i] = Math.random()*10;
    }
    return a;
};
/* end utility funcs */

test( "map1( fn, a )", function() {
   var addOne = adder(1);
   var addTen = adder(10);
   var a = [0, 1, 2, 3];

   var result = map( addOne, a );
   for( var i=0; i<a.length; i++ ) {
       equals( result[i], addOne(a[i]) );
   }

   result = map( addTen, a );
   for( var i=0; i<a.length; i++ ) {
       equals( result[i], addTen(a[i]) );
   }

});

test( "map2( fn, a1, a2 )", function() {
    var a1 = [0, 1, 2, 3];
    var a2 = [0, 1, 2, 3];

    var result = map2( sum2, a1, a2 );
    for( var i=0; i<a1.length; i++ ) {
        equals( result[i], a1[i]+a2[i] );
    }

    a2 = [-21, 10, 2, 4, 10];
    result = map2( sum2, a1, a2 );
    for( var i=0; i<a1.length; i++ ) {
        equals( result[i], a1[i]+a2[i] );
    }

});

test( "map3( fn, a1, a2, a3 )", function() {
    var a1 = [0, 1, 2, 3];
    var a2 = [0, 1, 2, 3];
    var a3 = [0, 1, 2, 3];
    var result = map3( sum3, a1, a2, a3 );

    for( var i=0; i<a1.length; i++ ) {
        equals( result[i], a1[i]+a2[i]+a3[i] );
    }

});

test( "arity agnostic map() ", function() {
   // Arity 1
   var a1 = generateRandArray( 5 );
   var a2 = generateRandArray( 5 );
   var a3 = generateRandArray( 5 );

   var testNum = Math.floor( Math.random() * 10 ) +1;

   var agResult = map( adder(testNum), a1 );
   var result = map1( adder(testNum), a1 );

   for( var i=0; i<testNum; i++ ) {
       equals( agResult[i], result[i] );
   }

   // Arity 2
   agResult = map( sum2, a1, a2 );
   result = map2( sum2, a1, a2 );

   for( var i=0; i<testNum; i++ ) {
       equals( agResult[i], result[i] );
   }

   // Arity 3
   agResult = map( sum3, a1, a2, a3 );
   result = map3( sum3, a1, a2, a3 );

   for( var i=0; i<testNum; i++ ) {
       equals( agResult[i], result[i] );
   }
});

test( "map with uneven arrays", function() {
   var a1 = [0, 1, 2, 3, 4];
   var a2 = [0, 1, 2, 3];

   var result = map( sum2, a1, a2 );
   equals( 4, result.length );
});

test( "reduce", function() {
  var a1 = generateRandArray( 5 );
  var result = reduce( sum2, a1 );
  var expected =0;
  for( var i=0; i<a1.length; i++ ) {
      expected += a1[i];
  }
  equals( result, expected );
});

test( "arrayToCsv( a, delimiter )", function() {
    var a = [0, 1, 2, 3];
    var testDelimiters = [",", "|", ".", "||"];

    var csv = arrayToCsv( a, testDelimiters[0] );
    equals( csv, "0,1,2,3" );

    csv = arrayToCsv( a, testDelimiters[1] );
    equals( csv, "0|1|2|3");

    csv = arrayToCsv( a, testDelimiters[2] );
    equals( csv, "0.1.2.3");

    csv = arrayToCsv( a, testDelimiters[3] );
    equals( csv, "0||1||2||3" );

});
