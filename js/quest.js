let usuarios = []
let usuario = {}
let itensInventorio = []
let itensAll = []
let itemSelecionado = {}
let quests = {}
let monstrosAll = []

//armas e equipamentos
let arma = {}
let roupa = {}
let escudo = {}
let acessorio = {}

let atkAdd = 0
let defAdd = 0

function abrirInicioQuest(){
    buscarBase()

    includeHTML()
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
        quests = db.quest;
        audioConfirm()
        document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;

        itensAll = []
        itensAll = db.pocoes.concat(db.equipamentos, db.objetos)
        itensInventorio = []
        monstrosAll = db.inimigos

        for(let i = 0; i < usuario.itens.length; i++){
            let it = itensAll.find(x => x.id == usuario.itens[i].id)
            if(it != undefined){
                it.qtd = usuario.itens[i].qtd
                it.equipado = usuario.itens[i].equipado
                itensInventorio.push(it)
            }
        }
        getQuests()
    })
    .catch((err) => {
        console.error(err);
    });
}

function irParaPerfil() {
    window.location.replace("perfil.html")
}

function irParaUsuarios() {
    window.location.replace("usuarios.html")
}

function getQuests() {
    let html = ''
    for(let i = 0; i < quests.length; i++){
        if(usuario.quest == undefined) usuario.quest = []
        if(usuario.nivel >= quests[i].nivel &&
           usuario.quest.find(x => x.id == quests[i].id) == undefined && 
           (quests[i].needQuest == undefined || usuario.quest.find(x => x.id == quests[i].needQuest) != undefined)){
            html += renderQuestList(quests[i])
        }
    }
    html += `<hr class='hr100menos10'/>
             <div>
                <button class="button-laranja" onmouseover="audioCursor()" onclick="getQuestsConcluidas()">Concluídas</button>
             </div>`
    document.getElementById('titleTypeItem').innerHTML = 'Quests'
    document.getElementById('listaQuests').innerHTML = html
}

function getQuestsConcluidas() {
    let html = ''
    if(usuario.quest == undefined){
        document.getElementById('listaQuests').innerHTML = '...'
        return
    }
    for(let i = 0; i < quests.length; i++){
        if(usuario.nivel >= quests[i].nivel && usuario.quest.find(x => x.id == quests[i].id) != undefined){
            html += renderQuestList(quests[i])
        }
    }
    html += `<hr class='hr100menos10' />
             <div>
                <button class="button-azul" onmouseover="audioCursor()" onclick="verificarSePassouDeNivel()">Voltar</button>
             </div>`
    document.getElementById('listaQuests').innerHTML = html
}

function getQuestDetails(id) {
    let questEmQuestao = quests.find(x => x.id == id)
    document.getElementById('listaQuests').innerHTML = renderQuestDescricao(questEmQuestao)
}

function finalizarQuest(id) {
    let questEmQuestao = quests.find(x => x.id == id)
    let prog = getProgressRequire(questEmQuestao)
    if(prog.progresso < 100){
        audioError()
        return;
    }
    audioConfirm()
    usuario.exp += questEmQuestao.exp
    usuario.bravecoins += questEmQuestao.bravecois
    //Reduzir os itens do usuário
    if(questEmQuestao.itens != undefined){
        for(let i = 0; i < questEmQuestao.itens.length; i++){
            for(let j = 0; j < usuario.itens.length; j++){
                //Achou o item
                if(usuario.itens[j].id == questEmQuestao.itens[i].id){
                    usuario.itens[j].qtd -= questEmQuestao.itens[i].qtd;
                    if(usuario.itens[j].qtd == 0){
                        usuario.itens.splice(j, 1)
                    }
                }
            }
        }
    }

    //Adicionar os itens do usuário
    if(questEmQuestao.recompansaItem != undefined){
        for(let i = 0; i < questEmQuestao.recompansaItem.length; i++){
            if(usuario.itens.find(x => x.id == questEmQuestao.recompansaItem[i].id)){
                for(let j = 0; j < usuario.itens.length; j++){
                    //Achou o item
                    if(usuario.itens[j].id == questEmQuestao.recompansaItem[i].id){
                        usuario.itens[j].qtd += questEmQuestao.recompansaItem[i].qtd;
                    }
                }
            }else{
                let itemEmQuestao = itensAll.find(x => x.id == questEmQuestao.recompansaItem[i].id)
                if(itemEmQuestao.classe == undefined || itemEmQuestao.classe == usuario.classe){
                    usuario.itens.push(questEmQuestao.recompansaItem[i])
                }
            }
        }
    }

    //Atualizar o inventario
    itensInventorio = []
    for(let i = 0; i < usuario.itens.length; i++){
        let it = itensAll.find(x => x.id == usuario.itens[i].id)
        if(it != undefined){
            it.qtd = usuario.itens[i].qtd
            it.equipado = usuario.itens[i].equipado
            itensInventorio.push(it)
        }
    }

    if(usuario.quest == undefined) usuario.quest = []

    usuario.quest.push({id: id})
    salvarUsuarioBanco(usuario)

    document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
    document.getElementById('listaQuests').innerHTML = renderQuestFinal(questEmQuestao)
}

