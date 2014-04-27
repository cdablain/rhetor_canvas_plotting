module( " RhtCharUtils " );
test( " is_alpha( c ) ", function() {
   ok( CharUtils.is_alpha( "a" ) );
   ok( CharUtils.is_alpha( "F" ) );

   ok( !CharUtils.is_alpha( "$" ) );
   ok( !CharUtils.is_alpha( "(" ) );
});

test( " is_dot( c ) ", function() {
   ok( CharUtils.is_dot( "." ) );
   ok( !CharUtils.is_dot( "a" ) );
});

test( "is_minus_sign( c )", function() {
   ok( CharUtils.is_minus_sign( "-") );
   ok( !CharUtils.is_minus_sign( "+") );
});

test( "is_digit_char( c )", function() {
   ok( CharUtils.is_digit_char( "3") );
   ok( !CharUtils.is_digit_char( "+") );
});



module( "RhtMathExpressionReader " );
test( "read_next_number", function() {
   var reader = new RhtMathExpressionReader();

   var numberStrings = ["3", "2.34", ".332", "54x"];
   var expectedTokens = ["3", "2.34", ".332", "54"];
   var actualTokens = [];

   for( var i=0; i<numberStrings.length; i++ ) { actualTokens[actualTokens.length] = reader.read_next_number( numberStrings[i] ); }
   for( var i=0; i<numberStrings.length; i++ ) {
       equals( actualTokens[i], expectedTokens[i], "expected: " + expectedTokens[i] + " actual: " + actualTokens[i] );
   }

   numberStrings = ["-3", "-2.34", "-.332", "-54x"];
   expectedTokens = ["-3", "-2.34", "-.332", "-54"];
   actualTokens = [];

   for( var i=0; i<numberStrings.length; i++ ) { actualTokens[actualTokens.length] = reader.read_next_token( numberStrings[i] ); }
   for( var i=0; i<numberStrings.length; i++ ) {
       equals( actualTokens[i], expectedTokens[i], "expected: " + expectedTokens[i] + " actual: " + actualTokens[i] );
   }

   var strings = ["3sin(x)", "xsin(x)", "10exp(x)", "blah", "cos(x)"];
   var expectedFirstToken = ["3", "xsin", "10", "blah", "cos"];
   var expectedSecondToken = ["sin", "(", "exp", undefined, "("];

   for( var i=0; i<strings.length; i++ ) {
       var token = reader.read_next_token( strings[i] );
       var secondToken = reader.read_next_token( subArray( strings[i], token.length, strings[i].length ) );
       ok( token == expectedFirstToken[i], "expectedFirst: " + expectedFirstToken[i] + " actualFirst " + token   );
       ok( secondToken == expectedSecondToken[i], "expectedSecond: " + expectedSecondToken[i] + " actualSecond " + secondToken   );

   }
});

test( "read_next_alphas", function() {
   var reader = new RhtMathExpressionReader();

   var alphaStrings = ["foo", "bar", "baaz", "quux"];
   var expectedTokens =	["foo", "bar", "baaz", "quux"];
   for( var i=0; i<alphaStrings.length; i++ ) {
       ok( reader.read_next_alphas( alphaStrings[i] ) === expectedTokens[i] );
   };

   alphaStrings = ["1", ".", "-", "23", "+"];
   expectedTokens = ["", "", "", "", ""];
   for( var i=0; i<alphaStrings.length; i++ ) {
       ok( reader.read_next_alphas( alphaStrings[i] ) === expectedTokens[i] );
   };
});

test( "read_next_token", function() {
//   var reader = new RhtMathExpressionReader();
});

module( "RhtMathTokenClassifier");

test( "is_operator_infix", function() {
   var classifier = new RhtMathTokenClassifier();
   var infixTokens = ["*", "+", "-"];
   for( var i=0; i<infixTokens.length; i++ ) {
       ok( classifier.is_operator_infix( infixTokens[i] ) );
   }

   var nonInfixTokens = ["sin", "(", "3.2"];
   for( var i=0; i<nonInfixTokens.length; i++ ) {
       ok( !classifier.is_operator_infix( nonInfixTokens[i] ) );
   }

});



module( "RhtMathTokenizer" );
test( "identity_operator_combo", function() {
   var tokenizer = new RhtMathTokenizer();

   var tokens = ["sin", "-10.3", "tanh", "exp", "3.234" ];
   for( var i=0; i<tokens.length; i++ ) {
       ok( tokenizer.identity_operator_combo( tokens[i] ) == -1 );
   }
   tokens = ["xsin", "xtanh", "xacos", "bsin"];
   for( var i=0; i<tokens.length; i++ ) {
       ok( tokenizer.identity_operator_combo( tokens[i] ) == 1 );
   }
});

test( "is_trig_operator", function() {
  var classifier = new RhtMathTokenClassifier();
   for( var i=0; i<mathTokens.trigOperators.length; i++ ) {
       ok( classifier.is_trig_operator( mathTokens.trigOperators[i] ) );
   }
   for( var i=0; i<mathTokens.exponentialOperators.length; i++ ) {
       ok( !classifier.is_trig_operator( mathTokens.exponentialOperators[i] ) );
   }
});

test( "is_identity", function() {
   var classifier = new RhtMathTokenClassifier();
   ok( !classifier.is_identity("") );
   ok( !classifier.is_identity(" ") );
});

