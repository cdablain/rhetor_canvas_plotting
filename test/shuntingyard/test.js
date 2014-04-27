module( " reverse polish " );

test( " shunting_yard test ", function() {
          var tokenizer = new RhtMathTokenizer();
          var shuntingYard = new RhtShuntingYard();
          var mathStrings =  ["5+((1+2)*4)-3", "12 + 34", "3 + 4",
                              "3 + 4 * 5", "3 * ( 4 + 5 )", "(3 + 4) * (5 + 6)",
                              "3 + 4 + 5",
                              "3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3"];

          var tokens = map( tokenizer.tokenize, mathStrings );

          var expectedReversePolish = [["5","1","2","+","4","*","+","3","-"],
                                       ["12", "34", "+"],
                                       ["3", "4", "+"],["3", "4", "5", "*", "+"],
                                       ["3", "4", "5", "+", "*"],["3", "4", "+", "5", "6", "+", "*"],["3", "4", "+", "5", "+"],
                                       ["3", "4", "2", "*", "1", "5", "-", "2", "3", "^", "^", "/", "+"]];

          var actualReversePolish = map( shuntingYard.shunting_yard, tokens );
          for( var i=0; i<expectedReversePolish.length; i++ ) {
              ok( arrayEquals( expectedReversePolish[i], actualReversePolish[i] ),
                  "actual: " + actualReversePolish[i] +
                  " expected: " + expectedReversePolish[i] +
                  " original: " + tokens[i] );
          }
});

test( " evaluation of reverse polish ", function() {
          var shuntingYard = new RhtShuntingYard();
          var tokenizer = new RhtMathTokenizer();
          var mathStrings =  ["5+((1+2)*4)-3",
                              "12 + 34",
                              "3 + 4",
                              "3 + 4 * 5",
                              "3 * ( 4 + 5 )",
                              "(3 + 4) * (5 + 6)",
                              "3 + 4 + 5",
                              "3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3"]; // This is actually not finished out right...
          var tokens = map( tokenizer.tokenize, mathStrings );
          var reversePolish = map( shuntingYard.shunting_yard, tokens );

          var results = map( shuntingYard.reverse_polish_to_func, reversePolish );

          var expectedResults = [14, 46, 7, 23, 27, 77, 12, 3]; // Last is float issue

          for( var i=0; i<results.length; i++ ) {
              ok( (results[i]()<=expectedResults[i]+Number( "000.1" )) && (results[i]()>=expectedResults[i]-"000.1"),
                  "expected: " + expectedResults[i] +
                  " actual: " + results[i]() );

          }

} );