function passouEssaQuest(id){
    return usuario.quest.find(x => x.id == id) != undefined
}

function getItensRequire(itens) {
    let html = ''
    if(itens == undefined) return '';
    for(let i = 0; i < itens.length; i++){
        let itemReal = itensAll.find(x => x.id == itens[i].id)
        let itensDoUsuario = itensInventorio.find(x => x.id ==itens[i].id)
        if(itensDoUsuario == undefined) itensDoUsuario = { qtd : 0}
        html += renderItemRequire({
            icone : itemReal.icone,
            qtd : itensDoUsuario.qtd,
            need : itens[i].qtd
        })
    }
    return html
}

function getMonstrosRequire(monstros) {
    let html = ''
    if(monstros == undefined) return '';
    for(let i = 0; i < monstros.length; i++){
        let monstroReal = monstrosAll.find(x => x.id == monstros[i].id)
        let inimDoUsuario = usuario.inimigos != undefined ? usuario.inimigos.find(x => x.id == monstros[i].id) : { qtd : 0}
        if(inimDoUsuario == undefined) inimDoUsuario = {qtd : 0}
        html += renderMonsterRequire({
            nome : monstroReal.nome,
            qtd : inimDoUsuario.qtd,
            need : monstros[i].qtd
        })
    }
    return html
}

function getRecompensas(itens) {
    let html = ''
    if(itens == undefined) return '';
    for(let i = 0; i < itens.length; i++){
        let itemReal = itensAll.find(x => x.id == itens[i].id)
        if(itemReal.classe == undefined || itemReal.classe == usuario.classe){
            html += `<img src="img/icons/${itemReal.icone}.png" alt="perfil" class="iconRecompensaQuest">`
        }
    }
    return html
}

function getInnReq(inn) {
    if(inn == undefined) return '';
    return `<b class="colorAzulCondado">Noites na Pousada:</b> ${usuario.inn || 0}/${inn}`
}

function renderProgress(id) {
    let questQuestao = quests.find(x => x.id == id)
    let prog = getProgressRequire(questQuestao)
    if(passouEssaQuest(id)){
        return ''
    }else if(prog.progresso >= 100){
        return `<div class="questStatusConcluido">
                    <span>Concluído</span>
                </div>`
    }else{
        return `<div class="questStatusInProgess">
                    <div id="barHP" class="barHP" style="width: ${prog.progresso}%;"></div>
                </div>`
    }
}

function getProgressRequire(quest) {
    let itrUsuario = 0
    let itrNeed = 0
    let itens = quest.itens
    let monstros = quest.monstros
    if(itens != undefined){
        for(let i = 0; i < itens.length; i++){
            let itensDoUsuario = copiarObjecto(itensInventorio.find(x => x.id ==itens[i].id))
            if(itensDoUsuario == undefined) itensDoUsuario = { qtd : 0}
            if(itensDoUsuario.qtd > itens[i].qtd) itensDoUsuario.qtd = itens[i].qtd
            itrNeed += itens[i].qtd
            itrUsuario += itensDoUsuario.qtd
        }
    }

    if(monstros != undefined){
        for(let i = 0; i < monstros.length; i++){
            let monsterDoUsuario = undefined
            if(usuario.inimigos != undefined) monsterDoUsuario = copiarObjecto(usuario.inimigos.find(x => x.id == monstros[i].id))
            if(monsterDoUsuario == undefined) monsterDoUsuario = { qtd : 0}
            if(monsterDoUsuario.qtd > monstros[i].qtd) monsterDoUsuario.qtd = monstros[i].qtd
            itrNeed += monstros[i].qtd
            itrUsuario += monsterDoUsuario.qtd
        }
    }

    if(quest.inn != undefined){
        itrNeed += quest.inn
        itrUsuario += usuario.inn || 0
    }
    
    return {
        itrUsuario : itrUsuario,
        itrNeed : itrNeed,
        progresso : itrUsuario * 100 / itrNeed
    }
}

