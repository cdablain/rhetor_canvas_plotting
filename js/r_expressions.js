// Character classification funcs
var CharUtils = {
    is_alpha: function( c ) { return /^([a-zA-Z])$/.test( c ); },
    is_dot: function( c ) { return c == ".";  },
    is_minus_sign: function( c ) { return c=="-"; } ,
    is_digit_char: function( c ) { return ( /^([0-9])$/.test( c ) ||  c == "." ); },
    is_not_whitespace: function( c ) { return !( c == " "); }

};

function RhtMathExpressionReader() {
    var m=this;
    var read_next = function( cond1 ) {
        return (function( str ) {
                    var acc="";
                    var i=0;
                    while( cond1( str[i] ) && i<str.length ) {
                        acc+=str[i];
                        i++;
                    }
                    return acc;
                });
    };

    m.read_next_number = read_next( CharUtils.is_digit_char );
    m.read_next_alphas = read_next( CharUtils.is_alpha );

    m.read_next_token = function( str ) {
        if( CharUtils.is_minus_sign( str[0] ) ) {
            if( CharUtils.is_alpha( str[1] ) ) {
                return "-" + m.read_next_alphas( subArray( str, 1, str.length ) );
            };
            if( CharUtils.is_digit_char( str[1] ) ) {
                return "-" + m.read_next_number( subArray( str, 1, str.length ) );
            };
        }
        if( CharUtils.is_digit_char( str[0] ) ) {
            return m.read_next_number( str );
        } else if ( CharUtils.is_alpha( str[0] ) ) {
            return m.read_next_alphas( str );
        } else { return str[0]; }
    };
};

var mathTokens = new function() {
    var m = this;
    m.termDelimiters = ["+", "-"];
    m.arithmeticOperators = ["+", "-", "*", "/", "pow", "^", "sqrt", "-sqrt"];
    m.exponentialOperators = ["exp", "ln", "log", "!", "^", "-exp", "-ln", "-log"];
    m.posTrigOperators = ["sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh"];
    m.negTrigOperators = ["-sin", "-cos", "-tan", "-asin", "-acos", "-atan", "-sinh", "-cosh", "-tanh"];
    m.trigOperators = ["sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
                       "-sin", "-cos", "-tan", "-asin", "-acos", "-atan", "-sinh", "-cosh", "-tanh"];
    m.leftAssociatedOperators = ["+", "-", "*", "/", "*", "^"];

    m.algebraOperators = ["factor", "expand"];       // For later use
    m.calculusOperators = ["integrate", "derive"];

    m.operators =
        m.arithmeticOperators.concat(
            m.exponentialOperators.concat(
                m.trigOperators.concat(
                    m.algebraOperators.concat(
                        m.calculusOperators ))));
};

function RhtMathTokenClassifier() {
    var m=this;
    var reader = new RhtMathExpressionReader();

    m.is_operator_factory = function( opArr ) { // returns functions that classify operators based params of matching operator strings
        return function( token ) {
            for( var i=0; i<opArr.length; i++ ) {
                if( token == opArr[i] ) { return true; }
            }
            return false;
        };
    };

    m.is_arithmetic_operator = m.is_operator_factory( mathTokens.arithmeticOperators );
    m.is_exponential_operator = m.is_operator_factory( mathTokens.exponentialOperators );
    m.is_trig_operator = m.is_operator_factory( mathTokens.trigOperators );
    m.is_algebra_operator = m.is_operator_factory( mathTokens.algebraOperators );
    m.is_calculus_operator = m.is_operator_factory( mathTokens.calculusOperators );
    m.is_operator = m.is_operator_factory( mathTokens.operators );

    m.is_operator_left_associated = m.is_operator_factory( mathTokens.leftAssociatedOperators );

    m.is_operator_infix = function( str ) { return m.is_arithmetic_operator( str ); };

    m.is_positive_variable = function( token ) {
        return (! m.is_operator( token ) && CharUtils.is_alpha( token[0] ));
    };
    m.is_negative_variable = function( token ) {
        return ( token.length>1 && CharUtils.is_minus_sign( token[0] ) && m.is_positive_variable( token.slice(1) ));
    };
    m.is_variable = function( token ) {
        return ( m.is_positive_variable( token ) || m.is_negative_variable( token ) );
    };
    m.is_positive_number = function( token ) {
        if( token.length<1 ) {
            return false;
        }
        for( var i=0; i<token.length; i++ ) {
            if( !CharUtils.is_digit_char( token[i] ) ) return false;
        }
        return true;
    } ;
    m.is_negative_number = function( token ) {
        return ( CharUtils.is_minus_sign( token[0] ) && m.is_positive_number( subArray( token, 1, token.length ) )) ;
    };
    m.is_number = function( token ) {
        return ( m.is_positive_number( token ) || m.is_negative_number( token ) );
    };
    m.is_identity = function( token ) {
        return ( !m.is_operator(token) ) && !(token=="(") && !(token==")") && token!=undefined && token.length>0 && token!=" ";
    };
}

