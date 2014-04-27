function RhtShuntingYard() {
    var classifier = new RhtMathTokenClassifier();
    var tokenizer = new RhtMathTokenizer();
    var string_to_func = function( str ) { // turn this into a switch case?
	if( str=="*" ) {return function( x, y ) { return x * y; };}
	if( str=="/" ) {return function( x, y ) { return x / y; };}
	if( str=="%" ) {return function( x, y ) { return x % y; };}
	if( str=="+" ) {return function( x, y ) { return x + y; };}
	if( str=="-" ) {return function( x, y ) { return x - y; };}
	if( str=="^" ) {return function( x, y ) { return Math.pow( x, y );};}
	
	if( str=="sqrt" ) {return function( x ) { return Math.sqrt( x );};}
	if( str=="exp" )  {return function( x ) { return Math.exp( x );};}
	if( str=="log" )  {return function( x ) { return Math.log( x, 10 );};}
	if( str=="ln" )   {return function( x ) { return Math.log( x );};}
	
	if( str=="sin" ) {return function( x ) { return Math.sin( x );};}
	if( str=="cos" ) {return function( x ) { return Math.cos( x );};};
	if( str=="tan" ) {return function( x ) { return Math.tan( x );};};
	if( str=="asin" ){return function( x ) { return Math.asin( x );};}
	if( str=="acos" ){return function( x ) { return Math.acos( x );};}
	if( str=="atan" ){return function( x ) { return Math.atan( x );};}
	if( str=="sinh" ){return function( x ) { return Math.sinh( x );};}
	if( str=="cosh" ){return function( x ) { return Math.cosh( x );};}    
	if( str=="tanh" ){return function( x ) { return Math.tanh( x );};}    
	
	if( str=="-sqrt" ) {return function( x ) { return 0-Math.sqrt( x );};}
	if( str=="-exp" )  {return function( x ) { return 0-Math.exp( x );};}
	if( str=="-log" )  {return function( x ) { return 0-Math.log( x, 10 );};}
	if( str=="-ln" )   {return function( x ) { return 0-Math.log( x );};}
	
	if( str=="-sin" ) {return function( x ) { return 0-Math.sin( x );};}
	if( str=="-cos" ) {return function( x ) { return 0-Math.cos( x );};};
	if( str=="-tan" ) {return function( x ) { return 0-Math.tan( x );};};
	if( str=="-asin" ){return function( x ) { return 0-Math.asin( x );};}
	if( str=="-acos" ){return function( x ) { return 0-Math.acos( x );};}
	if( str=="-atan" ){return function( x ) { return 0-Math.atan( x );};}
	if( str=="-sinh" ){return function( x ) { return 0-Math.sinh( x );};}
	if( str=="-cosh" ){return function( x ) { return 0-Math.cosh( x );};}    
	if( str=="-tanh" ){return function( x ) { return 0-Math.tanh( x );};}    
	
	if( str=="!" ){return function( x ){var acc=1;for( var i=x; i>1; i++ ){ acc*=i; } return acc; };}
	return '';
    };
    
    var precedence = function( token ) {
	if( classifier.is_trig_operator( token ) ) { return 4; }
	if( classifier.is_exponential_operator( token ) || (token=="^") ) { return 3; }
	if( (token=="*") || (token=="/") || (token =="%")) { return 2; }
	if( (token=="+") || (token=="-")) { return 1; }
	return 0;
    };
    
    var remove_whitespace = function( str ) {
	var s = "";
	for( var i=0; i<str.length; i++ ) { if(str[i]!=" ") { s+=str[i]; }}
	return s;
    };
    
    var is_operator_left_associated = function( op ) { return ((op=="+")||(op=="-")||(op=="*")||(op=="/")||(op=="%")); };
    
    var update_polish_from_operator_token = function( stack, polish, token ) { 
	while( stack.length > 0 ) { // WHY DOES THE PLUS COME OFF?! tHE MINUS MAKES THE PLUS COME OFF..
	    
	    var top = stack[stack.length-1]; 
	    var topIsOperator = classifier.is_operator( top );
	    var tokenIsInfix = classifier.is_operator_infix( token ); 
	    
	    if( topIsOperator &&                                               // Origninal form has <= at is_operator_left_assoc leel
		((is_operator_left_associated( token ) && (precedence( token ) <= precedence( top ))) ||
		 (!is_operator_left_associated( token ) && (precedence( token ) < precedence( top ))) )) {
		     polish.push( stack.pop() );
		 } else { break; }
	}
	stack.push( token ); 
    };
    
    this.shunting_yard = function( tokens ) {       // This is the shunting yard
	var stack = []; var polish = [];
	
	for( var pos=0; pos < tokens.length; pos++ ) { 
	    var token = tokens[pos];
	    if( classifier.is_identity( token ) ) {
		polish.push( token );
	    } else if( classifier.is_operator( token ) ) {   
		update_polish_from_operator_token( stack, polish, token ); 
	    } else if( token == "(" ) {
		stack.push( token );	    
	    } else if ( token == ")" ) {                           
		while( stack[stack.length-1] != "(" ) { 
		    polish.push( stack.pop() ); 
		}
		stack.pop();                            // pop the open parens 
	    } else {  pos = tokens.length+1; } // exit 
	    
	}
	while( stack.length != 0 ) { 
	    polish.push( stack.pop() );
	}
	return polish;
    };
    
    this.reverse_polish_to_func = function( reversePolish ) { 
	return function( x ) {
	    var stack = [];
	    for( var i=0; i<reversePolish.length; i++ ) {
		var token = reversePolish[i];
		
		if( classifier.is_identity( token ) ) {
		    if( classifier.is_number( token ) ){
			stack.push( token );		    		    
		    } else {                                 // Is variable
			if( classifier.is_negative_variable( token ) ) {
			    stack.push( 0-Number( x ) );
			} else { stack.push( Number(x) ); }
		    }
		} else {                                     
		    if( classifier.is_operator_infix( token ) ) {       // Need to do left/right assoc handling... minus and ^ need prev to be first
			var right = stack.pop();
			var left = stack.pop();
			var buf = (string_to_func( token ))( Number( left ) , Number( right ) ); 
			stack.push( buf );
		    } else {  
			var buf = (string_to_func( token ))( stack.pop() );
			stack.push( buf ); 
		    }
		}
	    }
	    return stack[0];
	};};
    
    this.math_string_to_func = function( str ) {
	return this.reverse_polish_to_func( this.shunting_yard( tokenizer.tokenize( str ) ) );
    };
    
}