function renderQuestList(qt) {
    return `<div class="itemQuest itemQuestMini" onclick="getQuestDetails(${qt.id})">
                <img src="img/face/${qt.avatar}.png" alt="perfil" class="questImagemMini">
                <div class="questDescricao">
                    <b class="colorAzulCondado">${qt.nome}</b> <i>nv.${qt.nivel}</i><br />
                    <div class="spanDescricaoQuest">${qt.descricao.length > 60 ? qt.descricao.substring(70,0) + '...' : qt.descricao}</div>
                </div>
                ${renderProgress(qt.id)}
            </div>`
}

function renderQuestDescricao(qt) {
return `<div class="itemQuest">
            <img src="img/face/${qt.avatar}.png" alt="perfil" class="questImagem">
            <div class="questDescricao">
                <b class="colorAzulCondado">${qt.nome}</b> <i>nv.${qt.nivel}</i><br />
                <div class="spanDescricaoQuest">${qt.descricao}</div>
                <div class="requisitoQuest">
                    <div class="requisitoQuest">
                        ${getItensRequire(qt.itens)}
                    </div>
                    <div class="requisitoQuest">
                        ${getMonstrosRequire(qt.monstros)}
                    </div>
                    <div class="requisitoQuest">
                        ${getInnReq(qt.inn)}
                    </div>
                </div>
                <div class="recompensasQuest">
                    <b>Recompensas:</b><br />
                    Bravecoins : ${qt.bravecois}<br/>
                    ${usuario.nivel < 50 ? 'Exp :' + qt.exp : ''}
                </div>
                
                ${getRecompensas(qt.recompansaItem)}
                <div class="buttonConcluirQuest">
                    <button class="button-azul" onmouseover="audioCursor()" onclick="getQuests()">Voltar</button>
                    ${passouEssaQuest(qt.id) ? '' : `<button class="button-laranja" onmouseover="audioCursor()" onclick="finalizarQuest(${qt.id})">Concluir</button>`}
                </div>
            </div>
            ${renderProgress(qt.id)}
            </div>`
}

function renderQuestFinal(qt) {
    return `<div class="itemQuest">
                <img src="img/face/${qt.avatar}.png" alt="perfil" class="questImagem">
                <div class="questDescricao">
                    <b class="colorAzulCondado">${qt.nome}</b> <i>nv.${qt.nivel}</i><br />
                    <div class="spanDescricaoQuest">${qt.mensagemRecompensa}</div>
                    <br />
                    <div class="recompensasQuest">
                        <b>Recompensas:</b><br />
                        Bravecoins : ${qt.bravecois}<br/>
                        ${usuario.nivel < 50 ? 'Exp :' + qt.exp : ''}
                    </div>
                    
                    ${getRecompensas(qt.recompansaItem)}
                    <div class="buttonConcluirQuest">
                        <button class="button-laranja" onmouseover="audioCursor()" onclick="verificarSePassouDeNivel()">Concluir</button>
                    </div>
                </div>
                </div>`
}

function renderItemRequire(item) {
    return `<img src="img/icons/${item.icone}.png" alt="perfil" class="iconRequisitoQuest">
            <span>${item.qtd} / ${item.need}</span>`
}

function renderMonsterRequire(monstro) {
    return `<b class="colorAzulCondado">${monstro.nome}</b><br />
            <span>${monstro.qtd} / ${monstro.need}</span>`
}