function RhtMathTokenizer() {
    var reader = new RhtMathExpressionReader();
    var classifier = new RhtMathTokenClassifier();
    var m = this;

    var are_identities_chained = function( token ) {
        if(token.length==1) { return false; }
        if( token.length==reader.read_next_alphas(token).length && !classifier.is_operator( token ) ) {
            return true;
        }
        return false;
    };
    var split_chained_identities = function( token ) {
        var acc = [];
        for( var i=0;i<token.length;i++ ) { acc[acc.length] = token[i]; }
        return acc;
    };

    m.is_multiplication_implied = function( prevToken, nextToken ) { // Clean this up
        if( undefined==nextToken ){ return false; }
        if( classifier.is_operator( prevToken ) && classifier.is_identity( nextToken ) ) {
            return false;
        }
        if( prevToken==")" && nextToken==")"){
            return false;
        }
        if( prevToken==")" && classifier.is_operator( nextToken ) && classifier.is_operator_infix( nextToken ) ){
            return false;
        }
        if( classifier.is_identity( prevToken ) && classifier.is_operator( nextToken ) && classifier.is_operator_infix( nextToken ) ) {
            return false;
        }
        if( prevToken=="(" && nextToken=="("){
            return false;
        }
        if( classifier.is_identity( prevToken ) && classifier.is_identity( nextToken ) ){
            return true;
        }
        if( classifier.is_identity( prevToken ) && classifier.is_operator( nextToken ) && !classifier.is_operator_infix( nextToken ) ){
            return true;
        }
        if( prevToken == ")" && classifier.is_identity( nextToken ) ){
            return true;
        }
        if( prevToken == ")" && !classifier.is_operator_infix( nextToken ) ){
            return true;
        }
        if( classifier.is_identity( prevToken ) && classifier.is_trig_operator( nextToken ) ){
            return true;
        }
        return false;
    };

    var interpose_multiplication_tokens = function( tokens ) {
        var newtokens = [];
        for( var i=0; i<tokens.length; i++ ) {
            if( m.is_multiplication_implied( tokens[i], tokens[i+1] ) ){
                newtokens[newtokens.length] = tokens[i];
                newtokens[newtokens.length] = "*";
            }else{
                newtokens[newtokens.length] = tokens[i];
            }
        }
        return newtokens;
    };

    var trig_operator_location = function( token ) { // Return the index
        if( token.length<4 ) { return -1; }
        for( var i=0; i<mathTokens.trigOperators.length; i++ ) {
            if( token.indexOf( mathTokens.trigOperators[i] ) != -1 &&
                token.indexOf ( mathTokens.trigOperators[i] ) == 1 &&
                !classifier.is_trig_operator( token ) )

                return token.indexOf( mathTokens.trigOperators[i] );
        }
        return -1;
    };

    var multi_char_operator_location = function( token ) {
        if( token.length<3 ) { return -1; }
        var multiOperators = ["pow", "exp", "log", "ln", "sqrt"];
        for( var i=0; i<multiOperators.length; i++ ) {
            if( token.indexOf( multiOperators[i] ) != -1 && !classifier.is_operator( token )) {
                return token.indexOf( multiOperators[i] );
            }
        }
        return -1;
    };

    m.identity_operator_combo = function( token ) {
        var trigOpLocation = trig_operator_location( token );
        var multiCharOperatorLocation = multi_char_operator_location( token );
        if( trigOpLocation != -1 ) {
            return trigOpLocation;
        }
        if( multiCharOperatorLocation != -1 ) {
            return multiCharOperatorLocation;
        }
        return -1;
    };

    m.tokenize = function( s ) {
        var tokens = [];
        while( 0<s.length ) {
            var token = reader.read_next_token( s );
            if( token != " " ) {
                var loc = m.identity_operator_combo( token );
                if( loc != -1  ) {
                    tokens[tokens.length] = token.substr( 0, loc );
                    tokens[tokens.length] = "*";
                    tokens[tokens.length] = token.substr( loc );
                } else
                    if( are_identities_chained( token ) ) {
                        tokens = tokens.concat( split_chained_identities( token ) );
                    } else if ( (tokens[tokens.length-1] == ")" || classifier.is_identity( tokens[tokens.length-1] ))
                                && token[0] == "-" && token.length>1 ) {
                                    tokens[tokens.length] = "-";
                                    tokens[tokens.length] = subArray( token, 1, token.length) ;
                                }else{
                                    tokens[tokens.length] = token;
                                }
                s = subArray( s, token.length, s.length );
            }else{
                s = subArray( s, 1, s.length );             // token was whitespace
            }
        }
        tokens = interpose_multiplication_tokens( tokens ); // Minuses result is interposed multiplication?!?!
        return tokens;
    };
}

