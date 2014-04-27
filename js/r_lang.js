// Returns a subset of an array, start inclusive, end exclusive
function subArray( a, start, end ) {
    var acc = [];
    var accCounter = 0;
    for( var i=start; i<end; i++ ) {
        acc[accCounter] =  a[i];
        accCounter++;
    }
    return acc;
}

function range( start, end ) {
   var a=[];
    for( var i=start; i<end; i++ ) {
        a[a.length] = i;
    }
    return a;
}

function map1( fn, a ) {
    var acc = [];
    for( var i=0; i<a.length; i++ ) {
        acc[i] = fn( a[i] );
    }
    return acc;
}

function map2( fn, a1, a2 ) {
    if( a1.length > a2.length ) {
        a1 = subArray( a1, 0, a2.length );
    }
    if( a1.length < a2.length ) {
        a2 = subArray( a2, 0, a2.length );
    }
    var acc = [];
    for( var i=0; i<a1.length; i++ ) {
        acc[i] = fn( a1[i], a2[i] );
    }
    return acc;
}

function map3( fn, a1, a2, a3 ) {
    var acc = [];
    if( a1.length > a2.length ) {
        a1 = subArray( a1, 0, a2.length );
    }
    if( a1.length < a2.length ) {
        a2 = subArray( a2, 0, a1.length );
    }
    if( a3.length > a2.length ) {
        a3 = subArray( a3, 0, a2.length );
    }
    for( var i=0; i<a1.length; i++ ) {
        acc[i] = fn( a1[i], a2[i], a3[i] );
    }
    return acc;
}

function map( fn, a1, a2, a3 ) {
    if( a2 == undefined ) {
        return map1( fn, a1 );
    }
    if( a3 == undefined ) {
        return map2( fn, a1, a2 );
    }
    return map3( fn, a1, a2, a3 );
}

function reduce( fn, a ) {
    if( a.length == 0 ) {
        return null;
    } else if( a.length == 1 ) {
        return a;
    } else {
        var acc = a[0];
        for( var i=1; i<a.length; i++ ) {
            acc = fn( acc, a[i] );
        }
        return acc;
    }
}

function filter( predicate, arr ){
    if( typeof arr == 'string' ){
        var acc = "";
        for( var i=0; i<arr.length; i++ ) {
            if( predicate( arr[i] ) ){
                acc+=arr[i];
            }
        }
        return acc;
    } else {
        var acc = [];
        for( var i=0; i<arr.length; i++ ) {
            if( predicate( arr[i] ) ) {
                acc[acc.length] = arr[i];
            }
        }
        return acc;
    }
}
function arrayToCsv( a, delimiter ) {
    if( a.length == 1 ) {
        return a[0];
    }
    var acc = a[0];
    for( var i=1; i<a.length; i++ ) {
        acc += ( delimiter + a[i] );
    }
    return acc;
}

function arrayEquals( arr1, arr2 ) {
    if( arr1.length != arr2.length ) {
        return false;
    }
    for( var i=0; i<arr1.length; i++ ) {
        if( arr1[i] != arr2[i] ) {
            return false;
        }
    }
    return true;
};


function time( fn, data ) {
    var startTime = new Date().getTime();
    var result = map( fn, data );
    return (new Date().getTime() - startTime() );
}

function equals_any( v, eqArr ) {
    var alen = eqArr.length;
    for( var i=0; i<alen; i++ ) {
        if( v == eqArr[i] ) { return true; }
    }
    return false;
}

/* stupid pipe-delimitation... */
function or( a, b ) {
    return (a || b);
}
