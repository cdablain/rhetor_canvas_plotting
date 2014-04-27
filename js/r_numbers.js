/***** A library for the production of mathematical value *****/
function isInteger( s ) {
  return ( s.toString().search( /^-?[0-9]+$/ ) == 0);
}

function isFactor( num, posFactor ) {
    if( num%posFactor==0 ) {
        return true;
    }
    return false;
}

function isNegative( num ) {
    if( num<0 ) { return true; }
    return false;
}

function isPositive( num ) {
    if( num>0 ) { return true; }
    return false;
}

function isPrime( num ) {
    if( isNegative( num ) ) { return false; }
    if( num<4 ) { return true; }
    for( var i=2; i<Math.ceil( Math.sqrt( num ) )+1; i++ ){
        if( num%i == 0 ) {
            return false;
        }
    }
    return true;
}

function calculateFactors( num ) {
    var factors=[];
    for( var i=2; i<=Math.ceil( Math.sqrt( num ) ); i++ ){
        if( isFactor( num, i ) ) {
            factors[ factors.length ] = i;
        }
    }
    for( var i=factors.length-1; i>-1; i-- ) {
        if( factors[i] != num/factors[i] ) {
            factors[factors.length] = num/factors[i];
        }
    }
    return factors;
}

function calculatePrimeFactors( num ) {
    var factors = calculateFactors( num );
    var primeFactors = [];
    for( var i=0; i<factors.length; i++ ) {
        if( isPrime( factors[i] ) ) {
            primeFactors[ primeFactors.length ] = factors[i];
        }
    }
    return primeFactors;
}

function generateRandInteger( low, high ) {
    var delta = high-low;
    if( low>high ) { delta = low-high; }
    if( low>high ) { return Math.floor( Math.random()*delta ) + high; }
    return Math.floor( Math.random()*delta ) + low;
}

function generateRandWholeNumber( max ) {
    return Math.floor( Math.random() * max );
}

function generateRandWholeNumbers( count, max ) {
    var rands = [];
    for( var i=0; i<count; i++ ) {
        rands[i] = generateRandWholeNumber( max );
    }
    return rands;
}
function generateRandPrime( low, high ) {
    var posPrime=0;
    while( !isPrime(posPrime=generateRandInteger( low, high ))  );
    return posPrime;
}

function generateRandRational( low, high ) {
    var ratio = 0;
    while( ratio==0 || ratio==Infinity || isNaN(ratio) || ratio==-Infinity || isInteger(ratio) ) {
        var numerator = generateRandInteger( low, high );
        var denominator = generateRandInteger( low, high );
        ratio = numerator/denominator;
    }
    return ratio;
}

function generateRandNumber( low, high ) {
    var delta = high-low;
    if( low>high ) {
        delta = low-high;
    }
    if( low>high ) {
        return Math.random()*delta + high;
    }
    return Math.random()*delta + low;
}

function generateRandNumbers( count, low, high ) {
    var rands = [];
    for( var i=0; i<count; i++ ) {
        rands[i] = generateRandNumber( low, high );
    }
    return rands;
}

// Variables
function generateRandBoolean() {
   var val = Math.ceil( Math.random() * 2 ) - 1;
   if( val == 1 ) {
        return true;
   }else{
        return false;
   }
}

function generateRandVariable() {
    var variables = ["x", "y", "z", "n", "m", "k"];
    return variables[ generateRandWholeNumber( variables.length ) ];
}


// misc.
function findGCD( numOne, numTwo ) {
    var greater;
    if( Math.abs(numOne) >= Math.abs(numTwo) ) {
        greater = Math.abs(numOne);
    }else{
        greater = Math.abs(numTwo);
    }

    for( var i=greater; i>0; i-- ) {
        if( numTwo%i == 0 && numOne%i == 0 ) {
            return i;
        }
    }
}

function ratioToSimplifiedString( num, den ) {
    var gcd = findGCD( num, den );
    return num/gcd + "/" + den/gcd;
}

function rand_int_excluding( min, max, exArr ) {
    var integer = generateRandInteger( min, max );
    while( equals_any( integer, exArr ) ) {
        integer = generateRandInteger( min, max );
    }
    return integer;
}

function Ratio( num, den ) {
    var m = this;
    m.num = num;
    m.den = den;
}

/* 01/01/11 */
function Ratios() {
    var m = this;
    m.simplify = function( ratio ) {
        var gcd = findGCD( ratio.num, ratio.den );
        return new Ratio( ratio.num/gcd, ratio.den/gcd );
    };

    var ho_arith = function( op ) {
        return function( ratio1, ratio2 ) {
            var commonDen = ratio1.den * ratio2.den;
            var numOne = ratio1.num * ratio2.den;
            var numTwo = ratio2.num * ratio1.den;
            var newNum = op( numOne, numTwo );

            return m.simplify( new Ratio( newNum, commonDen ) );
        };
    }

    m.add = ho_arith( function( a, b ) { return a + b; } );
    m.subtract = ho_arith( function( a, b ) { return a - b; } );

    m.multiply = function( ratio1, ratio2 ) {
        var res = new Ratio( ratio1.num * ratio2.num, ratio1.den * ratio2.den )
        return m.simplify( res );
    };

    m.divide = function( ratio1, ratio2 ) {
        return m.multiply( ratio1, new Ratio( ratio2.den, ratio2.num ) );
    };
};
