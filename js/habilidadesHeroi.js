let statusParalisado = {
    id: 0,
    icone: 'paralizar',
    duracao : 0
}

let statusAtordoado = {
    id: 2,
    icone: 'confundir',
    duracao : 0
}

function getHabilidadesHeroi(){
    if(turno != ENUM_TURNO.VOCE_ACAO){
        return;
    }
    if(status.tipo == 1 && duracao > 0){
        audioError()
        return
    }
    if(document.getElementById('janelaHabilidade').className == 'janelaHabilidade d-block'){
        document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
        audioCancel()
        return;
    }

    let html = ''
    for(let i = 0; i < habilidades.length; i++){
        html += templateHabilidade(habilidades[i])
    }
    audioConfirm()
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-block'
    document.getElementById('listaHabilidades').innerHTML = html
}

function getItensHeroi(){
    if(turno != ENUM_TURNO.VOCE_ACAO){
        return;
    }
    if(document.getElementById('janelaHabilidade').className == 'janelaHabilidade d-block'){
        document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
        audioCancel()
        return;
    }

    let html = ''
    for(let i = 0; i < itensInventorioBatalha.length; i++){
        html += templateItens(itensInventorioBatalha[i])
    }
    audioConfirm()
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-block'
    document.getElementById('listaHabilidades').innerHTML = html
}

function mostrarDescricaoHabilidade(id){
    audioCursor()
    let habil = habilidades.find(x => x.id == id)
    if(habil != undefined){
        document.getElementById('descriHabilidade').innerHTML = templateHabilidadeDescricao(habil)
    }
}

function mostrarDescricaoItem(id){
    audioCursor()
    let it = itensInventorioBatalha.find(x => x.id == id)
    if(it != undefined){
        document.getElementById('descriHabilidade').innerHTML = templateItemDescricao(it)
    }
}

function templateHabilidade(item){
    return `<div class="hab-item" onmouseover="mostrarDescricaoHabilidade(${item.id})" onclick="${item.acao}()" >
                <img src="img/icons/${item.icone}.png" alt="logo" />
                <span>${item.nome}</span>
                <div class="hab-mp ${usuario.mp < item.mp ? 'colorRed' : ''}">
                    ${item.mp}
                </div>
            </div>`
}

function templateHabilidadeDescricao(item){
    return `<img src="img/icons/${item.icone}.png" alt="logo" /><br />
            <b>${item.nome}</b>
            <hr />
            <i>${item.descricao}</i>`
}

function templateItens(item){
    return `<div class="hab-item" onmouseover="mostrarDescricaoItem(${item.id})" onclick="${item.acao}(${item.id})" >
                <img src="img/icons/${item.icone}.png" alt="logo" />
                <span>${item.nome}</span>
                <div class="hab-mp">
                    x${item.qtd}
                </div>
            </div>`
}

function templateItemDescricao(item){
    return `<img src="img/icons/${item.icone}.png" alt="logo" /><br />
            <b>${item.nome}</b>
            <hr />
            <span>${item.descricao}</span><br />
            <i>${item.efeito}</i>`
}

//Descançar
function heroiDescansar() {
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} esta descansando!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let hpAumentar = Math.floor(usuario.hpMax * 0.05)
        let mpAumentar = Math.floor(usuario.hpMax * 0.05)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">+${hpAumentar}</i><br />`
        usuario.hp += hpAumentar;
        usuario.mp += mpAumentar;
        if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
        if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
        audioCura()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

function heroiSugarVida(){
    if(turno != ENUM_TURNO.VOCE_ACAO){
        return;
    }
    let mpNecessario = 40;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
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
            if(dano <= 0){
                dano = 1
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
                let hpAumentar = dano
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                document.getElementById(`danoInimigo${index}`).innerHTML = ''
                document.getElementById('danoHeroi').className = 'danoHeroi d-block'
                document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">+${hpAumentar}</i><br />`
                usuario.hp += hpAumentar;
                usuario.mp -= mpNecessario;
                if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
                audioCura()
                animacaoBrilho('batalhaFace')
                salvarUsuarioBanco(usuario)
                atualizarHpMpHeroi()
        
                clearInterval(interval2)
                let interval3  = setInterval(function(){
                    document.getElementById('danoHeroi').className = 'danoHeroi d-none'
                    document.getElementById('danoHeroi').innerHTML = ''
                    esconlheuInimigo = false
        
                    esconlheuInimigo = false
                    if(inimigos[index].hp <= 0){
                        matarInimigo(`inimigo${index}`)
                    }
                    inimigoAtual = 0
                    vezDoNimigo()
                    clearInterval(interval3)
                },1000)
            }, 1000);
        }, 1000);
    }
}

