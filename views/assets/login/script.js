$(window).on('load',function(){
	$('input[name="codigo"]').focus();
});

$(document).ready(function(){   
	$('#continuar').click(function(event){
        event.preventDefault();
        var codigo = $('input[name="codigo"]').val();

		var socket = io('http://192.168.1.103:80');
		

    });
    $('input[name="codigo"]').keypress(function(event){
	    var keycode = (event.keyCode ? event.keyCode : event.which);
	    if(keycode == '13'){
	        $('#continuar').click();  
	    }
	});
});