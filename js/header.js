function onLoadHeader(){
    console.log('aqui')
    if(localStorage.aventureiro != undefined){
        console.log('cai aqui', document.getElementById('nav-userDeslogado'))
        document.getElementById('nav-userDeslogado').className = "nav-condado d-none"
        document.getElementById('nav-userLogado').className = "nav-condado d-flex"
    }else{
        console.log('local', localStorage)
    }
}