//Curar
function heroiCurar() {
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou cura!</span>`
    let interval  = setInterval(function(){
        let hpAumentar = Math.floor(usuario.hpMax * 0.2)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">+${hpAumentar}</i><br />`
        usuario.hp += hpAumentar;
        usuario.mp -= mpNecessario;
        if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
        audioCura()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Magia mais importante
function heroiMagiaMaisImportante() {
    let hpMiminuir = Math.floor(usuario.hpMax * 0.33);
    if(usuario.hp < hpMiminuir){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} sacrifica sua vida!</span>`
    let interval  = setInterval(function(){

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorRed">-${hpMiminuir}</i><br />`
        usuario.hp -= hpMiminuir;

        audioCura()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){

            document.getElementById('danoHeroi').className = 'danoHeroi d-block'
            document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+100%</i><br />`

            usuario.mp = usuario.mpMax;
            audioCura()
            animacaoBrilho('batalhaFace')
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()
    
            clearInterval(interval2)
            let interval3  = setInterval(function(){
                document.getElementById('danoHeroi').className = 'danoHeroi d-none'
                document.getElementById('danoHeroi').innerHTML = ''
                esconlheuInimigo = false
    
                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval3)
            },1000)
        }, 1000);
    }, 1000);
}

//Esta paralizado
function heroiEstaParalizado() {
    turno = ENUM_TURNO.VOCE_ATACA
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} esta paralizado!</span>`
    let interval  = setInterval(function(){
        audioParalisar()
        animacaoBrilho('batalhaFace')

        clearInterval(interval)
        let interval2  = setInterval(function(){
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Fúria
function heroiFuria() {
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou seu ataque!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let atkAumentar = Math.floor(atkReal * 0.2)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${atkAumentar}</i><br />`
        atkAdd.value = atkAumentar
        atkAdd.duracao += 3

        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Esconder-se
function heroiEsconder() {
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou sua defesa!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let defAumentar = Math.floor(defReal * 0.2)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${defAumentar}</i><br />`
        defAdd.value = defAumentar
        defAdd.duracao += 3

        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Ato de coragem
function heroiAtoDeCoragem() {
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou sua defesa!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let defAumentar = Math.floor(defReal / 2) * -1
        let atkAumentar = Math.floor(defReal * 2)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${atkAumentar}</i><br />`
        defAdd.value = defAumentar
        defAdd.duracao += 3
        atkAdd.value = atkAumentar
        atkAdd.duracao += 3

        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Roubar
function heroiRoubar(){
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} tenta roubar o inimigo!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            atualizarHpMpHeroi()

            let chance = Math.floor(Math.random() * 100)
            if(chance >= 50){
                audioComprar()
                document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} roubou ${inimigos[index].coins} bravecoins!</span>`
                document.getElementById('danoHeroi').className = 'danoHeroi d-block'
                document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${inimigos[index].coins}</i><br />`
                usuario.bravecoins += inimigos[index].coins
                salvarUsuarioBanco(usuario)

            }else{
                audioError()
                document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você falhou em sua tentativa de roubo!</span>`
            }

            clearInterval(interval)
            let interval2  = setInterval(function(){
                document.getElementById('danoHeroi').className = 'danoHeroi d-none'
                document.getElementById('danoHeroi').innerHTML = ''
                esconlheuInimigo = false

                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval2)
            },2000)
        }, 1000);
    }
}

//Ataque forte
function heroiAtaqueForte(){
    let mpNecessario = 40;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

            audioDamage()
            let danoAdicional = 0;
            if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
            let dano = atkReal + danoAdicional
            if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                dano += Math.floor(dano * 0.2)
            }
            dano += dano * 0.5
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

//Sinfonia concentrada
function heroiSinfoniaConcentrada(){
    let mpNecessario = 65;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

            audioDamage()
            let danoAdicional = 0;
            if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
            let dano = atkReal + danoAdicional
            if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                dano += Math.floor(dano * 0.2)
            }
            dano += dano * 3
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

//Sua força é a minha força
function heroiUsarForcaInimigo(){
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

            audioDamage()
            let danoAdicional = 0;
            if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
            let dano = atkReal + danoAdicional
            if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                dano += Math.floor(dano * 0.2)
            }
            dano += dano + inimigoSelecionado.atk
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

//Ataque Paralisante
function heroiAtaqueParalizante(){
    let mpNecessario = 50;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

            audioDamage()
            let danoAdicional = 0;
            if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
            let dano = atkReal + danoAdicional
            if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                dano += Math.floor(dano * 0.2)
            }
            dano -= inimigoSelecionado.def
            if(dano <= 0){
                dano = 1
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
                }else{
                    if(inimigos[index].status == undefined){
                        inimigos[index].status = []
                    }
                    if(inimigos[index].status.find(x => x.id == 0/*Status Paralizado*/) == undefined &&
                      inimigos[index].imuneParalisia != true){
                        let status = copiarObjecto(statusParalisado)
                        status.duracao = 2
                        inimigos[index].status.push(status)
                    }
                }
                
                audioParalisar()
                validarStatusMonstros()
                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval2)
            },1000)
        }, 1000);
    }
}

