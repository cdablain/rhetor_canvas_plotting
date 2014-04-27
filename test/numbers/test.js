/********* Test rht numbers *************/
test( "test isInteger()", function() {
    for( var i=-10; i<11; i++ ) {
        equals( true, isInteger( i ) );
    }
    equals( true, isInteger( 10.0 ) );
    equals( false, isInteger( 0.123 ) );
    equals( false, isInteger( 123.12 ) );

});

test( "test isFactor()", function() {
    equals( true, isFactor( 10, 2 ) );
    equals( false, isFactor( 7, 2 ) );
});

test( "test isPrime()", function() {
    equals( true,  isPrime( 2 )  );
    equals( true,  isPrime( 5 )  );
    equals( true,  isPrime( 7 )  );
    equals( true,  isPrime( 11 ) );
    equals( false, isPrime( 4 )  );
    equals( false, isPrime( 6 )  );
    equals( false, isPrime( 8 )  );
    equals( false, isPrime( 12 ) );
});

test( "test calculateFactors()", function() {
    var factors = calculateFactors( 12 );
    equals( factors[0], 2 );
    equals( factors[1], 3 );
    equals( factors[2], 4 );
    equals( factors[3], 6 );
    factors = calculateFactors( 100 );
    equals( factors.length, 6 );
    factors = calculateFactors( 882 );
    for( var i=0; i<factors.length; i++ ) {
//	alert(factors[i]);
    }
});

test( "test calculatePrimeFactors()", function() {
    var primeFactors = calculatePrimeFactors(100);
    for( var i=0; i<primeFactors.length; i++ ) {
        equals( isPrime( primeFactors[i] ), true );
    }
    equals( primeFactors.length, 2 );
});

test("test generate rand integer", function() {
  var upper = 100;
  var lower = -100;
  for( var i=0; i<25; i++ ) {
    var randNumber = generateRandInteger( -10, 10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );

    randNumber = generateRandInteger( 10, -10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );
  }
});


test("test generate rand rational", function() {
  var upper = 100;
  var lower = -100;
  for( var i=0; i<5; i++ ) {
    var randNumber = generateRandRational( -10, 10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );

    randNumber = generateRandRational( 10, -10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );
  }
});

test("test generateRandWholeNumber", function() {
    for( var i=0; i<100; i++ ) {
        var num = generateRandWholeNumber( 100 );
        equals( true, num<100 );
        equals( true, isPositive( num+1 ) );
    }
});
test("test generate rand number", function() {
  var upper = 100;
  var lower = -100;
  for( var i=0; i<25; i++ ) {
    var randNumber = generateRandNumber( -10, 10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );

    randNumber = generateRandNumber( 10, -10 );
    equals( true, (randNumber<=upper), "Rand number doesn't exceed upper bounds" );
    equals( true, (randNumber>=lower), "Rand number doesn't exceed lower bounds" );
  }
});


test("test findGCD", function() {
   equals( 3, findGCD( 9, 12 ) );
   equals( 3, findGCD( -9, 12 ) );

   equals( 10, findGCD( 10, 100 ) );
   equals( 10, findGCD( 100, -10 ) );

   equals( 12, findGCD( 12, 144 ) );
});

test("ratioToSimplifiedString", function() {
   equals( "2/3", ratioToSimplifiedString( 4, 6 ) );
   equals( "1/3", ratioToSimplifiedString( 30, 90 ) );
   equals( "6/7", ratioToSimplifiedString( 12, 14 ) );
   equals( "-1/10", ratioToSimplifiedString( -10, 100 ) );
   equals( "3/-4", ratioToSimplifiedString( 6, -8 ) );
});

module( "Ratios" );

test( "add", function() {
    var ratios = new Ratios();
    var rat1 = new Ratio( 1, 3 );
    var rat2 = new Ratio( 2, 5 );

    var ratSum = ratios.add( rat1, rat2 );

    equals( 11, ratSum.num  );
    equals( 15, ratSum.den  );
});

test( "subtract", function() {
    var ratios = new Ratios();
    var rat1 = new Ratio( 1, 3 ); // 5
    var rat2 = new Ratio( 2, 5 ); // 6

    var res = ratios.subtract( rat1, rat2 );

    equals( -1, res.num  );
    equals( 15, res.den  );

});

test( "multiplication", function() {
    var ratios = new Ratios();
    var rat1 = new Ratio( 1, 3 );
    var rat2 = new Ratio( 2, 5 );

    var res = ratios.multiply( rat1, rat2 );
    equals( res.num, 2 );
    equals( res.den, 15 );
});

test( "division", function() {
    var ratios = new Ratios();
    var rat1 = new Ratio( 1, 3 );
    var rat2 = new Ratio( 2, 5 );

    var res = ratios.divide( rat1, rat2 );

    equals( res.num, 5  );
    equals( res.den, 6  );

});