function renderAjuda() {
    document.getElementById('titleTypeItem').innerHTML = 'Ajuda'
    document.getElementById('listaQuests').innerHTML =  `<div class="itemQuest">
                <img src="img/face/175.png" alt="perfil" class="questImagem">
                <div class="questDescricao descricao100">
                    <b class="colorAzulCondado">Olá ${usuario.nome}. Em que podemos te ajudar hoje?</b><br />
                    Deixe abaixo suas dúvidas, reclamações ou mensagens que assim que possível responderemos
                    <br />
                    <span>
                    Mensagem:
                    </span><br />
                    <textarea id="mensagemAoAdmin" placeholder="..." class="input-condado"></textarea>
                    <div class="">
                        <button class="button-laranja" onmouseover="audioCursor()" onclick="enviarMensagem()">Enviar</button>
                    </div>
                </div>
            </div>`
}

function enviarMensagem(){
    let mensagem = document.getElementById('mensagemAoAdmin').value
    if(mensagem == undefined || mensagem.length <= 0){
        audioError()
        return
    }
    audioConfirm()
    if(usuario.mensagensAoAdmin == undefined) usuario.mensagensAoAdmin = []
    usuario.mensagensAoAdmin.push({
        id: usuario.mensagensAoAdmin.length + 1,
        msg : mensagem
    })
    salvarUsuarioBanco(usuario)

    document.getElementById('listaQuests').innerHTML =  `<div class="itemQuest">
                <img src="img/face/175.png" alt="perfil" class="questImagem">
                <div class="questDescricao descricao100">
                    <b class="colorAzulCondado">Obrigado pela mensagem ${usuario.nome}</b><br />
                    Assim que possível entraremos em contato com você se necessário
                    <br />
                    <div class="">
                        <button class="button-azul" onmouseover="audioCursor()" onclick="renderAjuda()">Voltar</button>
                    </div>
                </div>
            </div>`
}

function verificarSePassouDeNivel(){
    if(usuario.nivel >= 50){
        getQuests()
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
        document.getElementById('listaQuests').innerHTML = `  
        <div class="itemQuest">
                <img src="img/face/175.png" alt="perfil" class="questImagem">
                <div class="questDescricao">
                    <b class="colorAzulCondado"><h3 class='m-0'>Parabéns agora você é nível ${usuario.nivel}</h3></b><br />
                    <div class="spanDescricaoQuest">É possível que tenha desbloqueado novos itens na loja, habilidades ou Quests. De uma explorada por ai.</div>
                    <br />
                    <hr/>
                    <div class="recompensasNivel">
                        <div class="recompensasNivel">
                            <span>ATK + 2</span><br />
                            <span>DEF + 2</span><br />
                            <span>HP + 20</span><br />
                            <span>MP + 20</span><br />
                        </div>
                        <hr />
                        <div>
                            <button class="button-laranja" onmouseover="audioCursor()" onclick="verificarSePassouDeNivel()">Concluir</button>
                        </div>
                    </div>
                </div>
                </div>`
    }else{
        getQuests()
    }
}





//T-o-D-o
function renderToDo() {
    document.getElementById('titleTypeItem').innerHTML = 'Lista de afazeres'
    document.getElementById('listaQuests').innerHTML =  `<div class="itemQuest">
                <img src="img/face/175.png" alt="perfil" class="questImagem">
                <div class="questDescricao descricao100">
                    <div id='addNovoToDo'>
                        <b class="colorAzulCondado">Adicionar novo item</b><br />
                        <span>
                        Tarefa:
                        </span><br />
                        <textarea id="mensagemToDo" placeholder="..." class="input-condado"></textarea>
                        <div class="">
                            <button class="button-laranja" onmouseover="audioCursor()" onclick="adicionarToDo()">Adicionar</button>
                        </div>
                        ${renderToDos()}
                    </div>
                    
                </div>
            </div>`
}
function adicionarToDo(){
    let mensagem = document.getElementById('mensagemToDo').value
    if(mensagem == undefined || mensagem.length <= 0){
        audioError()
        return
    }
    audioConfirm()
    if(usuario.todos == undefined) usuario.todos = []
    usuario.todos.push({
        id: usuario.todos.length + 1,
        msg : mensagem,
        concluido : false
    })
    salvarUsuarioBanco(usuario)
    renderToDo()
}