//Ataque Atordoante
function heroiAtaqueAtordoante(){
    let mpNecessario = 40;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

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
                }else{
                    if(inimigos[index].status == undefined){
                        inimigos[index].status = []
                    }
                    if(inimigos[index].status.find(x => x.id == 2/*Status Paralizado*/) == undefined){
                        let status = copiarObjecto(statusAtordoado)
                        status.duracao = 3
                        inimigos[index].status.push(status)
                    }
                }
                
                audioParalisar()
                validarStatusMonstros()
                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval2)
            },1000)
        }, 1000);
    }
}

//Sinfonia Paralisante
function heroiSinfoniaParalisante(){
    let mpNecessario = 50;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Escolha o inimigo para atacar!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        audioParalisar()

        for(let index = 0; index < inimigos.length; index++){
            if(inimigos[index].hp > 0){
                animacaoBrilho(`inimigo${index}`)
                let interval2  = setInterval(function(){
            
                    if(inimigos[index].status == undefined){
                        inimigos[index].status = []
                    }
                    if(inimigos[index].status.find(x => x.id == 0/*Status Paralizado*/) == undefined &&
                        inimigos[index].imuneParalisia != true){
                        let status = copiarObjecto(statusParalisado)
                        status.duracao = 2
                        inimigos[index].status.push(status)
                    }
                    
                    clearInterval(interval2)
                },1000)
            }
        }

        clearInterval(interval)
        let intervalFin  = setInterval(function(){
            
            validarStatusMonstros()
            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(intervalFin)
        },1500)
    }, 1000);
}

//Sinfonia Atordoante
function heroiAtordoar(){
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você toca uma melodia envolvente que atordoa seus inimigos!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        audioAtordoar()

        for(let index = 0; index < inimigos.length; index++){
            if(inimigos[index].hp > 0){
                animacaoBrilho(`inimigo${index}`)
                let interval2  = setInterval(function(){
            
                    if(inimigos[index].status == undefined){
                        inimigos[index].status = []
                    }
                    if(inimigos[index].status.find(x => x.id == 2/*Status Paralizado*/) == undefined){
                        let status = copiarObjecto(statusAtordoado)
                        status.duracao = 4
                        inimigos[index].status.push(status)
                    }
                    
                    clearInterval(interval2)
                },1000)
            }
        }

        clearInterval(interval)
        let intervalFin  = setInterval(function(){
            
            validarStatusMonstros()
            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(intervalFin)
        },1500)
    }, 1000);
}