//module( " tokenizing " );

test( " is_multiplication_implied", function() {
   var tokenizer = new RhtMathTokenizer();
   var impliedTokens = [["3", "x"], ["x", "x"], ["x", "2.5"], ["2.34","sin"], ["87","g"], ["54.123","h"]];
   var notImpliedTokens = [["*", "x"], ["sin", "("], ["3", "+"], ["/", "2"], ["atan", "2.34"], ["pow", "("]];

   for( var i=0; i<impliedTokens.length; i++ ) {
       ok( tokenizer.is_multiplication_implied( impliedTokens[i][0], impliedTokens[i][1] )  );
   }
   for( var i=0; i<notImpliedTokens.length; i++ ) {
       ok( !tokenizer.is_multiplication_implied(
               notImpliedTokens[i][0], notImpliedTokens[i][1] ), notImpliedTokens[i][0] + notImpliedTokens[i][1]  );
   }

});

test( "tokenize", function() {
   var tokenizer = new RhtMathTokenizer();
   var mathStrings = ["3x^2",
                      "10.3sin(x^2)",
                      "x+4", "1/(1+exp(-x))",
                      "8tanh(-3x)",
                      "1/x",
                      "x2.3",
                      "9xxx",
                      "0.2exp(x)",
                      "-3x^2",
                      "-10.3sin(x^2)",
                      "-x+4",
                      "-1/(1+exp(-x))",
                      "-8tanh(-3x)",
                      "-1/x",
                      "-x2.3",
                      "-9xxx",
                      "-0.2exp(x)"];

   var expectedTokens = [["3", "*", "x", "^", "2"],
                         ["10.3", "*", "sin", "(", "x", "^", "2", ")"],
                         ["x", "+", "4"],
                         ["1", "/", "(", "1", "+", "exp", "(", "-x", ")", ")"],
                         ["8", "*", "tanh", "(", "-3", "*", "x", ")"],
                         ["1", "/", "x"],
                         ["x", "*", "2.3"],
                         ["9", "*", "x", "*", "x", "*", "x"],
                         ["0.2", "*", "exp", "(", "x", ")"],
                         ["-3", "*", "x", "^", "2"],
                         ["-10.3", "*", "sin", "(", "x", "^", "2", ")"],
                         ["-x", "+", "4"],
                         ["-1", "/", "(", "1", "+", "exp", "(", "-x", ")", ")"],
                         ["-8", "*", "tanh", "(", "-3", "*", "x", ")"],
                         ["-1", "/", "x"],
                         ["-x", "*", "2.3"],
                         ["-9", "*", "x", "*", "x", "*", "x"],
                         ["-0.2", "*", "exp", "(", "x", ")"]];

   for( var i=0; i<mathStrings.length; i++ ) {
       ok( arrayEquals( tokenizer.tokenize( mathStrings[i] ), expectedTokens[i] ),
           "actual: " + tokenizer.tokenize( mathStrings[i] ) + "\nexpected: " + expectedTokens[i] );
   }
});


test( "tokenize_more_tests", function() {
   var tokenizer = new RhtMathTokenizer();
   var mathStrings =  ["5+((1+2)*4)-3",
                       "12 + 34",
                       "3 + 4",
                       "3 + 4 * 5",
                       "3 * ( 4 + 5 )",
                       "(3 + 4) * (5 + 6)",
                       "3 + 4 + 5",
                       "3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3"]; // Here tokenize is wrong, thinks 1 - 5 implies multiplication];
   var actualTokens = map( tokenizer.tokenize, mathStrings );

   var expectedTokens = [["5", "+", "(", "(", "1", "+", "2", ")", "*", "4", ")", "-", "3"], // Minus is wrong and extra mult at )*blah
                         ["12", "+", "34"],
                         ["3", "+", "4"],
                         ["3", "+", "4", "*", "5"],
                         ["3", "*", "(", "4", "+", "5", ")"],
                         ["(", "3", "+", "4", ")", "*", "(", "5", "+", "6", ")"],
                         ["3", "+", "4", "+", "5"],
                         ["3", "+", "4", "*", "2", "/", "(", "1", "-", "5", ")", "^", "2", "^", "3"]
                        ];

   for( var i=0; i<mathStrings.length; i++ ) {
       ok( arrayEquals( actualTokens[i], expectedTokens[i] ),
           "actual: " + actualTokens[i] + " expected: " + expectedTokens[i] );
   }

   mathStrings = ["1/xsin(x)", "1/x*sin(x)", "xexp(x)", "xlog(x)"];
   expectedTokens = [["1", "/", "x", "*", "sin", "(", "x", ")"],
                     ["1", "/", "x", "*", "sin", "(", "x", ")"],
                     ["x", "*", "exp", "(", "x", ")"],
                     ["x", "*", "log", "(", "x", ")"]
                    ];
   actualTokens = [];

   for( var i=0; i<expectedTokens.length; i++ )	{
       actualTokens[actualTokens.length] = tokenizer.tokenize( mathStrings[i] );
   }

   for( var i=0; i<expectedTokens.length; i++ )	{
       ok( arrayEquals( expectedTokens[i], actualTokens[i]  ),
           expectedTokens[i] + " : " + actualTokens[i] );
   }

});




module( " classification " );