function renderToDos(){
    if(usuario.todos == undefined || usuario.todos.length <= 0) return ''
    let html = ''
    for(let i = usuario.todos.length; i > 0; i--){
        html += templateToDoList(usuario.todos[i - 1])
    }
    return html
}

function templateToDoList(todo) {
    return `<div class="itemQuest itemToDo ${todo.concluido == true ? 'toDoFeito' : ''}">
                <div class="questDescricao">
                    <div class="spanDescricaoQuest">${todo.msg}</div>
                
                    <img src="img/icons/check.svg" alt="perfil" class="checkImgTodo" onclick="marcarToDoComoFeito(${todo.id})">
                    <img src="img/icons/trash.svg" alt="perfil" class="trashImgToDo" onclick="excluirToDo(${todo.id})">
                </div>
            </div>`
}

function marcarToDoComoFeito(id){
    for(let i = 0; i < usuario.todos.length; i++){
        if(usuario.todos[i].id == id){
            usuario.todos[i].concluido = true
            audioConfirm()
        }
    }
    salvarUsuarioBanco(usuario)
    renderToDo()
}

function excluirToDo(id){
    for(let i = 0; i < usuario.todos.length; i++){
        if(usuario.todos[i].id == id){
            usuario.todos.splice(i, 1)
            audioCancel()
        }
    }
    salvarUsuarioBanco(usuario)
    renderToDo()
}

function renderInimigos(){
    let inimigos = copiarObjecto(monstrosAll.sort((a, b) => {
        if (a.nivel > b.nivel) {
            return 1;
          }
          if (a.nivel < b.nivel) {
            return -1;
          }
          return 0;
    }))
    document.getElementById('titleTypeItem').innerHTML = 'Lista de inimigos'
    document.getElementById('listaQuests').innerHTML = `<div class='monsterContainer'>
        <div id='listaMonster' class='listaMonster'>
        </div>
        <div id='descriMonster' class='descriMonster'>
        </div>
    </div>`
    html = ``
    for(let i = 0; i < inimigos.length; i++){
        html += templateMonsterList(inimigos[i])
    }
    document.getElementById('listaMonster').innerHTML = html
}

function templateMonsterList(m){
    let monstroDoUsuario = usuario.inimigos.find(x => x.id == m.id);
    return `<div class="monsterName ${monstroDoUsuario != undefined ? '' : 'monsterBlock'}" onclick='abrirDescriMonser(${m.id})'>
                <div class="spanDescricaoQuest">${monstroDoUsuario != undefined ? m.nome : '??????????'}</div>       
            </div>`
}

function abrirDescriMonser(id){
    let monsterEmQuestao = monstrosAll.find(x => x.id == id)
    let monstroUsu = usuario.inimigos.find(x => x.id == id)
    if(monstroUsu == undefined){
        audioError()
        return
    }
    audioConfirm()
    document.getElementById('descriMonster').innerHTML = `<div class="monstroDescri">
                <div class='monsterContainerImage'>
                    <img src="img/monsters/${monsterEmQuestao.imagem}.png" alt="logo" />
                </div>
                <b class='colorYellow'>${monsterEmQuestao.nome}</b>
                <span>${monsterEmQuestao.descricao}</span>
                <hr />
                <i>nv.${monsterEmQuestao.nivel}</i>
                <div class='atributosInimigo'>
                    <span>ATK  ${monsterEmQuestao.atk}</span><br />
                    <span>DEF  ${monsterEmQuestao.def}</span><br />
                    <span>HP   ${monsterEmQuestao.hp}</span><br />
                </div>
                <hr />
                <span>Local: ${monsterEmQuestao.local}</span>
                <span>Mortos: ${monstroUsu.qtd}</span>
                <hr />
                <div class='itensDoInimigo'>
                    ${getItensMonster(monsterEmQuestao.itens)}
                </div>
            </div>`
}

function getItensMonster(itens){
    if(itens == undefined) return ''
    let html = ''
    for(let i = 0; i < itens.length; i++){
        let itemRecQuestao = itensAll.find(x => x.id == itens[i].id)
        html += renderItemMonster(itemRecQuestao)
    }
    return html
}

function renderItemMonster(item) {
    return `<img src="img/icons/${item.icone}.png" alt="perfil" class="iconRequisitoQuest">`
}