//Flechas Paralisantes
function heroiFlechasParalisantes(){
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Escolha o inimigo para atacar!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        audioDamage()

        for(let index = 0; index < inimigos.length; index++){
            if(inimigos[index].hp > 0){
                let inimigoSelecionado = inimigos[index]
                let danoAdicional = 0;
                if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
                let dano = atkReal + danoAdicional
                if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                    dano += Math.floor(dano * 0.2)
                }
                dano -= inimigoSelecionado.def
                dano = Math.floor(dano * 0.5)
                if(dano < 0){
                    dano = 0
                }
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
        

                animacaoBrilho(`inimigo${index}`)
                let interval2  = setInterval(function(){
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                    document.getElementById(`danoInimigo${index}`).innerHTML = ''
                    if(inimigos[index].hp <= 0){
                        matarInimigo(`inimigo${index}`)
                    }else{
                        if(inimigos[index].status == undefined){
                            inimigos[index].status = []
                        }
                        if(inimigos[index].status.find(x => x.id == 0/*Status Paralizado*/) == undefined &&
                           inimigos[index].imuneParalisia != true){
                            let status = copiarObjecto(statusParalisado)
                            status.duracao = 2
                            inimigos[index].status.push(status)
                        }
                    }

                    clearInterval(interval2)
                },1000)
            }
        }

        clearInterval(interval)
        let intervalFin  = setInterval(function(){
            
            validarStatusMonstros()
            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(intervalFin)
        },1500)
    }, 1000);
}

//Congelar
function heroiCongelar(){
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Escolha o inimigo para atacar!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque forte!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        audioGelo()

        for(let index = 0; index < inimigos.length; index++){
            if(inimigos[index].hp > 0){
                let inimigoSelecionado = inimigos[index]
                let danoAdicional = 0;
                if(atkAdd.duracao > 0) danoAdicional = atkAdd.value
                let dano = atkReal + danoAdicional
                if(inimigoSelecionado.status != undefined && inimigoSelecionado.status.find(x => x.id == 2 && x.duracao > 0) != undefined){
                    dano += Math.floor(dano * 0.2)
                }
                dano -= inimigoSelecionado.def
                dano = Math.floor(dano * 0.2)
                if(dano < 0){
                    dano = 0
                }
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
        

                animacaoBrilho(`inimigo${index}`)
                let interval2  = setInterval(function(){
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                    document.getElementById(`danoInimigo${index}`).innerHTML = ''
                    if(inimigos[index].hp <= 0){
                        matarInimigo(`inimigo${index}`)
                    }else{
                        if(inimigos[index].status == undefined){
                            inimigos[index].status = []
                        }
                        if(inimigos[index].status.find(x => x.id == 0/*Status Paralizado*/) == undefined &&
                           inimigos[index].imuneParalisia != true){
                            let status = copiarObjecto(statusParalisado)
                            status.duracao = 3
                            inimigos[index].status.push(status)
                        }
                    }

                    clearInterval(interval2)
                },1000)
            }
        }

        clearInterval(interval)
        let intervalFin  = setInterval(function(){
            
            validarStatusMonstros()
            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(intervalFin)
        },1500)
    }, 1000);
}

//Ataque todos
function heroiExplosao(){
    let mpNecessario = 50;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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

//Sinfonia poderosa
function heroiSinfoniaPoderosa(){
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} esta tocando uma sinfonia muito poderosa!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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
                dano += dano
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

//Allegro
function heroiAllegro(){
    let mpNecessario = 150;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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
                dano = dano * 3
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

//Flechas ignorando a defesa
function heroiFlechasCerteiras(){
    let mpNecessario = 100;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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

//Melodia protetora
function heroiMelodiaDefesa() {
    let mpNecessario = 15;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou sua defesa!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let defAumentar = Math.floor(defReal * 0.4)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${defAumentar}</i><br />`
        defAdd.value = defAumentar
        defAdd.duracao += 4

        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Ataque Duplo
function heroiAtaqueDuplo(){
    let mpNecessario = 10;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
            usuario.mp -= mpNecessario;
            atualizarHpMpHeroi()
            let inimigoSelecionado = inimigos[index]
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

            animacaoBrilho(`inimigo${index}`)
            document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
            clearInterval(interval)
            let interval2  = setInterval(function(){
                audioDamage()
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 2}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                animacaoBrilho(`inimigo${index}`)
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                clearInterval(interval2)
                let interval3  = setInterval(function(){
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                    document.getElementById(`danoInimigo${index}`).innerHTML = ''
                    esconlheuInimigo = false
                    if(inimigos[index].hp <= 0){
                        matarInimigo(`inimigo${index}`)
                    }
                    inimigoAtual = 0
                    vezDoNimigo()
                    clearInterval(interval3)
                },1000)
            }, 1000);
        }, 1000);
    }
}

//Ataque triplo
function heroiAtaqueTriplo(){
    let mpNecessario = 90;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
            usuario.mp -= mpNecessario;
            atualizarHpMpHeroi()
            let inimigoSelecionado = inimigos[index]
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

            animacaoBrilho(`inimigo${index}`)
            document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
            clearInterval(interval)
            let interval2  = setInterval(function(){
                audioDamage()
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 2}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                animacaoBrilho(`inimigo${index}`)
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                clearInterval(interval2)
                let interval3 = setInterval(function(){
                    audioDamage()
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                    document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 3}`
                    inimigos[index].hp -= dano;
                    if(inimigos[index].hp < 0){
                        inimigos[index].hp = 0
                    }
                    animacaoBrilho(`inimigo${index}`)
                    document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                    clearInterval(interval3)
                    let interval4  = setInterval(function(){
                        document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                        document.getElementById(`danoInimigo${index}`).innerHTML = ''
                        esconlheuInimigo = false
                        if(inimigos[index].hp <= 0){
                            matarInimigo(`inimigo${index}`)
                        }
                        inimigoAtual = 0
                        vezDoNimigo()
                        clearInterval(interval4)
                    },1000)
                }, 1000);
            }, 1000);
        }, 1000);
    }
}

