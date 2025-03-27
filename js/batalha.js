let tropa = {}
let inimigos = []
let turno = 1
let acaoEscolherMonstro = undefined
let atkReal = 0
let defReal = 0
let itensInventorioBatalha = []
let itensAllBatalha = []
let inimigoSelecionado = {}
let esconlheuInimigo = false
let acoesInimigo = []
let inimigoAtual = 0
let habilidades = []
let itensInventorio = []
let heroiMorreu = false

//armas e equipamentos
let arma = {}
let roupa = {}
let escudo = {}
let acessorio = {}
let chapeu = {}

let status = {
    tipo : 0,
    duracao: 0
}
let atkAdd = {
    value : 0,
    duracao: 0
}
let defAdd = {
    value : 0,
    duracao: 0
}

const ENUM_TURNO = {
    VOCE_ACAO : 0,
    VOCE_MAGIA: 1,
    VOCE_ESCOLHE_MONSTRO: 2,
    MONSTRO_ATACA_VOCE: 3,
    VOCE_ATACA : 4
}

const ENUM_STATUS = {
    PARALISADO : 0,
    ROUCO: 1,
    ATORDOAR: 2
}

function getInimigos(mapa){
    turno = 1
    fetch(
        'get_json.php'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        
        let tropas =  db.tropas.filter(x => x.mapa == mapa && x.nivel <= usuario.nivel)
        tropa = tropas[Math.floor(Math.random() * tropas.length)];
        inimigos = []
        //Pegar inimigos
        for(let i = 0; i < tropa.inimigos.length; i++){
            let inimigo = {};
            inimigo = db.inimigos.find(x => x.id == tropa.inimigos[i])
            if(inimigo != undefined){
                inimigo.hpMax = inimigo.hp
                inimigos.push(copiarObjecto(inimigo))
            }
        }
        heroiMorreu = false
        itensAllBatalha = []
        itensInventorioBatalha = []
        acoesInimigo = db.acoes
        habilidades = db.habilidade.filter(x => (x.classe == undefined || x.classe == usuario.classe) && (x.nivel == undefined || x.nivel <= usuario.nivel))
        itensAllBatalha = db.pocoes
        itemArmasEquipamentos = db.equipamentos
        itensAll = db.pocoes.concat(db.equipamentos, db.objetos)

        itensInventorioBatalha = []
        itensInventorio = []

        for(let i = 0; i < usuario.itens.length; i++){
            let it = itensAllBatalha.find(x => x.id == usuario.itens[i].id)
            if(it != undefined){
                it.qtd = usuario.itens[i].qtd
                it.equipado = usuario.itens[i].equipado
                itensInventorioBatalha.push(it)
            }
        }

        for(let i = 0; i < usuario.itens.length; i++){
            let it = itemArmasEquipamentos.find(x => x.id == usuario.itens[i].id)
            if(it != undefined){
                it.qtd = usuario.itens[i].qtd
                it.equipado = usuario.itens[i].equipado
                itensInventorio.push(it)
            }
        }

        status = {
            tipo : 0,
            duracao: 0
        }
        atkAdd = {
            value : 0,
            duracao: 0
        }
        defAdd = {
            value : 0,
            duracao: 0
        }
        getItensEAtributos()
        renderInimigos()
        let interval =  setInterval(function(){
            turno = 0
            document.getElementById('mensagensNaBatalha').innerHTML = `<span>Sua vez!</span>`
            habilitarComandos()
            clearInterval(interval)
        }, 2300);
    })
    .catch((err) => {
        console.error(err);
    });
}

function getItensEAtributos(){
    atkReal = usuario.atk;
    defReal = usuario.def
    for(let i = 0; i < itensInventorio.length; i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].equipado == true){
            switch (itensInventorio[i].subtipo){
                case 'arma':
                    arma = itensInventorio[i]
                    atkReal += arma.atk
                    defReal += arma.def
                    break;
                case 'escudo':
                    escudo = itensInventorio[i]
                    atkReal += escudo.atk
                    defReal += escudo.def
                    break;
                case 'roupa':
                    roupa = itensInventorio[i]
                    atkReal += roupa.atk
                    defReal += roupa.def
                    break;
                case 'chapeu':
                    chapeu = itensInventorio[i]
                    atkReal += chapeu.atk
                    defReal += chapeu.def
                    break;
                default:
                    acessorio = itensInventorio[i]
                    atkReal += acessorio.atk
                    defReal += acessorio.def
            }
        }
    }
    if(arma != undefined && arma.icone != undefined){
        document.getElementById('iconAtacar').src = `img/icons/${arma.icone}.png`
    }
}