function RhtMathTermClassifiction() {
    /****** begin term funcs *********/
    var is_term_delimiter = is_operator_factory( termDelimiters );
    var not_term_delimiter = function( str ) { return !is_term_delimiter( str ); };

    var read_next_term = read_next( not_term_delimiter );

    function filter_non_operators( tokens ) { return filter( is_operator, tokens ); }

    function if_any( predicates, datum ) {
        for( var i=0; i<predicates.length; i++ ) {
            if( predicates[i](datum) ) return true;
        }
        return false;
    }
    function if_none( predicates, datum ) {
        for( var i=0; i<predicates.length; i++ ) {
            if( predicates[i](datum) ) return false;
        }
        return true;
    }
    function term_classer_factory( klassers ) {  // A higher order func to produce term classifiers
        return function( tokens ) {
            var ops = filter_non_operators( tokens );
            for( var i=0; i<ops.length; i++ ) {
                if( klasser( tokens[i] ) ) {
                    return false;
                }
            }
            return true;
        };
    }
 // isPolynomialTerm  isTrigTerm() isArithmeticTerm isCompoundTerm()
 // factor expand derive integrate evaluate
}

function RhtMathExpressionValidator() { // Use only with tokenized expressions
    // operators chained without operand interposed
    var disallowedCharacters = ["@", "#", "$", "%", "&", "~", "`", "_", "=", "<", ">", "?", ",", "[", "]", "{", "}"];
    var classifier = new RhtMathTokenClassifier();

    var parens_mismatched = function( expression ) {
        var openCount = 0;
        var closeCount = 0;
        for( var i=0; i<expression.length; i++ ) {
            if( expression[i] == "(") { openCount++; }
            if( expression[i] == ")") { closeCount++; }
        }
        if( openCount!=closeCount ) { return true; }
        return false;
    };

    var is_character_disallowed = function( ch ) { // O(n)
        for( var i=0; i<disallowedCharacters.length; i++ ) {
            if( ch == disallowedCharacters[i] ) { return true; }
        }
        return false;
    };
    var contains_disallowed_character = function( expression ) { // O(n^2)
        for( var i=0; i<expression.length; i++ ) {
            if( is_character_disallowed( expression[i] ) ) {
                return true;
            }
        }
        return false;
    };
    var contains_chained_infix_operators = function( expression ) {
        var prev;
        var next;
        for( var i=0; i<expression.length-1; i++ ) {
            prev = expression[i];
            next = expression[i+1];
            if( classifier.is_operator_infix( prev ) && classifier.is_operator_infix( next ) ) {
                return true;
            }
        }
        return false;
    };
    this.is_expression_well_formed = function( expression ) { // Should return messages?
        if( parens_mismatched( expression ) ){
            return false;
        }
        if( contains_disallowed_character( expression )  ) {
            return false;
        }
        if( contains_chained_infix_operators( expression ) ) {
            return false;
        }

        return true;    // what about prefix operators without trailing parens...
    };
}