//Ataque triplo paralizante
function heroiRelampagos(){
    let mpNecessario = 100;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
            usuario.mp -= mpNecessario;
            atualizarHpMpHeroi()
            let inimigoSelecionado = inimigos[index]
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

            animacaoBrilho(`inimigo${index}`)
            document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
            clearInterval(interval)
            let interval2  = setInterval(function(){
                audioDamage()
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 2}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                animacaoBrilho(`inimigo${index}`)
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                clearInterval(interval2)
                let interval3 = setInterval(function(){
                    audioDamage()
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                    document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 3}`
                    inimigos[index].hp -= dano;
                    if(inimigos[index].hp < 0){
                        inimigos[index].hp = 0
                    }
                    animacaoBrilho(`inimigo${index}`)
                    document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                    clearInterval(interval3)
                    let interval4  = setInterval(function(){
                        document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                        document.getElementById(`danoInimigo${index}`).innerHTML = ''
                        esconlheuInimigo = false
                        if(inimigos[index].hp <= 0){
                            matarInimigo(`inimigo${index}`)
                        }else{
                            let chance = Math.floor(Math.random() * 100)
                            if(chance <= 25){
                                if(inimigos[index].status == undefined){
                                    inimigos[index].status = []
                                }
                                if(inimigos[index].status.find(x => x.id == 0/*Status Paralizado*/) == undefined &&
                                   inimigos[index].imuneParalisia != true){
                                    let status = copiarObjecto(statusParalisado)
                                    status.duracao = 2
                                    inimigos[index].status.push(status)
                                }
                            }
                        }
                        inimigoAtual = 0
                        vezDoNimigo()
                        clearInterval(interval4)
                    },1000)
                }, 1000);
            }, 1000);
        }, 1000);
    }
}

//Ataque quadruplo
function heroiDisparosConcentrados(){
    let mpNecessario = 100;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
            usuario.mp -= mpNecessario;
            atualizarHpMpHeroi()
            let inimigoSelecionado = inimigos[index]
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

            animacaoBrilho(`inimigo${index}`)
            document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
            clearInterval(interval)
            let interval2  = setInterval(function(){
                audioDamage()
                document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 2}`
                inimigos[index].hp -= dano;
                if(inimigos[index].hp < 0){
                    inimigos[index].hp = 0
                }
                animacaoBrilho(`inimigo${index}`)
                document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                clearInterval(interval2)
                let interval3 = setInterval(function(){
                    audioDamage()
                    document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                    document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 3}`
                    inimigos[index].hp -= dano;
                    if(inimigos[index].hp < 0){
                        inimigos[index].hp = 0
                    }
                    animacaoBrilho(`inimigo${index}`)
                    document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                    clearInterval(interval3)
                    let interval4 = setInterval(function(){
                        audioDamage()
                        document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-block'
                        document.getElementById(`danoInimigo${index}`).innerHTML = `-${dano * 4}`
                        inimigos[index].hp -= dano;
                        if(inimigos[index].hp < 0){
                            inimigos[index].hp = 0
                        }
                        animacaoBrilho(`inimigo${index}`)
                        document.getElementById(`barHPMonster${index}`).style.width = (inimigos[index].hp * 100 /  inimigos[index].hpMax ) + '%'
                        clearInterval(interval4)
                        let interval5  = setInterval(function(){
                            document.getElementById(`danoInimigo${index}`).className = 'danoInimigo d-none'
                            document.getElementById(`danoInimigo${index}`).innerHTML = ''
                            esconlheuInimigo = false
                            if(inimigos[index].hp <= 0){
                                matarInimigo(`inimigo${index}`)
                            }
                            inimigoAtual = 0
                            vezDoNimigo()
                            clearInterval(interval5)
                        },1000)
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }
}

//A pena é mais forte do que a espada
function heroiPenaMaisForteQueEspada() {
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou seu ataque!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        let atkAumentar = Math.floor(atkReal * 2)

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${atkAumentar}</i><br />`
        atkAdd.value = atkAumentar
        atkAdd.duracao += 3
        status = {
            tipo : 1,
            duracao: 3
        }
        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

function heroiPontoFraco(){
    let mpNecessario = 75;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    audioConfirm()
    bloquearComandos()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>Escolha o inimigo para atacar!</span>`
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-flex'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'
    turno = ENUM_TURNO.VOCE_ESCOLHE_MONSTRO;
    acaoEscolherMonstro = (index) => {
        turno = ENUM_TURNO.VOCE_ATACA
        usuario.mp -= mpNecessario;
        atualizarHpMpHeroi()
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

//O poder do protagonista
function heroiProtagonismo() {
    let mpNecessario = 500;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} aumentou seu ataque!</span>`
    let interval  = setInterval(function(){
        audioDamage()
        turno = ENUM_TURNO.VOCE_ATACA
        let atkAumentar = usuario.hpMax - usuario.hp + 50;

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorBlue">+${atkAumentar}</i><br />`
        atkAdd.value = atkAumentar
        atkAdd.duracao += 3

        usuario.mp -= mpNecessario;
        
        audioUp()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Assassinato arriscado
function heroiAssassinatoArrisacdo(){
    let mpNecessario = 200;
    if(usuario.mp < mpNecessario){
        audioError();
        return
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
        document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} tenta assassinar o inimigo!</span>`
        let interval  = setInterval(function(){
            usuario.mp -= mpNecessario;
            salvarUsuarioBanco(usuario)
            atualizarHpMpHeroi()

            let chance = Math.floor(Math.random() * 100)
            if(chance <= 15){
                audioDamage()
                document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} matou seu inimigo!</span>`
                inimigos[index].hp = 0
                matarInimigo(`inimigo${index}`)

            }else{
                audioError()
                document.getElementById('mensagensNaBatalha').innerHTML = `<span>Você falhou em sua tentativa de assassinato!</span>`
            }

            clearInterval(interval)
            let interval2  = setInterval(function(){
                esconlheuInimigo = false

                inimigoAtual = 0
                vezDoNimigo()
                clearInterval(interval2)
            },2000)
        }, 1000);
    }
}

//Tudo ou nada Arqueiro
function heroiTudoOuNadaArqueiro(){
    let mpNecessario = 200;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= 200;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()
        status = {
            tipo : 0,
            duracao: 3
        }

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
                dano += dano * 5
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

//Tudo ou nada Mago
function heroiTudoOuNada(){
    let mpNecessario = (usuario.mpMax / 2);
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp = 0;
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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
                dano += dano * 5
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

//Sinfonia Final
function heroiSinfoniaFinal(){
    let mpNecessario = 200;
    if(usuario.mp < mpNecessario){
        audioError();
        return
    }
    if(usuario.hp <= (usuario.hpMax / 2)){
        audioError();
        alert('Você não tem HP o suficiente para essa ação')
        return
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()

    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    getAudioAtaqueClase()
    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou um ataque impressionante!</span>`
    let interval  = setInterval(function(){
        usuario.mp -= mpNecessario;
        usuario.hp -= usuario.hpMax / 2
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

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
                dano += dano * 5
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

function inimigoEstaAtordoado(index) {
    if(inimigos[index] != undefined && inimigos[index].status != undefined &&
       inimigos[index].status.find(x => x.id == 2 && x.duracao > 0)){
        return true
    }
}



//Itens

//Poções de cura porcentagem
function itemDeCuraPorcen(id) {
    let itemUsar = itensAllBatalha.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou ${itemUsar.nome}!</span>`
    let interval  = setInterval(function(){
        let hpAumentar = Math.floor(usuario.hpMax * (itemUsar.hp / 100))
        let mpAumentar = Math.floor(usuario.mpMax * (itemUsar.mp / 100))

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">+${hpAumentar > 0 ? hpAumentar : mpAumentar}</i><br />`
        usuario.hp += hpAumentar;
        usuario.mp += mpAumentar;
        if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
        if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
        for(let i = 0; i < usuario.itens.length; i++){
            if(usuario.itens[i].id == itemUsar.id){
                usuario.itens[i].qtd -= 1
                if(usuario.itens[i].qtd == 0){
                    usuario.itens.splice(i,1)
                }
            }
        }
        audioPot()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Poções de aumento de atributo
function itemDeAtributoPorcen(id) {
    let itemUsar = itensAllBatalha.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou ${itemUsar.nome}!</span>`
    let interval  = setInterval(function(){
        let hpAumentar = itemUsar.hpMax
        let mpAumentar = itemUsar.mpMax
        let atkAumentar = itemUsar.atk
        let defAumentar = itemUsar.def
        let atributoAumentar = hpAumentar + mpAumentar + atkAumentar + defAumentar

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">+${atributoAumentar}</i><br />`
        usuario.hp += hpAumentar;
        usuario.mp += mpAumentar;
        usuario.hpMax += hpAumentar
        usuario.mpMax += mpAumentar
        usuario.atk += atkAumentar
        usuario.defAumentar += defAumentar
        if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
        if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
        for(let i = 0; i < usuario.itens.length; i++){
            if(usuario.itens[i].id == itemUsar.id){
                usuario.itens[i].qtd -= 1
                if(usuario.itens[i].qtd == 0){
                    usuario.itens.splice(i,1)
                }
            }
        }
        audioPot()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            vezDoNimigo()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Veneno
function tomarVeneno(id) {
    let itemUsar = itensAllBatalha.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou ${itemUsar.nome}!</span>`
    let interval  = setInterval(function(){

        document.getElementById('danoHeroi').className = 'danoHeroi d-block'
        document.getElementById('danoHeroi').innerHTML = `<i class="colorGreen">-${usuario.hp}</i><br />`
        usuario.hp = 0;
        if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
        if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
        for(let i = 0; i < usuario.itens.length; i++){
            if(usuario.itens[i].id == itemUsar.id){
                usuario.itens[i].qtd -= 1
                if(usuario.itens[i].qtd == 0){
                    usuario.itens.splice(i, 1)
                }
            }
        }
        audioDamage()
        animacaoBrilho('batalhaFace')
        salvarUsuarioBanco(usuario)
        atualizarHpMpHeroi()

        clearInterval(interval)
        let interval2  = setInterval(function(){
            document.getElementById('danoHeroi').className = 'danoHeroi d-none'
            document.getElementById('danoHeroi').innerHTML = ''
            esconlheuInimigo = false

            inimigoAtual = 0
            validarUsuarioMorreu()
            clearInterval(interval2)
        },1000)
    }, 1000);
}

//Usou bomba
function itemUsouBomba(id) {
    let itemUsar = itensAllBatalha.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    turno = ENUM_TURNO.VOCE_ATACA
    audioConfirm()
    bloquearComandos()
    document.getElementById('batalhaCancelarButton').className = 'batalhaCancelarButton d-none'
    document.getElementById('janelaHabilidade').className = 'janelaHabilidade d-none'

    document.getElementById('mensagensNaBatalha').innerHTML = `<span>${usuario.nome} usou ${itemUsar.nome}!</span>`
        
    for(let i = 0; i < usuario.itens.length; i++){
        if(usuario.itens[i].id == itemUsar.id){
            usuario.itens[i].qtd -= 1
            if(usuario.itens[i].qtd == 0){
                usuario.itens.splice(i,1)
            }
        }
    }

    animacaoBrilho('batalhaFace')
    salvarUsuarioBanco(usuario)
    usuario.mp + 50
    heroiExplosao()
}