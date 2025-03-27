let mensagens = []
let messageAtual = {}
let showMessage = false;
let encerrarMensagem = undefined
let seguroClicar = true

function audioCursor(){
    document.getElementById('audioSE').src = 'audio/Cursor1.ogg'
}

function audioConfirm(){
    document.getElementById('audioSE').src = 'audio/Load2.ogg'
}

function audioError(){
    document.getElementById('audioSE').src = 'audio/Parry.ogg'
}

function audioCancel(){
    document.getElementById('audioSE').src = 'audio/Cancel1.ogg'
}

function audioDamage(){
    document.getElementById('audioSE').src = 'audio/Damage2.ogg'
}

function audioComprar(){
    document.getElementById('audioSE').src = 'audio/Shop2.ogg'
}

function audioEquipar(){
    document.getElementById('audioSE').src = 'audio/Equip1.ogg'
}

function audioFiltrar(){
    document.getElementById('audioSE').src = 'audio/Computer.ogg'
}

function audioFugir(){
    document.getElementById('audioSE').src = 'audio/Run.ogg'
}

function audioEspada(){
    document.getElementById('audioSE').src = 'audio/Sword4.ogg'
}

function audioArco(){
    document.getElementById('audioSE').src = 'audio/Bow2.ogg'
}

function audioFaca(){
    document.getElementById('audioSE').src = 'audio/Sword5.ogg'
}

function audioFogo(){
    document.getElementById('audioSE').src = 'audio/Fire1.ogg'
}

function audioGelo(){
    document.getElementById('audioSE').src = 'audio/Ice3.ogg'
}

function audioMusica(){
    document.getElementById('audioSE').src = 'audio/Saint6.ogg'
}

function audioAtaqueNormal(){
    document.getElementById('audioSE').src = 'audio/Attack3.ogg'
}

function audioCura(){
    document.getElementById('audioSE').src = 'audio/Recovery.ogg'
}

function audioPot(){
    document.getElementById('audioSE').src = 'audio/Item2.ogg'
}

function audioDpwn(){
    document.getElementById('audioSE').src = 'audio/Down1.ogg'
}

function audioParalisar(){
    document.getElementById('audioSE').src = 'audio/Paralyze3.ogg'
}

function audioAtordoar(){
    document.getElementById('audioSE').src = 'audio/Pollen.ogg'
}

function audioUp(){
    document.getElementById('audioSE').src = 'audio/Up1.ogg'
}

function audioVenceu(){
    document.getElementById('audioME').src = 'audio/Fanfare2.ogg'
}

function audioPerdeu(){
    document.getElementById('audioME').src = 'audio/Shock1.ogg'
}

function audioInn(){
    document.getElementById('audioME').src = 'audio/Inn1.ogg'
}

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
        /* Make an HTTP request using the attribute value as the file name: */
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
            validaHeader()
            }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /* Exit the function: */
        return;
        }
    }
}

function validaHeader(){
    if(localStorage.aventureiro != undefined){
        let userLogado = JSON.parse(localStorage.aventureiro)
        if(document.getElementById('nav-userDeslogado') != null){
            document.getElementById('nav-userDeslogado').className = "nav-condado d-none"
            document.getElementById('nav-userLogado').className = "nav-condado d-flex"
            document.getElementById('userContainer').className = 'usuarioBar d-flex'
            document.getElementById('nomeUser').innerHTML = '<b>' + userLogado.nome + '</b>  <i>nv.' + userLogado.nivel + '</i>'
            document.getElementById('userAvatar').innerHTML = `<img  src="img/face/${userLogado.avatar}.png" alt="face" />`
            document.getElementById('barHP').style.width = (userLogado.hp * 100 / userLogado.hpMax) + '%'
            document.getElementById('barMP').style.width = (userLogado.mp * 100 / userLogado.mpMax) + '%'
            document.getElementById('barEXP').style.width = (userLogado.exp * 100 / (userLogado.nivel * 100 * 2)) + '%'
        }
    }
}

function salvarUsuarioBanco(usu){
    fetch(
        'get_json.php'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        for(let i = 0; i < db.usuarios.length; i++){
            if(db.usuarios[i].nome == usu.nome && db.usuarios[i].id != usu.id){
                audioError()
                alert('Já existe um outro usuário com esse nome');
                return;
            }
            if(db.usuarios[i].id == usu.id){
                usu.senha = db.usuarios[i].senha
                db.usuarios[i] = usu;
            }
        }
        //Salvar
        var data = new FormData();
        data.append('db', JSON.stringify({db}));

        var requisicao = new XMLHttpRequest();
        requisicao.open("POST", "update_json.php");
        requisicao.send(data);
        requisicao.onreadystatechange = function() {//Call a function when the state changes.
            if(requisicao.readyState == 4 && requisicao.status == 200) {
                /*mensagens = []
                mensagens.push(
                    {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Sucesso! E que a aventura começe '}
                )
                messageAtual = {}*/
                //renderNextMessage()
                usu.senha = undefined;
                localStorage.setItem('aventureiro', JSON.stringify(usu));
                validaHeader()
            }
    }
    })
    .catch((err) => {
        console.error(err);
    });
}

function renderNextMessage(){
    message = document.getElementById('mensagens');
    face = document.getElementById('mensagemFace');
    corpo = document.getElementById('mensagemCorpo');

    if(messageAtual.opcoes != undefined) return;
    if(seguroClicar != true) return;

    if(!showMessage){
        if(mensagens.length > 0){
            seguroClicar = false
            messageAtual = mensagens[0]
            message.className = 'mensagem d-block'
            face.innerHTML = `<img src="img/face/${messageAtual.face}" alt="face" />`
            corpo.innerHTML = `<span>${messageAtual.text}</span>`
            if(messageAtual.opcoes != undefined &&  messageAtual.opcoes.length > 0){
                for(let i = 0; i < messageAtual.opcoes.length; i++){
                    corpo.innerHTML += `<br /><button class="buttonOpcoesMensagem" onclick="${messageAtual.opcoes[i].acao}">${messageAtual.opcoes[i].text}</button>`
                }
            }
            showMessage = true
            let interval = setInterval(function(){
                seguroClicar = true;
                clearInterval(interval)
            }, 500);
        }else{
            message.className = 'mensagem d-none'
            showMessage = false
            seguroClicar = true
        }
    }else{
        let index = mensagens.findIndex(x => x.id == messageAtual.id)
        if(mensagens[index + 1] == undefined){
            message.className = 'mensagem d-none'
            mensagens = []
            messageAtual = {}
            showMessage = false
            if(encerrarMensagem != undefined) encerrarMensagem()
        }else{
            messageAtual = mensagens[index + 1]
            message.className = 'mensagem d-block'
            face.innerHTML = `<img src="img/face/${messageAtual.face}" alt="face" />`
            corpo.innerHTML = `<span>${messageAtual.text}</span>`
            if(messageAtual.opcoes != undefined &&  messageAtual.opcoes.length > 0){
                for(let i = 0; i < messageAtual.opcoes.length; i++){
                    corpo.innerHTML += `<br /><button onclick="${messageAtual.opcoes[i].acao}">${messageAtual.opcoes[i].text}</button>`
                }
            }
            showMessage = true
        }
        audioCursor()
    }
}

function encerrarMensagens() {
    mensagens = []
    messageAtual = {}
    message.className = 'mensagem d-none'
    showMessage = false
    seguroClicar = true
}

function copiarObjecto(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor();
    for (var key in obj) {
        temp[key] = copiarObjecto(obj[key]);
    }
    return temp;
}

function logout(){
    localStorage.setItem('aventureiro', undefined);
}