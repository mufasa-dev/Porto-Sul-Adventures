let menusHabilitados = true
let itensAll = []

function abrirLAventure(){
    includeHTML()

    buscarBase()
    document.getElementById('audioBGM').play()
}


function buscarBase(){
    usuario = JSON.parse(localStorage.aventureiro);
    fetch(
        'get_json.php'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        usuario =  db.usuarios.find(x => x.id == usuario.id)
        usuario.senha = undefined
        usuarios = db.usuarios;
        audioConfirm()
        document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
        if(usuario.whatchIntro != true){
            carregarIntroducao()
        }else{
            abrirMenusLugares()
        }
        let itensAll = db.pocoes
        itensAll = itensAll.concat(db.equipamentos, db.objetos)
    })
    .catch((err) => {
        console.error(err);
    });
}

function carregarIntroducao(){
    mensagens = []
    mensagens.push(
        {id: 1, face : "gimble_gamble.jpg" , text : '<b>Gimble e Gamble:</b><br />Bom dia viajante'},
        {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br />Seja mais do que bem-vindo a <i>Porto Sul</i>'},
        {id: 3, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br />Eu sou Gamble'},
        {id: 4, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br />E eu sou Gimble'},
        {id: 5, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br />Chegamos aqui a pouco tempo, mas já estamos nos sentindo em casa.'},
        {id: 6, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br /><i>Porto Sul</i> é uma cidade mágica, cheia das mais difereças pessoas e criaturas'},
        {id: 7, face : "gimble_gamble.jpg" , text : '<b>Gamble:</b><br />De uma explorada pela cidade ou pela praia ou floresta ao redor e tire suas próprias conclusões'},
        {id: 8, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br />Ah, e claro. Não se esqueça de nos visitar em nossa loja.'}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        terminouIntroducao()
        abrirMenusLugares()
    }
    renderNextMessage()
}

function terminouIntroducao(){
    usuario.whatchIntro = true
    salvarUsuarioBanco(usuario)
}

function abrirMenusLugares(){
    document.getElementById('porLugaresIncriveis').className = 'd-block'
    document.getElementById('cena').className = 'cena d-flex'
    bloquearPorNivel()
}

function abrirPortoSul(){
    if(menusHabilitados != true){audioError(); return;}
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-porto-sul'
}

function abrirFloresta(){
    if(menusHabilitados != true){audioError(); return;}
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-floresta'
}

function abrirPraia(){
    if(menusHabilitados != true || usuario.nivel < 10){
        audioError();
        return;
    }
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-praia'
}

function abrirCaverna(){
    if(menusHabilitados != true || usuario.nivel < 20){
        audioError();
        return;
    }
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-caverna'
}

function abrirCasa(){
    if(menusHabilitados != true || usuario.nivel < 30){
        audioError();
        return;
    }
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-casaMalAssombrada'
}

function abrirMontanha(){
    if(menusHabilitados != true || usuario.nivel < 40){
        audioError();
        return;
    }
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-block'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-none'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-montanha'
}

function abrirCastelo(){
    if(menusHabilitados != true || usuario.nivel < 50){
        audioError();
        return;
    }
    audioConfirm()
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-none';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-none';
    document.getElementById('opcoesPortoSul').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesFloresta').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesPraia').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCaverna').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCasaMalAssombrada').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesMontanha').className = 'menuOpcoesLugar d-none'
    document.getElementById('opcoesCastelo').className = 'menuOpcoesLugar d-block'
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-castelo'
}

function abirLoja(){
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : "gimble_gamble.jpg" , text : `<b>Gimble e Gamble:</b><br />Ah, Olá ${usuario.nome}`},
        {id: 2, face : "gimble_gamble.jpg" , text : '<b>Gimble:</b><br />Seja bem-vindo a nossa loja, vamos entre...'}
    )
    messageAtual = {}
    encerrarMensagem  = () => window.location.replace("loja.html")
    renderNextMessage()
}

function abrirINN(){
    bloquearMenus()
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-inn'
    mensagens = []
    mensagens.push(
        {id: 1, face : "158.png" ,
        text : `<b>Dona do lugar:</b><br />Ah, Olá ${usuario.nome}. Gostaria de passar a noite?`,
        opcoes: [
            {text : `Sim : ${usuario.nivel * 10} Bravecoins`, acao : 'passarNoite()'},
            {text : 'Voltar', acao : 'sairDoINN()'}
        ]}
    )
    messageAtual = {}
    encerrarMensagem  = undefined
    renderNextMessage()
}

function passarNoite(){
    if(usuario.bravecoins < (usuario.nivel * 10)){
        audioError()
        return;
    }
    document.getElementById('audioBGM').src =  ''
    audioInn()
            
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-black'
    encerrarMensagens()
    let interval = setInterval(function(){
        mensagens = []
        mensagens.push(
            {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Já estou totalmente recuperado. Hora de voltar para minha aventura.`},)
        messageAtual = {}
        encerrarMensagem  = () => finalizarNoite()
        renderNextMessage()
        clearInterval(interval)
        document.getElementById('audioBGM').src =  'audio/Ship2.mp3'
    }, 5000);
}

function finalizarNoite(){
    usuario.hp = usuario.hpMax;
    usuario.mp = usuario.mpMax;
    usuario.bravecoins -= (usuario.nivel * 10);
    if(usuario.inn == undefined) usuario.inn = 0
    usuario.inn += 1; 
    salvarUsuarioBanco(usuario)
    document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
    validaHeader()
    habilitarrMenus()
    abrirPortoSul()
}

function sairDoINN() {
    habilitarrMenus()
    abrirPortoSul()
    encerrarMensagens()
}

function explorarFloresta(){
    document.getElementById('audioBGM').src =  ''
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-batleFloresta'
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Você estava explorando a Floresta tranquilamente quando alguns insetos te atacam de repente.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(1);
    }
    renderNextMessage()
}

function explorarPraia(){
    document.getElementById('audioBGM').src =  ''
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-batlePraia'
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Você estava andando tranquilamente pela beira da praia quando alguns monstros resolvem te atacar.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(2);
    }
    renderNextMessage()
}

function explorarCavernas(){
    document.getElementById('audioBGM').src =  ''
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Você estava tranquilamente explorando uma caverna escura no meio do nada quando criaturas estranhas surgem de repente.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(3);
    }
    renderNextMessage()
}

function explorarCasa(){
    document.getElementById('audioBGM').src =  ''
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-casaMalAssombrada-batalha'
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Você estava explorando cautelosamente a casa quando criaturas muito estranhas aparecem.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(4);
    }
    renderNextMessage()
}

function explorarMontanhas(){
    document.getElementById('audioBGM').src =  ''
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Enquanto você estava explorando as montanhas criaturas aladas começam a te perseguir.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(5);
    }
    renderNextMessage()
}

function explorarCastelo(){
    document.getElementById('audioBGM').src =  ''
    document.getElementById('menuDoMeio').className = 'aventure-menu-meio aventure-menu-meio-castelo-batalha'
    bloquearMenus()
    mensagens = []
    mensagens.push(
        {id: 1, face : `${usuario.avatar}.png` , text : `<b>${usuario.nome}:</b><br />Você estava tranquilamente invadindo um castelo estranho no meio do nada, quando de repente criaturas estranhas tentam te expusar.`}
    )
    messageAtual = {}
    encerrarMensagem  = () => {
        document.getElementById('audioBGM').src =  'audio/Field1.mp3'
        getInimigos(6);
    }
    renderNextMessage()
}

function bloquearMenus(){
    menusHabilitados = false
    let opcoes = document.getElementsByClassName('menuOpcoesLugar')
    for(let i = 0; i < opcoes.length; i++){
        opcoes[i].className = 'menuOpcoesLugar d-none'
    }

    let lugarMenus = document.getElementsByClassName('lugar-item')
    for(let i = 0; i < lugarMenus.length; i++){
        lugarMenus[i].disabled = true
        lugarMenus[i].className += ' lugar-item-disabled'
    }
    bloquearPorNivel()
}

function habilitarrMenus(){
    menusHabilitados = true
    let lugarMenus = document.getElementsByClassName('lugar-item')
    for(let i = 0; i < lugarMenus.length; i++){
        lugarMenus[i].disabled = false
        lugarMenus[i].className = 'lugar-item'
    }
    bloquearPorNivel()
}

function bloquearPorNivel(){
    if(usuario.nivel < 10) document.getElementById('lugarPraia').className += ' lugar-item-disabled'
    if(usuario.nivel < 20) document.getElementById('lugarCaverna').className += ' lugar-item-disabled'
    if(usuario.nivel < 30) document.getElementById('lugarCasa').className += ' lugar-item-disabled'
    if(usuario.nivel < 40) document.getElementById('lugarMontanha').className += ' lugar-item-disabled'
    if(usuario.nivel < 50) document.getElementById('lugarCastelo').className += ' lugar-item-disabled'
}