function renderInimigos() {
    document.getElementById('cena').className = 'cena d-none'
    document.getElementById('grupoInimigos').className = 'grupoInimigos d-flex';
    document.getElementById('batalhaComandos').className = 'batalhaComandos d-flex';
    document.getElementById('imagemPerfilBatalha').src = `img/face/${usuario.avatar}.png`
    atualizarHpMpHeroi()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${tropa.nome} ${tropa.inimigos.length > 1 ? 'apareceram' : 'apareceu'}!</span>`
    for(let i = 0; i < 3; i++){
        if(inimigos[i] != undefined){
            document.getElementById(`inimigo${i}`).className = 'inimigo'
            document.getElementById(`inimigo${i}`).innerHTML = `
                <span>${inimigos[i].nome}</span>
                <img src="img/monsters/${inimigos[i].imagem}.png" alt="${inimigos[i].nome}" class="monstro" />
                <img src="img/icons/paralizar.png" alt="status" id="iconStatusMonstro${i}0" class="iconStatusMonstro0 d-none" />
                <img src="img/icons/paralizar.png" alt="status" id="iconStatusMonstro${i}1" class="iconStatusMonstro1 d-none" />
                <img src="img/icons/paralizar.png" alt="status" id="iconStatusMonstro${i}2" class="iconStatusMonstro2 d-none" />
                <div class="barHpMp">
                    <div id="barHPMonster${i}" class="barHP" style="width: ${inimigos[i].hp *  100 / inimigos[i].hpMax}%;"></div>
                </div>
                <h1 id="danoInimigo${i}" class="danoInimigo d-none"></h1>
            `
        }else{
            document.getElementById(`inimigo${i}`).innerHTML = ''
        }
    }
}

function atualizarHpMpHeroi() {
    document.getElementById('barHPBatle').style.width = (usuario.hp * 100 / usuario.hpMax) + '%'
    document.getElementById('barMPBatle').style.width = (usuario.mp * 100 / usuario.mpMax) + '%'
}

function bloquearComandos(){
    document.getElementById('batalhaAtaque').className = 'batalhaAtaque disabled'
    document.getElementById('batalhaMagia').className = 'batalhaMagia disabled'
    document.getElementById('batalhaDefender').className = 'batalhaDefender disabled'
    document.getElementById('batalhaFugir').className = 'batalhaFugir disabled'
}

function habilitarComandos(){
    document.getElementById('batalhaAtaque').className = 'batalhaAtaque'
    document.getElementById('batalhaMagia').className = 'batalhaMagia'
    document.getElementById('batalhaDefender').className = 'batalhaDefender'
    if(tropa.proibidoFugir != true){
        document.getElementById('batalhaFugir').className = 'batalhaFugir'
    }else{
        document.getElementById('batalhaFugir').className = 'batalhaFugir disabled'
    }
}

function selecionarInimigo(index){
    if(turno != ENUM_TURNO.VOCE_ESCOLHE_MONSTRO || esconlheuInimigo == true) return;
    if(inimigos[index].hp <= 0) return;
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    inimigoSelecionado = inimigos[index]
    acaoEscolherMonstro(index)
}

function atacar(){
    if(turno != ENUM_TURNO.VOCE_ACAO){
        return;
    }
    if(usuario.clase == 'Bardo'){
        ataqueBardo()
        return;
    }
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Escolha o inimigo para atacar!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-flex'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
    turno = ENUM_TURNO.VOCE_ESCOLHE_MONSTRO;
    acaoEscolherMonstro = (index) => {
        turno = ENUM_TURNO.VOCE_ATACA
        getAudioAtaqueClase()
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} atacou!</span>`
        let interval  = setInterval(function(){
            audioDamage()
            let danoAdicional = 0;
            if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
            let dano = atkReal + danoAdicional
            if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                dano += Math.floor(dano * 0.2)
            }
            dano -= inimigoSelecionado.def
            if(dano < 0){
                dano = 0
            }
            document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
            document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano}`
            inimigos[index].hp -= dano;
            if(inimigos[index].hp < 0){
                inimigos[index].hp = 0
            }
            animacaoBrilho(`inimigo${index}`)
            document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
            clearInterval(interval)
            let interval2  = setInterval(function(){
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                document.getElementById(`danoInimigo${index}`).innerHTML = ''
                esconlheuInimigo = false
                if(inimigos[index].hp <= 0){
                    matarInimigo(`inimigo${index}`)
                }
                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval2)
            },1000)
        }, 1000);
    }
}

//Ataque bardo
function ataqueBardo(){
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){

        for(let index = 0; index < inimigos.length; index++){
            if(inimigos[index].hp > 0){
                audioDamage()
                let inimigoSelecionado = inimigos[index]
                let danoAdicional = 0;
                if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
                let dano = atkReal + danoAdicional
                if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                    dano += Math.floor(dano * 0.2)
                }
                dano -= inimigoSelecionado.def
                dano = Math.floor(dano / 2)
                if(dano < 0){
                    dano = 0
                }
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                animacaoBrilho(`inimigo${index}`)
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                
                let interval2  = setInterval(function(){
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                    document.getElementById(`danoInimigo${index}`).innerHTML = ''
                    if(inimigos[index].hp <= 0){
                        matarInimigo(`inimigo${index}`)
                    }
                    clearInterval(interval2)
                },1000)
            }
        }
        
        clearInterval(interval)
        let interval2  = setInterval(function(){
            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1500)
    }, 1000);
}

function descobrirAcaoInimigo(){
    let inimiQueAtaca = inimigos[inimigoAtual]

    if(inimiQueAtaca == undefined) return nextEnemy

    if(inimiQueAtaca.status != undefined){
        let temStatusParalizado = inimiQueAtaca.status.find(x => x.id == 0/* id status paralizado */ && x.duracao > 0)
        if(temStatusParalizado != undefined) return inimigoEstaParalizado
    }
    
    for(let i = 0; i < inimiQueAtaca.acoes.length; i++){
        let chance = Math.floor(Math.random() * 100)
        if(chance <= inimiQueAtaca.acoes[i].chances){
            if(inimiQueAtaca.acoes[i].idAcao == 1) return inimigoAtacar
            if(inimiQueAtaca.acoes[i].idAcao == 2) return inimigoPassarAvez
            if(inimiQueAtaca.acoes[i].idAcao == 3) return inimigoDefender
            if(inimiQueAtaca.acoes[i].idAcao == 4) return inimigoCurar
            if(inimiQueAtaca.acoes[i].idAcao == 5) return inimigoAtaqueDuplo
            if(inimiQueAtaca.acoes[i].idAcao == 6) return inimigoAtaqueForte
            if(inimiQueAtaca.acoes[i].idAcao == 7) return inimigoVampirismo
            if(inimiQueAtaca.acoes[i].idAcao == 8) return inimigoQuebraDefesa
            if(inimiQueAtaca.acoes[i].idAcao == 9) return inimigoRoubar
            if(inimiQueAtaca.acoes[i].idAcao == 10) return inimigoAtaqueTriplo
            if(inimiQueAtaca.acoes[i].idAcao == 11) return inimigoAtaqueTriplo
        }
    }
}

function inimigoAtacar(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} atacou!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = inimigos[inimigoAtual].atk - defReal - defAdicional;    
        if(inimigoEstaAtordoado(inimigos[inimigoAtual].id)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        let intervalFinalizar  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            if(validarUsuarioMorreu()) return
            if(heroiMorreu){
                return
            }
            inimigoAtual += 1
            vezDoNimigo()
            clearInterval(intervalFinalizar)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoQuebraDefesa(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} atacou seu ponto fraco!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = inimigos[inimigoAtual].atk - (Math.floor((defReal - defAdicional) / 2));    
        if(inimigoEstaAtordoado(inimigos[inimigoAtual].id)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        let intervalFinalizar  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            if(validarUsuarioMorreu()) return
            if(heroiMorreu){
                return
            }
            inimigoAtual += 1
            vezDoNimigo()
            clearInterval(intervalFinalizar)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoAtaqueForte(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} usou um ataque forte!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = Math.floor(inimigos[inimigoAtual].atk + (inimigos[inimigoAtual].atk * 0.5) - defReal - defAdicional);    
        if(inimigoEstaAtordoado(inimigoAtual)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        let intervalFinalizar  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            if(validarUsuarioMorreu()) return
            if(heroiMorreu){
                return
            }
            inimigoAtual += 1
            vezDoNimigo()
            clearInterval(intervalFinalizar)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoAtaqueDuplo(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} atacou rapidamente!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = inimigos[inimigoAtual].atk - defReal - defAdicional;    
        if(inimigoEstaAtordoado(inimigoAtual)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        atualizarHpMpHeroi()

        let intervalLerMessage2  = setInterval(function(){
            document.getElementById('danoHeroi').innerHTML = `-${dano * 2}`
            usuario.hp -= dano;
            audioDamage()
            animacaoBrilho('batalhaFace')
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()
    
            let intervalFinalizar  = setInterval(function(){
                document.getElementById('danoHeroi').className = 'danoHeroi d-none'
                if(validarUsuarioMorreu()) return
                if(heroiMorreu){
                    return
                }
                inimigoAtual += 1
                vezDoNimigo()
                clearInterval(intervalFinalizar)
            },1000)
            clearInterval(intervalLerMessage2)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoAtaqueTriplo(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} atacou rapidamente!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = inimigos[inimigoAtual].atk - defReal - defAdicional;    
        if(inimigoEstaAtordoado(inimigoAtual)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        atualizarHpMpHeroi()

        let intervalLerMessage2  = setInterval(function(){
            document.getElementById('danoHeroi').innerHTML = `-${dano * 2}`
            usuario.hp -= dano;
            audioDamage()
            animacaoBrilho('batalhaFace')
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()
    
            let intervalLerMessage3  = setInterval(function(){
                document.getElementById('danoHeroi').innerHTML = `-${dano * 2}`
                usuario.hp -= dano;
                audioDamage()
                animacaoBrilho('batalhaFace')
                salvarUsuarioBanco(usuario)
                atualizarHpMpHeroi()
        
                let intervalFinalizar  = setInterval(function(){
                    document.getElementById('danoHeroi').className = 'danoHeroi d-none'
                    if(validarUsuarioMorreu()) return
                    if(heroiMorreu){
                        return
                    }
                    inimigoAtual += 1
                    vezDoNimigo()
                    clearInterval(intervalFinalizar)
                },1000)
                clearInterval(intervalLerMessage3)
            },1000)
            clearInterval(intervalLerMessage2)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoRoubar(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} te roubou!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = Math.floor(usuario.bravecoins * 0.01)
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.bravecoins -= dano;
        audioComprar()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;

        let intervalFinalizar  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            if(validarUsuarioMorreu()) return
            if(heroiMorreu){
                return
            }
            inimigoAtual += 1
            vezDoNimigo()
            clearInterval(intervalFinalizar)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoCurar(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} esta se curando!</span>`
    audioAtaqueNormal()
    
    let intervalLerMessage  = setInterval(function(){
        let hpACurar = inimigos[inimigoAtual].hpMax * 0.1
        
        document.getElementById(`danoInimigo${inimigoAtual}`).className = 'danoInimigo colorGreen d-block'
        document.getElementById(`danoInimigo${inimigoAtual}`).innerHTML = `+${hpACurar}`
        inimigos[inimigoAtual].hp += hpACurar;
        document.getElementById(`barHPMonster${inimigoAtual}`).style.width = (inimigos[inimigoAtual].hp * 100 /  inimigos[inimigoAtual].hpMax ) + '%'
        if(inimigos[inimigoAtual].hp > inimigos[inimigoAtual].hpMax){
            inimigos[inimigoAtual].hp = inimigos[inimigoAtual].hpMax
        }
        audioCura()
        animacaoBrilho(`inimigo${inimigoAtual}`)
        let intervalFinalizar  = setInterval(function(){
            document.getElementById(`danoInimigo${inimigoAtual}`).className = 'danoInimigo d-none'
            document.getElementById(`danoInimigo${inimigoAtual}`).innerHTML = ``
            if(validarUsuarioMorreu()) return
            if(heroiMorreu){
                return
            }
            inimigoAtual += 1
            vezDoNimigo()
            clearInterval(intervalFinalizar)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoVampirismo(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} suga sua vida!</span>`
    audioAtaqueNormal()
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        let defAdicional = 0;
        if(defAdicional.duracao > 0) defAdicional = defAdd.value
        let dano = inimigos[inimigoAtual].atk - defReal - defAdicional;    
        if(inimigoEstaAtordoado(inimigoAtual)){
            dano = Math.floor(dano * 0.8)
        }
        if(dano <= 0){
            dano = 1
        }
        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `-${dano}`
        usuario.hp -= dano;
        audioDamage()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        let intervalLerMessage2  = setInterval(function(){
            let hpACurar = dano
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById(`danoInimigo${inimigoAtual}`).className = 'danoInimigo colorGreen d-block'
            document.getElementById(`danoInimigo${inimigoAtual}`).innerHTML = `+${hpACurar}`
            inimigos[inimigoAtual].hp += hpACurar;
            document.getElementById(`barHPMonster${inimigoAtual}`).style.width = (inimigos[inimigoAtual].hp * 100 /  inimigos[inimigoAtual].hpMax ) + '%'
            if(inimigos[inimigoAtual].hp > inimigos[inimigoAtual].hpMax){
                inimigos[inimigoAtual].hp = inimigos[inimigoAtual].hpMax
            }
            audioCura()
            animacaoBrilho(`inimigo${inimigoAtual}`)
            let intervalFinalizar  = setInterval(function(){
                document.getElementById(`danoInimigo${inimigoAtual}`).className = 'danoInimigo d-none'
                document.getElementById(`danoInimigo${inimigoAtual}`).innerHTML = ``
                if(validarUsuarioMorreu()) return
                if(heroiMorreu){
                    return
                }
                inimigoAtual += 1
                vezDoNimigo()
                clearInterval(intervalFinalizar)
            },1000)
            clearInterval(intervalLerMessage2)
        },1000)
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoPassarAvez(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} passou a vez!</span>`
    let intervalLerMessage  = setInterval(function(){
        inimigoAtual += 1
        vezDoNimigo()
        clearInterval(intervalLerMessage)
    },1000)
}

function nextEnemy(){
    inimigoAtual += 1
    vezDoNimigo()
}

function inimigoEstaParalizado(){
    audioParalisar()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} esta paralizado!</span>`
    animacaoBrilho(`inimigo${inimigoAtual}`)
    let intervalLerMessage  = setInterval(function(){
        inimigoAtual += 1
        vezDoNimigo()
        clearInterval(intervalLerMessage)
    },1000)
}

function inimigoDefender(){
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${inimigos[inimigoAtual].nome} defendeu!</span>`
    let intervalLerMessage  = setInterval(function(){
        inimigoAtual += 1
        vezDoNimigo()
        clearInterval(intervalLerMessage)
    },1000)
}

function animacaoBrilho(objId) {
    let itemAnimar = document.getElementById(objId)
    let classeAntes = itemAnimar.className
    itemAnimar.className = classeAntes + ' divBranca'
    let intervalAnimate  = setInterval(function(){
        itemAnimar.className = classeAntes
        clearInterval(intervalAnimate)
    },300)
}

function matarInimigo(objId) {
    let itemMatar = document.getElementById(objId)
    itemMatar.className = ' inimigo inimigoMorto'
    let intervalAnimate  = setInterval(function(){
        itemMatar.innerHTML = ''
        clearInterval(intervalAnimate)
    },300)
}

function vezDoNimigo() {
    let temAlguemVivo = inimigos.find(x => x.hp > 0) != undefined
    if(!temAlguemVivo){
        document.getElementById('audioBGM').src =  ''
        audioVenceu()
        bloquearComandos()
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você venceu!</span>`

        //Voltar ao mapa
        let interval  = setInterval(function(){
            vencer()
            clearInterval(interval)
        }, 2000);
        return;
    }
    if(heroiMorreu){
        return
    }
    //Ataque do inimigo
    validarStatusMonstros()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${tropa.nome} ao ataque!</span>`
    let interval  = setInterval(function(){
        if(inimigos[inimigoAtual] == undefined){
            voltarAosComandos()
        }else{
            if(inimigos[inimigoAtual].hp <= 0) inimigoAtual += 1

            let acaoInimigo =  descobrirAcaoInimigo()
            acaoInimigo()
        }
        clearInterval(interval)
    }, 1000);
}

function vencer(){
    let expRec = 0
    let coinsRec = 0
    let itensRecHtml = ''
    for(let i = 0; i < inimigos.length; i++){
        expRec += inimigos[i].exp;
        coinsRec += inimigos[i].coins;
        if(inimigos[i].itens != undefined){
            let chance = Math.floor(Math.random() * 100)
            for(let j = 0; j < inimigos[i].itens.length; j++){
                if(chance <= inimigos[i].itens[j].chances){
                    let itemNovo = inimigos[i].itens[j]
                    let oItemEmSi = itensAll.find(x => x.id == itemNovo.id)
                    if(itemNovo != undefined && oItemEmSi != undefined){
                        itensRecHtml += renderItensRecompensa(oItemEmSi)
                        if(usuario.itens.find(x => x.id == itemNovo.id) == undefined){
                            usuario.itens.push({
                                id: itemNovo.id,
                                qtd: 1
                            })
                        }else if(oItemEmSi.unico != true){
                            for(let k = 0; k < usuario.itens.length; k++){
                                if(usuario.itens[k].id == itemNovo.id) usuario.itens[k].qtd += 1
                            }
                        }
                    }
                }
            }
        }
        //Adicionar inimigos
        if(usuario.inimigos == undefined) usuario.inimigos = []
        if(usuario.inimigos.find(x => x.id == inimigos[i].id) == undefined){
            usuario.inimigos.push({id : inimigos[i].id, qtd: 1})
        }else{
            for(let j = 0; j < usuario.inimigos.length; j++){
                if(usuario.inimigos[j].id == inimigos[i].id){
                    usuario.inimigos[j].qtd += 1
                }
            }
        }
    }
    usuario.exp += expRec;
    usuario.bravecoins += coinsRec
    salvarUsuarioBanco(usuario)
    document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
    document.getElementById('janelaVitoria').className = 'janelaVitoria d-block'
    document.getElementById('janelaVitoria').innerHTML = 
    `<h3>Você venceu</h3>
        <hr/>
        <div class="recompensasVitoria">
            <span>Exp + ${expRec}</span>
            <span class="moedasRecompensa"><img src="img/icons/moedinha.png" alt="face" /> + ${coinsRec}</span>
            ${itensRecHtml}
            <hr />
        </div>
    <button class="button-laranja" onmouseover="audioCursor()" onclick="verificarSePassouDeNivel()">Fechar</button>`
}

function verificarSePassouDeNivel(){
    if(usuario.nivel >= 50){
        voltarAtelaAnterior()
        return;
    }
    if(usuario.exp * 100 / (usuario.nivel * 100 * 2) >= 100){
        audioUp()
        usuario.exp = usuario.exp - (usuario.nivel * 100 * 2)
        usuario.nivel += 1;
        usuario.atk += 2
        usuario.def += 2
        usuario.hpMax += 20
        usuario.mpMax += 20
        usuario.hp = usuario.hpMax
        usuario.mp = usuario.mpMax
        salvarUsuarioBanco(usuario)
        document.getElementById('janelaVitoria').className = 'janelaVitoria d-none'
        document.getElementById('janelaNovoNivel').className = 'janelaNovoNivel d-block';
        document.getElementById('janelaNovoNivel').innerHTML = `  <h3>Parabéns agora você é nível ${usuario.nivel}</h3>
            <hr/>
            <div class="recompensasNivel">
                <span>ATK + 2</span><br />
                <span>DEF + 2</span><br />
                <span>HP + 20</span><br />
                <span>MP + 20</span><br />
                <hr />
            </div>
        <button class="button-laranja" onmouseover="audioCursor()" onclick="verificarSePassouDeNivel()">Fechar</button>`
    }else{
        voltarAtelaAnterior()
    }
}

function renderItensRecompensa(item) {
    if(item == undefined) return '';

    return `<img src="img/icons/${item.icone}.png" class="itemRec" alt="logo" />`
}

function voltarAosComandos(){
    audioCancel()
    
    if(atkAdd.duracao > 0) atkAdd.duracao -= 1
    if(defAdd.duracao > 0) defAdd.duracao -= 1

    if(status.duracao > 0 && status.tipo == 0){
        status.duracao -= 1
        heroiEstaParalizado()
    }else{
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>Sua vez!</span>`
        document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
        status.duracao -= 1
        habilitarComandos()
        validarStatusMonstros()
        diminuirStatusMonstros()
        turno = ENUM_TURNO.VOCE_ACAO
    }
}

function fugir(){
    if(turno != ENUM_TURNO.VOCE_ACAO){
        return;
    }
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
    audioFugir()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você fugiu!</span>`
    let interval  = setInterval(function(){
        voltarAtelaAnterior()
        clearInterval(interval)
    }, 2000);
}

function voltarAtelaAnterior(){
    document.getElementById('janelaNovoNivel').className = 'janelaNovoNivel d-none'
    document.getElementById('janelaVitoria').className = 'janelaVitoria d-none'
    document.getElementById('cena').className = 'cena d-flex'
    turno = 0
    habilitarrMenus()
    if(tropa.mapa == 1) abrirFloresta()
    if(tropa.mapa == 2) abrirPraia()
    if(tropa.mapa == 3) abrirCaverna()
    if(tropa.mapa == 4) abrirCasa()
    if(tropa.mapa == 5) abrirMontanha()
    if(tropa.mapa == 6) abrirCastelo()
    document.getElementById('audioBGM').src =  'audio/Ship2.mp3'
}

function validarStatusMonstros() {
    for(let i = 0; i < inimigos.length; i++){
        if(inimigos[i].hp > 0){
            for(let j = 0; j < 3; j++){
                if(inimigos[i].status != undefined && inimigos[i].status.length > j && inimigos[i].status[j].duracao > 0){
                    document.getElementById(`iconStatusMonstro${i}${j}`).className = `iconStatusMonstro${j} d-block`
                    document.getElementById(`iconStatusMonstro${i}${j}`).src = `img/icons/${inimigos[i].status[j].icone}.png`
                }else{
                    document.getElementById(`iconStatusMonstro${i}${j}`).className = `iconStatusMonstro${j} d-none`
                }
            }
        }
    }
}

function diminuirStatusMonstros() {
    for(let i = 0; i < inimigos.length; i++){
        if(inimigos[i].hp > 0){
            for(let j = 0; j < 3; j++){
                if(inimigos[i].status != undefined && inimigos[i].status.length > j){
                    if(inimigos[i].status[j].duracao == 0){
                        inimigos[i].status.splice(j,1)
                    }else{
                        inimigos[i].status[j].duracao -= 1
                    }
                }
            }
        }
    }
}

function validarUsuarioMorreu(){
    if(usuario.hp <= 0){
        heroiMorreu = true
        usuario.hp =1
        atualizarHpMpHeroi()
        salvarUsuarioBanco(usuario)
        document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
        document.getElementById('audioBGM').src =  ''
        audioPerdeu()
        bloquearComandos()
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você perdeu!</span>`
        
        let interval  = setInterval(function(){
            voltarAtelaAnterior()
            clearInterval(interval)
        }, 4000);
        return true
    }
    return false
}

function getAudioAtaqueClase() {
    if(arma == undefined || arma.nome == undefined){
        audioAtaqueNormal()
        return;
    }
    if(usuario.classe == 'Guerreiro'){
        audioEspada()
        return;
    }
    if(usuario.classe == 'Arqueiro'){
        audioArco()
        return;
    }
    if(usuario.classe == 'Ladino'){
        audioFaca()
        return;
    }
    if(usuario.classe == 'Mago'){
        audioFogo()
        return;
    }
    if(usuario.classe == 'Bardo'){
        audioEspada()
        return;
    }
}

function audioCursorMonstro(){
    if(turno == ENUM_TURNO.VOCE_ESCOLHE_MONSTRO) audioCursor()
}