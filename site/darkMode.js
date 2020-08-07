document.body.style.backgroundColor = sessionStorage.getItem('bg');
document.body.style.color = sessionStorage.getItem('cc');
if (sessionStorage.getItem('bg') === '#eee') {
    document.getElementById("darkSwitch").checked = false;
    document.body.style.backgroundColor = sessionStorage.getItem('bg');

}else if (sessionStorage.getItem('bg') == null || undefined){
    document.getElementById("darkSwitch").checked = false;
    document.body.style.backgroundColor = '#eee'
}

else{ 
    document.getElementById("darkSwitch").checked = true;
    document.body.style.backgroundColor = sessionStorage.getItem('bg');
}
function darkMode() {
     if ( sessionStorage.getItem('bg') === '#eee') {

            sessionStorage.setItem('bg', 'rgb(34,34,34)');
            //sessionStorage.setItem('cc', '#777'); change this for future font colour adjustment
            

     }
    else if (sessionStorage.getItem('bg') == null || undefined) {
        sessionStorage.setItem('bg', 'rgb(34,34,34)');
        //sessionStorage.setItem('cc', '#777');

    }
    else if( sessionStorage.getItem('bg') === 'rgb(34,34,34)') {

        sessionStorage.setItem('bg', '#eee');
        //sessionStorage.setItem('cc', '#333');


    }

document.body.style.backgroundColor = sessionStorage.getItem('bg');
document.body.style.color = sessionStorage.getItem('cc');

}