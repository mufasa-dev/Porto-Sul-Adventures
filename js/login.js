let avatar = 1;
let usuarioDefault = {
    id : 2,
    nome : "",
    clase : "Guerreiro",
    email : "",
    senha : "",
    atk : 10,
    def : 10,
    nivel : 1,
    exp : 0,
    hpMax : 100,
    mpMax : 100,
    hp : 100,
    mp : 100,
    bravecoins : 100,
    avatar : 1,
    itens : [
        {id : 1, qtd : 1},
    ],
    whatchIntro : false
}

function abrirLogin(){
    includeHTML()
}

function login(){
    let nome = document.getElementById('loginNome').value;
    let senha = document.getElementById('loginSenha').value;
    fetch(
        'db/db.json'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        //console.log('db', db)
        let usuario = db.usuarios.filter(x => (x.nome == nome || x.email == nome) && x.senha == senha)
        if(usuario.length <= 0){
            //Não deu certo
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Ops!'},
                {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /> Usuário ou Senha incorretos!'},
                {id: 3, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br /> Tente de novo!'}
            )
            messageAtual = {}
            renderNextMessage()
            audioError()
        }else{
            //Deu certo
            localStorage.setItem('aventureiro', JSON.stringify(usuario[0]));
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : `<b>Gimble e Gimble:</b><br />Seja bem-vindo de volta ${usuario[0].nome} `}
            )
            messageAtual = {}
            renderNextMessage()

            encerrarMensagem = () => {
                window.location.replace("aventura.html");
                clearInterval(interval)
            }
            audioConfirm()
        }
    })
    .catch((err) => {
        console.error(err);
    });
}

function register(){
    let nome = document.getElementById('registerNome').value;
    let email = document.getElementById('registerEmail').value;
    let senha = document.getElementById('registerSenha').value;
    let classe = document.getElementById('registerClasse').value;
    let confirmSenha = document.getElementById('registerSenhaConfirm').value;

    if(!nome || nome.length < 3 || !senha || senha.length < 3 ||
       !confirmSenha || confirmSenha.length < 3 || !email || email.length < 3){
            //Não deu certo
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Ops!'},
                {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /> Favor preencher todos os dados corretamente!'}
            )
            messageAtual = {}
            renderNextMessage()
            audioError()
            return
    }
    if(senha != confirmSenha){
        //Não deu certo
        mensagens = []
        mensagens.push(
            {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Ops!'},
            {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /> As senhas não são iguais!'}
        )
        messageAtual = {}
        renderNextMessage()
        audioError()
        return
    }
    document.getElementById('botaoRegistrar').disabled = true

    fetch(
        'db/db.json'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        let usuario = db.usuarios.filter(x => x.nome == nome)
        let usuario2 = db.usuarios.filter(x => x.email == email)
        if(usuario.length > 0){
            //Não deu certo
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Ops! '},
                {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /> Já existe um usuário cadastrado com esse nome!'},
                {id: 3, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br /> Tente de novo!'}
            )
            messageAtual = {}
            document.getElementById('botaoRegistrar').disabled = false
            renderNextMessage()
            audioError()
        }else if(usuario2.length > 0){
            //Não deu certo
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Ops! '},
                {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /> Já existe um usuário cadastrado com esse e-mail!'},
                {id: 3, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br /> Tente de novo!'}
            )
            messageAtual = {}
            document.getElementById('botaoRegistrar').disabled = false
            renderNextMessage()
            audioError()
        }else{
            //Deu certo
            usuarioDefault.nome = nome
            usuarioDefault.senha = senha
            usuarioDefault.email = email
            usuarioDefault.clase = classe
            usuarioDefault.avatar = avatar
            usuarioDefault.id = db.usuarios.length + 1
            db.usuarios.push(usuarioDefault)
            //console.log('db', db)
            salvarUsuario(db)
            audioConfirm()
        }
    })
    .catch((err) => {
        console.error(err);
    });
}

function salvarUsuario(db){
    var data = new FormData();
    data.append('db', JSON.stringify({db}));

    var requisicao = new XMLHttpRequest();
    requisicao.open("POST", "update_json.php");
    requisicao.send(data);
    requisicao.onreadystatechange = function() {//Call a function when the state changes.
        if(requisicao.readyState == 4 && requisicao.status == 200) {
            mensagens = []
            mensagens.push(
                {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gimble:</b><br />Sucesso! E que a aventura começe '}
            )
            messageAtual = {}
            renderNextMessage()
            encerrarMensagem = () => {
                usuarioDefault.senha = undefined;
                localStorage.setItem('aventureiro', JSON.stringify(usuarioDefault));
                window.location.replace("aventura.html")
            }
        }
    }
}

function openModalSelectPerfil(){
    document.getElementById('modalSelectPerfil').className = 'modal d-flex'
    renderFaces()
}

function fecharModalSelectPerfil(){
    document.getElementById('modalSelectPerfil').className = 'modal d-none'
}

function renderFaces(){
    let content = document.getElementById('modalSelectPerfilContent')
    let html = ''
    for(let i = 1; i < 127; i++){
        html += `<img src="img/face/${i}.png" alt="face" class="${i == avatar ? 'faceSelecionada' : 'faceAselecionar'}" onclick="selectFace(${i})"/>`
    }
    content.innerHTML = html
}

function selectFace(id){
    avatar = id; console.log(`<img src="img/face/${id}.png"  alt="face />`)
    document.getElementById('avatar').innerHTML = `<img  src="img/face/${id}.png" alt="face" />`
    fecharModalSelectPerfil()
}
